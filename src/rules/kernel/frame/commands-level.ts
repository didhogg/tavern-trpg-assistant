// e 段 + P3-3b：建卡与升级。步骤由 dnd5e 官方 AdvancementManager 计算，应用也走同一管理器；不手写成长规则。
// 选择步骤用一张“进阶类型 → 应用数据”的登记表；P3-3b 起优先用存档记下的选择，没有记录才取第一个可选项。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import type { KernelActorStateLike } from '../../../core/saves/state'
import { applyStateToActor } from './actor-state'
import { freshSeed, reseedKernel } from './seed'
import { importEntry, importerMeta, importerProps, stampConsumableSource } from './importer'

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
  return data
}

/** 小窗里把作者条目重新放进人物时，告诉 Plutonium 这是普通物品，不要弹“用导入器吗”。 */
export function markStandardDragDrop(item: any): any {
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
export async function applyManager(manager: any, values: any[] | undefined, { strict = false } = {}): Promise<{ finished: true } | { finished: false; step: any }> {
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

/** 重建时按存档 refs 的顺序排物品；只改显示顺序，不改内容。 */
async function sortActorItems(actor: any, rows: Array<{ itemId?: string; order?: number; entry?: any }>): Promise<void> {
  const updates = []
  for (const row of rows) {
    if (typeof row.order !== 'number') continue
    const item = (row.itemId ? actor.items.get(row.itemId) : null)
      ?? [...actor.items].find((it: any) => it.name === row.entry?.name && (!row.entry?.type || it.type === row.entry.type))
    if (item) updates.push({ _id: item.id, sort: row.order })
  }
  if (updates.length) await actor.updateEmbeddedDocuments('Item', updates)
}

/** 建一张新卡：空白人物 → 种族/背景/职业（官方 forNewItem）→ 装备；没有成长步骤的顶层条目也显式放进人物。 */
async function buildActor(name: string, items: any[], equipment: any[], choices: Record<string, any[] | undefined> = {}, { strict = false, seed }: { strict?: boolean; seed?: string } = {}): Promise<any> {
  if (seed !== undefined) reseedKernel(seed)
  const ActorClass = g.CONFIG.Actor.documentClass
  const created = await ActorClass.create({ name, type: 'character', system: { details: { level: 1 } } })
  for (const raw of items) {
    const source = raw?.data ?? raw
    const data = cleanItem(source)
    if (raw?.itemId) data._id = raw.itemId
    stampConsumableSource(data)
    // Plutonium 导入时会预先写好部分成长选择（如职业豁免）；dnd5e 看到“已选”就不再加到人物身上。
    // 用 dnd5e 自己清理“人物做过的选择”的官方入口（物品拖出人物时同样调用），让成长从头走。
    g.CONFIG.Item.dataModels[data.type]?.resetData?.(data.system)
    const key = raw?.refKey ?? refKeyOf(data)
    const manager = Manager().forNewItem(created, data, { automaticApplication: true })
    const outcome = await applyManager(manager, key ? choices[key] : undefined, { strict })
    if (!outcome.finished) return { pending: true, step: outcome.step, built: actorLevel(created) }
    const exists = created.items.contents.some((i: any) => i.type === data.type
      && i.flags?.plutonium?.hash === data.flags?.plutonium?.hash)
    if (!exists) await created.createEmbeddedDocuments('Item', [markStandardDragDrop(cleanItem(data))], { keepId: true })
  }
  if (equipment.length) await created.createEmbeddedDocuments('Item', equipment.map(item => { const data = cleanItem(item?.data ?? item); if (item?.itemId) data._id = item.itemId; stampConsumableSource(data); return markStandardDragDrop(data) }), { keepId: true })
  await sortActorItems(created, [...items, ...equipment])
  return { actor: created }
}

/** 对管理器没有恢复到的进阶选择，用官方 Advancement#restore 再补一次（幂等：值已相同就跳过）。 */
async function restoreRecordedChoices(actor: any, choices: Record<string, any[] | undefined>, planRows: Array<{ refKey?: string; entry?: any }> = []): Promise<void> {
  for (const item of actor.items) {
    const f = item.flags?.plutonium
    if (!f?.propDroppable || !f.source || !f.hash) continue
    const planRow = planRows.find((row) => row.entry?.name === item.name)
    const rows = (planRow?.refKey ? choices[planRow.refKey] : undefined) ?? choices[`${f.propDroppable}|${f.source}|${f.hash}`] ?? []
    for (const row of rows) {
      const adv = item.advancement?.byId?.[row.id]
      if (!adv?.restore) continue
      const current = item.toObject().system?.advancement?.[row.id]?.value ?? adv.value?.toObject?.() ?? adv.value
      if (JSON.stringify(current) === JSON.stringify(row.data)) continue
      await item.update({ [`system.advancement.${row.id}.value`]: row.data })
    }
  }
}

function flagsOf(item: any): string | null {
  const f = item?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}

/** 重建时导入器/管理器可能给物品换新 id；按作者编号把存档里的状态键改到新 id。 */
function remapStateIds(state: any, actor: any, rows: Array<{ itemId?: string; entry: any }>): void {
  if (!state || typeof state !== 'object') return
  const map = new Map<string, string>()
  for (const row of rows) {
    if (!row.itemId) continue
    const flags = flagsOf(row.entry)
    const target = (flags ? [...actor.items].find((item: any) => flagsOf(item) === flags) : null)
      ?? [...actor.items].find((item: any) => item.name === row.entry?.name)
    if (target && target.id !== row.itemId) map.set(row.itemId, target.id)
  }
  for (const bucket of ['items', 'effects'] as const) {
    const source = state[bucket]
    if (!source || typeof source !== 'object') continue
    const next: any = {}
    for (const [key, value] of Object.entries(source)) next[map.get(key) ?? key] = value
    state[bucket] = next
  }
  if (Array.isArray(state.itemRemoved)) state.itemRemoved = state.itemRemoved.map((id: string) => map.get(id) ?? id)
  if (Array.isArray(state.effectRemoved)) state.effectRemoved = state.effectRemoved.map((id: string) => map.get(id) ?? id)
}

export interface BuildRow { prop: string; entry: any; refKey: string; itemId?: string; order?: number; data?: any }
export interface BuildPlan {
  name: string
  items: BuildRow[]
  equipment?: BuildRow[]
  choices?: Record<string, any[] | undefined>
  /** 读档用：存档里记下的人物种子；新建卡不传，内核自己生成。 */
  seed?: string
}

export interface RebuildPlan {
  name: string
  /** 顶层条目（种族/背景/职业/其他有作者编号的东西），按人物里的顺序。 */
  items: Array<{ prop: string; entry: any; refKey: string; itemId?: string; order?: number; data?: any }>
  equipment: Array<{ prop: string; entry: any; refKey: string; itemId?: string; order?: number; data?: any }>
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
      for (const row of plan.items) items.push({ data: row.data ?? await importEntry(row.prop, row.entry), refKey: row.refKey, itemId: row.itemId, order: row.order })
      const equipment = []
      for (const row of plan.equipment ?? []) equipment.push({ data: row.data ?? await importEntry(row.prop, row.entry), refKey: row.refKey })
      const built = await buildActor(plan.name, items, equipment, plan.choices ?? {}, { strict: false, seed })
      if (built.pending) return { kernelStatus: 'pending', reason: 'build-step-not-complete', seed, step: built.step, built: built.built }
      return { id: built.actor.id, seed, ...actorLevel(built.actor) }
    }),

    /** 建卡待选项：把作者转出的种族/背景/职业条目放进一个空白 1 级人物，列官方成长步骤（不改世界）。 */
    buildSteps: (itemData: any) => operate([], async () => {
      const ActorClass = g.CONFIG.Actor.documentClass
      const blank = new ActorClass({ name: 'Build preview', type: 'character', system: { details: { level: 1 } } })
      const manager = Manager().forNewItem(blank, itemData)
      const steps = await describeSteps(manager)
      return { status: steps.length ? 'pending' : 'complete', steps }
    }),

    /** 按作者条目导入成 dnd5e 物品数据（不进世界）；T5/探针用。 */
    importForBuild: (prop: string, entry: any) => operate([], async () => importEntry(prop, entry)),
    /** T2：作者登记表里真的有导入器的类别。 */
    importerProps,
    importerMeta,

    /** P3-3b 重建：按引用导入作者条目 → 按记下的选择建卡 → 叠状态差别。 */
    rebuildCharacter: (plan: RebuildPlan) => operate([], async () => {
      const seed = plan.seed?.trim() || plan.name
      reseedKernel(seed)
      const items = []
      for (const row of plan.items) items.push({ data: row.data ?? await importEntry(row.prop, row.entry), refKey: row.refKey, itemId: row.itemId, order: row.order })
      const equipment = []
      for (const row of plan.equipment) equipment.push({ data: row.data ?? await importEntry(row.prop, row.entry), refKey: row.refKey, itemId: row.itemId, order: row.order })
      const built = await buildActor(plan.name, items, equipment, plan.choices, { strict: true, seed })
      if (built.pending) return { kernelStatus: 'pending', reason: 'rebuild-step-not-complete', step: built.step, built: built.built }
      const base = built.actor.toObject()
      remapStateIds(plan.state, built.actor, [...plan.items, ...plan.equipment])
      await applyStateToActor(built.actor, plan.state)
      await restoreRecordedChoices(built.actor, plan.choices, [...plan.items, ...plan.equipment])
      return { id: built.actor.id, seed, ...actorLevel(built.actor), data: built.actor.toObject(), base }
    }),
  }
}
