// P3-3b 第 ② 步：把“完整人物 + 重建基准”拆成存档要的三样东西（引用/选择/状态差别），
// 以及把这三样叠回重建出来的人物。纯函数，不碰数据库、不碰小窗。
import { kernelActorStateSchema, type KernelActor, type KernelActorState, type KernelCampaign, type KernelChange, type KernelCombat, type KernelRef } from '../../schemas/kernel'
import { clone, isObject, jsonDiff, mergeDiff, stateKeyOfFlags, stateKeyOfRef } from './state'

export { applyActorState, jsonDiff } from './state'

export interface KernelActorData {
  id: string
  name: string
  data: Record<string, unknown>
}

export interface KernelRefFlags {
  page?: string
  source?: string
  hash?: string
  propDroppable?: string
  label?: string
}

/** 作者编号 → 本战役【库】里的条目身份；映射不了返回 null。 */
export type KernelRefMapper = (flags: KernelRefFlags) => KernelRef | null

/** 找两份数据的差别；默认实现只处理 JSON 对象/数组/值（数组整体替换）。 */
export type KernelDiff = (base: unknown, current: unknown) => Record<string, unknown>

/** 引用/选择的键：同一本书的同一类别同一条。 */
export function refKey(ref: Pick<KernelRef, 'set' | 'prop' | 'hash'>): string {
  return `${ref.set}|${ref.prop}|${ref.hash}`
}

const byId = (list: unknown): Map<string, Record<string, unknown>> => {
  const out = new Map<string, Record<string, unknown>>()
  if (!Array.isArray(list)) return out
  for (const item of list) if (isObject(item) && typeof item._id === 'string') out.set(item._id, item)
  return out
}

const stripCollections = (data: Record<string, unknown>): Record<string, unknown> => {
  const out = clone(data)
  delete out.items
  delete out.effects
  return out
}

function refsOf(data: Record<string, unknown>, mapRef: KernelRefMapper): KernelRef[] {
  const actorFlags = isObject(data.flags) && isObject(data.flags.plutonium) ? data.flags.plutonium as KernelRefFlags : null
  if (actorFlags?.source && actorFlags?.hash && (actorFlags.page === 'bestiary.html' || actorFlags.propDroppable === 'creature' || data.type !== 'character')) {
    const ref = mapRef({ ...actorFlags, propDroppable: 'creature' })
    if (!ref) throw new Error(`无法把作者编号对应到【库】条目：${actorFlags.source}/${actorFlags.hash}`)
    return [{ ...ref, label: ref.label ?? (typeof data.name === 'string' ? data.name : undefined) }]
  }
  const out: KernelRef[] = []
  if (!Array.isArray(data.items)) return out
  for (const item of data.items) {
    if (!isObject(item) || typeof item._id !== 'string') continue
    const flags = isObject(item.flags) && isObject(item.flags.plutonium) ? item.flags.plutonium as KernelRefFlags : null
    if (!flags) continue
    const ref = mapRef(flags)
    if (!ref) throw new Error(`无法把作者编号对应到【库】条目：${flags.source}/${flags.hash}`)
    out.push({ ...ref, itemId: item._id, label: ref.label ?? (typeof item.name === 'string' ? item.name : undefined) })
  }
  return out
}

/** 完整人物 + 重建基准 → 引用 / 选择 / 状态差别。choices 来自官方 Advancement#reverse。 */
export function splitActor(current: KernelActorData, rebuilt: KernelActorData, mapRef: KernelRefMapper, choices: Record<string, unknown>, diff: KernelDiff = jsonDiff): {
  refs: KernelRef[]
  choices: Record<string, unknown>
  state: KernelActorState
} {
  const data = current.data
  const base = rebuilt.data
  const state: KernelActorState = kernelActorStateSchema.parse({})
  state.actor = diff(stripCollections(base), stripCollections(data))
  const refs = refsOf(data, mapRef)
  const keyById = new Map<string, string>()
  for (const ref of refs) if (ref.itemId) { const key = stateKeyOfRef(ref); if (key) keyById.set(ref.itemId, key) }
  const baseItems = byId(base.items)
  const currentItems = byId(data.items)
  for (const [id, item] of currentItems) {
    const before = baseItems.get(id)
    const flags = isObject(item.flags) && isObject(item.flags.plutonium) ? item.flags.plutonium as KernelRefFlags : null
    const key = stateKeyOfFlags(flags) ?? keyById.get(id) ?? id
    if (!before) {
      // 有作者引用的新增物品：重建时按 refs 重新建出来，不把整份内容塞进 state。
      if (!key.startsWith('ref:')) state.itemAdded.push(clone(item))
      continue
    }
    const d = diff(before, item)
    if (Object.keys(d).length) state.items[key] = d
  }
  for (const [id, item] of baseItems) {
    if (currentItems.has(id)) continue
    const flags = isObject(item.flags) && isObject(item.flags.plutonium) ? item.flags.plutonium as KernelRefFlags : null
    const direct = stateKeyOfFlags(flags)
    const ref = flags ? mapRef(flags) : null
    state.itemRemoved.push(direct ?? stateKeyOfRef(ref) ?? id)
  }
  const baseEffects = byId(base.effects)
  const currentEffects = byId(data.effects)
  for (const [id, effect] of currentEffects) {
    const before = baseEffects.get(id)
    if (!before) { state.effectAdded.push(clone(effect)); continue }
    const d = diff(before, effect)
    if (Object.keys(d).length) state.effects[id] = d
  }
  for (const id of baseEffects.keys()) if (!currentEffects.has(id)) state.effectRemoved.push(id)
  return { refs, choices, state }
}

// ---------- 战斗：战役层只存一份 ----------

export function emptyCombat(): KernelCombat {
  return { id: null, name: '', round: 0, turn: null, active: false, combatants: [] }
}

const combatantOf = (data: Record<string, unknown>): KernelCombat['combatants'][number] | null => {
  if (typeof data._id !== 'string' || typeof data.actorId !== 'string') return null
  return {
    id: data._id,
    actorId: data.actorId,
    name: typeof data.name === 'string' ? data.name : undefined,
    initiative: typeof data.initiative === 'number' ? data.initiative : null,
    defeated: data.defeated === true,
    hidden: data.hidden === true,
  }
}

/** 把一条战斗改动叠进战役层的那一份战斗；人物归属的改动不进来。 */
export function applyCombatChange(current: KernelCombat, change: KernelChange): KernelCombat {
  const out = clone(current)
  const data = isObject(change.data) ? change.data : {}
  if (change.type === 'Combat') {
    if (change.action === 'delete') return emptyCombat()
    if (change.action === 'create') {
      out.id = typeof data._id === 'string' ? data._id : null
      out.name = typeof data.name === 'string' ? data.name : out.name
      out.round = typeof data.round === 'number' ? data.round : 0
      out.turn = typeof data.turn === 'number' ? data.turn : null
      out.active = data.active === true
      out.combatants = Array.isArray(data.combatants)
        ? data.combatants.map(combatantOf).filter((c): c is NonNullable<typeof c> => !!c) : []
      return out
    }
    if (typeof data._id === 'string') out.id = data._id
    if (typeof data.name === 'string') out.name = data.name
    if (typeof data.round === 'number') out.round = data.round
    if (typeof data.turn === 'number' || data.turn === null) out.turn = data.turn as number | null
    if (typeof data.active === 'boolean') out.active = data.active
    if (Array.isArray(data.combatants)) {
      for (const raw of data.combatants) {
        if (!isObject(raw)) continue
        const next = combatantOf(raw)
        if (!next) continue
        const index = out.combatants.findIndex((c) => c.id === next.id)
        if (index < 0) out.combatants.push(next)
        else out.combatants[index] = { ...out.combatants[index], ...next }
      }
    }
    return out
  }
  if (change.type !== 'Combatant') return out
  const id = typeof data._id === 'string' ? data._id : null
  if (change.action === 'delete') {
    const ids = Array.isArray(change.data) ? change.data.filter((v): v is string => typeof v === 'string') : id ? [id] : []
    out.combatants = out.combatants.filter((c) => !ids.includes(c.id))
    return out
  }
  const next = combatantOf({ ...data, _id: id ?? data._id, actorId: data.actorId ?? out.combatants.find((c) => c.id === id)?.actorId })
  if (!next) return out
  const index = out.combatants.findIndex((c) => c.id === next.id)
  if (index < 0) out.combatants.push(next)
  else out.combatants[index] = { ...out.combatants[index], ...next }
  return out
}

export function applyCombatChanges(current: KernelCombat, changes: KernelChange[]): KernelCombat {
  let out = clone(current)
  for (const change of changes) if (change.type === 'Combat' || change.type === 'Combatant') out = applyCombatChange(out, change)
  return out
}

export function isCombatChange(change: KernelChange): boolean {
  return change.type === 'Combat' || change.type === 'Combatant'
}

export function actorIdOf(change: KernelChange): string | null {
  if (change.parentUuid?.startsWith('Actor.')) return change.parentUuid.slice('Actor.'.length)
  if (change.type === 'Actor' && isObject(change.data) && typeof change.data._id === 'string') return change.data._id
  return null
}

// ---------- 没有小窗时的退路：把改动直接叠进精简段 ----------

function merge(target: Record<string, unknown>, patch: Record<string, unknown>): void {
  mergeDiff(target, patch)
}

/** 把一条人物改动叠进精简段（没有重建基准时用；有基准时用 splitActor）。 */
export function applyActorChange(actor: KernelActor, change: KernelChange, mapRef: KernelRefMapper): KernelActor {
  const next = clone(actor)
  const state = next.state
  const data = isObject(change.data) ? change.data : {}
  if (change.type === 'Actor') {
    if (change.action === 'delete') { state.actor = { __deleted: true }; return next }
    if (change.action === 'create') throw new Error('没有 compactActors：不能把 Actor.create 直接塞进存档')
    merge(state.actor, data)
    return next
  }
  if (change.type === 'Item') {
    const id = typeof data._id === 'string' ? data._id : null
    if (change.action === 'delete') {
      const ids = Array.isArray(change.data) ? change.data.filter((v): v is string => typeof v === 'string') : id ? [id] : []
      state.itemRemoved.push(...ids)
      return next
    }
    if (change.action === 'create') {
      const flags = isObject(data.flags) && isObject(data.flags.plutonium) ? data.flags.plutonium as KernelRefFlags : null
      const ref = flags ? mapRef(flags) : null
      if (isObject(data.system) && isObject(data.system.advancement) && Object.values(data.system.advancement).some((a) => isObject(a) && isObject(a.value) && Object.keys(a.value).length)) {
        throw new Error('没有 compactActors：不能从 Item.create 推回成长选择')
      }
      if (!ref || !id) throw new Error('没有 compactActors：不能把没有作者编号的物品整份存进存档')
      next.refs.push({ ...ref, itemId: id, label: ref.label ?? (typeof data.name === 'string' ? data.name : undefined) })
      return next
    }
    if (!id) return next
    const patch = clone(data)
    delete patch._id
    if (isObject(patch.system) && isObject(patch.system.advancement)) {
      throw new Error('没有 compactActors：不能从物品更新推回成长选择')
    }
    state.items[id] = state.items[id] ? { ...state.items[id], ...patch } : patch
    return next
  }
  if (change.type === 'ActiveEffect') {
    const id = typeof data._id === 'string' ? data._id : null
    if (change.action === 'delete') {
      const ids = Array.isArray(change.data) ? change.data.filter((v): v is string => typeof v === 'string') : id ? [id] : []
      state.effectRemoved.push(...ids)
      return next
    }
    if (change.action === 'create') { state.effectAdded.push(clone(data)); return next }
    if (id) state.effects[id] = state.effects[id] ? { ...state.effects[id], ...clone(data) } : clone(data)
    return next
  }
  return next
}

export function applyActorChanges(actor: KernelActor, changes: KernelChange[], mapRef: KernelRefMapper): KernelActor {
  let out = clone(actor)
  for (const change of changes) if (!isCombatChange(change)) out = applyActorChange(out, change, mapRef)
  return out
}

/** 用一条改动更新整个内核段：人物改动进对应人物，战斗改动进战役层一份。 */
export function applyKernelChanges(kernel: KernelCampaign, changes: KernelChange[], mapRef: KernelRefMapper): KernelCampaign {
  const next = clone(kernel)
  for (const change of changes) {
    if (isCombatChange(change)) {
      next.combat = applyCombatChange(next.combat, change)
      continue
    }
    const actorId = actorIdOf(change)
    if (!actorId) continue
    const index = next.actors.findIndex((a) => a.id === actorId)
    if (index < 0) continue
    next.actors[index] = applyActorChange(next.actors[index], change, mapRef)
  }
  return next
}
