import type { Raw } from '../extract/load'
import type { PlannedEntry, PlannedType } from './plan'
import { BOOK_BY_SOURCE, PACK_BY_SOURCE, SRD_PACK_ID } from '../config/books'
import { slug } from '../lib/slug'
import type { R11Data } from '../extract/r11'

const PANTHEON_EN: Record<string, string> = {
  凯尔特: 'celtic',
  被遗忘的国度: 'forgotten-realms',
  非人类: 'nonhuman',
  北欧: 'norse',
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function pageOf(raw: Raw): number {
  return typeof raw.page === 'number' && Number.isFinite(raw.page) ? raw.page : 0
}

interface PlanR11Result {
  entries: PlannedEntry[]
  deityConflicts: string[]
}

export function planR11(data: R11Data, existing: PlannedEntry[]): PlanR11Result {
  const used = new Set(existing.map((entry) => entry.id))
  const out: PlannedEntry[] = []
  let counter = 0

  const make = (type: PlannedType, raw: Raw, parts: string[], source: string, context: Record<string, string> = {}): PlannedEntry => {
    const nameCn = str(raw.name).trim()
    const nameEn = str(raw.ENG_name).trim() || nameCn
    const name = nameCn || nameEn
    if (!name) throw new Error(`条目没有名称（类型 ${type}，来源 ${source || '未知'}）`)
    const book = BOOK_BY_SOURCE.get(source)
    if (!book) throw new Error(`来源不在白名单内：${source}（${name}）`)
    const base = `${type === 'monsterPart' ? 'monsterpart' : type}.${parts.map((part) => part || 'entry').join('-')}.${source.toLowerCase()}`
    let id = base
    let n = 2
    while (used.has(id)) id = `${base}-${n++}`
    used.add(id)
    const page = pageOf(raw)
    counter++
    return {
      key: `${type}|${source}|${name}|${counter}`,
      type,
      raw,
      source,
      packId: raw.srd === true ? SRD_PACK_ID : PACK_BY_SOURCE.get(source)!,
      srd: raw.srd === true,
      name,
      nameEn,
      page,
      id,
      missingName: !nameCn || (nameCn === nameEn && /[A-Za-z]/.test(nameCn)),
      missingPage: page === 0,
      context,
    }
  }

  const push = (entry: PlannedEntry): void => { out.push(entry) }

  for (const raw of data.languages) {
    const code = str(raw.ENG_name).trim().toLowerCase()
    if (!code) throw new Error(`语言没有英文名：${str(raw.name)}`)
    push(make('language', { ...raw, _code: code }, [slug(code)], str(raw.source)))
  }
  for (const raw of data.languageScripts) push(make('rule', { ...raw, _ruleCategory: 'script' }, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { ruleCategory: 'script' }))
  for (const raw of data.skills) push(make('rule', { ...raw, _ruleCategory: 'skill' }, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { ruleCategory: 'skill' }))
  for (const raw of data.senses) push(make('rule', { ...raw, _ruleCategory: 'sense' }, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { ruleCategory: 'sense' }))
  for (const raw of data.itemProperties) {
    const first = Array.isArray(raw.entries) && raw.entries[0] && typeof raw.entries[0] === 'object' ? raw.entries[0] as Raw : {}
    const name = first.name ?? raw.name
    const nameEn = first.ENG_name ?? raw.ENG_name
    push(make('rule', { ...raw, _ruleCategory: 'itemProperty', name, ENG_name: nameEn }, [slug(str(nameEn) || str(name))], str(raw.source), { ruleCategory: 'itemProperty' }))
  }
  const itemTypeIds = new Map<string, string>()
  for (const original of data.itemTypes) {
    let raw = original
    const copy = raw._copy && typeof raw._copy === 'object' ? raw._copy as Raw : undefined
    if (copy) {
      const base = data.itemTypes.find((item) => item.abbreviation === copy.abbreviation && item.source === copy.source)
      if (!base) throw new Error(`物品类型 _copy 解析不了：${str(raw.name)}（${str(copy.abbreviation)}|${str(copy.source)}）`)
      const { _copy, ...own } = raw
      raw = { ...base, ...own }
    }
    const made = make('rule', { ...raw, _ruleCategory: 'itemType' }, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { ruleCategory: 'itemType' })
    itemTypeIds.set(`${str(raw.abbreviation)}|${str(raw.source)}`, made.id)
    push(made)
  }
  for (const raw of data.itemTypeExtras) {
    const target = itemTypeIds.get(str(raw.appliesTo))
    if (!target) throw new Error(`物品类型附加条目的 appliesTo 解析不了：${str(raw.appliesTo)}（${str(raw.name)}）`)
    push(make('rule', { ...raw, _ruleCategory: 'itemTypeExtra', _appliesToId: target }, [slug(str(raw.appliesTo).split('|')[0])], str(raw.source), { ruleCategory: 'itemTypeExtra' }))
  }

  const deityGroups = new Map<string, Raw[]>()
  for (const raw of data.deities) {
    const key = `${str(raw.name)}|${str(raw.source)}`
    const list = deityGroups.get(key) ?? []
    list.push(raw)
    deityGroups.set(key, list)
  }
  const deityConflicts: string[] = []
  for (const [key, group] of deityGroups) {
    if (group.length < 2) continue
    deityConflicts.push(key)
    const pantheons = [...new Set(group.map((raw) => str(raw.pantheon)))].sort()
    const fallback = new Map(pantheons.map((pantheon, index) => [pantheon, `p${index + 1}`]))
    for (const raw of group) {
      const pantheon = str(raw.pantheon)
      const suffix = PANTHEON_EN[pantheon] ?? fallback.get(pantheon) ?? 'p1'
      push(make('deity', { ...raw, _deityConflict: true }, [slug(str(raw.ENG_name) || str(raw.name)), slug(suffix)], str(raw.source), { deityConflict: key }))
    }
  }
  for (const raw of data.deities) {
    const key = `${str(raw.name)}|${str(raw.source)}`
    if ((deityGroups.get(key)?.length ?? 0) > 1) continue
    push(make('deity', raw, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source)))
  }

  for (const raw of data.rewards) {
    const kind = str(raw._rewardKind) || 'reward'
    push(make('reward', { ...raw, _rewardKind: kind }, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { rewardKind: kind }))
  }
  for (const raw of data.cults) push(make('cult', raw, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source)))
  for (const raw of data.traps) push(make('hazard', { ...raw, _hazardKind: 'trap' }, ['trap', slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { hazardKind: 'trap' }))
  for (const raw of data.hazards) push(make('hazard', { ...raw, _hazardKind: 'hazard' }, ['hazard', slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { hazardKind: 'hazard' }))
  for (const raw of data.objects) push(make('object', raw, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source)))
  for (const raw of data.vehicles) push(make('vehicle', raw, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source)))
  for (const raw of data.makebrewActions) push(make('monsterPart', { ...raw, _partKind: 'action' }, ['action', slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { partKind: 'action' }))
  for (const raw of data.makebrewTraits) push(make('monsterPart', { ...raw, _partKind: 'trait' }, ['trait', slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { partKind: 'trait' }))
  for (const raw of data.monsterFeatures) push(make('monsterPart', { ...raw, _partKind: 'feature' }, ['feature', slug(str(raw.ENG_name) || str(raw.name))], 'DMG', { partKind: 'feature' }))
  for (const raw of data.quickrefs) push(make('rule', { ...raw, _ruleCategory: 'quickref' }, [slug(str(raw.ENG_name) || str(raw.name))], str(raw.source), { ruleCategory: 'quickref' }))

  return { entries: out, deityConflicts }
}
