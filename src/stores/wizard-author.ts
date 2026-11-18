import { markRaw, ref, shallowRef, type ComputedRef } from 'vue'
import { refKey } from '../core/saves/split'
import type { EntryRef } from '../library/scopes'
import type { DraftWatcher, DraftWindow } from '../rules/kernel/drafts'
import { useAppStore } from './app'

/** 作者开过的一个窗口：哪件条目导入时开的；closed = 玩家已在作者窗口里答完（作者关了它）。 */
export interface AuthorWindow { win: DraftWindow; refKey: string; closed: boolean }

/**
 * 分步建卡的「作者窗口」：选中的条目按顺序交后端草稿人（作者整机「导入到人物」，people.draftSet），
 * 作者开窗口时排进这里，建卡页把窗口整个搬到那件条目右边，玩家直接在作者窗口里答；作者关了窗口就记为答完。
 * 改了前面的条目：后端关掉开着的作者窗口、退回快照重导，这里丢掉那件及以后的窗口。界面只摆，不算规则。
 */
export function createAuthorDraft(deps: { items: ComputedRef<EntryRef[]>; owner: () => string; name: () => string }) {
  const app = useAppStore()
  const people = () => app.svc().backend.people
  const windows = ref<AuthorWindow[]>([])
  const busy = ref(false)
  const error = ref<string | null>(null)
  /** 后端已经导入好的条目（和后端快照一致的那一段）。 */
  const imported = shallowRef<string[]>([])
  let draft: Promise<string> | null = null
  let seq = 0

  const watcher: DraftWatcher = {
    open: (win) => { windows.value = [...windows.value, { win: markRaw(win), refKey: refKey(win.ref), closed: false }] },
    closed: (token) => { windows.value = windows.value.map((w) => w.win.token === token ? { ...w, closed: true } : w) },
  }

  /** 选中的条目变了：交给后端草稿人（前面不变的留着，后面的作者重问）。 */
  async function sync(): Promise<void> {
    const list = deps.items.value
    if (!list.length && !draft) return
    const keys = list.map(refKey)
    let same = 0
    while (same < imported.value.length && imported.value[same] === keys[same]) same++
    imported.value = imported.value.slice(0, same)
    const keep = new Set(imported.value)
    windows.value = windows.value.filter((w) => keep.has(w.refKey))
    const mine = ++seq
    busy.value = true
    error.value = null
    try {
      draft ??= people().draftOpen(deps.owner(), deps.name().trim() || '新人物')
      const out = await people().draftSet(deps.owner(), await draft, list, watcher)
      if (mine !== seq) return
      imported.value = keys.slice(0, out.done)
      if (out.status !== 'complete' && out.status !== 'cancelled') error.value = out.error ?? `作者导入没完成（${out.status}）`
    } catch (e) {
      if (mine === seq) error.value = e instanceof Error ? e.message : String(e)
    } finally {
      if (mine === seq) busy.value = false
    }
  }
  const of = (ref: EntryRef): AuthorWindow[] => windows.value.filter((w) => w.refKey === refKey(ref))
  const open = (): AuthorWindow[] => windows.value.filter((w) => !w.closed)
  /** 收下草稿人（创建）：作者导入完、窗口都答完了才行。交回草稿人编号。 */
  async function take(): Promise<string | null> {
    if (!draft || busy.value || open().length || imported.value.length !== deps.items.value.length) return null
    const id = await draft
    draft = null
    return id
  }
  /** 关掉建卡：丢掉草稿人（后端关掉开着的作者窗口）。 */
  async function reset(): Promise<void> {
    seq++
    const id = draft
    draft = null; imported.value = []; windows.value = []; busy.value = false; error.value = null
    if (id) await people().draftClose(deps.owner(), await id)
  }
  return { windows, busy, error, sync, of, open, take, reset }
}
