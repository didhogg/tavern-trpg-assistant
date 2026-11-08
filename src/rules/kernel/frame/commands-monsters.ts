// d 段：怪物 NPC。完整怪物导入只调 Plutonium 公开导入器；动作/施法/传奇动作仍走 dnd5e 官方入口。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { Operate } from './commands-items'
import type { KernelActorStateLike } from '../../../core/saves/state'
import { reseedKernel } from './seed'
import { applyStateToActor } from './actor-state'

const g = globalThis as any

function abilityState(system: any): any {
  return Object.fromEntries(Object.entries(system.abilities ?? {}).map(([key, ability]: [string, any]) => [key,
    { value: ability.value ?? null, mod: ability.mod ?? null, save: ability.save?.value ?? ability.save ?? null,
      proficient: ability.proficient ?? null }]))
}

function skillState(system: any): any {
  return Object.fromEntries(Object.entries(system.skills ?? {}).map(([key, skill]: [string, any]) => [key,
    { total: skill.total ?? null, passive: skill.passive ?? null, proficient: skill.proficient ?? null }]))
}

function activityList(activities: any): any[] {
  if (!activities) return []
  if (Array.isArray(activities)) return activities
  if (typeof activities[Symbol.iterator] === 'function') return [...activities]
  return Object.values(activities)
}

function itemSummary(item: any): any {
  return {
    id: item.id ?? item._id ?? null,
    name: item.name,
    type: item.type,
    activities: activityList(item.system?.activities).map((a: any) => ({ id: a.id ?? a._id, type: a.type, name: a.name })),
    uses: item.system?.uses?.max ? { max: item.system.uses.max, spent: item.system.uses.spent ?? null } : null,
  }
}

/** 完整导入后的 Actor 摘要：用文档的准备后 system（不是 toObject 的源数据），只取结算要用的数值与结构。 */
function actorSummary(doc: any): any {
  const data = doc.toObject ? doc.toObject() : doc
  const system = doc.system ?? data.system ?? {}
  const items = doc.items?.contents ?? doc.items ?? data.items ?? []
  return {
    name: doc.name ?? data.name,
    type: doc.type ?? data.type,
    ac: system.attributes?.ac?.value ?? null,
    hp: system.attributes?.hp ? { value: system.attributes.hp.value ?? null, max: system.attributes.hp.max ?? null } : null,
    abilities: abilityState(system),
    skills: skillState(system),
    cr: system.details?.cr ?? null,
    legendary: {
      actions: system.resources?.legact ? { value: system.resources.legact.value ?? null, max: system.resources.legact.max ?? null } : null,
      resistances: system.resources?.legres ? { value: system.resources.legres.value ?? null, max: system.resources.legres.max ?? null } : null,
    },
    items: [...items].map(itemSummary),
    validation: doc.validationFailures ?? [],
  }
}

async function importTemp(entry: any): Promise<any> {
  const api = g.game.modules.get('plutonium')?.api
  if (!api?.importer?.creature?.pImportEntry) throw Error('Plutonium creature importer is not available')
  const summary = await api.importer.creature.pImportEntry(entry, { isTemp: true })
  const doc = summary.imported?.[0]?.document ?? null
  return { summary, doc }
}

/** ImportSummary.status 是 Symbol，不能经 postMessage 结构化克隆；只把它变成可读文本。 */
function statusText(status: any): any {
  if (typeof status !== 'symbol') return status
  return status.description ?? String(status)
}

async function importOne(entry: any): Promise<any> {
  const { summary, doc } = await importTemp(entry)
  return {
    status: statusText(summary.status),
    entity: { name: entry.name, source: entry.source },
    ...(doc ? actorSummary(doc) : { error: 'Importer returned no document' }),
  }
}

function seedForMonster(entry: any): void {
  reseedKernel(`monster:${String(entry?.name ?? '')}|${String(entry?.source ?? '')}`)
}

export function createMonsterCommands(operate: Operate) {
  return {
    /** 完整怪物导入（临时 Actor，不进世界）：全量验证用。 */
    importMonster: (entry: any) => operate([], async () => importOne(entry)),

    /** 一批怪物逐个完整导入；单条失败只记在该行，不中断整批。 */
    importMonsters: (entries: any[]) => operate([], async () => {
      const rows = []
      for (const entry of entries) {
        try {
          rows.push(await importOne(entry))
        } catch (error) {
          rows.push({ status: 'error', entity: { name: entry.name, source: entry.source },
            error: error instanceof Error ? error.message : String(error) })
        }
      }
      return rows
    }),

    /** P3-3b 重建怪物：按作者条目重新导入 → 建 Actor → 叠状态差别。 */
    rebuildMonster: (plan: { entry: any; name: string; state?: KernelActorStateLike; data?: any }) => operate([], async () => {
      seedForMonster(plan.entry)
      let data: any
      let status = 'complete'
      if (plan.data) data = structuredClone(plan.data)
      else {
        const imported = await importTemp(plan.entry)
        if (!imported.doc) throw Error(`Importer returned no document for ${plan.entry?.name ?? 'monster'}`)
        data = imported.doc.toObject()
        status = statusText(imported.summary.status)
      }
      delete data._id
      for (const item of data.items ?? []) delete item._id
      for (const effect of data.effects ?? []) delete effect._id
      const ActorClass = g.CONFIG.Actor.documentClass
      const created = await ActorClass.create({ ...data, name: plan.name })
      const base = created.toObject()
      await applyStateToActor(created, plan.state)
      return { status, id: created.id, ...actorSummary(created), data: created.toObject(), base }
    }),

    /** 怪物导入结果（不建 Actor）：给换算缓存存。 */
    importMonsterData: (entry: any) => operate([], async () => {
      seedForMonster(entry)
      const { summary, doc } = await importTemp(entry)
      if (!doc) throw Error(`Importer returned no document for ${entry?.name ?? 'monster'}`)
      return { status: statusText(summary.status), data: doc.toObject() }
    }),

    /** 用存好的怪物数据建 Actor（缓存命中时走这条）。 */
    createActorFromData: (raw: any) => operate([], async () => {
      const data = structuredClone(raw)
      delete data._id
      for (const item of data.items ?? []) delete item._id
      for (const effect of data.effects ?? []) delete effect._id
      const ActorClass = g.CONFIG.Actor.documentClass
      const created = await ActorClass.create(data)
      return { status: 'complete', id: created.id, ...actorSummary(created) }
    }),

    /** 完整怪物导入并放进世界（抽样做动作/施法/传奇动作用）；返回新 Actor 的 id 与摘要。 */
    importMonsterActor: (entry: any) => operate([], async () => {
      seedForMonster(entry)
      const { summary, doc } = await importTemp(entry)
      if (!doc) throw Error(`Importer returned no document for ${entry.name}`)
      const data = doc.toObject()
      delete data._id
      for (const item of data.items ?? []) delete item._id
      for (const effect of data.effects ?? []) delete effect._id
      const ActorClass = g.CONFIG.Actor.documentClass
      const created = await ActorClass.create(data)
      return { status: statusText(summary.status), id: created.id, ...actorSummary(created) }
    }),
  }
}
