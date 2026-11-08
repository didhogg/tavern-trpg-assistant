// e 段 + P3-3b：建卡与升级。步骤由 dnd5e 官方 AdvancementManager 计算，应用也走同一管理器；不手写成长规则。
// 选择步骤用一张“进阶类型 → 应用数据”的登记表；P3-3b 起优先用存档记下的选择，没有记录才取第一个可选项。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import type { KernelActorStateLike } from '../../../core/saves/state'
import { applyStateToActor } from './actor-state'

const g = globalThis as any

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

/** 管理器完成后，把条目自己记下的 Trait 选择再走一遍官方 apply；不手写选择值。 */
async function applyRecordedTraits(item: any): Promise<void> {
  for (const advancement of Object.values(item.advancement?.byId ?? {}) as any[]) {
    const type = advancement.constructor?.typeName ?? advancement.type
    if (type !== 'Trait') continue
    const chosen = [...((advancement.value?.chosen ?? []) as Iterable<string>)]
    if (!chosen.length) continue
    const levelLimit = item.actor?.system.details?.level ?? 1
    for (const level of advancement.levels ?? []) {
      if (level > levelLimit && level !== 0) continue
      await advancement.apply(level, { chosen })
    }
  }
  await item.actor?.reset?.()
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
    const existing = new Set(advancement.value?.chosen ?? [])
    const automatic = await advancement.automaticApplicationValue?.(flow.level)
    if (automatic !== false) return { chosen: [...new Set([...existing, ...(automatic.chosen ?? [])])] }
    const chosen = new Set(existing)
    for (const choice of advancement.configuration?.choices ?? []) {
      let count = choice.count ?? 1
      for (const key of choice.pool ?? []) {
        if (chosen.has(key)) continue
        chosen.add(key)
        if (--count <= 0) break
      }
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

/** 每步优先用官方 reverse 记下的恢复数据；重建时缺记录就 pending，不填默认值。 */
async function applyManager(manager: any, values: any[] | undefined, { strict = false } = {}): Promise<{ finished: true } | { finished: false; step: any }> {
  if (!manager.steps.length) return { finished: true }
  for (const step of manager.steps) {
    if (step.automatic || !step.flow) continue
    const advancement = step.flow.advancement
    const recorded = values?.find((v: any) => v.id === advancement.id && v.level === step.flow.level)
      ?? values?.find((v: any) => v.id === advancement.id && values.filter((x: any) => x.id === advancement.id).length === 1)
    if (recorded) {
      if (recorded.error) return { finished: false, step: { ...stepSummary(step), error: recorded.error } }
      step.type = 'restore'
      step.flow.retainedData = recorded.data
      step.automatic = true
      continue
    }
    if (strict) return { finished: false, step: stepSummary(step) }
    const value = await firstChoice(step.flow)
    if (value === undefined) continue
    step.flow.getAutomaticApplicationValue = async () => value
    step.automatic = true
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
async function buildActor(name: string, items: any[], equipment: any[], choices: Record<string, any[] | undefined> = {}, { strict = false } = {}): Promise<any> {
  const ActorClass = g.CONFIG.Actor.documentClass
  const created = await ActorClass.create({ name, type: 'character', system: { details: { level: 1 } } })
  for (const raw of items) {
    const source = raw?.data ?? raw
    const data = cleanItem(source)
    const key = raw?.refKey ?? refKeyOf(data)
    const manager = Manager().forNewItem(created, data, { automaticApplication: true })
    const outcome = await applyManager(manager, key ? choices[key] : undefined, { strict })
    if (!outcome.finished) return { pending: true, step: outcome.step, built: actorLevel(created) }
    const exists = created.items.contents.some((i: any) => i.type === data.type
      && i.flags?.plutonium?.hash === data.flags?.plutonium?.hash)
    if (!exists) await created.createEmbeddedDocuments('Item', [markStandardDragDrop(cleanItem(data))])
    const createdItem = created.items.contents.find((i: any) => i.type === data.type
      && i.flags?.plutonium?.hash === data.flags?.plutonium?.hash)
    if (createdItem) await applyRecordedTraits(createdItem)
  }
  if (equipment.length) await created.createEmbeddedDocuments('Item', equipment.map(item => markStandardDragDrop(cleanItem(item?.data ?? item))))
  return { actor: created }
}

/** 结算小窗里把作者条目导入成 dnd5e 物品（临时文档，不进世界）。 */
async function importEntry(prop: string, entry: any): Promise<any> {
  const api = g.game.modules.get('plutonium')?.api
  if (!api?.importer) throw Error('Plutonium importer is not available')
  const importer = await api.importer.pGetImporter({ prop })
  if (!importer) throw Error(`No Plutonium importer for ${prop}`)
  const opts = new api.importer.ImportOpts({ isTemp: true })
  const summary = prop === 'class' && importer.pImportEntryClass
    ? await importer.pImportEntryClass(entry, opts)
    : await importer.pImportEntry(entry, opts)
  const doc = summary?.imported?.[0]?.document ?? null
  if (!doc) throw Error(`Plutonium import failed for ${entry?.name ?? prop}`)
  return doc.toObject ? doc.toObject() : doc
}

export interface RebuildPlan {
  name: string
  /** 顶层条目（种族/背景/职业/其他有作者编号的东西），按人物里的顺序。 */
  items: Array<{ prop: string; entry: any; refKey: string }>
  equipment: Array<{ prop: string; entry: any; refKey: string }>
  /** refKey → 官方 Advancement#reverse 记下的恢复数据。 */
  choices: Record<string, any[] | undefined>
  state?: KernelActorStateLike
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
              const fallback = type === 'Trait' ? (advancement.value?.toObject?.() ?? advancement.value ?? {}) : type === 'ScaleValue' ? {} : undefined
              const data = reversed === undefined || reversed === null ? fallback : reversed
              if (data !== undefined) rows.push({ id: advancement.id, type, level: advLevel, data })
            } catch (error) {
              rows.push({ id: advancement.id, type, level: advLevel, error: error instanceof Error ? error.message : String(error) })
            }
          }
        }
        if (rows.length) out[key] = rows
      }
      return out
    }, [actorId]),

    /** 用结算内核建一张新卡；choices 按 refKey 给出官方 reverse 的恢复数据。 */
    buildCharacter: (name: string, items: any[], equipment: any[] = [], choices: Record<string, any[] | undefined> = {}) => operate([], async () => {
      const built = await buildActor(name, items, equipment, choices, { strict: false })
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

    /** P3-3b 重建：按引用导入作者条目 → 按记下的选择建卡 → 叠状态差别。 */
    rebuildCharacter: (plan: RebuildPlan) => operate([], async () => {
      const items = []
      for (const row of plan.items) items.push({ data: await importEntry(row.prop, row.entry), refKey: row.refKey })
      const equipment = []
      for (const row of plan.equipment) equipment.push({ data: await importEntry(row.prop, row.entry), refKey: row.refKey })
      const built = await buildActor(plan.name, items, equipment, plan.choices, { strict: true })
      if (built.pending) return { kernelStatus: 'pending', reason: 'rebuild-step-not-complete', step: built.step, built: built.built }
      const base = built.actor.toObject()
      await applyStateToActor(built.actor, plan.state)
      return { id: built.actor.id, ...actorLevel(built.actor), data: built.actor.toObject(), base }
    }),
  }
}
