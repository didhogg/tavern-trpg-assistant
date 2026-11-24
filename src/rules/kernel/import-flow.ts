// 空白卡建人 / 从库里加（P6-R 11-24）：作者「导入到人物」整路 + 问答桥的一问一答（主线）。
//   step(人, 条目, 已答) → 小窗带着全部回答重跑作者导入（同输入同结果）：
//     问到还没答的题 → 这个人按存档退回，交回题目（过唯一显示出口，中文）；
//     答完 → 作者写进人物的改动留在小窗，交回「会加上什么」（过显示出口）；玩家确认 = people.confirm 写存档（一条撤销），取消 = people.cancel 退回。
// 题目 / 回答的格式见 author-ask-types.ts；小窗命令 frame/commands-import.ts importToActor。
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
  | { status: 'question'; question: ImportQuestion; ms: number; missed: string[] }
  | { status: 'ready'; changes: KernelChange[]; added: Array<{ id: string; type: string; typeLabel: string; name: string }>; ms: number }
  | { status: 'error'; error: string; ms: number }

export class KernelImportFlow {
  constructor(private readonly deps: { runtime: KernelRuntime; people: KernelPeople }) {}

  /** replaceItemId = 换掉的那件（换种族 / 背景）：官方先拿掉它，和导入算同一次改动。 */
  async step(ownerKey: string, actorId: string, ref: EntryRef, answers: AskAnswer[], replaceItemId?: string): Promise<ImportStep> {
    const t0 = performance.now()
    const ms = () => Math.round(performance.now() - t0)
    const out = await this.run(ownerKey, actorId, ref, answers, replaceItemId)
    if (out.status === 'pending' && out.question) {
      // 第一题出来后玩家要想一会儿：后台先把物品资料读好（起始装备题要用），不等它
      if (!answers.length) void this.deps.runtime.session(ownerKey).then(({ session }) => session.call('warmImport')).catch((e: unknown) => console.warn('[trpg-assistant] 预读物品资料没成功', e))
      await this.deps.people.cancel(ownerKey, [actorId])
      const shown = await (await this.deps.runtime.displayFor(ownerKey, [ref])).show(out.question as AskQuestion)
      return { status: 'question', question: shown.value as ImportQuestion, ms: ms(), missed: shown.missed }
    }
    if (out.status !== 'complete') {
      if (out.changes?.length) await this.deps.people.cancel(ownerKey, [actorId])
      return { status: 'error', error: out.error ?? `导入没有完成（${out.status}）`, ms: ms() }
    }
    const exit = String(out.result?.exit ?? '')
    if (exit === 'taskExitCancelled' || exit === 'taskExitCompleteFailed') {
      if (out.changes?.length) await this.deps.people.cancel(ownerKey, [actorId])
      return { status: 'error', error: exit === 'taskExitCancelled' ? '作者导入被取消' : '作者导入失败（详见控制台）', ms: ms() }
    }
    const rows = (out.result?.added ?? []) as AddedRow[]
    const names: FrameText[] = rows.map((row) => row.label ?? named(row.name, []))
    const shown = await (await this.deps.runtime.displayFor(ownerKey, [ref])).show({ names, types: rows.map((row) => row.typeLabel ?? named(row.type, [])) })
    return {
      status: 'ready', changes: (out.changes ?? []) as KernelChange[], ms: ms(),
      added: rows.map((row, i) => ({ id: row._id, type: row.type, typeLabel: String(shown.value.types[i] ?? row.type), name: String(shown.value.names[i] ?? row.name) })),
    }
  }

  /** 小窗跑一次作者导入（importToActor）：条目按库编号换成作者认得的原文（和建卡、加条目同一条换法）。 */
  private async run(ownerKey: string, actorId: string, ref: EntryRef, answers: AskAnswer[], replaceItemId?: string): Promise<{ status: string; result?: any; changes?: unknown[]; error?: string; question?: unknown }> {
    const rt = this.deps.runtime
    // 回答里玩家从库里选的专长（属性提升改选专长）：同一条换法换成作者认得的条目
    const featRefs = answers.flatMap((a) => (a.featRef ? [a.featRef as EntryRef] : []))
    const rows = await rt.entries(ownerKey, [ref, ...featRefs])
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error }
    const [row, ...feats] = rows.rows
    let n = 0
    const given = answers.map((a) => (a.featRef ? { ...a, featRef: undefined, featEntry: feats[n++]?.entry } : a))
    const { session } = await rt.session(ownerKey)
    const result = await session.call('importToActor', actorId, { prop: row.ref.prop, entry: row.entry }, given, replaceItemId)
    if (result.status === 'pending') return { status: 'pending', question: result.result?.question ?? null, changes: result.changes ?? [] }
    if (!executed(result.status)) return { status: result.status, error: result.error ?? `导入状态：${result.status}`, changes: result.changes ?? [] }
    await rt.trackAdded(ownerKey, actorId, result.result?.added)
    return { status: 'complete', result: result.result, changes: result.changes ?? [] }
  }

  /** 确认：留在小窗里的改动写进存档（一条撤销）。 */
  confirm(ownerKey: string, changes: KernelChange[]) { return this.deps.people.confirm(ownerKey, changes) }
  /** 取消：这个人按存档退回。 */
  cancel(ownerKey: string, actorId: string) { return this.deps.people.cancel(ownerKey, [actorId]) }
}
