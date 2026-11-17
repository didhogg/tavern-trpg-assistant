// e 段 + P3-3b：建卡与升级。步骤由 dnd5e 官方 AdvancementManager 计算，应用也走同一管理器；不手写成长规则。
// 选择步骤用一张“进阶类型 → 应用数据”的登记表；P3-3b 起优先用存档记下的选择，没有记录才取第一个可选项。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { FrameText } from '../shown'
import { asiValue } from './asi'
import { settled } from './server'
import type { ActorGetter, Operate } from './commands-items'
import type { KernelActorStateLike } from '../../../core/saves/state'
import { applyStateToActor } from './actor-state'
import { freshSeed, reseedKernel } from './seed'
import { importEntry, importerMeta, importerProps } from './importer'
import { actorTypes, BUILD_ACTOR_TYPE } from './actor-types'
import { restoreRecordedChoices } from './commands-restore'
import { blankChoice, firstChoice } from './commands-choice'
import { resolveStarting, type StartingSelection } from './commands-equipment'
import { checkedBuildTrait, fillBuildTraits, isBuildTrait, type TraitPlans, type ExpertiseViews } from './build-traits'
import { stripTraitOrigins } from './trait-origins'

const g = globalThis as any
export function Manager(): any {
  const cls = g.dnd5e?.applications?.advancement?.AdvancementManager
  if (!cls) throw Error('dnd5e AdvancementManager is not available')
  return cls
}

function managerFor(actor: any, classId: string, delta: number, options: any = {}): any {
  return Manager().forLevelChange(actor, classId, delta, options)
}

export function actorLevel(actor: any): any {
  return {
    level: actor.system.details?.level ?? null,
    hp: actor.system.attributes?.hp?.toObject?.() ?? actor.system.attributes?.hp ?? null,
    items: actor.items?.size ?? null,
    classes: actor.items?.contents?.filter((i: any) => i.type === 'class').map((i: any) => ({ id: i.id, name: i.name, levels: i.system.levels ?? null })) ?? [],
    weapons: actor.items?.contents?.filter((i: any) => i.type === 'weapon').map((i: any) => ({
      id: i.id, name: i.name,
      activities: [...(i.system.activities ?? [])].map((a: any) => ({ id: a.id, type: a.type })),
      damageType: i.system.damage?.base?.types?.[0] ?? null,
    })) ?? [],
  }
}

export function cleanItem(item: any): any {
  const data = item?.toObject ? item.toObject() : structuredClone(item)
  for (const key of ['_id', '_key', 'folder', 'sort', 'ownership', '_stats']) delete data[key]
  stripTraitOrigins(data)
  return data
}

/** 小窗里把作者条目重新放进人物时，告诉 Plutonium 这是普通物品，不要弹“用导入器吗”。 */
function markStandardDragDrop(item: any): any {
  const data = item?.toObject ? item.toObject() : structuredClone(item)
  data.flags ??= {}
  data.flags.plutonium ??= {}
  data.flags.plutonium.isStandardDragDrop = true
  return data
}

function refKeyOf(data: any): string | null {
  const f = data?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}

/** 官方 reverse 的返回值可能是数据模型或带 Set；转成能存进存档（JSON）的样子，内容不变。 */
function storable(data: any): any {
  return JSON.parse(JSON.stringify(data, (_key, value) => value instanceof Set ? [...value] : value))
}

/**
 * 每步优先用官方 reverse 记下的恢复数据（按 dnd5e 自己合成 restore 步骤的写法）。
 * 没有记录的步骤：官方能自动定的交给官方；要玩家选的，新建卡取第一个可选项，重建时 pending。
 * 注意：不能把 forward 步骤标成 automatic——dnd5e 的连续自动循环只用第一步的自动值，
 * 后面的步骤会拿到错的数据（曾导致技能选择落空）。只覆盖 getAutomaticApplicationValue，让管理器逐步取值。
 */
export async function applyManager(manager: any, values: any[] | undefined, { strict = false, picks, blank = false, expertise }: { strict?: boolean; picks?: BuildPick[]; blank?: boolean; expertise?: ExpertiseViews } = {}): Promise<{ finished: true } | { finished: false; step: any }> {
  if (!manager.steps.length) return { finished: true }
  for (const step of manager.steps) {
    if (step.automatic || !step.flow) continue
    const advancement = step.flow.advancement
    const recorded = values?.find((v: any) => v.id === advancement.id && v.level === step.flow.level)
    const pick = picks?.find((p) => p.id === advancement.id && (p.level ?? null) === (step.flow.level ?? null))
    if (isBuildTrait(advancement.id)) {
      if (recorded?.error || (strict && !recorded)) return { finished: false, step: { ...stepSummary(step), error: recorded?.error } }
      const value = await checkedBuildTrait(expertise?.get(advancement.id) ?? advancement, recorded?.data ?? pick?.value)
      if (!value) return { finished: false, step: { ...stepSummary(step), error: '建卡选择已不在当前候选内' } }
      if (recorded) {
        step.type = 'restore'
        step.flow.retainedData = value
        step.automatic = true
      } else step.flow.getAutomaticApplicationValue = async () => value
      continue
    }
    if (recorded) {
      if (recorded.error) return { finished: false, step: { ...stepSummary(step), error: recorded.error } }
      step.type = 'restore'
      step.flow.retainedData = recorded.data
      step.automatic = true
      continue
    }
    if (await step.flow.getAutomaticApplicationValue() !== false) continue
    // 玩家这一步的选择（建卡界面给的）：值的样子就是官方进阶要的（Trait = {chosen:[..]}、能力值 = {type:'asi', assignments:{..}}）
    if (pick) {
      // 属性提升：界面只交玩家加的点，固定加值合并和检查在 asi.ts
      const value = pick.value?.type === 'asi' ? asiValue(advancement, pick.value) : pick.value
      if (!value) return { finished: false, step: { ...stepSummary(step), error: '属性提升的选择不合规' } }
      step.flow.getAutomaticApplicationValue = async () => value
      continue
    }
    if (strict) return { finished: false, step: stepSummary(step) }
    const value = (blank ? await blankChoice(step.flow) : undefined) ?? await firstChoice(step.flow)
    if (value === undefined) continue
    step.flow.getAutomaticApplicationValue = async () => value
  }
  const completed = new Promise<boolean>(resolve => {
    const hook = g.Hooks.on('dnd5e.advancementManagerComplete', (finished: any) => {
      if (finished !== manager) return
      g.Hooks.off(hook)
      resolve(true)
    })
    setTimeout(() => { g.Hooks.off(hook); resolve(false) }, 3_000)
  })
  await manager.render()
  const ok = await completed
  // 下一个管理器开始前，等这一步官方回调发出的写入落地（例如种族把 details.race 指向自己），否则会被下一步整份覆盖掉
  if (ok) await settled()
  return ok ? { finished: true } : { finished: false, step: stepSummary(manager.step) }
}

function stepSummary(step: any): any {
  if (!step) return null
  const flow = step.flow
  const advancement = flow?.advancement
  return {
    type: step.type,
    level: step.level ?? null,
    automatic: Boolean(step.automatic),
    error: step.error?.message ?? null,
    advancement: advancement ? {
      type: advancement.constructor?.typeName ?? advancement.type,
      id: advancement.id ?? null,
      title: advancement.title ?? null,
      level: flow.level ?? null,
    } : null,
  }
}

async function describeSteps(manager: any): Promise<any[]> {
  const steps = []
  for (const step of manager.steps) {
    const flow = step.flow
    const advancement = flow?.advancement
    let automaticValue = null
    if (typeof flow?.getAutomaticApplicationValue === 'function') {
      try {
        const value = await flow.getAutomaticApplicationValue()
        if (value !== false && value != null) automaticValue = value
      } catch {
        // 某些步骤没有可自动应用的值；保留为空，交给后续选择。
      }
    }
    steps.push({
      type: step.type,
      level: step.level ?? null,
      automatic: Boolean(step.automatic),
      class: step.class ? { itemId: step.class.item?.id ?? null, level: step.class.level ?? null } : null,
      advancement: advancement ? {
        type: advancement.constructor?.typeName ?? advancement.type,
        id: advancement.id ?? null,
        title: advancement.title ?? null,
        level: flow.level ?? null,
      } : null,
      automaticValue,
    })
  }
  return steps
}

/** 建一张新卡：空白人物 → 种族/背景/职业（官方 forNewItem）→ 装备；没有成长步骤的顶层条目也显式放进人物。 */
/** 人物现在每项属性的值（官方 system.abilities[k].value）。 */
export function abilityValues(actor: any): Record<string, number> {
  return Object.fromEntries(Object.entries(actor.system?.abilities ?? {}).map(([k, v]: [string, any]) => [k, v.value]))
}

export async function buildActor(name: string, items: any[], equipment: any[], choices: Record<string, any[] | undefined> = {}, { strict = false, seed, id, picks, blank = false, traitScope, onManager }: { strict?: boolean; seed?: string; id?: string; picks?: Record<string, BuildPick[]>; blank?: boolean; traitScope?: string[]; onManager?: (info: { manager: any; key: string | null; unsupported: FrameText[]; picks?: BuildPick[]; traitPlans: TraitPlans; expertise: ExpertiseViews }) => Promise<void> } = {}): Promise<any> {
  if (seed !== undefined) reseedKernel(seed)
  const ActorClass = g.CONFIG.Actor.documentClass
  const created = await ActorClass.create({ ...(id ? { _id: id } : {}), name, type: BUILD_ACTOR_TYPE, system: { details: { level: 1 } } }, { keepId: !!id })
  const scope = traitScope ? new Set(traitScope) : undefined
  const initial = abilityValues(created)
  const missingTraits: Array<{ refKey: string; titles: FrameText[] }> = []
  for (const raw of items) {
    const source = raw?.data ?? raw
    const data = cleanItem(source)
    // Plutonium 导入时会预先写好部分成长选择（如职业豁免）；dnd5e 看到“已选”就不再加到人物身上。
    // 用 dnd5e 自己清理“人物做过的选择”的官方入口（物品拖出人物时同样调用），让成长从头走。
    g.CONFIG.Item.dataModels[data.type]?.resetData?.(data.system)
    const key = raw?.refKey ?? refKeyOf(data)
    const recorded = key ? choices[key] : undefined
    const useBuildTraits = key && (!strict || recorded?.some((value) => isBuildTrait(value.id)))
    const traitPlans: TraitPlans = new Map()
    const expertise: ExpertiseViews = new Map()
    const itemPicks = key ? picks?.[key] : undefined
    const unsupported = useBuildTraits ? await fillBuildTraits(data, raw, key, created.items.some((item: any) => item.type === 'class'), {
      actor: created, plans: traitPlans, scope, picks: itemPicks, previous: recorded, expertise, replay: strict ? recorded?.map(value => value.id) : undefined,
    }) : []
    if (key && unsupported.length) missingTraits.push({ refKey: key, titles: unsupported })
    const removed = [...(recorded ?? []), ...(key ? picks?.[key] ?? [] : [])].find((value) => isBuildTrait(value.id) && !(value.id in (data.system?.advancement ?? {})))
    if (removed) return { pending: true, step: { error: '存档中的建卡步骤已变更', id: removed.id, refKey: key }, built: actorLevel(created), actor: created, initial, missingTraits }
    const manager = Manager().forNewItem(created, data, { automaticApplication: true })
    await onManager?.({ manager, key, unsupported, picks: itemPicks, traitPlans, expertise })
    const outcome = await applyManager(manager, recorded, { strict, blank, picks: itemPicks, expertise })
    if (!outcome.finished) return { pending: true, step: outcome.step, built: actorLevel(created), actor: created, initial, missingTraits }
    const exists = created.items.contents.some((i: any) => i.type === data.type
      && i.flags?.plutonium?.hash === data.flags?.plutonium?.hash)
    if (!exists) await created.createEmbeddedDocuments('Item', [markStandardDragDrop(cleanItem(data))])
  }
  if (equipment.length) await created.createEmbeddedDocuments('Item', equipment.map(item => markStandardDragDrop(cleanItem(item?.data ?? item))))
  return { actor: created, initial, missingTraits }
}

export interface BuildRow { prop: string; entry: any; refKey: string; itemId?: string; data?: any }
/** 玩家在建卡里做的一次选择：哪一条进阶（id + 等级）、值是官方进阶要的样子。 */
export interface BuildPick { id: string; level: number | null; value: any }

export interface BuildPlan {
  name: string
  items: BuildRow[]
  equipment?: BuildRow[]
  choices?: Record<string, any[] | undefined>
  /** 玩家的选择（按条目引用的键）；没给的位置仍按「第一个可选项」。 */
  picks?: Record<string, BuildPick[]>
  /** 起始装备的选择（按职业 / 背景条目的键）：展开成物品（带数量）和钱，随人物建出来。 */
  starting?: Record<string, StartingSelection>
  /** 起始装备里本战役看不到的物品（按条目键）：不给。 */
  startingExcluded?: Record<string, string[]>
  /** true = 玩家没选的位置留空（建卡界面用）；不给 = 取第一个可选项（模板加入）。 */
  blank?: boolean
  traitScope?: string[]
  /** 读档用：存档里记下的人物种子；新建卡不传，内核自己生成。 */
  seed?: string
}

export interface RebuildPlan {
  id?: string
  name: string
  /** 顶层条目（种族/背景/职业/其他有作者编号的东西），按人物里的顺序。 */
  items: Array<{ prop: string; entry: any; refKey: string; itemId?: string; data?: any }>
  equipment: Array<{ prop: string; entry: any; refKey: string; itemId?: string; data?: any }>
  /** refKey → 官方 Advancement#reverse 记下的恢复数据。 */
  choices: Record<string, any[] | undefined>
  state?: KernelActorStateLike
  /** 这个人物自己的种子；不给就用名字。 */
  seed?: string
}

export function createLevelCommands(operate: Operate, actor: ActorGetter) {
  return {
    /** 升级待选项：官方管理器算出的步骤 + 每步是否自动、自动值、所属进阶。 */
    levelUpSteps: (actorId: string, classId: string, delta = 1) => operate([], async () => {
      const manager = managerFor(actor(actorId), classId, delta)
      const steps = await describeSteps(manager)
      return { status: steps.length ? 'pending' : 'complete', steps }
    }, [actorId]),

    /**
     * 应用升级 / 降级：自动步骤原样应用；玩家给了选择（values：成长编号 + 等级 + 选择数据，和建卡、读档同一种）就按选择走官方 restore；
     * 没给的选择步骤仍按“第一个可选项”取值；仍无值则 pending。
     */
    levelUpApply: (actorId: string, classId: string, delta = 1, values?: any[]) => operate([], async () => {
      const a = actor(actorId)
      const manager = managerFor(a, classId, delta, { automaticApplication: true })
      const outcome = await applyManager(manager, values)
      if (!outcome.finished) {
        return {
          kernelStatus: 'pending',
          reason: manager.step ? 'awaiting-choice' : 'advancement-manager-not-complete',
          step: outcome.step,
        }
      }
      return actorLevel(a)
    }, [actorId]),

    /** 用官方 Advancement#reverse 记下人物身上每个进阶的选择（在克隆人物上做，不动现场）。 */
    captureChoices: (actorId: string) => operate([], async () => {
      const source = actor(actorId)
      const clone = source.clone()
      const level = clone.system.details?.level ?? 1
      const out: Record<string, any[]> = {}
      const items = Array.from(clone.items) as any[]
      for (const item of items) {
        const flags = item.flags?.plutonium
        if (!flags?.propDroppable || !flags.source || !flags.hash) continue
        const key = `${flags.propDroppable}|${flags.source}|${flags.hash}`
        const rows = []
        for (const advancement of Object.values(item.advancement?.byId ?? {}) as any[]) {
          for (const advLevel of (advancement.levels ?? [])) {
            if (advLevel > level && advLevel !== 0) continue
            const type = advancement.constructor?.typeName ?? advancement.type
            try {
              const reversed = await advancement.reverse(advLevel)
              if (reversed !== undefined && reversed !== null) rows.push({ id: advancement.id, type, level: advLevel, data: storable(reversed) })
            } catch (error) {
              rows.push({ id: advancement.id, type, level: advLevel, error: error instanceof Error ? error.message : String(error) })
            }
          }
        }
        if (rows.length) out[key] = rows
      }
      return out
    }, [actorId]),

    /** 测试/界面改人物名；编号和种子不动。 */
    renameActor: (actorId: string, name: string) => operate([], async () => {
      const a = actor(actorId)
      await a.update({ name, 'prototypeToken.name': name })
      return actorLevel(a)
    }, [actorId]),

    /** 读档全部命中缓存：一次 createDocuments 批量建（保留编号），再逐个叠状态差别。 */
    createActorsFromBase: (rows: Array<{ base: any; state?: KernelActorStateLike }>) => operate([], async () => {
      const ActorClass = g.CONFIG.Actor.documentClass
      const created = await ActorClass.createDocuments(rows.map((row) => structuredClone(row.base)), { keepId: true })
      const out = []
      for (let i = 0; i < created.length; i++) {
        await applyStateToActor(created[i], rows[i].state)
        out.push({ id: created[i].id, ...actorLevel(created[i]), data: created[i].toObject(), base: rows[i].base })
      }
      return out
    }),

    /** 用结算内核建一张新卡：调用方只交条目和选择；内核生成人物种子并交回，读档用它。 */
    buildCharacter: (plan: BuildPlan) => operate([], async () => {
      const seed = plan.seed ?? freshSeed()
      const items = []
      for (const row of plan.items) items.push({ ...row, data: row.data ?? await importEntry(row.prop, row.entry) })
      const equipment = []
      for (const row of plan.equipment ?? []) equipment.push({ data: row.data ?? await importEntry(row.prop, row.entry), refKey: row.refKey })
      const starting = plan.starting ? await resolveStarting(plan.items.filter((r) => r.entry?.startingEquipment), plan.starting, plan.startingExcluded) : null
      const built = await buildActor(plan.name, items, [...equipment, ...(starting?.equipment ?? [])], plan.choices ?? {}, { strict: false, seed, picks: plan.picks, blank: plan.blank, traitScope: plan.traitScope })
      if (built.pending) {
        await built.actor.delete()
        return { kernelStatus: 'pending', reason: 'build-step-not-complete', seed, step: built.step, built: built.built }
      }
      if (starting?.specials.length) await built.actor.createEmbeddedDocuments('Item', starting.specials)
      if (starting?.currency) await built.actor.update({ 'system.currency': starting.currency })
      return { id: built.actor.id, seed, initial: built.initial, skipped: starting?.skipped ?? [], missingTraits: built.missingTraits, ...actorLevel(built.actor) }
    }),

    /** 建卡待选项：把作者转出的种族/背景/职业条目放进一个空白 1 级人物，列官方成长步骤（不改世界）。 */
    buildSteps: (itemData: any) => operate([], async () => {
      const ActorClass = g.CONFIG.Actor.documentClass
      const blank = new ActorClass({ name: 'Build preview', type: BUILD_ACTOR_TYPE, system: { details: { level: 1 } } })
      const manager = Manager().forNewItem(blank, itemData)
      const steps = await describeSteps(manager)
      return { status: steps.length ? 'pending' : 'complete', steps }
    }),

    /** 按作者条目导入成 dnd5e 物品数据（不进世界）；T5/探针用。 */
    importForBuild: (prop: string, entry: any) => operate([], async () => importEntry(prop, entry)),
    /** T2：作者登记表里真的有导入器的类别。 */
    importerProps,
    importerMeta,
    /** P5.6 卡型：规则系统声明的人物类型 + 人物存放类别换出来的类型 + 分步建卡的类型。 */
    actorTypes: (storeProp: string, samples: any[]) => operate([], async () => actorTypes(storeProp, samples)),

    /** P3-3b 重建：按引用导入作者条目 → 按记下的选择建卡 → 叠状态差别。 */
    rebuildCharacter: (plan: RebuildPlan) => operate([], async () => {
      const seed = plan.seed?.trim() || plan.name
      reseedKernel(seed)
      const items = []
      for (const row of plan.items) items.push({ ...row, data: row.data ?? await importEntry(row.prop, row.entry) })
      const equipment = []
      for (const row of plan.equipment) equipment.push({ data: row.data ?? await importEntry(row.prop, row.entry), refKey: row.refKey, itemId: row.itemId })
      const built = await buildActor(plan.name, items, equipment, plan.choices, { strict: true, seed, id: plan.id })
      if (built.pending) {
        await built.actor.delete()
        return { kernelStatus: 'pending', reason: 'rebuild-step-not-complete', step: built.step, built: built.built }
      }
      const base = built.actor.toObject()
      await applyStateToActor(built.actor, plan.state)
      if ([...built.actor.items].filter((item: any) => item.type === 'class').length > 1) await restoreRecordedChoices(built.actor, plan.choices, [...plan.items, ...plan.equipment])
      return { id: built.actor.id, seed, ...actorLevel(built.actor), data: built.actor.toObject(), base }
    }),
  }
}
