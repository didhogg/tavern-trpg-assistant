// 读人物页（people.sheet 的实现）：官方数值 + 官方显示数据，过唯一显示出口。
// 显示文字过唯一出口：物品 / 特性 / 效果名换成本战役语言，带作者编号的配上库条目（ref）；怪物动作等由小窗按作者编号在条目里定位。
// 分段计时（写完重读整张人物是每次改动后等得最久的一段）：读存档 / 显示出口 / 小窗读数 / 过显示出口，写 console.debug。
import { stopwatch } from '../../core/stopwatch'
import type { KernelRuntime } from './runtime'

import type { ChangedField } from './people'
import type { FieldInfo } from './person-views'

interface SavedLike { refs?: Array<{ set: string; prop: string; hash: string }>; off?: unknown[] }
type Call = (ownerKey: string, fn: string, ...args: unknown[]) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any -- 小窗命令结果原样交回

export async function readSheet(ctx: {
  saved: (ownerKey: string, actorId: string) => Promise<SavedLike | null>
  call: Call
  runtime: KernelRuntime
}, ownerKey: string, actorId: string) {
  const w = stopwatch()
  const savedActor = await ctx.saved(ownerKey, actorId)
  w.lap('saved')
  const refs = (savedActor?.refs ?? []).map((r) => ({ set: r.set, prop: r.prop, hash: r.hash }))
  const shownBy = await ctx.runtime.displayFor(ownerKey, refs)
  w.lap('display')
  const out = await ctx.call(ownerKey, 'sheet', actorId, shownBy.entries)
  w.lap('frame')
  if (out.status !== 'complete') return out
  // 物品 / 效果名和官方显示数据（view）一起过唯一显示出口
  const shown = await shownBy.show({ shown: out.result.shown, view: out.result.view, levels: out.result.levels })
  w.lap('show')
  console.debug('[trpg-assistant] 人物读数用时', JSON.stringify(w.done({ refs: refs.length })), '小窗', JSON.stringify(out.result.ms ?? {}))
  // off = 这个人现在取下了哪几项（存档里的安排；特征 / 职业与出身单元按它显示「已取下」、装回 = 去掉那一行）
  const off = savedActor?.off ?? []
  const changed: ChangedField[] = [] // P6-R：人物存完整数据，没有「自动基准」可比，金线不再有（留空给旧调用方）
  return { ...out, result: { ...out.result, shown: shown.value.shown, view: shown.value.view, levels: shown.value.levels, off, changed, changedItems: {} as Record<string, ChangedField[]>, baseKnown: true, ...(shown.missed.length ? { untranslated: shown.missed } : {}) } }
}

/** 编辑窗口：一块字段的官方定义（名字 / 种类 / 选项 / 底值）+ 改到它的效果 + 官方明细（P6-R），过唯一出口。 */
export async function readFields(ctx: { call: Call; runtime: KernelRuntime }, ownerKey: string, actorId: string, target: { itemId?: string; path: string }) {
  const out = await ctx.call(ownerKey, 'fieldInfo', actorId, target)
  if (out.status !== 'complete') return out
  const shown = await (await ctx.runtime.displayFor(ownerKey, [])).show(out.result as FieldInfo)
  return { ...out, result: shown.value }
}

/** 只读的小窗取数并过唯一出口（特质选项 traitChoices、特殊特质 specialTraits……）：不写存档；没取成 = null。 */
export async function readShown<T>(ctx: { call: Call; runtime: KernelRuntime }, ownerKey: string, fn: string, ...args: unknown[]): Promise<T | null> {
  const out = await ctx.call(ownerKey, fn, ...args)
  if (out.status !== 'complete') return null
  return (await (await ctx.runtime.displayFor(ownerKey, [])).show(out.result)).value as T
}

/** 降级演练：官方在小窗里真降一次，交回会收回的物品（已过显示出口）、生命上限 / 总等级前后；只算不存，算完 cancel 按存档退回。 */
export async function readLevelPreview(ctx: { saved: (ownerKey: string, actorId: string) => Promise<SavedLike | null>; call: Call; runtime: KernelRuntime; cancel: (ownerKey: string, ids: string[]) => Promise<void> }, ownerKey: string, actorId: string, classId: string, delta: number) {
  const refs = ((await ctx.saved(ownerKey, actorId))?.refs ?? []).map((r) => ({ set: r.set, prop: r.prop, hash: r.hash }))
  const shownBy = await ctx.runtime.displayFor(ownerKey, refs)
  const out = await ctx.call(ownerKey, 'levelPreview', actorId, classId, delta, shownBy.entries)
  await ctx.cancel(ownerKey, [actorId])
  if (out.status !== 'complete') return out
  return { ...out, result: (await shownBy.show(out.result)).value }
}
