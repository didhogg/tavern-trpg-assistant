// e 段：建卡与升级。步骤由 dnd5e 官方 AdvancementManager 计算，应用也走同一管理器；不手写成长规则。
// 选择步骤用一张“进阶类型 → 第一个可选项”的登记表；加一种进阶写法 = 加一行。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'

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

async function applyManager(manager: any): Promise<boolean> {
  if (!manager.steps.length) return true
  for (const step of manager.steps) {
    if (step.automatic || !step.flow) continue
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
    setTimeout(() => { g.Hooks.off(hook); resolve(false) }, 2_000)
  })
  await manager.render()
  return completed
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
    const chosen = new Set(advancement.value?.chosen ?? [])
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
      const finished = await applyManager(manager)
      if (!finished) {
        return {
          kernelStatus: 'pending',
          reason: manager.step ? 'awaiting-choice' : 'advancement-manager-not-complete',
          step: stepSummary(manager.step),
        }
      }
      return actorLevel(a)
    }, [actorId]),

    /** 用结算内核建一张新卡：空白人物 → 种族/背景/职业（官方 forNewItem）→ 起始武器。 */
    buildCharacter: (name: string, items: any[], equipment: any[] = []) => operate([], async () => {
      const ActorClass = g.CONFIG.Actor.documentClass
      const created = await ActorClass.create({ name, type: 'character', system: { details: { level: 1 } } })
      for (const item of items) {
        const manager = Manager().forNewItem(created, cleanItem(item), { automaticApplication: true })
        const finished = await applyManager(manager)
        if (!finished) {
          return { kernelStatus: 'pending', reason: 'build-step-not-complete', step: stepSummary(manager.step), built: actorLevel(created) }
        }
      }
      if (equipment.length) await created.createEmbeddedDocuments('Item', equipment.map(cleanItem))
      return { id: created.id, ...actorLevel(created) }
    }),

    /** 建卡待选项：把作者转出的种族/背景/职业条目放进一个空白 1 级人物，列官方成长步骤（不改世界）。 */
    buildSteps: (itemData: any) => operate([], async () => {
      const ActorClass = g.CONFIG.Actor.documentClass
      const blank = new ActorClass({ name: 'Build preview', type: 'character', system: { details: { level: 1 } } })
      const manager = Manager().forNewItem(blank, itemData)
      const steps = await describeSteps(manager)
      return { status: steps.length ? 'pending' : 'complete', steps }
    }),
  }
}
