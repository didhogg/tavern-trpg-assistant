// P6 B1 人物页统一入口（界面只从这里取）：读人、改人、回到自动、掷骰、休息 / 升降级（先预览）、
// 加人 / 复制 / 回收站 / 彻底删除、撤销与改动记录。规则全在结算小窗（官方 dnd5e），这里只按顺序调用、写存档、让小窗和存档一致。
//
//  小操作：小窗执行 → 立刻写存档（可撤销）          大操作：小窗执行 → 预览 → [确认] 写存档 / [取消] 按存档退回
//  撤销：存档退一步 → 小窗里受影响的人按存档退回     回到自动：小窗里把字段改回基准值 → 写存档时差别自然消失
import type { KernelActorCompact, KernelSaveService } from '../../core/saves/kernel'
import { isObject, jsonDiff } from '../../core/saves/state'
import type { EntryRef } from '../../library/scopes'
import type { KernelActor, KernelChange } from '../../schemas/kernel'
import type { SheetEdit } from './frame/commands-sheet'
import type { KernelRuntime } from './runtime'

/**
 * 游戏中会变的状态（不是手改设定，不画金线）。登记表：加一种 = 加一行，按 dnd5e 6.1 数据路径匹配。
 * 其余和基准不同的字段都算"手改设定"（加值、覆盖、基础值、熟练…）。
 */
export const PLAY_STATE: RegExp[] = [
  /^system\.attributes\.hp\.(value|temp|tempmax)$/, /^system\.attributes\.death\./, /^system\.attributes\.(inspiration|exhaustion)$/,
  /^system\.spells\.[^.]+\.value$/, /^system\.resources\.[^.]+\.value$/, /^system\.currency\./, /^system\.details\.xp\./,
  /^system\.(uses\.spent|quantity|equipped|attuned|prepared|container|hd\.spent)$/, /^system\.activities\.[^.]+\.uses\.spent$/,
]

export interface ChangedField { path: string; kind: 'state' | 'setting' }

/** 两份数据逐字段比出的路径（`-=` 删除的也算）。 */
function paths(diff: Record<string, unknown>, prefix = '', out: string[] = []): string[] {
  for (const [key, value] of Object.entries(diff)) {
    const path = prefix ? `${prefix}.${key.replace(/^-=/, '')}` : key.replace(/^-=/, '')
    if (!key.startsWith('-=') && isObject(value) && Object.keys(value).length) paths(value as Record<string, unknown>, path, out)
    else out.push(path)
  }
  return out
}
const kindOf = (path: string): ChangedField['kind'] => PLAY_STATE.some((re) => re.test(path)) ? 'state' : 'setting'
const strip = (data: Record<string, unknown>): Record<string, unknown> => { const out = { ...data }; delete out.items; delete out.effects; delete out._stats; return out }
const get = (obj: unknown, path: string): unknown => path.split('.').reduce<unknown>((v, k) => isObject(v) ? (v as Record<string, unknown>)[k] : undefined, obj)
const itemsById = (data: Record<string, unknown> | null): Map<string, Record<string, unknown>> =>
  new Map(((data?.items ?? []) as Array<Record<string, unknown>>).map((i) => [String(i._id), i]))

export class KernelPeople {
  constructor(private readonly deps: { runtime: KernelRuntime; saves: KernelSaveService }) {}

  private async rev(ownerKey: string): Promise<number> {
    const k = await this.deps.saves.read(ownerKey)
    if (!k) throw new Error('这个战役还没有绑定结算内核')
    return k.revision
  }
  private async call(ownerKey: string, fn: string, ...args: unknown[]): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any -- 小窗命令结果原样交回
    const { session } = await this.deps.runtime.session(ownerKey)
    return (session.call as unknown as (fn: string, ...args: unknown[]) => Promise<unknown>)(fn, ...args)
  }
  private async saved(ownerKey: string, id: string): Promise<KernelActor | null> {
    return (await this.deps.saves.read(ownerKey))?.actors.find((a) => a.id === id) ?? null
  }

  /** 读人物页：官方数值 + 分解 + 和基准不同的字段（金线只画 setting）。 */
  async sheet(ownerKey: string, actorId: string) {
    const out = await this.call(ownerKey, 'sheet', actorId)
    if (out.status !== 'complete') return out
    const base = await this.deps.runtime.baseOf(ownerKey, actorId)
    const current = ((await this.call(ownerKey, 'preparedActors')) as Array<{ source: Record<string, unknown> }>).find((a) => a.source._id === actorId)?.source ?? null
    const changed: ChangedField[] = base && current ? paths(jsonDiff(strip(base), strip(current))).map((path) => ({ path, kind: kindOf(path) })) : []
    const items: Record<string, ChangedField[]> = {}
    const baseItems = itemsById(base)
    for (const [id, item] of itemsById(current)) {
      const was = baseItems.get(id)
      if (!was) continue
      const list = paths(jsonDiff(was, item)).filter((p) => !p.startsWith('_stats')).map((path) => ({ path, kind: kindOf(path) }))
      if (list.length) items[id] = list
    }
    return { ...out, result: { ...out.result, changed, changedItems: items, baseKnown: !!base } }
  }

  /** 小操作：小窗执行，成功就立刻写进存档（一条撤销）；没成功就按存档把这个人退回，免得小窗留着半截改动。 */
  async act(ownerKey: string, actorId: string, fn: string, ...args: unknown[]) {
    const outcome = await this.call(ownerKey, fn, ...args)
    const changes = (outcome.changes ?? []) as KernelChange[]
    if (outcome.status !== 'complete') { if (changes.length) await this.cancel(ownerKey, [actorId]); return { outcome, kernel: null } }
    const kernel = changes.length ? (await this.deps.saves.apply(ownerKey, changes, await this.rev(ownerKey))).kernel : null
    return { outcome, kernel }
  }

  /** 统一改人物（字段 / 加值 / 覆盖 / 物品 / 效果 / 状态与力竭级数）。 */
  edit(ownerKey: string, actorId: string, edits: SheetEdit[]) { return this.act(ownerKey, actorId, 'edit', actorId, edits) }

  /** 回到自动：把这些字段改回重建基准的值（基准里没有的就删掉）；items = { 物品编号: [路径] }。 */
  async revert(ownerKey: string, actorId: string, fields: string[], items: Record<string, string[]> = {}) {
    const base = await this.deps.runtime.baseOf(ownerKey, actorId)
    if (!base) throw new Error(`没有 ${actorId} 的重建基准，先读档或重开战役`)
    const edits: SheetEdit[] = fields.map((path) => { const v = get(base, path); return v === undefined ? { kind: 'set', path, remove: true } : { kind: 'set', path, value: v } })
    const baseItems = itemsById(base)
    for (const [itemId, list] of Object.entries(items)) for (const path of list) {
      const v = get(baseItems.get(itemId), path)
      edits.push(v === undefined ? { kind: 'item', itemId, path, remove: true } : { kind: 'item', itemId, path, value: v })
    }
    return this.edit(ownerKey, actorId, edits)
  }

  /** 检定登记表（属性 / 工具 / 死亡豁免 / 生命骰 / 战斗外先攻）；会改人物的（死亡豁免、生命骰）立刻写存档。 */
  check(ownerKey: string, actorId: string, kind: string, key?: string, points: number[] = []) { return this.act(ownerKey, actorId, 'check', actorId, kind, key, points) }

  /** 大操作先预览：小窗执行，交回结果 + 存档前后对照；之后 confirm 写入或 cancel 退回。fn = rest / levelUpApply / useItem / cast … */
  async attempt(ownerKey: string, actorId: string, fn: string, ...args: unknown[]) {
    const outcome = await this.call(ownerKey, fn, ...args)
    const changes = (outcome.changes ?? []) as KernelChange[]
    const preview = changes.length ? await this.deps.saves.preview(ownerKey, changes) : null
    return { outcome, changes, preview, actorId }
  }
  async confirm(ownerKey: string, changes: KernelChange[]) { return (await this.deps.saves.apply(ownerKey, changes, await this.rev(ownerKey))).kernel }
  /** 取消：小窗里这些人按存档退回。 */
  async cancel(ownerKey: string, ids: string[]) {
    for (const id of ids) await this.deps.runtime.restore(ownerKey, id, await this.saved(ownerKey, id))
  }

  /** 加人：分步建卡。adjustments = 列表信息（分类等）。 */
  async build(ownerKey: string, plan: Parameters<KernelRuntime['buildCharacter']>[1], adjustments: Record<string, unknown> = {}) {
    const built = await this.deps.runtime.buildCharacter(ownerKey, plan)
    if (built.status !== 'complete' || !built.id) return { built, kernel: null }
    return { built, kernel: await this.enroll(ownerKey, [built.id], adjustments) }
  }
  /** 加人：从模板（库里的怪物 / NPC）加入，count 份。 */
  async fromTemplate(ownerKey: string, ref: EntryRef, count = 1, adjustments: Record<string, unknown> = {}) {
    const made = await this.deps.runtime.createActors(ownerKey, Array.from({ length: Math.max(1, count) }, () => ref))
    if (made.status !== 'complete' || !made.actors) return { made, kernel: null }
    return { made, kernel: await this.enroll(ownerKey, made.actors.map((a: { id: string }) => a.id), adjustments) }
  }
  /** 复制一个人：同样的引用 / 选择 / 状态差别，换新种子重建（读档时编号不会和原来的人撞）。 */
  async copy(ownerKey: string, actorId: string, name: string) {
    const source = await this.saved(ownerKey, actorId)
    if (!source) throw new Error(`存档里没有这个人物：${actorId}`)
    const copy = { ...source, name, seed: `${source.seed || source.name}~${crypto.randomUUID().slice(0, 8)}` }
    const result = await this.deps.runtime.rebuild(ownerKey, copy)
    if (result.status !== 'complete' || !result.id) return { result, kernel: null }
    if (copy.name !== (result.data as { name?: string } | undefined)?.name) await this.call(ownerKey, 'renameActor', result.id, name)
    return { result, kernel: await this.enroll(ownerKey, [result.id], source.adjustments) }
  }
  private async enroll(ownerKey: string, ids: string[], adjustments: Record<string, unknown>) {
    const compacts: KernelActorCompact[] = await this.deps.runtime.compact(ownerKey, ids)
    return (await this.deps.saves.addActors(ownerKey, compacts, await this.rev(ownerKey), adjustments)).kernel
  }

  /** 列表信息（分类、标签、置顶、回收站、排序）：改人物的个人调整，可撤销。 */
  async adjust(ownerKey: string, ids: string[], patch: Record<string, unknown>) {
    return (await this.deps.saves.setAdjustments(ownerKey, ids, patch, await this.rev(ownerKey))).kernel
  }
  /** 彻底删除（回收站清空）：存档拿掉，小窗里也删掉。可撤销。 */
  async purge(ownerKey: string, ids: string[]) {
    const kernel = (await this.deps.saves.purgeActors(ownerKey, ids, await this.rev(ownerKey))).kernel
    for (const id of ids) await this.deps.runtime.restore(ownerKey, id, null)
    return kernel
  }

  /** 撤销一步：存档退回后，小窗里受影响的人按存档退回（加人的撤销 = 删掉）。 */
  async undo(ownerKey: string) {
    const done = await this.deps.saves.undo(ownerKey, await this.rev(ownerKey))
    if (!done) return null
    for (const row of done.restored) await this.deps.runtime.restore(ownerKey, row.id, row.actor)
    return done.kernel
  }
  /** 撤销到这里：一步一步撤，直到那次写入之前（revision = 改动记录里那一行的 revision）。 */
  async undoTo(ownerKey: string, revision: number) {
    let kernel = await this.deps.saves.read(ownerKey)
    while (kernel && (kernel.undo.at(-1)?.revision ?? -1) >= revision) kernel = await this.undo(ownerKey) ?? null
    return kernel
  }
  history(ownerKey: string) { return this.deps.saves.history(ownerKey) }
}
