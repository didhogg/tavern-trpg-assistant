import type { Raw, RawData } from '../extract/load'
import { BOOK_BY_SOURCE, BOOK_SOURCES, PACK_BY_SOURCE, SRD_PACK_ID } from '../config/books'
import { slug } from '../lib/slug'
import { collectTables, type TableSeed } from './tables'
import type { FluffRecord } from '../extract/fluff'

export type PlannedType =
  | 'spell' | 'monster' | 'item' | 'class' | 'subclass' | 'feature'
  | 'race' | 'subrace' | 'background' | 'feat'
  | 'condition' | 'disease' | 'status' | 'table' | 'rule' | 'lore' | 'language' | 'deity' | 'reward' | 'cult' | 'hazard' | 'object' | 'vehicle' | 'monsterPart' | 'recipe' | 'charoption'

export interface PlannedEntry {
  key: string
  type: PlannedType
  raw: Raw
  source: string
  packId: string
  srd: boolean
  name: string
  nameEn: string
  page: number
  id: string
  missingName: boolean
  missingPage: boolean
  context: Record<string, string>
}

export interface FluffUnmatched { name: string; source: string; kind: string; reason: string }

export interface PlanResult {
  entries: PlannedEntry[]
  tables: PlannedEntry[]
  tableSeeds: TableSeed[]
  classIds: Map<string, string>
  subclassIds: Map<string, string>
  skippedFeatures: number
  skippedSubraces: number
  unmatchedFluff: FluffUnmatched[]
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function pageOf(raw: Raw): number {
  return typeof raw.page === 'number' && Number.isFinite(raw.page) ? raw.page : 0
}

function is2024(source: string): boolean {
  return source === 'XPHB' || source === 'XDMG' || source === 'XMM'
}

export function planAll(data: RawData, items: Raw[]): PlanResult {
  const entries: PlannedEntry[] = []
  const tables: PlannedEntry[] = []
  const used = new Set<string>()
  const classIds = new Map<string, string>()
  const subclassIds = new Map<string, string>()
  const subclassSlugs = new Map<string, string>()
  const classSlugs = new Map<string, { classSlug: string; subclassSlug: string }>()
  let skippedFeatures = 0
  let skippedSubraces = 0
  let counter = 0

  const idFor = (type: PlannedType, parts: string[], source: string): string => {
    const base = `${type}.${parts.map((p) => p || 'entry').join('-')}.${source.toLowerCase()}`
    let id = base
    let n = 2
    while (used.has(id)) id = `${base}-${n++}`
    used.add(id)
    return id
  }

  const make = (type: PlannedType, raw: Raw, parts: string[], context: Record<string, string> = {}): PlannedEntry => {
    const source = str(raw.source)
    const nameCn = str(raw.name).trim()
    const nameEn = str(raw.ENG_name).trim() || nameCn
    const missingName = !nameCn || (nameCn === nameEn && /[A-Za-z]/.test(nameCn))
    const name = nameCn || nameEn
    if (!name) throw new Error(`条目没有名称（类型 ${type}，来源 ${source || '未知'}，ENG ${str(raw.ENG_name) || '—'}，序号 ${counter}）`)
    const page = pageOf(raw)
    const srd = raw.srd === true
    const book = BOOK_BY_SOURCE.get(source)
    if (!book) throw new Error(`来源不在白名单内：${source}（${name}）`)
    counter++
    return {
      key: `${type}|${source}|${name}|${counter}`,
      type,
      raw,
      source,
      packId: srd ? SRD_PACK_ID : PACK_BY_SOURCE.get(source)!,
      srd,
      name,
      nameEn,
      page,
      id: idFor(type, parts, source),
      missingName,
      missingPage: page === 0,
      context,
    }
  }

  for (const raw of data.classes) {
    const classSlug = slug(str(raw.ENG_name) || str(raw.name))
    const entry = make('class', raw, [classSlug])
    entries.push(entry)
    const key = `${str(raw.name)}|${str(raw.source)}`
    classIds.set(key, entry.id)
    classSlugs.set(key, { classSlug, subclassSlug: '' })
  }
  for (const raw of data.subclasses) {
    if (is2024(str(raw.classSource))) continue
    const key = `${str(raw.className)}|${str(raw.classSource)}`
    const info = classSlugs.get(key)
    if (!info) continue
    const subclassSlug = slug(str(raw.ENG_name) || str(raw.shortName) || str(raw.name))
    const entry = make('subclass', raw, [info.classSlug, subclassSlug], { classId: classIds.get(key) ?? '' })
    entries.push(entry)
    subclassIds.set(`${key}|${str(raw.shortName)}|${str(raw.source)}`, entry.id)
    subclassIds.set(`${key}|${str(raw.shortName)}`, entry.id)
    subclassIds.set(`${key}|${str(raw.name)}|${str(raw.source)}`, entry.id)
    subclassSlugs.set(`${key}|${str(raw.shortName)}|${str(raw.source)}`, subclassSlug)
    subclassSlugs.set(`${key}|${str(raw.shortName)}`, subclassSlug)
  }

  for (const raw of data.spells) entries.push(make('spell', raw, [slug(str(raw.ENG_name) || str(raw.name))]))
  for (const raw of data.monsters) entries.push(make('monster', raw, [slug(str(raw.ENG_name) || str(raw.name))]))
  for (const raw of items) {
    const idSlug = str(raw._variantSlug) || slug(str(raw.ENG_name) || str(raw.name))
    entries.push(make('item', raw, [idSlug], { baseOnly: raw._baseOnly ? '1' : '0' }))
  }
  const hiddenAbilities = new Map<string, unknown>()
  for (const sub of data.subraces) {
    if (str(sub.name).trim() || str(sub.ENG_name).trim() || !sub.ability) continue
    hiddenAbilities.set(`${str(sub.raceName)}|${str(sub.raceSource)}`, sub.ability)
  }
  for (const raw of data.races) {
    const ability = raw.ability ?? hiddenAbilities.get(`${str(raw.name)}|${str(raw.source)}`)
    entries.push(make('race', ability ? { ...raw, ability } : raw, [slug(str(raw.ENG_name) || str(raw.name))]))
  }
  for (const raw of data.subraces) {
    if (!str(raw.name).trim() && !str(raw.ENG_name).trim()) {
      skippedSubraces++
      continue
    }
    const parentKey = `${str(raw.raceName)}|${str(raw.raceSource)}`
    const parent = entries.find((e) => e.type === 'race' && `${e.name}|${e.source}` === parentKey)
    const parentSlug = parent ? slug(parent.nameEn) : slug(str(raw.raceName))
    const displayName = parent && !str(raw.name).includes(parent.name) ? `${str(raw.name)}${parent.name}` : str(raw.name)
    const displayEn = parent && (raw._versionOf === undefined || !(str(raw.ENG_name) || str(raw.name)).includes(parent.nameEn)) ? `${str(raw.ENG_name) || str(raw.name)} ${parent.nameEn}` : str(raw.ENG_name)
    entries.push(make('subrace', { ...raw, name: displayName, ENG_name: displayEn }, [parentSlug, slug(str(raw.ENG_name) || str(raw.name))], { parentRace: parent?.id ?? '', parentSpeed: parent?.raw.speed === undefined ? '' : JSON.stringify(parent.raw.speed) }))
  }
  for (const raw of data.backgrounds) {
    const entry = make('background', raw, [slug(str(raw.ENG_name) || str(raw.name))])
    entries.push(entry)
    const blocks = Array.isArray(raw.entries) ? raw.entries : []
    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue
      const rec = block as Raw
      const meta = rec.data as Raw | undefined
      if (meta?.isFeature !== true || typeof rec.name !== 'string') continue
      entries.push(make('feature', { ...rec, source: entry.source, page: entry.page, srd: raw.srd }, [slug(entry.nameEn), slug(str(rec.ENG_name) || rec.name)], { ownerType: 'background', ownerId: entry.id, featureKind: 'background' }))
    }
  }
  for (const raw of data.feats) entries.push(make('feat', raw, [slug(str(raw.ENG_name) || str(raw.name))]))
  for (const raw of data.conditions) entries.push(make('condition', raw, [slug(str(raw.ENG_name) || str(raw.name))]))
  for (const raw of data.diseases) entries.push(make('disease', raw, [slug(str(raw.ENG_name) || str(raw.name))]))
  for (const raw of data.statuses) entries.push(make('status', raw, [slug(str(raw.ENG_name) || str(raw.name))]))
  for (const raw of data.variantRules) entries.push(make('rule', { ...raw, _ruleCategory: 'variant' }, [slug(str(raw.ENG_name) || str(raw.name))], { ruleCategory: 'variant' }))
  for (const raw of data.actions) entries.push(make('rule', { ...raw, _ruleCategory: 'action' }, [slug(str(raw.ENG_name) || str(raw.name))], { ruleCategory: 'action' }))

  for (const raw of data.classFeatures) {
    const key = `${str(raw.className)}|${str(raw.classSource)}`
    const info = classSlugs.get(key)
    if (!info || is2024(str(raw.classSource)) || (str(raw.classSource) && str(raw.source) !== str(raw.classSource) && raw.isClassFeatureVariant !== true)) {
      skippedFeatures++
      continue
    }
    entries.push(make('feature', raw, [info.classSlug, slug(str(raw.ENG_name) || str(raw.name))], { ownerType: 'class', ownerId: classIds.get(key) ?? '', featureKind: 'class' }))
  }
  for (const raw of data.subclassFeatures) {
    const key = `${str(raw.className)}|${str(raw.classSource)}`
    const info = classSlugs.get(key)
    const owner = subclassIds.get(`${key}|${str(raw.subclassShortName)}|${str(raw.subclassSource)}`) ?? subclassIds.get(`${key}|${str(raw.subclassShortName)}`)
    if (!info || !owner || is2024(str(raw.classSource)) || is2024(str(raw.subclassSource)) || (str(raw.subclassSource) && str(raw.source) !== str(raw.subclassSource))) {
      skippedFeatures++
      continue
    }
    const subclassSlug = subclassSlugs.get(`${key}|${str(raw.subclassShortName)}|${str(raw.subclassSource)}`) ?? subclassSlugs.get(`${key}|${str(raw.subclassShortName)}`) ?? 'subclass'
    entries.push(make('feature', raw, [info.classSlug, subclassSlug, slug(str(raw.ENG_name) || str(raw.name))], { ownerType: 'subclass', ownerId: owner, featureKind: 'subclass' }))
  }
  for (const raw of data.optionalFeatures) {
    entries.push(make('feature', raw, [slug(str(raw.ENG_name) || str(raw.name))], { ownerType: 'optional', ownerId: 'optional', featureKind: 'optional' }))
  }

  const scanEntries = entries
    .filter((e) => ['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'rule'].includes(e.type))
    .map((e) => ({ raw: e.raw, source: e.source, page: e.page, name: e.name, nameEn: e.nameEn }))
  const tableSeeds = collectTables(data, scanEntries)
  if (process.env.TRPG_DEBUG_TABLE) console.error(`TABLE SRD ${tableSeeds.filter((s) => s.srd).length} / ${tableSeeds.length}`, tableSeeds.filter((s) => s.srd).slice(0, 5).map((s) => s.name))
  for (const seed of tableSeeds) {
    const raw: Raw = { ...seed, name: seed.name, ENG_name: seed.nameEn, source: seed.source, page: seed.page, srd: seed.srd === true, __seed: seed }
    tables.push(make('table', raw, [slug(seed.nameEn || seed.name)]))
  }

  for (const entry of [...entries]) {
    if (entry.type !== 'race' && entry.type !== 'subrace') continue
    const blocks = Array.isArray(entry.raw.entries) ? entry.raw.entries : []
    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue
      const rec = block as Raw
      if (rec.type !== 'entries' || typeof rec.name !== 'string' || !Array.isArray(rec.entries)) continue
      const feature = make('feature', { ...rec, source: entry.source, page: entry.page, ENG_name: rec.ENG_name, srd: entry.raw.srd }, [slug(entry.nameEn), slug(str(rec.ENG_name) || rec.name)], { ownerType: 'race', ownerId: entry.id, featureKind: 'race' })
      entries.push(feature)
    }
  }
  for (const variant of data.magicVariants) {
    const inherits = (variant.inherits && typeof variant.inherits === 'object' ? variant.inherits : {}) as Raw
    const source = str(inherits.source || variant.source)
    if (!BOOK_BY_SOURCE.has(source) || !String(variant.type).startsWith('GV')) continue
    const raw: Raw = { ...variant, ...inherits, source, name: variant.name, ENG_name: variant.ENG_name, page: inherits.page ?? variant.page, entries: inherits.entries ?? variant.entries, _template: true }
    entries.push(make('item', raw, [slug(str(variant.ENG_name) || str(variant.name))], { template: '1' }))
  }
  const familyGroups = new Map<string, Raw>()
  for (const group of data.itemGroups) {
    if (!BOOK_SOURCES.has(String(group.source))) continue
    const names = (Array.isArray(group.items) ? group.items : []).map(String).sort().join('|')
    if (!familyGroups.has(names)) familyGroups.set(names, group)
  }
  for (const group of familyGroups.values()) {
    const name = str(group.name).replace(/[（(]\*[）)]/g, '').trim()
    entries.push(make('item', { ...group, _family: true, name, ENG_name: group.ENG_name }, [slug(str(group.ENG_name) || name) + '-family'], { family: '1' }))
  }
  for (const entry of entries) {
    if (entry.type !== 'item' || !entry.raw._variant || !entry.raw._baseItem) continue
    const variant = entry.raw._variant as Raw
    const inherits = (variant.inherits && typeof variant.inherits === 'object' ? variant.inherits : {}) as Raw
    const templateSource = str(inherits.source || variant.source)
    const base = entry.raw._baseItem as Raw
    const baseSource = str(base.source)
    const templateBook = BOOK_BY_SOURCE.get(templateSource)
    const baseBook = BOOK_BY_SOURCE.get(baseSource)
    if (!templateBook || !baseBook) continue
    const bothSrd = inherits.srd === true && base.srd === true
    const packSource = templateBook.layer >= baseBook.layer ? templateSource : baseSource
    entry.packId = bothSrd ? SRD_PACK_ID : PACK_BY_SOURCE.get(packSource)!
    entry.srd = bothSrd
    entry.raw = { ...entry.raw, srd: entry.srd }
  }
  const unmatchedFluff: FluffUnmatched[] = []
  const loreTargets = new Set<string>()
  const findFluffTarget = (record: FluffRecord): PlannedEntry | undefined => {
    const raw = record.raw
    const source = str(raw.source)
    const name = str(raw.name)
    const en = str(raw.ENG_name)
    const candidates = entries.filter((e) => e.source === source)
    if (record.kind === 'race') {
      const race = candidates.find((e) => e.type === 'race' && (e.name === name || e.nameEn === en))
      if (race) return race
      const parts = /^(.+?)\s*\((.+?)\)$/.exec(en) ?? /^(.+?)\s*[（(](.+?)[）)]$/.exec(name)
      if (parts) {
        const id = `subrace.${slug(parts[1].trim())}-${slug(parts[2].trim())}.${source.toLowerCase()}`
        return entries.find((e) => e.id === id)
      }
      return undefined
    }
    const type = record.kind === 'feature' ? 'feature' : record.kind
    return candidates.find((e) => e.type === type && (e.name === name || e.nameEn === en))
  }
  for (const record of data.fluff ?? []) {
    const raw = record.raw
    const entriesValue = raw.entries
    const hasEntries = Array.isArray(entriesValue) ? entriesValue.length > 0 : !!entriesValue
    if (!hasEntries) continue
    const target = findFluffTarget(record)
    if (!target) {
      unmatchedFluff.push({ name: str(raw.ENG_name) || str(raw.name), source: str(raw.source), kind: record.kind, reason: '没有找到同名目标条目' })
      continue
    }
    if (loreTargets.has(target.id)) throw new Error(`lore 目标重复：${target.id}`)
    loreTargets.add(target.id)
    if (target.packId === SRD_PACK_ID) {
      const patch = make('lore', {
        ...raw,
        source: str(raw.source),
        name: target.name,
        ENG_name: target.nameEn,
        srd: false,
        _lore: entriesValue,
        _target: target.id,
      }, [target.id], { target: target.id })
      const desired = `lore.${target.id}`
      if (used.has(desired)) throw new Error(`lore 补丁 id 重复：${desired}`)
      patch.id = desired
      used.add(desired)
      entries.push(patch)
    } else {
      if (target.id === 'subrace.aasimar-fallen.vgm') console.error('FLUFF DEBUG', JSON.stringify(entriesValue).slice(0,500))
      target.raw = { ...target.raw, _lore: entriesValue }
    }
  }
  for (const entry of [...entries]) {
    if (entry.type !== 'monster' || !Array.isArray(entry.raw.variant) || !entry.raw.variant.length) continue
    const variants = entry.raw.variant
    if (entry.packId === SRD_PACK_ID) {
      const patchId = `lore.${entry.id}`
      const existing = entries.find((e) => e.id === patchId)
      if (existing) {
        existing.raw = { ...existing.raw, _variants: variants }
      } else {
        const patch = make('lore', {
          ...entry.raw,
          source: entry.source,
          name: entry.name,
          ENG_name: entry.nameEn,
          srd: false,
          _variants: variants,
          _target: entry.id,
        }, [entry.id], { target: entry.id })
        patch.id = patchId
        used.add(patchId)
        entries.push(patch)
      }
      loreTargets.add(entry.id)
    } else {
      entry.raw = { ...entry.raw, _variants: variants }
    }
  }
  return { entries, tables, tableSeeds, classIds, subclassIds, skippedFeatures, skippedSubraces, unmatchedFluff }
}
