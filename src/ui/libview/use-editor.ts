// P5.5 编辑器的状态（EditorPage 用）：左右两栏（主编辑语言 / 另一语言）、JSON 文字同步、两边不一样的项、草稿自动存、撤销。
// 数据都走后端：字段表 custom.fields、另一语言 bilingual.otherEntry、对不上 bilingual.mismatches、检查 custom.validateEntry、草稿 custom.saveDraft。
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { Services } from '../../core/services'
import type { EditSession } from './edit-flow'
import { fromText, issueLines, toText, type Ent } from './edit-json'
import type { FormTable } from './EntryForm.vue'
import type { JsonIssue } from './JsonBox.vue'

export type Side = 'main' | 'other'
export const otherCodeSet = (cs: string): string => (cs === 'en' ? 'cn' : 'en')
/** 交给后端 / 作者小窗前拷一份纯数据。 */
export const plain = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T
export const langName = (cs: string): string => (cs === 'en' ? 'English' : '中文')

export function useEditor(svc: () => Services, session: EditSession) {
  const lib = () => svc().backend.library
  const prop = session.prop
  const cs = { main: session.codeSet, other: otherCodeSet(session.codeSet) }
  // 条目整条替换（表单每次给新对象），用 shallowRef 免得变成 Vue 的代理（代理传不进作者小窗，也不能 structuredClone）
  const ents = { main: shallowRef<Ent>(plain(session.ent)), other: shallowRef<Ent | null>(null) }
  const tables = { main: shallowRef<FormTable | null>(null), other: shallowRef<FormTable | null>(null) }
  /** 另一语言：found 有这一条 / none 还没有（右栏是空表单）/ ambiguous 对上好几条 / loading / error。 */
  const otherState = ref<'loading' | 'found' | 'none' | 'ambiguous' | 'error'>('loading')
  const otherHash = ref<string | null>(null)
  let otherStart = ''
  const dirty = ref(false)
  /** 左栏是哪一边（⇄ 左右对调）。 */
  const left = ref<Side>('main')
  const right = computed<Side>(() => (left.value === 'main' ? 'other' : 'main'))

  async function loadTable(side: Side): Promise<void> {
    const t = await lib().custom.fields(cs[side], prop)
    tables[side].value = t ? { fields: t.fields, defs: t.defs, labels: t.labels } : null
  }
  async function loadOther(): Promise<void> {
    otherState.value = 'loading'
    try {
      if (session.target.kind === 'mine' && session.pack) {
        const r = await lib().bilingual.otherEntry(cs.main, session.pack.id, prop, { uniqueId: session.target.uniqueId })
        if (r.state === 'found' && r.entity) { ents.other.value = r.entity; otherHash.value = r.hash; otherState.value = 'found'; otherStart = JSON.stringify(r.entity); return }
        if (r.state === 'ambiguous') { otherState.value = 'ambiguous'; return }
      }
      ents.other.value = (await lib().custom.blankEntry(cs.other, prop)) ?? { name: '' }
      otherStart = JSON.stringify(ents.other.value)
      otherState.value = 'none'
    } catch (e) { console.error('[trpg-assistant] 读取另一语言失败', e); otherState.value = 'error' }
  }
  const ready = Promise.all([loadTable('main'), loadTable('other').catch(() => null), loadOther()])

  /** 另一语言这一边动过没有（新建时空表单没动就不存）。 */
  const otherTouched = () => !!ents.other.value && JSON.stringify(ents.other.value) !== otherStart

  function setEnt(side: Side, ent: Ent): void {
    ents[side].value = ent
    dirty.value = true
  }

  // ---- JSON 标签：编辑的是左栏那一条；文字能解析就同步回表单，解析不了先不动表单 ----
  const jsonText = ref(toText(ents.main.value))
  const jsonIssues = ref<JsonIssue[]>([])
  let fromJson = false
  watch(() => ents[left.value].value, (e) => { if (fromJson) { fromJson = false; return } if (e) jsonText.value = toText(e) }, { deep: false })
  watch(left, () => { const e = ents[left.value].value; if (e) jsonText.value = toText(e) })
  async function onJson(text: string): Promise<void> {
    jsonText.value = text
    const r = fromText(text)
    if (!r.ok) { jsonIssues.value = [r.issue]; return }
    fromJson = true
    setEnt(left.value, r.ent)
    try { jsonIssues.value = issueLines(r.pointers, prop, await lib().custom.validateEntry(cs[left.value], prop, plain(r.ent))) } catch (e) { console.warn('[trpg-assistant] 结构检查没跑成', e) }
  }

  // ---- 两边不一样的不用翻译的项（≠）；房规以后再加「改过」 ----
  const marks = ref<Record<string, string>>({})
  let markTimer: ReturnType<typeof setTimeout> | null = null
  watch([ents.main, ents.other], () => {
    if (markTimer) clearTimeout(markTimer)
    markTimer = setTimeout(async () => {
      const a = ents.main.value, b = ents.other.value
      if (!b || otherState.value === 'none' && !otherTouched()) { marks.value = {}; return }
      try { marks.value = Object.fromEntries((await lib().bilingual.mismatches(cs.main, prop, plain(a), plain(b))).map((f) => [f, '≠'])) } catch (e) { console.warn('[trpg-assistant] 对比两边没成功', e) }
    }, 600)
  }, { deep: false })

  // ---- 草稿：停手 1.5 秒存一份（只存插件管理记录，不碰条目） ----
  const draftKey = ref<string | undefined>(session.draftKey)
  const draftAt = ref<number | null>(null)
  let draftTimer: ReturnType<typeof setTimeout> | null = null
  watch([ents.main, ents.other], () => {
    if (!dirty.value) return
    if (draftTimer) clearTimeout(draftTimer)
    draftTimer = setTimeout(async () => {
      try {
        draftKey.value = await lib().custom.saveDraft({ codeSet: cs.main, prop, s: plain(ents.main.value), target: plain(session.target) }, draftKey.value)
        draftAt.value = Date.now()
      } catch (e) { console.warn('[trpg-assistant] 草稿没存上', e) }
    }, 1500)
  })
  onBeforeUnmount(() => { if (draftTimer) clearTimeout(draftTimer); if (markTimer) clearTimeout(markTimer) })
  async function dropDraft(): Promise<void> {
    if (draftTimer) clearTimeout(draftTimer)
    if (draftKey.value) await lib().custom.discardDraft(draftKey.value).catch((e: unknown) => console.warn('[trpg-assistant] 丢草稿没成功', e))
  }

  // ---- 撤销（改自己的条目：已存过的版本退回一步，Q13） ----
  const undoLeft = ref(0)
  async function loadUndo(): Promise<void> {
    if (session.target.kind !== 'mine') return
    try { undoLeft.value = await lib().custom.undoSteps(cs.main, prop, session.target.uniqueId) } catch { undoLeft.value = 0 }
  }
  void loadUndo()

  /** 存的时候交给后端的两边（中文 / 英文按资料集分）。另一语言只在动过、或本来就有的时候存。 */
  function sides() {
    const zhSide = cs.main === 'en' ? 'other' : 'main'
    const pick = (side: Side) => (side === 'main' ? { ent: plain(ents.main.value), replaceHash: session.replaceHash } : ents.other.value && (otherTouched() || otherState.value === 'found') && otherState.value !== 'ambiguous' ? { ent: plain(ents.other.value), replaceHash: otherHash.value ?? undefined } : undefined)
    return { zh: pick(zhSide), en: pick(zhSide === 'main' ? 'other' : 'main') }
  }

  /** 另一语言打开时的样子（本来就有那一条才有；新建 / 还没有为 null）。 */
  const otherBefore = (): Ent | null => (otherState.value === 'found' && otherStart ? JSON.parse(otherStart) as Ent : null)

  return { otherBefore, cs, ents, tables, otherState, left, right, ready, dirty, setEnt, jsonText, jsonIssues, onJson, marks, draftAt, dropDraft, undoLeft, loadUndo, sides, otherTouched }
}
