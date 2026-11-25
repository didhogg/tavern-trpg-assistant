// 空白卡建人 / 从库里加（P6-R 11-24）：作者「导入到人物」整路 + 问答桥的一问一答（主线）。
//   作者在小窗里一直跑着：问到一题就停在那里（frame/commands-import.ts importBegin），这里交回题目（过唯一显示出口，中文）；
//   玩家答一题 = importAnswer，作者接着跑到下一题——不从头重跑。回到前面某题重答 = 作者取消、人物按存档退回、带着前面的回答从头跑到那题。
//   答完 → 作者写进人物的全部改动（各段合起来）留在小窗，交回「会加上什么」；玩家确认 = people.confirm 写存档（一条撤销），取消 = 作者收尾 + people.cancel 退回。
// 题目 / 回答的格式见 author-ask-types.ts。
/* eslint-disable @typescript-eslint/no-explicit-any -- 小窗命令结果没有类型声明 */
import type { EntryRef } from '../../library/scopes'
import type { KernelChange } from '../../schemas/kernel'
import type { AskAnswer, AskQuestion } from './author-ask-types'
import type { Displayed, FrameText } from './shown'
import { named } from './shown'
import type { KernelRuntime } from './runtime'
import type { KernelPeople } from './people'
import { executed } from './host'

/** 作者导入后加进人物的一件（名字按作者编号取）。 */
interface AddedRow { _id: string; name: string; label?: FrameText; type: string; typeLabel?: FrameText | null }
export type ImportQuestion = Displayed<AskQuestion>
export type ImportStep =
  /** missed = 显示出口没翻到的字（检查用，界面不显示）。 */
  | { status: 'question'; question: ImportQuestion; ms: number; missed: string[]; split: { run: number; display: number } }
  | { status: 'ready'; changes: KernelChange[]; added: Array<{ id: string; type: string; typeLabel: string; name: string }>; facts: Array<{ title: string; text: string }>; ms: number; split: { run: number; track: number; display: number } }
  | { status: 'error'; error: string; ms: number }

/** 等界面把这一步画出来再做（没有画面的环境直接排到后面）。 */
const afterPaint = (run: () => void): void => {
  const raf = (globalThis as { requestAnimationFrame?: (cb: () => void) => void }).requestAnimationFrame
  if (raf) raf(() => setTimeout(run, 0)); else setTimeout(run, 0)
}

/** 正在问的一次导入（一个战役同时只有一次）：哪个人、哪条、已经交给作者几个回答、各段写入。 */
interface Live { actorId: string; key: string; answers: AskAnswer[]; changes: KernelChange[]; shows?: Promise<Shows>; /** 重新选某一级：问答完要按原样升回去的那几级。 */ restore?: { classId: string; delta: number; values: unknown[] } }
/**
 * 重新选某个职业的某一级（驾驶员 11-25：任意一级都能重选）。照 dnd5e 自己的「修改某一级的选择」（AdvancementManager.forModifyChoices）
 * 同一个顺序：先记下人物现在每条成长的选择（captureChoices，官方 Advancement#reverse）→ 降到这一级之前 → 这一级按作者问答重选
 * → 更高的几级按记下的选择原样升回（levelUpApply 带 values，官方 restore，按成长编号对上）。全部算同一次改动、一条撤销。
 * 第 1 级不行：降到 0 级官方会把整件职业拿掉；作者导入的起始装备、1 级戏法不在 dnd5e 成长记录里，拿不掉，重新导入又加一份（e2e 实测 16 件重复），
 * 再加上作者每次导入特性授予都是新编号（Plutonium pAddItemGrantAdvancementLinks 每次 randomID），原记录也对不上。等驾驶员定（NEXT.md）。
 */
export interface RedoLevel { classId: string; level: number; top: number }
/**
 * 职业 / 子职业这次怎么导入（驾驶员 11-25 评测：主职业、目标等级、子职业是同一次人物变更）。照作者自己的升级（frame/class-import.ts）：
 *   levels = 导入到这个职业的哪几级（给了作者就不再问等级）；subclass = 和职业一起进的子职业（库条目）；redo = 重新选某一级。
 */
export interface ImportHow { levels?: number[]; subclass?: EntryRef | null; redo?: RedoLevel }
/** 加 / 升职业、补选子职业之前作者那边的情况（frame/class-import.ts classPlan）。 */
export type ClassPlan =
  | { kind: 'class'; classId: string | null; classLevel: number; hasSubclass: boolean; total: number; subclassLevel: number | null; className: string; classSource: string }
  | { kind: 'subclass'; classId: string | null; classLevel: number; total: number; className: string; classSource: string }
/** 这一次导入的显示出口（条目对照、取名表）：同一次导入里条目不变，建一次各步共用。 */
type Shows = Awaited<ReturnType<KernelRuntime['displayFor']>>
type FrameResult = { status: string; result?: any; changes?: unknown[]; error?: string }

export class KernelImportFlow {
  private readonly live = new Map<string, Live>()
  constructor(private readonly deps: { runtime: KernelRuntime; people: KernelPeople }) {}

  /**
   * replaceItemId = 换掉的那件（换种族 / 背景）：官方先拿掉它，和导入算同一次改动。answers = 到现在为止的全部回答。
   * how = 职业的等级 / 子职业 / 重新选某一级（见 ImportHow）。
   */
  async step(ownerKey: string, actorId: string, ref: EntryRef, answers: AskAnswer[], replaceItemId?: string, how: ImportHow = {}): Promise<ImportStep> {
    const t0 = performance.now()
    const ms = () => Math.round(performance.now() - t0)
    const redo = how.redo
    // 显示出口按这次涉及的条目建（子职业一起进时，子职业特性的名字也按它的编号取）
    const shownRefs = how.subclass ? [ref, how.subclass] : [ref]
    const key = JSON.stringify([ref, replaceItemId ?? null, how])
    let { session } = await this.deps.runtime.session(ownerKey)
    const now = this.live.get(ownerKey)
    let out: FrameResult
    // 正好是作者停着的那题的回答：交给作者接着跑
    if (now && now.actorId === actorId && now.key === key && answers.length === now.answers.length + 1 && JSON.stringify(answers.slice(0, -1)) === JSON.stringify(now.answers)) {
      const [answer] = await this.withFeats(ownerKey, answers.slice(-1))
      out = await session.call('importAnswer', answer)
      now.answers = [...answers]
    } else {
      // 新开一次，或回到前面某题重答：先收掉进行中的（人物按存档退回），带着前面的回答从头跑
      await this.cancel(ownerKey, actorId)
      // 库发布了新版就重开小窗：后面用重开后的那一个
      if (await this.fresh(ownerKey)) session = (await this.deps.runtime.session(ownerKey)).session
      const rows = await this.deps.runtime.entries(ownerKey, how.subclass ? [ref, how.subclass] : [ref])
      if (rows.status !== 'complete') return { status: 'error', error: rows.error ?? `条目没读出来（${rows.status}）`, ms: ms() }
      const [row, subRow] = rows.rows
      this.live.set(ownerKey, { actorId, key, answers: [...answers], changes: [] })
      // 第 1 级：只有这一级时可以重选（官方拿掉职业 + 收回作者导入记录里的，再按 1 级重新导入，class-import.ts fresh）；
      // 更高的几级在第 1 级之上，按原选择升回要靠成长编号，而作者每次导入特性授予都换新编号，对不上，先降到 1 级再重选
      if (redo && redo.level < 2 && redo.top > 1) { await this.cancel(ownerKey, actorId); return { status: 'error', error: '要重选第 1 级，先把这个职业降到 1 级', ms: ms() } }
      if (redo && redo.level >= 2) {
        const kept = await session.call('captureChoices', actorId)
        if (kept.status !== 'complete') { await this.cancel(ownerKey, actorId); return { status: 'error', error: kept.error ?? `没记下原来的选择（${kept.status}）`, ms: ms() } }
        const values = Object.values((kept.result ?? {}) as Record<string, Array<{ level: number; error?: string }>>).flat().filter((v) => v.level > redo.level && !v.error)
        // 降到这一级之前；作者导入记录只收回这一级的（更高的几级等会儿原样升回，它们当时加的留着）
        const down = await session.call('levelUpApply', actorId, redo.classId, redo.level - 1 - redo.top, undefined, redo.level)
        if (!executed(down.status)) { await this.cancel(ownerKey, actorId); return { status: 'error', error: down.error ?? `先降级没完成（${down.status}）`, ms: ms() } }
        const live = this.live.get(ownerKey)!
        live.changes.push(...((down.changes ?? []) as KernelChange[]))
        if (redo.top > redo.level) live.restore = { classId: redo.classId, delta: redo.top - redo.level, values }
      }
      // 重新选第 L 级：降到 L-1 后只导入第 L 级（作者带上现有子职业，子职业在这一级的特性一起回来）
      const levels = redo ? [redo.level] : how.levels
      const classHow = levels || subRow ? { levels, subclass: subRow ? { prop: subRow.ref.prop, entry: subRow.entry } : null, ...(redo?.level === 1 ? { fresh: true } : {}) } : undefined
      out = await session.call('importBegin', actorId, { prop: row.ref.prop, entry: row.entry }, await this.withFeats(ownerKey, answers), replaceItemId, classHow)
    }
    const live = this.live.get(ownerKey)!
    live.changes.push(...((out.changes ?? []) as KernelChange[]))
    const ran = ms()
    const question = out.status === 'pending' ? out.result?.question : null
    if (question) {
      const shown = await (await this.showsOf(ownerKey, shownRefs)).show(question as AskQuestion)
      const all = ms()
      // 玩家读题时在后台预读作者接下来要对照的资料（只读、不改人物；等题目画出来再开始，不抢出题的时间）。
      // 作者的合集包缓存只留 60 秒，所以每出一题都续一次：还在的只刷新时间，过期的重新读（frame/commands-equipment.ts warmItems）
      afterPaint(() => void session.call('warmImport').catch((e: unknown) => console.warn('[trpg-assistant] 预读资料没成功', e)))
      return { status: 'question', question: shown.value as ImportQuestion, ms: all, missed: shown.missed, split: { run: ran, display: all - ran } }
    }
    const exit = String(out.result?.exit ?? '')
    if (!executed(out.status) || exit === 'taskExitCancelled' || exit === 'taskExitCompleteFailed') {
      await this.cancel(ownerKey, actorId)
      const error = !executed(out.status) ? out.error ?? `导入没有完成（${out.status}）` : exit === 'taskExitCancelled' ? '作者导入被取消' : '作者导入失败（详见控制台）'
      return { status: 'error', error, ms: ms() }
    }
    // 重新选中间某一级：更高的几级按记下的选择原样升回
    if (live.restore) {
      const up = await session.call('levelUpApply', actorId, live.restore.classId, live.restore.delta, live.restore.values)
      if (!executed(up.status)) { await this.cancel(ownerKey, actorId); return { status: 'error', error: up.error ?? `更高的几级没能按原样升回（${up.status}）`, ms: ms() } }
      live.changes.push(...((up.changes ?? []) as KernelChange[]))
      live.restore = undefined
    }
    // 跑完：改动都留在小窗，等确认 / 取消（作者那边已收尾，这里只记着要退回的是哪个人）
    live.answers = [...answers]
    await this.deps.runtime.trackAdded(ownerKey, actorId, out.result?.added)
    const tracked = ms()
    const rows = (out.result?.added ?? []) as AddedRow[]
    const names: FrameText[] = rows.map((row) => row.label ?? named(row.name, []))
    const facts = (out.result?.facts ?? []) as Array<{ title: FrameText; text: FrameText }>
    const shown = await (await this.showsOf(ownerKey, shownRefs)).show({ names, types: rows.map((row) => row.typeLabel ?? named(row.type, [])), facts })
    return {
      status: 'ready', changes: [...live.changes], ms: ms(), split: { run: ran, track: tracked - ran, display: ms() - tracked },
      added: rows.map((row, i) => ({ id: row._id, type: row.type, typeLabel: String(shown.value.types[i] ?? row.type), name: String(shown.value.names[i] ?? row.name) })),
      facts: (shown.value.facts as unknown as Array<{ title: string; text: string }>).map((f) => ({ title: String(f.title), text: String(f.text) })),
    }
  }

  /** 加 / 升职业、补选子职业之前：问作者这个职业几级选子职业、人物现在几级（只读，不留改动）。 */
  async plan(ownerKey: string, actorId: string, ref: EntryRef): Promise<ClassPlan | { error: string }> {
    await this.fresh(ownerKey)
    const rows = await this.deps.runtime.entries(ownerKey, [ref])
    if (rows.status !== 'complete') return { error: rows.error ?? `条目没读出来（${rows.status}）` }
    const row = rows.rows[0]
    const { session } = await this.deps.runtime.session(ownerKey)
    const out = await session.call('importPlan', actorId, { prop: row.ref.prop, entry: row.entry })
    return out.status === 'complete' ? out.result as ClassPlan : { error: out.error ?? `没读出职业情况（${out.status}）` }
  }

  /** 库在小窗打开后发布了新版（刚存了自制条目、装了书）：没有进行中的导入时重开小窗、把存档里的人装回，作者才读得到新条目。 */
  private async fresh(ownerKey: string): Promise<boolean> {
    if (this.live.has(ownerKey) || !(await this.deps.runtime.stale(ownerKey))) return false
    await this.deps.runtime.close(ownerKey)
    await this.deps.people.load(ownerKey)
    return true
  }

  private showsOf(ownerKey: string, refs: EntryRef[]): Promise<Shows> {
    const live = this.live.get(ownerKey)
    if (!live) return this.deps.runtime.displayFor(ownerKey, refs)
    return (live.shows ??= this.deps.runtime.displayFor(ownerKey, refs))
  }

  /** 回答里玩家从库里选的专长（属性提升改选专长）：按库编号换成作者认得的条目（和建卡、加条目同一条换法）。 */
  private async withFeats(ownerKey: string, answers: AskAnswer[]): Promise<AskAnswer[]> {
    const refs = answers.flatMap((a) => (a.featRef ? [a.featRef as EntryRef] : []))
    if (!refs.length) return answers
    const rows = await this.deps.runtime.entries(ownerKey, refs)
    if (rows.status !== 'complete') throw Error(rows.error ?? '选的专长没读出来')
    let n = 0
    return answers.map((a) => (a.featRef ? { ...a, featRef: undefined, featEntry: rows.rows[n++]?.entry } : a))
  }

  /** 确认：留在小窗里的改动写进存档（一条撤销）。 */
  async confirm(ownerKey: string, changes: KernelChange[]) {
    const out = await this.deps.people.confirm(ownerKey, changes)
    this.live.delete(ownerKey)
    return out
  }
  /** 取消 / 重来：作者停着的题当玩家关掉弹窗（作者自己收尾），这个人按存档退回。 */
  async cancel(ownerKey: string, actorId: string) {
    const { session } = await this.deps.runtime.session(ownerKey)
    const out = await session.call('importAbort')
    const was = this.live.get(ownerKey)
    this.live.delete(ownerKey)
    // 没有进行中的导入（第一次打开）：人物没被动过，不用退回
    if (!was && !out.result?.actorId) return
    const ids = [...new Set([actorId, was?.actorId, out.result?.actorId].filter((x): x is string => typeof x === 'string'))]
    await this.deps.people.cancel(ownerKey, ids)
  }
}
