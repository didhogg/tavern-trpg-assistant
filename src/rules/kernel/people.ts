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

/** 装人结果：legacy = 旧格式人物（只有整份内容，不能按引用重建）。 */
export interface LoadedActor { id: string; name: string; status: 'complete' | 'missing' | 'pending' | 'error' | 'legacy'; error?: string; missing?: Array<{ label: string; reason: string }> }

/** 人物列表一行；loaded = false 时数值都是 null（没装进小窗：缺资料 / 旧格式 / 出错）。 */
/** 小窗 roster 命令交回的一人。 */
interface LiveRow { id: string; name: string; img: string | null; type: string; system: Record<string, unknown>; items: Array<{ id: string; type: string; name: string; levels: number | null }>; conditions: string[] }

export interface RosterRow {
  id: string; name: string; img: string | null; type: string | null; loaded: boolean
  adjustments: Record<string, unknown>
  classes: Array<{ name: string; levels: number | null }>; race: string | null; background: string | null
  level: number | null; cr: number | null
  hp: { value: number | null; max: number | null; temp: number | null } | null
  ac: number | null; passivePerception: number | null; speed: number | null
  conditions: string[]
  /** 读档检查里这个人缺的条目（名字）；有就在行上标「N 项资料不可用」。 */
  missing: string[]
}

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

/**
 * 加人时的取名规则（复制、从模板加入共用）：base 是名字，count 是要几个，taken 是存档里现有人物的名字。
 *   没有同名、加 1 个 → 「地精」；没有同名、加 3 个 → 地精 1 / 2 / 3；
 *   已有「盖尔」再来 1 个 → 盖尔 2；已有「地精 1~3」再加 2 个 → 地精 4 / 5。
 */
export function nextNames(base: string, count: number, taken: string[]): string[] {
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: (\\d+))?$`)
  let max = 0
  let plain = false
  for (const name of taken) {
    const m = re.exec(name)
    if (!m) continue
    if (m[1]) max = Math.max(max, Number(m[1])); else plain = true
  }
  if (!plain && !max && count === 1) return [base]
  let n = Math.max(max, plain ? 1 : 0)
  return Array.from({ length: count }, () => `${base} ${++n}`)
}
/** 复制时的名字底：「地精 1」复制出来是「地精 4」不是「地精 1 2」。 */
const baseName = (name: string): string => name.replace(/ \d+$/, '')

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

  /**
   * 进战役 / 读档后把存档里的人装进结算小窗（调现成的 rebuildMany：基准缓存全中就一次批量建）。
   * 已经在小窗里的不重建；旧格式人物（legacy）不能按引用重建，照实标出。每人交回：好了 / 缺资料（缺哪些、为什么）/ 出错。
   */
  async load(ownerKey: string): Promise<LoadedActor[]> {
    const kernel = await this.deps.saves.read(ownerKey)
    if (!kernel) return []
    const present = new Set((await this.prepared(ownerKey)).map((a) => String(a.source._id)))
    const todo = kernel.actors.filter((a) => !present.has(a.id) && !a.legacy)
    const results = todo.length ? await this.deps.runtime.rebuildMany(ownerKey, todo) : []
    return kernel.actors.map((a): LoadedActor => {
      if (present.has(a.id)) return { id: a.id, name: a.name, status: 'complete' }
      if (a.legacy) return { id: a.id, name: a.name, status: 'legacy' }
      const r = results[todo.indexOf(a)]
      return { id: a.id, name: a.name, status: r.status, ...(r.error ? { error: r.error } : {}),
        ...(r.missing?.length ? { missing: r.missing.map((m) => ({ label: m.ref.label ?? m.ref.hash, reason: m.reason })) } : {}) }
    })
  }

  /**
   * 人物列表一次读全员（每次现算，不另存）：存档里的名单与个人调整 + 小窗里官方算好的数 + 读档检查缺的资料。
   * 字段路径照 dnd5e 6.1 数据模型（P6-0 §2.5 已核对）；职业 / 种族 / 背景的名字用存档引用上的【库】名字（中文战役是中文）。
   */
  async roster(ownerKey: string): Promise<RosterRow[]> {
    const kernel = await this.deps.saves.read(ownerKey)
    if (!kernel) return []
    const out = await this.call(ownerKey, 'roster')
    if (out.status !== 'complete') throw new Error(`读人物列表失败：${out.error ?? out.status}`)
    const byId = new Map((out.result as LiveRow[]).map((r) => [r.id, r]))
    const check = await this.deps.saves.check(ownerKey)
    return kernel.actors.map((a): RosterRow => {
      const live = byId.get(a.id)
      const sys = (live?.system ?? {}) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any -- 引擎算好的数值，按 dnd5e 路径读
      const label = (item?: LiveRow['items'][number]): string | null => item ? a.refs.find((r) => r.itemId === item.id)?.label ?? item.name : null
      return {
        id: a.id, name: live?.name ?? a.name, img: live?.img ?? null, type: live?.type ?? null, loaded: !!live, adjustments: a.adjustments,
        classes: (live?.items ?? []).filter((i) => i.type === 'class').map((i) => ({ name: label(i) ?? i.name, levels: i.levels })),
        race: label(live?.items.find((i) => i.type === 'race')), background: label(live?.items.find((i) => i.type === 'background')),
        level: sys.details?.level ?? null, cr: sys.details?.cr ?? null,
        hp: sys.attributes?.hp ? { value: sys.attributes.hp.value ?? null, max: sys.attributes.hp.max ?? null, temp: sys.attributes.hp.temp ?? null } : null,
        ac: sys.attributes?.ac?.value ?? null, passivePerception: sys.skills?.prc?.passive ?? null, speed: sys.attributes?.movement?.speeds?.walk ?? null, // 引擎算好的步行速度（已计力竭 / 状态）；movement.walk 只是原始填写值
        conditions: live?.conditions ?? [],
        missing: check.missing.filter((m) => m.actorId === a.id).map((m) => m.ref.label ?? m.ref.hash),
      }
    })
  }

  private async prepared(ownerKey: string): Promise<Array<{ source: Record<string, unknown>; system: Record<string, unknown>; name?: string }>> {
    return this.call(ownerKey, 'preparedActors')
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
  /** 建卡选项：选中的条目现在要玩家选哪些事（官方候选）+ 额外必选项（子职业 / 专长 / 可选特性，带候选）；预览不进存档。 */
  buildOptions(ownerKey: string, plan: Parameters<KernelRuntime['buildOptions']>[1]) { return this.deps.runtime.buildOptions(ownerKey, plan) }
  /** 起始装备选项：选中的职业 / 背景写着的起始装备（每组选项、类别候选、金币骰式）；预览不进存档。 */
  startingEquipment(ownerKey: string, plan: Parameters<KernelRuntime['startingEquipment']>[1]) { return this.deps.runtime.startingEquipment(ownerKey, plan) }
  /** 加人：从模板（库里的怪物 / NPC）加入，count 份。 */
  async fromTemplate(ownerKey: string, ref: EntryRef, count = 1, adjustments: Record<string, unknown> = {}) {
    const made = await this.deps.runtime.createActors(ownerKey, Array.from({ length: Math.max(1, count) }, () => ref))
    if (made.status !== 'complete' || !made.actors) return { made, kernel: null }
    const ids = made.actors.map((a: { id: string }) => a.id)
    // 名字：库里的名字（中文战役是中文），按取名规则编号；建好后改名，基准仍是重建结果，名字作为差别写进存档（读档后还在）
    const base = made.names?.[0]
    if (base) {
      const names = nextNames(base, ids.length, ((await this.deps.saves.read(ownerKey))?.actors ?? []).map((a) => a.name))
      for (let i = 0; i < ids.length; i++) await this.call(ownerKey, 'renameActor', ids[i], names[i])
    }
    return { made, kernel: await this.enroll(ownerKey, ids, adjustments) }
  }
  /** 复制一个人：同样的引用 / 选择 / 状态差别，换新种子重建（读档时编号不会和原来的人撞）。 */
  async copy(ownerKey: string, actorId: string, given?: string) {
    const source = await this.saved(ownerKey, actorId)
    if (!source) throw new Error(`存档里没有这个人物：${actorId}`)
    const name = given ?? nextNames(baseName(source.name), 1, ((await this.deps.saves.read(ownerKey))?.actors ?? []).map((a) => a.name))[0]
    // 复制品不带原人物编号：重建会沿用存档编号（冷读档编号不变），带着就和原人物撞成同一个
    const { id: _sourceId, ...rest } = source
    const copy = { ...rest, name, seed: `${source.seed || source.name}~${crypto.randomUUID().slice(0, 8)}` }
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
