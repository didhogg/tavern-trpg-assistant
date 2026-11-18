// 建卡草稿人（驾驶员 2026-11-18 定：建卡走作者整机，作者的提问装进我们的建卡页）。
// 一个草稿人 = 小窗里一个空白人物 + 每导入一件条目后的整份快照。建卡页每次改了选中的条目就交来完整清单：
// 和快照比，前面相同的留着（已经答过的作者问题不重问），从第一件不同的起退回那份快照、再一件件交作者「导入到人物」。
// 作者开的窗口经小窗作者窗口桥（frame/ask-bridge.ts）→ 传话通道 → answer() → 建卡页（把作者窗口整个搬到那件条目的右边，玩家直接答）。
// 玩家又改了选择：开着的作者窗口回「取消」（作者按取消处理，不导入这件），草稿人退回快照。只管建人，不算规则。
import { refKey } from '../../core/saves/split'
import type { ScopedLibrary } from '../../library/scoped'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { LibraryService } from '../../library/service'
import { kernelDataSource } from '../../library/sources'
import type { WindowNotice, WindowReply } from './ask'
import { display } from './display'
import type { KernelSession } from './host'
import { namerFor } from './naming'
import type { FrameText, Shown } from './shown'
import type { PairsOf } from './sidecar'

type Data = Record<string, unknown>
type Row = { ref: EntryRef; entry: unknown; zh: unknown | null }
/** 作者开的一个窗口（给建卡页）：哪件条目导入时开的、标题（本战役语言）、作者声明的样式表、窗口本身（小窗里作者画好的那个元素）。 */
export interface DraftWindow { token: string; ref: EntryRef; title: Shown; styles: string[]; node: () => HTMLElement | null }
/** 建卡页：作者开了窗口就摆出来，关了就收起。 */
export interface DraftWatcher { open(win: DraftWindow): void; closed(token: string): void }
/** done = 已导入好几件（前 done 件和清单一致）；cancelled = 被新的清单打断或玩家取消。 */
export interface DraftResult { status: string; error?: string; done: number }

export interface DraftDeps {
  open(ownerKey: string): Promise<{ session: KernelSession; pairsOf: PairsOf }>
  entries(ownerKey: string, refs: EntryRef[]): Promise<{ status: string; error?: string; rows: Row[] }>
  library(ownerKey: string): Promise<CampaignLibrary>
  scoped: ScopedLibrary
  service: LibraryService
}

interface Draft { owner: string; id: string; seed: string; blank: Data; snaps: Array<{ key: string; data: Data }>; run: Promise<DraftResult> | null; stop: (() => void) | null }

export class KernelDrafts {
  private readonly rows = new Map<string, Draft>()
  /** 每个战役此刻谁在接作者窗口（同一时刻一个战役只导入一件）。 */
  private readonly asking = new Map<string, (notice: WindowNotice) => Promise<WindowReply>>()

  constructor(private readonly deps: DraftDeps) {}

  /** 小窗报作者窗口开了 / 关了（传话通道 ask）：交给正在导入的那一位；没人在导入就让小窗关掉它。 */
  answer(ownerKey: string, notice: unknown): Promise<WindowReply> {
    const asker = this.asking.get(ownerKey)
    return asker ? asker(notice as WindowNotice) : Promise.resolve({ cancel: true })
  }

  /** 开一个草稿人。 */
  async open(ownerKey: string, name: string): Promise<string> {
    const o = await this.deps.open(ownerKey)
    const seed = `${name}~${crypto.randomUUID().slice(0, 8)}`
    const call = await o.session.call('draftStart', { name, seed })
    const out = call.result as { id?: string; data?: Data } | null
    if (call.status !== 'complete' || !out?.id || !out.data) throw new Error(`开不了草稿人：${call.error ?? call.status}`)
    this.rows.set(out.id, { owner: ownerKey, id: out.id, seed, blank: out.data, snaps: [], run: null, stop: null })
    return out.id
  }

  /** 草稿人 = 这份条目清单（按顺序导入）；作者的提问交给 answer。上一次还在问就先打断它。level = 职业建到几级。 */
  async set(ownerKey: string, id: string, items: EntryRef[], watcher: DraftWatcher, level = 1): Promise<DraftResult> {
    const d = this.draft(ownerKey, id)
    d.stop?.()
    await d.run
    const run = this.apply(d, items, watcher, level)
    d.run = run
    try { return await run } finally { if (d.run === run) { d.run = null; d.stop = null } }
  }

  /** 收下草稿人（改成最终名字），交回整份数据与随机种子；之后它就是正式人物。 */
  async take(ownerKey: string, id: string, name: string): Promise<{ id: string; data: Data; seed: string }> {
    const d = this.draft(ownerKey, id)
    const call = await (await this.deps.open(ownerKey)).session.call('draftTake', { id, name })
    const out = call.result as { id?: string; data?: Data } | null
    if (call.status !== 'complete' || !out?.data) throw new Error(`收不下草稿人：${call.error ?? call.status}`)
    this.rows.delete(id)
    return { id, data: out.data, seed: d.seed }
  }

  /** 丢掉草稿人（关掉建卡窗口）。 */
  async close(ownerKey: string, id: string): Promise<void> {
    const d = this.rows.get(id)
    if (!d || d.owner !== ownerKey) return
    d.stop?.()
    await d.run
    this.rows.delete(id)
    const call = await (await this.deps.open(ownerKey)).session.call('deleteActors', [id])
    if (call.status !== 'complete') throw new Error(`删不掉草稿人 ${id}：${call.error ?? call.status}`)
  }

  private draft(ownerKey: string, id: string): Draft {
    const d = this.rows.get(id)
    if (!d || d.owner !== ownerKey) throw new Error(`没有这个草稿人：${id}`)
    return d
  }

  private async reset(d: Draft, keep: number): Promise<void> {
    d.snaps.length = keep
    const data = keep ? d.snaps[keep - 1].data : d.blank
    const call = await (await this.deps.open(d.owner)).session.call('draftReset', { id: d.id, data })
    if (call.status !== 'complete') throw new Error(`草稿人退不回去：${call.error ?? call.status}`)
  }

  private async apply(d: Draft, items: EntryRef[], watcher: DraftWatcher, level: number): Promise<DraftResult> {
    const keys = items.map(refKey)
    let keep = 0
    while (keep < d.snaps.length && keep < keys.length && d.snaps[keep].key === keys[keep]) keep++
    if (keep < d.snaps.length) await this.reset(d, keep)
    if (keep === keys.length) return { status: 'complete', done: keep }
    const rows = await this.deps.entries(d.owner, items.slice(keep))
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error, done: keep }
    const o = await this.deps.open(d.owner)
    let stopped = false
    /** 开着的作者窗口：记号 → 让小窗关掉它 / 它自己关了。 */
    const waiting = new Map<string, (reply: WindowReply) => void>()
    d.stop = () => { stopped = true; for (const resolve of waiting.values()) resolve({ cancel: true }); waiting.clear() }
    const levels = Array.from({ length: Math.max(1, level) }, (_, i) => i + 1)
    for (const row of rows.rows) {
      if (stopped) return { status: 'cancelled', done: d.snaps.length }
      /** 这件条目导入时作者开着的窗口：开了下一个 / 导入结束 = 都答完了（作者的「关了」通知要等关窗动画，常常晚到）。 */
      const opened = new Set<string>()
      const finish = (token: string) => { if (!opened.delete(token)) return; waiting.get(token)?.({}); waiting.delete(token); watcher.closed(token) }
      this.asking.set(d.owner, async (notice) => {
        if ('closed' in notice) { finish(notice.closed); return {} }
        if (stopped) return { cancel: true }
        const token = notice.open
        const title = await this.show(d.owner, notice.title, [row])
        let node: HTMLElement | null = null
        // 作者画好的窗口在小窗文档里（同源）；第一次取出后由建卡页挪走，之后用记住的那个
        const take = () => node ??= o.session.frame.frame.contentDocument?.querySelector<HTMLElement>(`[data-trpg-window="${token}"]`) ?? null
        // 作者导入一次只问一个窗口、答完才往下走：开了新窗口 = 之前开的都答完了
        for (const earlier of [...opened]) finish(earlier)
        return new Promise<WindowReply>((resolve) => {
          waiting.set(token, resolve)
          opened.add(token)
          watcher.open({ token, ref: row.ref, title, styles: notice.styles, node: take })
        })
      })
      try {
        const call = await o.session.call('draftImport', { id: d.id, row: { prop: row.ref.prop, entry: row.entry, ...(row.ref.prop === 'class' ? { levels } : {}) } })
        const out = call.result as { data?: Data; reason?: string; prop?: string; name?: string } | null
        if (call.status !== 'complete' || !out?.data) {
          await this.reset(d, d.snaps.length)
          return { status: stopped ? 'cancelled' : call.status, error: call.error ?? `作者导入没完成（${out?.prop ?? ''} ${out?.name ?? ''}：${out?.reason ?? ''}）`, done: d.snaps.length }
        }
        d.snaps.push({ key: refKey(row.ref), data: out.data })
      } finally { this.asking.delete(d.owner); for (const token of [...opened]) finish(token) }
    }
    return { status: 'complete', done: d.snaps.length }
  }

  /** 作者窗口标题过唯一的显示出口（和建卡选项同一套：库名、作者代码同位置、条目原文同位置）。 */
  private async show(ownerKey: string, text: FrameText, rows: Row[]): Promise<Shown> {
    const library = await this.deps.library(ownerKey)
    const o = await this.deps.open(ownerKey)
    const shown = await display(text, {
      translate: library.codeSet !== kernelDataSource().codeSet,
      pairs: await o.pairsOf(rows),
      namer: await namerFor(this.deps.scoped, library),
      author: this.deps.service.texts.reader(library.codeSet),
    })
    return shown.value as Shown
  }
}
