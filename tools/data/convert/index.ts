import type { Entry, PackFeature, PackManifest } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { makeContext } from './context'
import { attributionOf, licenseOf, makeClassIds, makeSubclassIds, ruleOptionsFor } from './packInfo'
import { addRef, type RefIndex } from '../markup/inline'
import { convertSpell } from './spell'
import { convertMonster } from './monster'
import { convertItem } from './item'
import { convertClass, convertFeature, convertSubclass } from './character'
import { convertBackground, convertRace } from './character2'
import { convertCondition, convertFeat, convertRule } from './featRule'
import { convertTable } from './table'
import { convertLore, loreForEntry } from './lore'
import { BOOKS, BOOK_BY_SOURCE, BOOK_NAMES, PACK_BY_SOURCE, SRD_PACK_ID, SRD_VERSION, lineageFor } from '../config/books'
import { DAMAGE_TYPE } from './common'
import type { RawData } from '../extract/load'
import { assignVersionGroups, disambiguateNames, emptyVersionStats, markNpcRaces, resolveFromVariant, resolveSupersededBy, type VersionStats } from './versions'

export interface ConvertedPack {
  manifest: PackManifest
  entries: Entry[]
  features: PackFeature[]
}

export interface ConversionStats {
  softRefs: number
  prunedRefs: number
  missingPages: number
  missingNames: number
  duplicateIds: number
  skippedFeatures: number
  skippedSubraces: number
  textOnlyActivities: number
  unmappedFoundry: Array<{ key: string; count: number; example: string }>
  interiorRequires: Array<{ packId: string; require: string }>
  versions: VersionStats
}

export interface ConversionResult {
  packs: ConvertedPack[]
  stats: ConversionStats
}

const ALL_TYPES = new Set(['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'disease', 'status', 'rule', 'table', 'lore'])

function structuralIds(data: Record<string, unknown>): string[] {
  const out: string[] = []
  const push = (value: unknown) => {
    if (typeof value === 'string') out.push(value)
    else if (Array.isArray(value)) for (const item of value) push(item)
  }
  push(data.classId)
  push((data.owner as { id?: string } | undefined)?.id)
  push(data.parentRace)
  push(data.traits)
  for (const item of (data.characteristics as Array<{ table?: string }> | undefined) ?? []) push(item.table)
  for (const item of (data.advancement as Array<{ items?: string[]; pool?: string[] }> | undefined) ?? []) {
    push(item.items)
    push(item.pool)
  }
  for (const item of (data.rows as Array<{ then?: { table?: string } }> | undefined) ?? []) push(item.then?.table)
  return out
}

function pruneRefs(value: unknown, allowed: Set<string>, planned: Map<string, PlannedEntry>, count: { n: number }): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{ref:([^|}]+)(?:\|([^}]*))?\}\}/g, (whole, id: string, display: string | undefined) => {
      const target = planned.get(id)
      if (target && allowed.has(target.packId)) return whole
      count.n++
      return display ?? target?.name ?? id
    })
  }
  if (Array.isArray(value)) return value.map((item) => pruneRefs(item, allowed, planned, count))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) out[key] = pruneRefs(item, allowed, planned, count)
    return out
  }
  return value
}

function requiresFor(entry: PlannedEntry, data: Record<string, unknown>, planned: Map<string, PlannedEntry>): Set<string> {
  const packs = new Set<string>()
  if (entry.packId === SRD_PACK_ID) return packs
  for (const id of structuralIds(data)) {
    const target = planned.get(id)
    if (target && target.packId !== entry.packId) {
      packs.add(target.packId)
      if (process.env.TRPG_DEBUG_REQ) console.error(`REQ ${entry.packId}:${entry.id} -> ${id} (${target.packId})`)
    }
  }
  return packs
}

function pruneStructural(data: Record<string, unknown>, allowed: Set<string>, planned: Map<string, PlannedEntry>): void {
  const ok = (id: unknown): boolean => typeof id === 'string' && (allowed.has(planned.get(id)?.packId ?? '') || false)
  for (const key of ['classes', 'subclasses', 'traits']) {
    const list = data[key]
    if (Array.isArray(list)) data[key] = list.filter((x) => typeof x !== 'string' || ok(x))
  }
  for (const key of ['classId', 'parentRace']) {
    if (typeof data[key] === 'string' && !ok(data[key])) delete data[key]
  }
  const owner = data.owner as { id?: string; type?: string } | undefined
  if (owner && owner.type !== 'optional' && typeof owner.id === 'string' && !ok(owner.id)) delete data.owner
  const characteristics = data.characteristics as Array<{ table?: string }> | undefined
  if (Array.isArray(characteristics)) data.characteristics = characteristics.filter((c) => ok(c.table))
  const advancement = data.advancement as Array<{ items?: string[]; pool?: string[]; explain?: string }> | undefined
  if (Array.isArray(advancement)) {
    for (const item of advancement) {
      if (Array.isArray(item.items)) item.items = item.items.filter((id) => ok(id) || planned.has(String(id)))
      if (Array.isArray(item.pool)) item.pool = item.pool.filter((id) => ok(id) || planned.has(String(id)))
      if (typeof item.explain === 'string' && !ok(item.explain)) delete item.explain
    }
  }
  const equipment = data.equipment as { fixed?: Array<{ item?: string }>; choose?: { from?: Array<{ item?: string }> } } | undefined
  if (equipment?.fixed) equipment.fixed = equipment.fixed.filter((x) => typeof x.item !== 'string' || ok(x.item))
  if (equipment?.choose?.from) equipment.choose.from = equipment.choose.from.filter((x) => typeof x.item !== 'string' || ok(x.item))
  const expanded = data.expandedSpells as Array<{ spells?: string[] }> | undefined
  if (Array.isArray(expanded)) {
    for (const group of expanded) if (Array.isArray(group.spells)) group.spells = group.spells.filter(ok)
  }
  const rows = data.rows as Array<{ refs?: string[]; then?: { table?: string } }> | undefined
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (Array.isArray(row.refs)) row.refs = row.refs.filter(ok)
      if (row.then && !ok(row.then.table)) delete row.then
    }
  }
}



export function convertAll(data: RawData, planned: PlannedEntry[], tables: PlannedEntry[], skippedFeatures: number, skippedSubraces = 0): ConversionResult {
  const versionStats = emptyVersionStats()
  disambiguateNames(planned, versionStats)
  const all = [...planned, ...tables]
  const byId = new Map(all.map((e) => [e.id, e]))
  const index: RefIndex = { byTypeName: new Map(), byTypeNameSource: new Map() }
  for (const entry of all) {
    addRef(index, { id: entry.id, type: entry.type, name: entry.name, packId: entry.packId }, entry.source)
    if (entry.nameEn && entry.nameEn !== entry.name) addRef(index, { id: entry.id, type: entry.type, name: entry.nameEn, packId: entry.packId }, entry.source)
  }
  const featuresByOwner = new Map<string, Array<{ id: string; name: string; level: number; raw: Record<string, unknown> }>>()
  const subclassLevelByClass = new Map<string, number>()
  const subclassNames = new Map<string, string>()
  for (const e of planned) if (e.type === 'subclass') subclassNames.set(e.id, e.name)
  for (const entry of planned) {
    if (entry.type !== 'feature' || !entry.context.ownerId) continue
    const list = featuresByOwner.get(entry.context.ownerId) ?? []
    list.push({ id: entry.id, name: entry.name, level: Number(entry.raw.level ?? 0), raw: entry.raw })
    featuresByOwner.set(entry.context.ownerId, list)
    if (entry.context.ownerType === 'subclass' && typeof entry.raw.level === 'number') {
      const subclass = byId.get(entry.context.ownerId)
      const classId = subclass?.context.classId
      if (classId) subclassLevelByClass.set(classId, Math.min(subclassLevelByClass.get(classId) ?? 20, entry.raw.level))
    }
  }
  const tablesByParent = new Map<string, Array<{ id: string; name: string }>>()
  const tableByName = new Map<string, string>()
  for (const table of tables) {
    const seed = table.raw.__seed as { parentKey?: string; name: string; nameEn?: string }
    if (seed.parentKey) {
      const list = tablesByParent.get(seed.parentKey) ?? []
      list.push({ id: table.id, name: table.name })
      tablesByParent.set(seed.parentKey, list)
    }
    tableByName.set(seed.name, table.id)
    tableByName.set(table.name, table.id)
    if (seed.nameEn) tableByName.set(seed.nameEn, table.id)
  }
  const bookMachine = new Map(data.books.map((b) => [b.source, b.translator === '机翻']))
  const unmappedFoundry = new Map<string, { count: number; example: string }>()
  const ctx: ConvertContext = makeContext({
    bookMachine,
    classIds: makeClassIds(planned),
    subclassIds: makeSubclassIds(planned),
    spellLookup: data.spellLookup,
    itemGroups: data.itemGroups,
    legendaryGroups: data.legendaryGroups,
    featuresByOwner,
    subclassLevelByClass,
    subclassNames,
    tablesByParent,
    tableByName,
    index,
    foundryClasses: data.foundryClasses,
    foundrySubclasses: data.foundrySubclasses,
    foundryClassFeatures: data.foundryClassFeatures,
    foundrySubclassFeatures: data.foundrySubclassFeatures,
    foundryFeats: data.foundryFeats,
    foundryRaces: data.foundryRaces,
    foundryOptionalFeatures: data.foundryOptionalFeatures,
    foundryItems: data.foundryItems,
    unmappedFoundry,
  })
  const allowedAll = new Set(all.map((e) => e.packId))
  const stats: ConversionStats = {
    softRefs: 0,
    prunedRefs: 0,
    missingPages: planned.filter((e) => e.missingPage).length,
    missingNames: planned.filter((e) => e.missingName).length,
    duplicateIds: all.filter((e) => /-\d+$/.test(e.id)).length,
    skippedFeatures,
    skippedSubraces,
    textOnlyActivities: 0,
    unmappedFoundry: [...unmappedFoundry].map(([key, value]) => ({ key, ...value })),
    interiorRequires: [],
    versions: versionStats,
  }
  const converted = new Map<string, Entry>()
  for (const entry of all) {
    const inline = { index, book: entry.source, ownPack: entry.packId, allowed: allowedAll, softRefs: { count: 0 }, missingTags: new Map(), vars: placeholders(entry) }
    const built = convertOne(entry, ctx, inline)
    const data = built.data as Record<string, unknown>
    if (entry.context.nameSuffix) data.nameSuffix = entry.context.nameSuffix
    if (entry.type !== 'lore') {
      const lore = loreForEntry(entry, inline)
      if (lore) data.lore = lore
    }
    const required = requiresFor(entry, data, byId)
    const allowed = new Set([entry.packId, SRD_PACK_ID, ...required])
    const prunedCount = { n: 0 }
    const pruned = pruneRefs(data, allowed, byId, prunedCount) as Record<string, unknown>
    pruneStructural(pruned, allowed, byId)
    stats.prunedRefs += prunedCount.n
    built.data = pruned
    if (entry.type === 'monster') {
      for (const key of ['traits', 'actions', 'bonusActions', 'reactions']) {
        const list = pruned[key] as Array<{ activities?: unknown[] }> | undefined
        if (list) stats.textOnlyActivities += list.filter((a) => !a.activities || a.activities.length === 0).length
      }
    }
    for (const packId of required) if (packId !== SRD_PACK_ID && packId !== entry.packId) stats.interiorRequires.push({ packId: entry.packId, require: packId })
    converted.set(entry.id, built)
  }
  const layerOf = (packId: string): number => packId === SRD_PACK_ID ? 0 : (BOOKS.find((b) => b.packId === packId)?.layer ?? 0)
  for (const plan of planned) {
    if (plan.raw._family !== true) continue
    const family = converted.get(plan.id)
    const members = (family?.data.members as string[] | undefined) ?? []
    if (!members.length) continue
    const target = members.map((id) => byId.get(id)).filter((e): e is PlannedEntry => !!e)
    let highPack = plan.packId
    for (const member of target) if (layerOf(member.packId) > layerOf(highPack)) highPack = member.packId
    plan.packId = highPack
    plan.srd = plan.packId === SRD_PACK_ID
    if (family) (family.data.credit as { srd?: boolean }).srd = plan.srd
  }
  const keyValueSpecs: Record<string, { label: string; match: RegExp }> = {
    'item.potion-of-healing-family.dmg': { label: '恢复量', match: /\{\{roll:([^|}]+)\|/ },
    'item.belt-of-giant-strength-family.dmg': { label: '力量值', match: /力量值变为(\d+)/ },
    'item.potion-of-giant-strength-family.dmg': { label: '力量值', match: /力量属性值将变为(\d+)/ },
  }
  for (const plan of planned) {
    if (plan.raw._family !== true) continue
    const spec = keyValueSpecs[plan.id]
    if (!spec) continue
    const family = converted.get(plan.id)
    const members = (family?.data.members as string[] | undefined) ?? []
    const values: Record<string, string> = {}
    for (const member of members) {
      const text = JSON.stringify(converted.get(member)?.data.text ?? '')
      const match = spec.match.exec(text)
      if (!match) throw new Error(`家族 ${plan.id} 的成员 ${member} 缺少要点值`)
      values[member] = match[1]
    }
    if (!family || !Object.keys(values).length) throw new Error(`家族 ${plan.id} 没有要点列成员`)
    family.data.keyValue = { label: spec.label, values }
  }
  for (const [id, built] of converted) {
    const plan = byId.get(id)
    if (!plan) continue
    const required = requiresFor(plan, built.data as Record<string, unknown>, byId)
    const allowed = new Set([plan.packId, SRD_PACK_ID, ...required])
    const count = { n: 0 }
    built.data = pruneRefs(built.data, allowed, byId, count) as typeof built.data
    pruneStructural(built.data as Record<string, unknown>, allowed, byId)
    stats.prunedRefs += count.n
  }
  resolveSupersededBy(planned, converted, versionStats)
  markNpcRaces(planned, converted, versionStats)
  assignVersionGroups(planned, converted, versionStats)
  resolveFromVariant(planned, converted, versionStats)
  stats.unmappedFoundry = [...unmappedFoundry].map(([key, value]) => ({ key, ...value }))
  const packIds = [SRD_PACK_ID, ...BOOKS.map((b) => b.packId)]
  const packs: ConvertedPack[] = packIds.map((packId) => {
    const entries = [...converted.values()].filter((e) => {
      const p = byId.get(e.id)
      return p?.packId === packId
    })
    const book = BOOKS.find((b) => b.packId === packId)
    const requireSet = new Set<string>((book?.requiresBooks ?? []).map((s) => PACK_BY_SOURCE.get(s)!))
    for (const entry of entries) {
      const plan = byId.get(entry.id)!
      for (const pack of requiresFor(plan, entry.data, byId)) requireSet.add(pack)
    }
    const features = ruleOptionsFor(packId, entries, planned)
    const requires = [...requireSet].filter((id) => id !== packId && id !== SRD_PACK_ID).sort().map((id) => ({ id }))
    const manifest: PackManifest = {
      id: packId,
      ruleId: 'dnd5e2014',
      category: 'rules',
      name: book?.name ?? 'SRD 基础规则',
      nameEn: book?.nameEn ?? 'Systems Reference Document',
      version: book?.version ?? SRD_VERSION,
      license: licenseOf(entries),
      attribution: attributionOf(entries),
      description: book ? `${book.name}（D&D 5e 2014）的条目、随机表与规则选项。` : 'D&D 5e（2014）SRD 基础规则：带 srd 标记的条目、随机表与规则选项。',
      author: 'didhogg',
      lineage: lineageFor(packId),
      entryCount: entries.length,
      typeCounts: {},
      contributes: {},
      relationships: { requires, recommends: [], conflicts: [] },
      blobs: [],
      dataVersion: 2,
      minAppVersion: '0.1.0',
    }
    return { manifest, entries, features }
  })
  return { packs, stats }
}




function placeholders(entry: PlannedEntry): Record<string, string> {
  const raw = entry.raw
  const base = (raw._baseItem ?? {}) as Record<string, unknown>
  const baseName = typeof base.name === 'string' ? base.name : ''
  const vars: Record<string, string> = {}
  for (const key of ['bonusWeapon', 'bonusAc', 'bonusWeaponAttack', 'bonusSpellAttack', 'bonusSpellSaveDc']) {
    const value = raw[key]
    if (typeof value === 'string' || typeof value === 'number') vars[key] = String(value)
  }
  const dmg = DAMAGE_TYPE[String(raw.dmgType ?? base.dmgType ?? '')]
  vars.dmgType = dmg ?? ''
  if (baseName) { vars['baseName/a'] = baseName; vars['baseName/l'] = baseName; vars['baseName/at'] = baseName }
  return vars
}

function convertOne(entry: PlannedEntry, ctx: ConvertContext, inline: Parameters<typeof convertSpell>[2]): Entry {
  switch (entry.type) {
    case 'spell':
      return convertSpell(entry, ctx, inline)
    case 'monster':
      return convertMonster(entry, ctx, inline)
    case 'item':
      return convertItem(entry, ctx, inline)
    case 'class':
      return convertClass(entry, ctx, inline)
    case 'subclass':
      return convertSubclass(entry, ctx, inline)
    case 'feature':
      return convertFeature(entry, ctx, inline)
    case 'race':
    case 'subrace':
      return convertRace(entry, ctx, inline)
    case 'background':
      return convertBackground(entry, ctx, inline)
    case 'feat':
      return convertFeat(entry, ctx, inline)
    case 'condition':
    case 'disease':
    case 'status':
      return convertCondition(entry, ctx, inline)
    case 'rule':
      return convertRule(entry, ctx, inline)
    case 'table':
      return convertTable(entry, ctx, inline)
    case 'lore':
      return convertLore(entry, ctx, inline)
    default:
      throw new Error(`没有为类型 ${entry.type} 准备转换器`)
  }
}

export { ALL_TYPES, BOOK_BY_SOURCE, BOOK_NAMES, PACK_BY_SOURCE }
