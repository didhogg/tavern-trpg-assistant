// P6 B1 人物页统一入口（界面只从这里取）：读人、改人、回到自动、掷骰、休息 / 升降级（先预览）、
// 加人 / 复制 / 回收站 / 彻底删除、撤销与改动记录。规则全在结算小窗（官方 dnd5e），这里只按顺序调用、写存档、让小窗和存档一致。
//
//  小操作：小窗执行 → 立刻写存档（可撤销）          大操作：小窗执行 → 预览 → [确认] 写存档 / [取消] 按存档退回
//  撤销：存档退一步 → 小窗里受影响的人按存档退回     回到自动：小窗里把字段改回基准值 → 写存档时差别自然消失
import type { KernelActorCompact, KernelSaveService } from '../../core/saves/kernel'
import { isObject } from '../../core/saves/state'
import type { EntryRef } from '../../library/scopes'
import { kernelActorSchema, type KernelActor, type KernelChange } from '../../schemas/kernel'
import type { SheetEdit } from './frame/commands-sheet'
import type { Displayed, FrameText } from './shown'
import type { FieldInfo } from './person-views'
export type { FieldEffect, FieldInfo, ShownField, ShownFieldInfo, SpecialTraits, TraitChoices } from './person-views'
import { executed } from './host'
import { actorData } from './rebuild'
import { baseName, nextNames } from './people-names'
export { nextNames } from './people-names'
import type { KernelRuntime } from './runtime'
import type { KernelNativeBuild } from './native-build'

/**
 * 游戏中会变的状态（不是手改设定，不画金线）。登记表：加一种 = 加一行，按 dnd5e 6.1 数据路径匹配。
 * 其余和基准不同的字段都算"手改设定"（加值、覆盖、基础值、熟练…）。
 */
export const PLAY_STATE: RegExp[] = [
  /^system\.attributes\.hp\.(value|temp|tempmax)$/, /^system\.attributes\.death\./, /^system\.attributes\.(inspiration|exhaustion)$/,
  /^system\.spells\.[^.]+\.value$/, /^system\.resources\.[^.]+\.value$/, /^system\.currency\./, /^system\.details\.xp\./,
  /^system\.(uses\.spent|quantity|equipped|attuned|prepared|container|hd\.spent)$/, /^system\.activities\.[^.]+\.uses\.spent$/,
  // 怪物（dnd5e NPC）的生命骰已用、传奇动作 / 传奇抗性已用（dnd5e 6.1 npc.mjs）
  /^system\.attributes\.hd\.spent$/, /^system\.resources\.[^.]+\.spent$/,
]

export interface ChangedField { path: string; kind: 'state' | 'setting' }

/** 小窗交回的编号名字（未过出口）；Glossary = 过了唯一显示出口的成品：tables[登记表名][编号] = 名字，statuses = 能开关的状态。 */
interface FrameGlossary { tables: Record<string, Record<string, FrameText>>; statuses: Array<{ id: string; name: FrameText; img: string | null }> }
export type Glossary = Displayed<FrameGlossary> & { untranslated?: string[] }

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

const get = (obj: unknown, path: string): unknown => path.split('.').reduce<unknown>((v, k) => isObject(v) ? (v as Record<string, unknown>)[k] : undefined, obj)
const itemsById = (data: Record<string, unknown> | null): Map<string, Record<string, unknown>> =>
  new Map(((data?.items ?? []) as Array<Record<string, unknown>>).map((i) => [String(i._id), i]))

type Saved = KernelActor & { base?: Record<string, unknown> }
/** 存档人物带上战役层的 B′ 完整数据（有的话）。 */
const withBase = (kernel: { bases?: Record<string, Record<string, unknown>> }, actor: KernelActor): Saved => {
  // P6-R：有完整数据就只按它建回（差别为空、不取下）
  if (actor.doc) return { ...actor, base: actor.doc, state: kernelActorSchema.shape.state.parse(undefined), off: [] }
  const base = kernel.bases?.[actor.id]
  return base ? { ...actor, base } : actor
}

export class KernelPeople {
  private readonly glossaries = new Map<string, Promise<Glossary>>()
  constructor(private readonly deps: { runtime: KernelRuntime; saves: KernelSaveService; native?: KernelNativeBuild }) {}

  private async rev(ownerKey: string): Promise<number> {
    const k = await this.deps.saves.read(ownerKey)
    if (!k) throw new Error('这个战役还没有绑定结算内核')
    return k.revision
  }
  private async call(ownerKey: string, fn: string, ...args: unknown[]): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any -- 小窗命令结果原样交回
    const { session } = await this.deps.runtime.session(ownerKey)
    return (session.call as unknown as (fn: string, ...args: unknown[]) => Promise<unknown>)(fn, ...args)
  }
  /** 存档里的这个人；B′ 人物带上战役层的完整数据（base），退回 / 读档 / 取下都从它建回。 */
  private async saved(ownerKey: string, id: string): Promise<Saved | null> {
    const kernel = await this.deps.saves.read(ownerKey)
    const actor = kernel?.actors.find((a) => a.id === id)
    return kernel && actor ? withBase(kernel, actor) : null
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
    const results = todo.length ? await this.deps.runtime.rebuildMany(ownerKey, todo.map((a) => withBase(kernel, a))) : []
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

  /** 读人物页：官方数值 + 官方显示数据（过唯一出口）。 */
  async sheet(ownerKey: string, actorId: string) {
    // 显示文字过唯一出口：物品 / 特性 / 效果名换成本战役语言，带作者编号的配上库条目（ref）；怪物动作等由小窗按作者编号在条目里定位
    const refs = ((await this.saved(ownerKey, actorId))?.refs ?? []).map((r) => ({ set: r.set, prop: r.prop, hash: r.hash }))
    const shownBy = await this.deps.runtime.displayFor(ownerKey, refs)
    const out = await this.call(ownerKey, 'sheet', actorId, shownBy.entries)
    if (out.status !== 'complete') return out
    // 物品 / 效果名和官方显示数据（view）一起过唯一显示出口
    const shown = await shownBy.show({ shown: out.result.shown, view: out.result.view })
    // P6-R：人物存完整数据，没有“自动基准”可比，金线不再有（changed 留空给旧调用方）
    const changed: ChangedField[] = []
    return { ...out, result: { ...out.result, shown: shown.value.shown, view: shown.value.view, changed, changedItems: {} as Record<string, ChangedField[]>, baseKnown: true, ...(shown.missed.length ? { untranslated: shown.missed } : {}) } }
  }

  /** 编辑窗口：一块字段的官方定义（名字 / 种类 / 选项 / 底值）+ 改到它的效果 + 官方明细（P6-R），过唯一出口。 */
  async fields(ownerKey: string, actorId: string, target: { itemId?: string; path: string }) {
    const out = await this.call(ownerKey, 'fieldInfo', actorId, target)
    if (out.status !== 'complete') return out
    const shown = await (await this.deps.runtime.displayFor(ownerKey, [])).show(out.result as FieldInfo)
    return { ...out, result: shown.value }
  }

  /** 只读的小窗取数并过唯一出口（特质选项 traitChoices、特殊特质 specialTraits……）：不写存档；没取成 = null。 */
  async shown<T>(ownerKey: string, fn: string, ...args: unknown[]): Promise<T | null> {
    const out = await this.call(ownerKey, fn, ...args)
    if (out.status !== 'complete') return null
    return (await (await this.deps.runtime.displayFor(ownerKey, [])).show(out.result)).value as T
  }

  /** 官方物品筛选（人物页工具条筛选开关）：只读，交回通过的物品编号。 */
  async filterItems(ownerKey: string, actorId: string, filters: string[]): Promise<string[] | null> {
    const out = await this.call(ownerKey, 'filterItems', actorId, filters)
    return out.status === 'complete' ? (out.result?.ids ?? []) as string[] : null
  }

  /** 编号的显示名（伤害类型、语言、体型、技能、物品属性……整表 + 能开关的状态），过唯一出口；本战役只取一次。 */
  glossary(ownerKey: string) {
    let pending = this.glossaries.get(ownerKey)
    if (!pending) {
      pending = (async () => {
        const out = await this.call(ownerKey, 'glossary')
        if (out.status !== 'complete') throw new Error(out.error ?? `取编号名字失败：${out.status}`)
        const shown = await (await this.deps.runtime.displayFor(ownerKey, [])).show(out.result as FrameGlossary)
        return { ...shown.value, ...(shown.missed.length ? { untranslated: shown.missed } : {}) }
      })()
      this.glossaries.set(ownerKey, pending)
      pending.catch(() => this.glossaries.delete(ownerKey))
    }
    return pending
  }

  /** 小操作：小窗执行，成功就立刻写进存档（一条撤销）；没成功就按存档把这个人退回，免得小窗留着半截改动。 */
  async act(ownerKey: string, actorId: string, fn: string, ...args: unknown[]) {
    const outcome = await this.call(ownerKey, fn, ...args)
    const changes = (outcome.changes ?? []) as KernelChange[]
    // 没算完（缺骰 / 等选择 / 出错）才退回；unsupported = 已算完 + 未支持提示，照常写入，提示随 outcome 交回
    if (!executed(outcome.status)) { if (changes.length) await this.cancel(ownerKey, [actorId]); return { outcome, kernel: null } }
    const kernel = changes.length ? (await this.deps.saves.apply(ownerKey, changes, await this.rev(ownerKey))).kernel : null
    return { outcome, kernel }
  }

  /** 从库里给人物加条目（物品等；驾驶员 11-23 批）：结算内核的加条目，成功就写进存档成一条可撤销的改动；没成功按存档退回。 */
  async add(ownerKey: string, actorId: string, refs: EntryRef[]) {
    const added = await this.deps.runtime.addToActor(ownerKey, actorId, refs)
    const changes = (added.changes ?? []) as KernelChange[]
    if (added.status !== 'complete') { if (changes.length) await this.cancel(ownerKey, [actorId]); return { added, kernel: null } }
    const kernel = changes.length ? (await this.deps.saves.apply(ownerKey, changes, await this.rev(ownerKey))).kernel : null
    return { added, kernel }
  }

  /** 拿掉一件条目（官方退回它带来的成长再删），一条可撤销改动。 */
  remove(ownerKey: string, actorId: string, itemId: string) { return this.act(ownerKey, actorId, 'removeItem', actorId, itemId) }
  /** 换掉一件条目（换种族 / 换背景）：先官方拿掉旧的，再加新的；两步合成一条可撤销改动，哪步没成都按存档退回。 */
  async replace(ownerKey: string, actorId: string, oldItemId: string, ref: EntryRef) {
    const removed = await this.call(ownerKey, 'removeItem', actorId, oldItemId)
    if (!executed(removed.status)) { await this.cancel(ownerKey, [actorId]); return { added: { status: removed.status, error: removed.error }, kernel: null } }
    const added = await this.deps.runtime.addToActor(ownerKey, actorId, [ref])
    if (added.status !== 'complete') { await this.cancel(ownerKey, [actorId]); return { added, kernel: null } }
    const changes = [...(removed.changes ?? []), ...(added.changes ?? [])] as KernelChange[]
    return { added, kernel: changes.length ? (await this.deps.saves.apply(ownerKey, changes, await this.rev(ownerKey))).kernel : null }
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
  /**
   * 加人：作者完整建卡器（P6 第 2 段）。建卡专用小窗里作者从头建好整个人（native-build.ts），
   * 收进存档走和复制 B′ 人物同一条路：完整人物建回日常小窗 → 写进存档（完整数据进战役层 bases）。玩家取消 / 没建成 = 存档不变。
   */
  async buildNative(ownerKey: string, name: string, adjustments: Record<string, unknown> = {}, slot?: HTMLElement) {
    if (!this.deps.native) throw new Error('这个插件没有接建卡专用小窗')
    const built = await this.deps.native.run(ownerKey, name, slot)
    if (built.status !== 'built') return { built, kernel: null }
    const { id: _blank, ...blank } = kernelActorSchema.parse({ id: 'native', name, seed: built.seed })
    const result = await this.deps.runtime.rebuild(ownerKey, { ...blank, base: built.data })
    if (result.status !== 'complete' || !result.id) return { built: { status: 'error' as const, error: result.error ?? '建好的人物放不回结算小窗' }, kernel: null }
    return { built, id: result.id, kernel: await this.enroll(ownerKey, [result.id], adjustments, [], { [result.id]: result.base ?? built.data }) }
  }
  /**
   * 用作者完整建卡器改一个已有的人（P6-R：升级、兼职、带选择的成长；空白人物没等级 = 作者从头建）：
   * 把这个人现在的完整数据放进建卡小窗交作者改，作者完成后整份换回日常小窗、写进存档 = 一条撤销；玩家取消 = 什么都不变。
   */
  async levelNative(ownerKey: string, actorId: string, slot?: HTMLElement) {
    if (!this.deps.native) throw new Error('这个插件没有接建卡专用小窗')
    const saved = await this.saved(ownerKey, actorId)
    if (!saved) throw new Error(`存档里没有这个人物：${actorId}`)
    const { session } = await this.deps.runtime.session(ownerKey)
    const current = await actorData(session, actorId)
    if (!current) throw new Error(`结算小窗里没有这个人物：${actorId}`)
    const built = await this.deps.native.run(ownerKey, saved.name, slot, current)
    if (built.status !== 'built') return { built, kernel: null }
    const rev = await this.rev(ownerKey)
    const empty = kernelActorSchema.shape.state.parse(undefined)
    const back = async () => { await this.deps.runtime.restore(ownerKey, actorId, await this.saved(ownerKey, actorId)) }
    const put = await this.deps.runtime.restore(ownerKey, actorId, { ...saved, doc: built.data, base: built.data, state: empty, off: [] })
    if (put?.status !== 'complete') { await back(); return { built: { status: 'error' as const, error: put?.error ?? '改好的人物放不回结算小窗' }, kernel: null } }
    try {
      const [compact] = await this.deps.runtime.compact(ownerKey, [actorId])
      return { built, kernel: (await this.deps.saves.replaceActor(ownerKey, compact, rev)).kernel }
    } catch (error) { await back(); throw error }
  }
  /** 放弃正在进行的完整建卡（关掉建卡专用小窗）。 */
  stopNative(ownerKey: string) { this.deps.native?.stop(ownerKey) }
  /** 复制一个人：同样的引用 / 选择 / 状态差别，换新种子重建（读档时编号不会和原来的人撞）；B′ 人物拷贝完整数据换新编号。 */
  async copy(ownerKey: string, actorId: string, given?: string) {
    const source = await this.saved(ownerKey, actorId)
    if (!source) throw new Error(`存档里没有这个人物：${actorId}`)
    const name = given ?? nextNames(baseName(source.name), 1, ((await this.deps.saves.read(ownerKey))?.actors ?? []).map((a) => a.name))[0]
    // 复制品不带原人物编号：重建会沿用存档编号（冷读档编号不变），带着就和原人物撞成同一个
    const { id: _sourceId, base: sourceBase, ...rest } = source
    const base = sourceBase ? { ...structuredClone(sourceBase), _id: crypto.randomUUID().replace(/-/g, '').slice(0, 16), name } : undefined
    const copy = { ...rest, name, seed: `${source.seed || source.name}~${crypto.randomUUID().slice(0, 8)}`, ...(base ? { base } : {}) }
    const result = await this.deps.runtime.rebuild(ownerKey, copy)
    if (result.status !== 'complete' || !result.id) return { result, kernel: null }
    if (copy.name !== (result.data as { name?: string } | undefined)?.name) await this.call(ownerKey, 'renameActor', result.id, name)
    return { result, kernel: await this.enroll(ownerKey, [result.id], source.adjustments, source.off, base ? { [result.id]: base } : {}) }
  }
  /** 写进存档；bases = B′ 人物的完整数据（进战役层，不进人物记录）。 */
  private async enroll(ownerKey: string, ids: string[], adjustments: Record<string, unknown>, off: KernelActor['off'] = [], bases: Record<string, Record<string, unknown>> = {}) {
    const compacts: KernelActorCompact[] = (await this.deps.runtime.compact(ownerKey, ids)).map((c) => ({ ...c, off, ...(bases[c.id] ? { base: bases[c.id] } : {}) }))
    return (await this.deps.saves.addActors(ownerKey, compacts, await this.rev(ownerKey), adjustments)).kernel
  }

  /**
   * 取下 / 装回自动项目：off = 这个人新的完整取下安排（装回 = 去掉那一行）。
   * 先在小窗里按新安排从完整基准重新准备（原始来源与选择不动），成功才把安排和按它拆好的人物一次写进存档（一条撤销）；
   * 准备不成（指向不存在 / 还不能取下的项，problems 写原因）或写存档失败（期间别处改过），小窗按存档退回，存档不变。
   */
  async setOff(ownerKey: string, actorId: string, off: KernelActor['off']) {
    const saved = await this.saved(ownerKey, actorId)
    if (!saved) throw new Error(`存档里没有这个人物：${actorId}`)
    const rev = await this.rev(ownerKey)
    const back = async () => { await this.deps.runtime.restore(ownerKey, actorId, await this.saved(ownerKey, actorId)) }
    const tried = await this.deps.runtime.restore(ownerKey, actorId, { ...saved, off })
    if (tried?.status !== 'complete') {
      await back()
      const problems = ((tried?.detail as { result?: { problems?: unknown[] } } | undefined)?.result?.problems ?? []) as Array<{ off: KernelActor['off'][number]; reason: string }>
      return { ok: false as const, error: tried?.error ?? '取下没有完成', problems, kernel: null }
    }
    try {
      const [compact] = await this.deps.runtime.compact(ownerKey, [actorId])
      return { ok: true as const, problems: [], kernel: (await this.deps.saves.setOff(ownerKey, compact, off, rev)).kernel }
    } catch (error) {
      await back()
      throw error
    }
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
    for (const row of done.restored) await this.deps.runtime.restore(ownerKey, row.id, row.actor && withBase(done.kernel, row.actor))
    return done.kernel
  }
  /** 撤销到这里：一步一步撤，直到那次写入之前（revision = 改动记录里那一行的 revision）。 */
  async undoTo(ownerKey: string, revision: number) {
    let kernel = await this.deps.saves.read(ownerKey)
    while (kernel && (kernel.undo.at(-1)?.revision ?? -1) >= revision) kernel = await this.undo(ownerKey) ?? null
    return kernel
  }
  /** 改动记录；每个字段带上中文字段名（label）和物品名（item），都过唯一显示出口；取不到的不带。 */
  async history(ownerKey: string) {
    const rows = await this.deps.saves.history(ownerKey)
    const asks = rows.flatMap((r) => r.actors.flatMap((a) => a.fields.map((f) => ({ actorId: a.id, path: f.path }))))
    if (!asks.length) return rows
    const out = await this.call(ownerKey, 'fieldLabels', asks)
    if (out.status !== 'complete') return rows
    const shown = await (await this.deps.runtime.displayFor(ownerKey, [])).show(out.result as Array<{ field: FrameText; item?: FrameText } | null>)
    let i = 0
    return rows.map((r) => ({ ...r, actors: r.actors.map((a) => ({ ...a, fields: a.fields.map((f) => {
      const got = shown.value[i++]
      return got ? { ...f, label: got.field, ...(got.item ? { item: got.item } : {}) } : f
    }) })) }))
  }
}
