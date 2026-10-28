import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, keywordsOf, pageOf } from './common'
import { convertBlocks } from './blocks'
import { activitiesFromText } from './activities'
import { plainText, summaryOf } from '../summary/summary'
import { renderInline } from '../markup/inline'
import type { InlineContext } from '../markup/inline'

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** 固定加值与「自选几项加几点」可以同时存在（如半精灵：魅力+2，另选两项各+1）。 */
function abilityBonus(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const fixed: Record<string, number> = {}
  let choose: Record<string, unknown> | undefined
  for (const item of Array.isArray(raw.ability) ? raw.ability : []) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    for (const key of ABILITY_KEYS) if (typeof obj[key] === 'number') fixed[key] = Number(obj[key])
    if (obj.choose && typeof obj.choose === 'object') {
      const c = obj.choose as Record<string, unknown>
      const from = Array.isArray(c.from) ? c.from.map(String).filter((k) => ABILITY_KEYS.includes(k)) : ABILITY_KEYS
      choose = { count: Number(c.count ?? 1), amount: Number(c.amount ?? 1), from }
    }
  }
  if (!Object.keys(fixed).length && !choose) return undefined
  return { ...(Object.keys(fixed).length ? { fixed } : {}), ...(choose ? { choose } : {}) }
}

function speed(raw: Record<string, unknown>): Record<string, number> {
  const value = raw.speed
  if (typeof value === 'number') return { walk: value }
  if (value && typeof value === 'object') {
    const out: Record<string, number> = {}
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) if (typeof v === 'number') out[key] = v
    return out
  }
  return { walk: 0 }
}

function keys(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const out = new Set<string>()
  for (const item of value) if (item && typeof item === 'object') for (const key of Object.keys(item)) out.add(key)
  return [...out]
}

export function convertRace(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const traits = (ctx.featuresByOwner.get(entry.id) ?? []).map((f) => f.id)
  const flexible = !raw.ability && entry.source === 'MPMM' ? { count: 3, amount: 1 } : undefined
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    ...(entry.type === 'subrace' ? { parentRace: entry.context.parentRace } : {}),
    size: Array.isArray(raw.size) ? raw.size.map(String) : [String(raw.size ?? 'M')],
    speed: speed(raw),
    ...(abilityBonus(raw) ? { abilityBonus: abilityBonus(raw) } : {}),
    ...(flexible ? { flexibleAbility: flexible } : {}),
    ...(typeof raw.darkvision === 'number' ? { darkvision: raw.darkvision } : {}),
    languages: keys(raw.languageProficiencies),
    proficiencies: [...keys(raw.skillProficiencies), ...keys(raw.toolProficiencies)],
    traits,
    advancement: traits.map((id) => ({ kind: 'itemGrant', level: 1, items: [id], optional: false })),
  }
  return { id: entry.id, type: entry.type, name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf(entry.type, entry.name, data, plainText(data.text as never)), data }
}

export function convertBackground(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const feature = (ctx.featuresByOwner.get(entry.id) ?? [])[0]
  const tables = ctx.tablesByParent.get(`${entry.source}|${entry.name}`) ?? []
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    proficiencies: { skills: keys(raw.skillProficiencies), tools: keys(raw.toolProficiencies), languages: keys(raw.languageProficiencies) },
    equipment: Array.isArray((raw.startingEquipment as Record<string, unknown> | undefined)?.default) ? ((raw.startingEquipment as Record<string, unknown>).default as string[]).map((v) => renderInline(v, inline)) : [],
    ...(feature ? { feature: feature.id } : {}),
    characteristics: tables.map((t) => ({ table: t.id, label: t.name })),
  }
  return { id: entry.id, type: 'background', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('background', entry.name, data, plainText(data.text as never)), data }
}

function abilityReq(value: unknown): Record<string, unknown> | undefined {
  if (!Array.isArray(value) || !value.length) return undefined
  const entries = value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const map: Record<string, number> = {}
    for (const key of ['str', 'dex', 'con', 'int', 'wis', 'cha']) if (typeof (item as Record<string, unknown>)[key] === 'number') map[key] = Number((item as Record<string, unknown>)[key])
    return Object.keys(map).length ? [{ ability: map }] : []
  })
  if (!entries.length) return undefined
  if (entries.length === 1) return entries[0]
  const labels: Record<string, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
  const text = entries.map((e) => Object.entries((e.ability as Record<string, number>) ?? {}).map(([k, v]) => `${labels[k] ?? k} ${v}`).join('、')).join(' 或 ')
  return { text }
}

export function prereqToRequires(prereq: unknown, ctx: ConvertContext): Record<string, unknown> | undefined {
  if (!Array.isArray(prereq) || !prereq.length) return undefined
  const all: Array<Record<string, unknown>> = []
  for (const item of prereq) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    const ability = abilityReq(obj.ability)
    if (ability) all.push(ability)
    if (typeof obj.level === 'number') all.push({ level: obj.level })
    if (obj.spellcasting === true || obj.spellcasting2020 === true) all.push({ spellcasting: true })
    if (Array.isArray(obj.proficiency)) {
      for (const prof of obj.proficiency) {
        if (prof && typeof prof === 'object') all.push({ proficiency: prof })
      }
    }
    if (Array.isArray(obj.race)) {
      const ids = obj.race.map((r) => ctx.resolveEntryId('race', String((r as Record<string, unknown>)?.name ?? ''))).filter((id): id is string => !!id)
      if (ids.length === 1) all.push({ race: ids })
      else if (ids.length > 1) all.push({ text: ids.map((id) => ctx.index.byTypeName.get(`race|${id}`)?.[0]?.name ?? id).join(' 或 ') })
      else if (typeof obj.other === 'string') all.push({ text: obj.other })
    }
    if (typeof obj.other === 'string') all.push({ text: obj.other })
    if (Array.isArray(obj.spell)) all.push({ text: `需要法术：${obj.spell.map(String).join('、')}` })
  }
  return all.length ? { all } : undefined
}

export function convertFeat(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const requires = prereqToRequires(raw.prerequisite, ctx)
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    ...(requires ? { requires } : {}),
    advancement: [],
  }
  return { id: entry.id, type: 'feat', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('feat', entry.name, data, plainText(data.text as never)), data }
}

export function convertCondition(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(entry.raw.entries, inline),
    effects: [],
    kind: entry.type,
  }
  return { id: entry.id, type: entry.type, name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf(entry.type, entry.name, data, plainText(data.text as never)), data }
}

export function convertRule(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const category = entry.context.ruleCategory === 'action' ? 'action' : 'variant'
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    category,
    ...(category === 'action' ? { activities: activitiesFromText(raw.entries, entry.name, entry.id) } : {}),
  }
  return { id: entry.id, type: 'rule', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('rule', entry.name, data, plainText(data.text as never)), data }
}

export { activitiesFromText }
