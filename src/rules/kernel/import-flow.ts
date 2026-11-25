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
  | { status: 'ready'; changes: KernelChange[]; added: Array<{ id: string; type: string; typeLabel: string; name: string }>; ms: number; split: { run: number; track: number; display: number } }
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
/** 这一次导入的显示出口（条目对照、取名表）：同一次导入里条目不变，建一次各步共用。 */
type Shows = Awaited<ReturnType<KernelRuntime['displayFor']>>
type FrameResult = { status: string; result?: any; changes?: unknown[]; error?: string }

export class KernelImportFlow {
  private readonly live = new Map<string, Live>()
  constructor(private readonly deps: { runtime: KernelRuntime; people: KernelPeople }) {}

  /**
   * replaceItemId = 换掉的那件（换种族 / 背景）：官方先拿掉它，和导入算同一次改动。answers = 到现在为止的全部回答。
   * redo = 重新选这个职业的某一级（见 RedoLevel）。
   */
  async step(ownerKey: string, actorId: string, ref: EntryRef, answers: AskAnswer[], replaceItemId?: string, redo?: RedoLevel): Promise<ImportStep> {
    const t0 = performance.now()
    const ms = () => Math.round(performance.now() - t0)
    const key = JSON.stringify([ref, replaceItemId ?? null, redo ?? null])
    const { session } = await this.deps.runtime.session(ownerKey)
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
      const rows = await this.deps.runtime.entries(ownerKey, [ref])
      if (rows.status !== 'complete') return { status: 'error', error: rows.error ?? `条目没读出来（${rows.status}）`, ms: ms() }
      const row = rows.rows[0]
      this.live.set(ownerKey, { actorId, key, answers: [...answers], changes: [] })
      if (redo && redo.level < 2) { await this.cancel(ownerKey, actorId); return { status: 'error', error: '第 1 级是职业本身，暂时不能单独重选', ms: ms() } }
      if (redo) {
        const kept = await session.call('captureChoices', actorId)
        if (kept.status !== 'complete') { await this.cancel(ownerKey, actorId); return { status: 'error', error: kept.error ?? `没记下原来的选择（${kept.status}）`, ms: ms() } }
        const values = Object.values((kept.result ?? {}) as Record<string, Array<{ level: number; error?: string }>>).flat().filter((v) => v.level > redo.level && !v.error)
        const down = await session.call('levelUpApply', actorId, redo.classId, redo.level - 1 - redo.top)
        if (!executed(down.status)) { await this.cancel(ownerKey, actorId); return { status: 'error', error: down.error ?? `先降级没完成（${down.status}）`, ms: ms() } }
        const live = this.live.get(ownerKey)!
        live.changes.push(...((down.changes ?? []) as KernelChange[]))
        if (redo.top > redo.level) live.restore = { classId: redo.classId, delta: redo.top - redo.level, values }
      }
      out = await session.call('importBegin', actorId, { prop: row.ref.prop, entry: row.entry }, await this.withFeats(ownerKey, answers), replaceItemId)
    }
    const live = this.live.get(ownerKey)!
    live.changes.push(...((out.changes ?? []) as KernelChange[]))
    const ran = ms()
    const question = out.status === 'pending' ? out.result?.question : null
    if (question) {
      const shown = await (await this.showsOf(ownerKey, ref)).show(question as AskQuestion)
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
    const shown = await (await this.showsOf(ownerKey, ref)).show({ names, types: rows.map((row) => row.typeLabel ?? named(row.type, [])) })
    return {
      status: 'ready', changes: [...live.changes], ms: ms(), split: { run: ran, track: tracked - ran, display: ms() - tracked },
      added: rows.map((row, i) => ({ id: row._id, type: row.type, typeLabel: String(shown.value.types[i] ?? row.type), name: String(shown.value.names[i] ?? row.name) })),
    }
  }

  private showsOf(ownerKey: string, ref: EntryRef): Promise<Shows> {
    const live = this.live.get(ownerKey)
    if (!live) return this.deps.runtime.displayFor(ownerKey, [ref])
    return (live.shows ??= this.deps.runtime.displayFor(ownerKey, [ref]))
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
