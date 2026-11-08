// e 段 + P3-3b：建卡与升级。步骤由 dnd5e 官方 AdvancementManager 计算，应用也走同一管理器；不手写成长规则。
// 选择步骤用一张“进阶类型 → 应用数据”的登记表；P3-3b 起优先用存档记下的选择，没有记录才取第一个可选项。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import type { KernelActorStateLike } from '../../../core/saves/state'
import { applyStateToActor } from './actor-state'
import { reseedKernel } from './seed'

const g = globalThis as any
/** 作者导入器第一次用时初始化会消耗随机数；每个类别先空跑一次，之后真导入才从人物种子开始。 */
const warmedImports = new Set<string>()

function Manager(): any {
  const cls = g.dnd5e?.applications?.advancement?.AdvancementManager
  if (!cls) throw Error('dnd5e AdvancementManager is not available')
  return cls
}

function managerFor(actor: any, classId: string, delta: number, options: any = {}): any {
  return Manager().forLevelChange(actor, classId, delta, options)
}

function actorLevel(actor: any): any {
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

function cleanItem(item: any): any {
  const data = item?.toObject ? item.toObject() : structuredClone(item)
  for (const key of ['_id', '_key', 'folder', 'sort', 'ownership', '_stats']) delete data[key]
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

/** 没有现成自动值时的固定规则：取第一个可选项。 */
async function firstChoice(flow: any): Promise<any> {
  const advancement = flow.advancement
  const type = advancement.constructor?.typeName ?? advancement.type
  if (type === 'HitPoints') return { [flow.level]: 'avg' }

  if (type === 'ItemGrant') {
    const automatic = await advancement.automaticApplicationValue?.(flow.level)
    if (automatic !== false) return automatic
    const items = (advancement.configuration?.items ?? []).filter((item: any) => !item.optional)
    return { ability: advancement.configuration?.spell?.ability?.[0] ?? null,
      selected: (items.length ? items : advancement.configuration?.items ?? []).map((item: any) => item.uuid) }
  }

  if (type === 'ItemChoice') {
    const count = advancement.configuration?.choices?.[flow.level]?.count ?? 1
    const pool = (advancement.configuration?.pool ?? []).map((item: any) => item.uuid)
    return { selected: pool.slice(0, count) }
  }

  if (type === 'Subclass') {
    const pack = g.game.packs.get('dnd5e.subclasses')
    if (!pack) return undefined
    const index = await pack.getIndex({ fields: ['system.classIdentifier', 'type'] })
    const entry = index.contents?.find((item: any) => item.type === 'subclass'
      && item.system?.classIdentifier === advancement.item?.system?.identifier)
    return entry ? `Compendium.${pack.metadata.id}.Item.${entry._id}` : undefined
  }

  if (type === 'Trait') {
    const automatic = await advancement.automaticApplicationValue?.(flow.level)
    if (automatic !== false) return automatic
    // 官方 unfulfilledChoices：每个待选位还能选哪些（已排除人物身上已有的熟练/语言）；每位取第一个。
    const { available } = await advancement.unfulfilledChoices()
    const chosen = new Set<string>()
    for (const slot of available) {
      const key = [...slot.choices.asSet()].find((k: string) => !chosen.has(k))
      if (key) chosen.add(key)
    }
    return { chosen: [...chosen] }
  }

  if (type === 'AbilityScoreImprovement') {
    const fixed = Object.entries(advancement.configuration?.fixed ?? {}).filter(([, value]) => value)
    if (fixed.length) return { type: 'asi', assignments: Object.fromEntries(fixed) }
    const key = Object.keys(flow.actor?.system?.abilities ?? {})
      .find(ability => advancement.canImprove?.(ability) !== false)
    return key ? { type: 'asi', assignments: { [key]: 2 } } : undefined
  }

  if (type === 'Size') return { size: advancement.configuration?.sizes?.first?.() ?? 'med' }
  if (type === 'ScaleValue') return {}
  return undefined
}

/**
 * 每步优先用官方 reverse 记下的恢复数据（按 dnd5e 自己合成 restore 步骤的写法）。
 * 没有记录的步骤：官方能自动定的交给官方；要玩家选的，新建卡取第一个可选项，重建时 pending。
 * 注意：不能把 forward 步骤标成 automatic——dnd5e 的连续自动循环只用第一步的自动值，
 * 后面的步骤会拿到错的数据（曾导致技能选择落空）。只覆盖 getAutomaticApplicationValue，让管理器逐步取值。
 */
async function applyManager(manager: any, values: any[] | undefined, { strict = false } = {}): Promise<{ finished: true } | { finished: false; step: any }> {
  if (!manager.steps.length) return { finished: true }
  for (const step of manager.steps) {
    if (step.automatic || !step.flow) continue
    const advancement = step.flow.advancement
    const recorded = values?.find((v: any) => v.id === advancement.id && v.level === step.flow.level)
    if (recorded) {
      if (recorded.error) return { finished: false, step: { ...stepSummary(step), error: recorded.error } }
      step.type = 'restore'
      step.flow.retainedData = recorded.data
      step.automatic = true
      continue
    }
    if (await step.flow.getAutomaticApplicationValue() !== false) continue
    if (strict) return { finished: false, step: stepSummary(step) }
    const value = await firstChoice(step.flow)
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
async function buildActor(name: string, items: any[], equipment: any[], choices: Record<string, any[] | undefined> = {}, { strict = false, seed }: { strict?: boolean; seed?: string } = {}): Promise<any> {
  if (seed !== undefined) reseedKernel(seed)
  const ActorClass = g.CONFIG.Actor.documentClass
  const created = await ActorClass.create({ name, type: 'character', system: { details: { level: 1 } } })
  for (const raw of items) {
    const source = raw?.data ?? raw
    const data = cleanItem(source)
    // Plutonium 导入时会预先写好部分成长选择（如职业豁免）；dnd5e 看到“已选”就不再加到人物身上。
    // 用 dnd5e 自己清理“人物做过的选择”的官方入口（物品拖出人物时同样调用），让成长从头走。
    g.CONFIG.Item.dataModels[data.type]?.resetData?.(data.system)
    const key = raw?.refKey ?? refKeyOf(data)
    const manager = Manager().forNewItem(created, data, { automaticApplication: true })
    const outcome = await applyManager(manager, key ? choices[key] : undefined, { strict })
    if (!outcome.finished) return { pending: true, step: outcome.step, built: actorLevel(created) }
    const exists = created.items.contents.some((i: any) => i.type === data.type
      && i.flags?.plutonium?.hash === data.flags?.plutonium?.hash)
    if (!exists) await created.createEmbeddedDocuments('Item', [markStandardDragDrop(cleanItem(data))])
  }
  if (equipment.length) await created.createEmbeddedDocuments('Item', equipment.map(item => markStandardDragDrop(cleanItem(item?.data ?? item))))
  return { actor: created }
}

/** 结算小窗里把作者条目导入成 dnd5e 物品（临时文档，不进世界）。 */
/**
 * Plutonium 生成种族/背景等的通用成长（UtilAdvancementsEntry.getGenericAdvancements）时，
 * 只有拿到这些“已选”项才会生成对应成长；不给就整条略过（背景技能、语言、抗性因此丢失）。
 * 这里一律给空数组 = “玩家还没选”：Plutonium 照作者条目生成完整成长，选择交给 dnd5e 成长流程。
 * 键名与形状取自作者源码；作者新增一种时在这里登记一行。
 */
const UNCHOSEN_PROFICIENCIES: Record<string, string[]> = {
  skillsChosenFvtt: [],
  languagesChosenFvtt: [],
  armorProficienciesChosenFvtt: [],
  weaponProficienciesChosenFvtt: [],
  toolProficienciesChosenFvtt: [],
  // 不登记 resistChosenFvtt：作者把“选一种抗性”（如龙裔血统）全部写进 grants，靠自己界面传入已选那一种；
  // 不传已选就会被 dnd5e 当成全给。等人物界面把玩家选的那一种传进来再登记。
}

async function importEntry(prop: string, entry: any, seed?: string): Promise<any> {
  const api = g.game.modules.get('plutonium')?.api
  if (!api?.importer) throw Error('Plutonium importer is not available')
  // 作者导入器第一次用时自己会初始化（会消耗随机数）；先初始化，再按人物重设种子，
  // 这样同一条目排在哪次导入前后，生成的编号都从同一个种子开始。
  const importer = await api.importer.pGetImporter({ prop })
  if (!importer) throw Error(`No Plutonium importer for ${prop}`)
  if (seed !== undefined && !warmedImports.has(prop)) {
    warmedImports.add(prop)
    reseedKernel(`warmup:${prop}`)
    try {
      await importer.pImportEntry(structuredClone(entry), new api.importer.ImportOpts({ isTemp: true }), structuredClone(UNCHOSEN_PROFICIENCIES))
    } catch (e) {
      console.warn('[trpg-kernel] 导入器预热失败，继续真导入', e)
    }
    reseedKernel(seed)
  }
  if (seed !== undefined) reseedKernel(seed)
  const opts = new api.importer.ImportOpts({ isTemp: true })
  const summary = prop === 'class' && importer.pImportEntryClass
    ? await importer.pImportEntryClass(entry, opts)
    : await importer.pImportEntry(entry, opts, structuredClone(UNCHOSEN_PROFICIENCIES))
  const doc = summary?.imported?.[0]?.document ?? null
  if (!doc) throw Error(`Plutonium import failed for ${entry?.name ?? prop}`)
  return doc.toObject ? doc.toObject() : doc
}

export interface RebuildPlan {
  name: string
  /** 顶层条目（种族/背景/职业/其他有作者编号的东西），按人物里的顺序。 */
  items: Array<{ prop: string; entry: any; refKey: string; data?: any }>
  equipment: Array<{ prop: string; entry: any; refKey: string; data?: any }>
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

    /** 应用升级：自动步骤原样应用；选择步骤按“第一个可选项”登记表取值；仍无值则 pending。 */
    levelUpApply: (actorId: string, classId: string, delta = 1) => operate([], async () => {
      const a = actor(actorId)
      const manager = managerFor(a, classId, delta, { automaticApplication: true })
      const outcome = await applyManager(manager, undefined)
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

    /** 建卡前按人物标识重设随机源；建卡流程在导入条目之前调用。 */
    setSeed: (seed: string) => operate([], async () => { reseedKernel(seed); return true }),

    /** 用结算内核建一张新卡；choices 按 refKey 给出官方 reverse 的恢复数据。 */
    buildCharacter: (name: string, items: any[], equipment: any[] = [], choices: Record<string, any[] | undefined> = {}) => operate([], async () => {
      const built = await buildActor(name, items, equipment, choices, { strict: false, seed: name })
      if (built.pending) return { kernelStatus: 'pending', reason: 'build-step-not-complete', step: built.step, built: built.built }
      return { id: built.actor.id, ...actorLevel(built.actor) }
    }),

    /** 建卡待选项：把作者转出的种族/背景/职业条目放进一个空白 1 级人物，列官方成长步骤（不改世界）。 */
    buildSteps: (itemData: any) => operate([], async () => {
      const ActorClass = g.CONFIG.Actor.documentClass
      const blank = new ActorClass({ name: 'Build preview', type: 'character', system: { details: { level: 1 } } })
      const manager = Manager().forNewItem(blank, itemData)
      const steps = await describeSteps(manager)
      return { status: steps.length ? 'pending' : 'complete', steps }
    }),

    /** 按作者条目导入成 dnd5e 物品数据（不进世界）；新建卡与读档重建共用这一个入口。 */
    importForBuild: (prop: string, entry: any, seed?: string) => operate([], async () => importEntry(prop, entry, seed)),

    /** P3-3b 重建：按引用导入作者条目 → 按记下的选择建卡 → 叠状态差别。 */
    rebuildCharacter: (plan: RebuildPlan) => operate([], async () => {
      const seed = plan.seed ?? plan.name
      reseedKernel(seed)
      const items = []
      for (const row of plan.items) items.push({ data: row.data ?? await importEntry(row.prop, row.entry, seed), refKey: row.refKey })
      const equipment = []
      for (const row of plan.equipment) equipment.push({ data: row.data ?? await importEntry(row.prop, row.entry, seed), refKey: row.refKey })
      const built = await buildActor(plan.name, items, equipment, plan.choices, { strict: true, seed })
      if (built.pending) return { kernelStatus: 'pending', reason: 'rebuild-step-not-complete', step: built.step, built: built.built }
      const base = built.actor.toObject()
      await applyStateToActor(built.actor, plan.state)
      return { id: built.actor.id, ...actorLevel(built.actor), data: built.actor.toObject(), base }
    }),
  }
}
