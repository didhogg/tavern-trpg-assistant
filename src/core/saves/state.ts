// P3-3b：人物状态差别的纯数据操作。不依赖 Foundry / zod，核心与结算小窗共用。
export interface KernelActorStateLike {
  actor: Record<string, unknown>
  items: Record<string, Record<string, unknown>>
  effects: Record<string, Record<string, unknown>>
  itemAdded: Array<Record<string, unknown>>
  itemRemoved: string[]
  effectAdded: Array<Record<string, unknown>>
  effectRemoved: string[]
}

export const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
export const clone = <T>(value: T): T => structuredClone(value)

export function emptyActorState(): KernelActorStateLike {
  return { actor: {}, items: {}, effects: {}, itemAdded: [], itemRemoved: [], effectAdded: [], effectRemoved: [] }
}

/** Foundry diffObject 的 JSON 等价物：对象逐键比，数组整体比，删除的键写成 `-=键`。
 *  splitActor 在插件/core 侧运行（不在结算小窗里），不能直接调用 foundry.utils.diffObject；
 *  这里按它的对象/数组/删除键语义实现，并用单元测试保证“拆开再叠回”逐项相等。 */
export function jsonDiff(base: unknown, current: unknown): Record<string, unknown> {
  if (isObject(base) && isObject(current)) {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(current)) {
      if (JSON.stringify(base[key]) === JSON.stringify(current[key])) continue
      const value = isObject(base[key]) && isObject(current[key]) ? jsonDiff(base[key], current[key]) : clone(current[key])
      out[key] = value
    }
    for (const key of Object.keys(base)) if (!(key in current)) out[`-=${key}`] = null
    return out
  }
  return JSON.stringify(base) === JSON.stringify(current) ? {} : clone(current) as Record<string, unknown>
}

export function mergeDiff(target: Record<string, unknown>, diff: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(diff)) {
    if (key.startsWith('-=')) { delete target[key.slice(2)]; continue }
    if (isObject(value) && isObject(target[key])) mergeDiff(target[key] as Record<string, unknown>, value)
    else target[key] = clone(value)
  }
}

/** 重建基准 + 状态差别 → 完整人物数据。 */
export function applyActorState(rebuilt: Record<string, unknown>, state: KernelActorStateLike): Record<string, unknown> {
  const out = clone(rebuilt)
  mergeDiff(out, state.actor)
  const items = Array.isArray(out.items) ? out.items as Record<string, unknown>[] : []
  const effects = Array.isArray(out.effects) ? out.effects as Record<string, unknown>[] : []
  const itemMap = new Map(items.filter((item) => typeof item._id === 'string').map((item) => [item._id as string, item]))
  for (const [id, d] of Object.entries(state.items)) {
    const item = itemMap.get(id)
    if (item) mergeDiff(item, d)
  }
  for (const item of state.itemAdded) {
    const id = item._id
    if (typeof id !== 'string' || !itemMap.has(id)) { items.push(clone(item)); if (typeof id === 'string') itemMap.set(id, item) }
  }
  const removed = new Set(state.itemRemoved)
  out.items = items.filter((item) => typeof item._id !== 'string' || !removed.has(item._id))
  const effectMap = new Map(effects.filter((effect) => typeof effect._id === 'string').map((effect) => [effect._id as string, effect]))
  for (const [id, d] of Object.entries(state.effects)) {
    const effect = effectMap.get(id)
    if (effect) mergeDiff(effect, d)
  }
  for (const effect of state.effectAdded) {
    const id = effect._id
    if (typeof id !== 'string' || !effectMap.has(id)) { effects.push(clone(effect)); if (typeof id === 'string') effectMap.set(id, effect) }
  }
  const removedEffects = new Set(state.effectRemoved)
  out.effects = effects.filter((effect) => typeof effect._id !== 'string' || !removedEffects.has(effect._id))
  return out
}
