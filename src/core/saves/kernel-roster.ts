// P6 B1：存档里的人物名单（加人、彻底删除、个人调整）与撤销 / 改动记录。
// 和 kernel.ts 的 apply 同一套规矩：比对修订号、短事务写、每次写一条撤销记录（改前的整个人物；加人记 null）。
// 列表信息（分类、标签、置顶、回收站、排序）放在人物已有的 adjustments 里（驾驶员 2026-11-15 定），存档结构不变。
import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import type { Workspace } from '../../schemas/campaign'
import { kernelCombatSchema, type KernelActor, type KernelCampaign } from '../../schemas/kernel'
import type { KernelActorCompact } from './kernel-types'
import { clone, isObject, jsonDiff } from './state'

export interface RosterContext {
  db: TrpgDatabase
  now: () => number
  limit: () => Promise<number>
  parse: (raw: unknown) => KernelCampaign | null
}

/** 撤销后每个受影响的人物现在的样子（null = 存档里已经没有他），交给结算小窗按存档退回。 */
export interface RestoredActor { id: string; actor: KernelActor | null }

async function write<T>(ctx: RosterContext, ownerKey: string, expectedRevision: number,
  change: (kernel: KernelCampaign) => { actors: KernelActor[]; before: Record<string, unknown>; extra?: T }): Promise<{ workspace: Workspace; kernel: KernelCampaign; extra?: T }> {
  const limit = await ctx.limit()
  return ctx.db.transaction('rw', ctx.db.workspaces, async () => {
    const ws = await ctx.db.workspaces.get(ownerKey)
    if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    const kernel = ctx.parse(ws.data.kernel)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    if (kernel.revision !== expectedRevision) throw new TrpgError('E_REVISION_CONFLICT', '存档已被其他窗口修改，请重新读取')
    const { actors, before, extra } = change(kernel)
    const next: KernelCampaign = {
      ...kernel, actors, revision: kernel.revision + 1,
      undo: [...kernel.undo, { at: ctx.now(), revision: kernel.revision, actorIds: Object.keys(before), before }].slice(-limit),
    }
    const workspace: Workspace = { ...ws, data: { ...ws.data, kernel: next }, updatedAt: ctx.now() }
    await ctx.db.workspaces.put(workspace)
    return { workspace, kernel: next, extra }
  })
}

/** 加人：建卡、从模板加入、复制之后调用；撤销 = 把他从存档拿掉。 */
export function addActors(ctx: RosterContext, ownerKey: string, compacts: KernelActorCompact[], expectedRevision: number, adjustments: Record<string, unknown> = {}) {
  return write(ctx, ownerKey, expectedRevision, (kernel) => {
    const taken = new Set(kernel.actors.map((a) => a.id))
    const before: Record<string, unknown> = {}
    const added = compacts.map((c) => {
      if (taken.has(c.id)) throw new TrpgError('E_ACTOR_EXISTS', `存档里已经有这个人物：${c.id}`)
      before[c.id] = null
      return { ...clone(c), off: clone(c.off ?? []), adjustments: clone(adjustments), dice: [], legacy: false } as KernelActor
    })
    return { actors: [...kernel.actors.map(clone), ...added], before }
  })
}

/** 彻底删除（回收站里清掉）；撤销 = 放回名单末尾。进回收站只是改 adjustments，不走这里。 */
export function purgeActors(ctx: RosterContext, ownerKey: string, ids: string[], expectedRevision: number) {
  return write(ctx, ownerKey, expectedRevision, (kernel) => {
    const before: Record<string, unknown> = {}
    for (const a of kernel.actors) if (ids.includes(a.id)) before[a.id] = clone(a)
    return { actors: kernel.actors.filter((a) => !ids.includes(a.id)).map(clone), before }
  })
}

/** 改个人调整（分类、标签、置顶、回收站、排序…）：patch 里的值为 null 表示删掉这个键。 */
export function setAdjustments(ctx: RosterContext, ownerKey: string, ids: string[], patch: Record<string, unknown>, expectedRevision: number) {
  return write(ctx, ownerKey, expectedRevision, (kernel) => {
    const before: Record<string, unknown> = {}
    const actors = kernel.actors.map((a) => {
      if (!ids.includes(a.id)) return clone(a)
      before[a.id] = clone(a)
      const adjustments = { ...clone(a.adjustments) }
      for (const [k, v] of Object.entries(patch)) { if (v === null) delete adjustments[k]; else adjustments[k] = clone(v) }
      return { ...clone(a), adjustments }
    })
    return { actors, before }
  })
}

/**
 * 改取下安排（P6）：取下安排 + 按新安排重新拆好的人物段一起写，一条撤销；版本对不上就不写（期间别处改过）。
 * 只换引用 / 选择 / 状态 / 取下安排，个人调整、骰点不动。
 */
export function setOff(ctx: RosterContext, ownerKey: string, compact: KernelActorCompact, off: KernelActor['off'], expectedRevision: number) {
  return write(ctx, ownerKey, expectedRevision, (kernel) => {
    const index = kernel.actors.findIndex((a) => a.id === compact.id)
    if (index < 0) throw new TrpgError('E_NOT_FOUND', `存档里没有这个人物：${compact.id}`)
    const old = kernel.actors[index]
    const actors = kernel.actors.map(clone)
    actors[index] = { ...clone(old), refs: clone(compact.refs), choices: clone(compact.choices), state: clone(compact.state), off: clone(off) }
    return { actors, before: { [old.id]: clone(old) } }
  })
}

/** 撤销最近一次写入：恢复受影响人物（加人的撤销 = 拿掉，删人的撤销 = 放回）与战役战斗；交回每个人现在的样子。 */
export async function undoLast(ctx: RosterContext, ownerKey: string, expectedRevision: number): Promise<{ workspace: Workspace; kernel: KernelCampaign; restored: RestoredActor[] } | null> {
  return ctx.db.transaction('rw', ctx.db.workspaces, async () => {
    const ws = await ctx.db.workspaces.get(ownerKey)
    if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    const kernel = ctx.parse(ws.data.kernel)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    if (kernel.revision !== expectedRevision) throw new TrpgError('E_REVISION_CONFLICT', '存档已被其他窗口修改，请重新读取')
    const last = kernel.undo.at(-1)
    if (!last) return null
    let actors = kernel.actors.map(clone)
    for (const id of last.actorIds) {
      const saved = last.before[id]
      const index = actors.findIndex((a) => a.id === id)
      if (saved === null) { actors = actors.filter((a) => a.id !== id); continue }
      if (isObject(saved) && 'refs' in saved && 'state' in saved) {
        if (index >= 0) actors[index] = clone(saved) as unknown as KernelActor
        else actors.push(clone(saved) as unknown as KernelActor)
      } else if (index >= 0) {
        actors[index] = { ...actors[index], state: (saved as KernelActor['state']) ?? actors[index].state }
      }
    }
    const combat = last.combatBefore ? kernelCombatSchema.parse(last.combatBefore) : kernel.combat
    const next: KernelCampaign = { ...kernel, actors, combat, revision: kernel.revision + 1, undo: kernel.undo.slice(0, -1) }
    const workspace: Workspace = { ...ws, data: { ...ws.data, kernel: next }, updatedAt: ctx.now() }
    await ctx.db.workspaces.put(workspace)
    const restored = last.actorIds.map((id) => ({ id, actor: actors.find((a) => a.id === id) ?? null }))
    return { workspace, kernel: next, restored }
  })
}

/** 改动记录的一行：哪次写入、谁、加了 / 删了 / 改了哪些字段（旧 → 新）。字段名是数据路径，显示名由界面查。 */
export interface HistoryRow {
  revision: number
  at: number
  combat: boolean
  actors: Array<{ id: string; name: string; kind: 'added' | 'removed' | 'changed'; fields: Array<{ path: string; from: unknown; to: unknown }> }>
}

function flatten(diff: Record<string, unknown>, from: unknown, to: unknown, prefix: string, out: HistoryRow['actors'][number]['fields']): void {
  for (const [key, value] of Object.entries(diff)) {
    const removed = key.startsWith('-=')
    const k = removed ? key.slice(2) : key
    const path = prefix ? `${prefix}.${k}` : k
    const a = isObject(from) ? (from as Record<string, unknown>)[k] : undefined
    const b = removed ? undefined : isObject(to) ? (to as Record<string, unknown>)[k] : undefined
    if (!removed && isObject(value) && isObject(a) && isObject(b)) flatten(value as Record<string, unknown>, a, b, path, out)
    else out.push({ path, from: clone(a), to: clone(b) })
  }
}

/** 改动记录（新的在前）：按撤销记录里"改前的人物"和下一次的样子逐字段比出来，不另存一份记录。 */
export function history(kernel: KernelCampaign): HistoryRow[] {
  const state = new Map<string, KernelActor | null>(kernel.actors.map((a) => [a.id, a]))
  const rows: HistoryRow[] = []
  for (const entry of [...kernel.undo].reverse()) {
    const row: HistoryRow = { revision: entry.revision, at: entry.at, combat: !!entry.combatBefore, actors: [] }
    for (const id of entry.actorIds) {
      const after = state.get(id) ?? null
      const raw = entry.before[id]
      const before = raw === null ? null : isObject(raw) && 'refs' in raw ? raw as unknown as KernelActor : after ? { ...after, state: raw as KernelActor['state'] } : null
      const name = after?.name ?? before?.name ?? id
      if (!before) row.actors.push({ id, name, kind: 'added', fields: [] })
      else if (!after) row.actors.push({ id, name, kind: 'removed', fields: [] })
      else {
        const pick = (a: KernelActor) => ({ name: a.name, state: a.state, adjustments: a.adjustments })
        const fields: HistoryRow['actors'][number]['fields'] = []
        flatten(jsonDiff(pick(before), pick(after)), pick(before), pick(after), '', fields)
        row.actors.push({ id, name, kind: 'changed', fields })
      }
      state.set(id, before)
    }
    rows.push(row)
  }
  return rows
}
