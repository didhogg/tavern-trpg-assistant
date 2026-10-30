import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import type { InlineContext } from '../markup/inline'
import { creditFor, keywordsOf, pageOf } from './common'
import { convertBlocks } from './blocks'
import { plainText, summaryOf } from '../summary/summary'
import { dedupeEffects, foundryFeature, foundryRulesFor, usesFromText } from './foundry'
import { FEAT_EFFECTS } from '../config/featureRules'
import { ACTION_RULES, CONDITION_EFFECTS, EXHAUSTION_LEVELS } from '../config/conditionEffects'
import { activitiesFromText } from './activities'
import { ABILITY_KEYS, proficiencyTrait, spellGrants } from './character2'

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
  const any: Array<Record<string, unknown>> = []
  for (const item of prereq) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.ability) && obj.ability.length > 1) {
      for (const a of obj.ability) if (a && typeof a === 'object') any.push({ ability: Object.fromEntries(Object.entries(a as Record<string, unknown>).filter(([, v]) => typeof v === 'number')) })
      continue
    }
    const ability = abilityReq(obj.ability)
    if (ability) all.push(ability)
    if (typeof obj.level === 'number') all.push({ level: obj.level })
    if (obj.level && typeof obj.level === 'object') {
      const level = obj.level as Record<string, unknown>
      const cls = level.class && typeof level.class === 'object' ? level.class as Record<string, unknown> : undefined
      const classId = cls ? ctx.classIds.get(`${String(cls.name ?? '')}|${String(cls.source ?? '')}`) ?? [...ctx.classIds].find(([k]) => k.startsWith(`${String(cls.name ?? '')}|`))?.[1] : undefined
      if (typeof level.level === 'number') all.push({ level: level.level, ...(classId ? { class: [classId] } : {}) })
    }
    if (obj.spellcasting === true || obj.spellcasting2020 === true) all.push({ spellcasting: true })
    if (Array.isArray(obj.proficiency)) for (const prof of obj.proficiency) if (prof && typeof prof === 'object') all.push({ proficiency: prof })
    if (Array.isArray(obj.race)) {
      const ids = obj.race.map((r) => ctx.resolveEntryId('race', String((r as Record<string, unknown>)?.name ?? ''))).filter((id): id is string => !!id)
      if (ids.length === 1) all.push({ race: ids })
      else if (ids.length > 1) all.push({ text: ids.map((id) => ctx.index.byTypeName.get(`race|${id}`)?.[0]?.name ?? id).join(' 或 ') })
      else if (typeof obj.other === 'string') all.push({ text: obj.other })
    }
    if (typeof obj.other === 'string') all.push({ text: obj.other })
    if (Array.isArray(obj.spell)) {
      const ids = obj.spell.map((s) => ctx.resolveEntryId('spell', String(s).replace(/#\w+$/, '').split('|')[0])).filter((id): id is string => !!id)
      if (ids.length) all.push({ spell: ids })
    }
    if (typeof obj.pact === 'string') {
      const pact = obj.pact.includes('刃') ? 'blade' : obj.pact.includes('链') ? 'chain' : obj.pact.includes('书') ? 'tome' : obj.pact.includes('符') ? 'talisman' : undefined
      if (pact) all.push({ pact })
      else all.push({ text: `契约：${obj.pact}` })
    }
    if (Array.isArray(obj.optionalfeature)) all.push({ text: `需要可选特性：${obj.optionalfeature.map(String).join('、')}` })
  }
  if (any.length) return { ...(all.length ? { all } : {}), any }
  return all.length ? { all } : undefined
}

function abilityIncreaseOf(raw: Record<string, unknown>): Array<Record<string, unknown>> | undefined {
  const out: Array<Record<string, unknown>> = []
  for (const item of Array.isArray(raw.ability) ? raw.ability : []) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    for (const key of ABILITY_KEYS) if (typeof rec[key] === 'number') out.push({ ability: key, amount: Number(rec[key]) })
    if (rec.choose && typeof rec.choose === 'object') {
      const c = rec.choose as Record<string, unknown>
      out.push({ choose: Number(c.count ?? 1), ...(Array.isArray(c.from) ? { from: c.from.map(String) } : {}) })
    }
  }
  return out.length ? out : undefined
}

export function convertFeat(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const requires = prereqToRequires(raw.prerequisite, ctx)
  const foundryRaw = foundryFeature({ feats: ctx.foundryFeats }, raw, 'feat', entry.source)
  const rules = foundryRaw ? foundryRulesFor(foundryRaw) : undefined
  for (const [key, value] of rules?.unmapped ?? []) {
    const current = ctx.unmappedFoundry?.get(key) ?? { count: 0, example: entry.id }
    ctx.unmappedFoundry?.set(key, { count: current.count + value.count, example: current.example })
  }
  const abilityIncrease = abilityIncreaseOf(raw)
  const grants = spellGrants(raw, ctx)
  const uses = rules?.uses ?? usesFromText(plainText(convertBlocks(raw.entries, inline)))
  const effects = dedupeEffects([...(rules?.effects ?? []) as unknown as Array<Record<string, unknown>>, ...(FEAT_EFFECTS[entry.id] ?? [])])
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    ...(abilityIncrease ? { abilityIncrease } : {}),
    ...(requires ? { requires } : {}),
    ...(uses ? { uses } : {}),
    ...(effects.length || grants.length ? { effects: [...effects, ...grants.map((g) => ({ kind: 'spellGrant', spells: [g.spell], mode: g.mode, ...(g.ability ? { ability: g.ability } : {}), ...(g.uses ? { uses: g.uses } : {}) }))] } : {}),
    ...(Array.isArray(raw.traitTags) ? { tags: raw.traitTags.map(String) } : {}),
    advancement: proficiencyTrait(raw) ? [proficiencyTrait(raw)!] : [],
  }
  if (foundryRaw) (data.credit as { structured?: { by: string; license: string } }).structured = { by: '5etools-foundry', license: 'MIT' }
  return { id: entry.id, type: 'feat', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('feat', entry.name, data, plainText(data.text as never)), data }
}

export function convertCondition(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(entry.raw.entries, inline),
    effects: CONDITION_EFFECTS[entry.id] ?? [],
    ...(entry.id === 'condition.exhaustion.phb' ? { levels: EXHAUSTION_LEVELS } : {}),
    kind: entry.type,
  }
  return { id: entry.id, type: entry.type, name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf(entry.type, entry.name, data, plainText(data.text as never)), data }
}

export function convertRule(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const category = entry.context.ruleCategory === 'action' ? 'action' : 'variant'
  const action = category === 'action' ? ACTION_RULES[entry.id] : undefined
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    category,
    ...(action ? { activation: action.activation, activities: action.activities, effects: action.effects } : {}),
    ...(category === 'action' && !action ? { activities: activitiesFromText(raw.entries, entry.name, entry.id) } : {}),
  }
  return { id: entry.id, type: 'rule', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('rule', entry.name, data, plainText(data.text as never)), data }
}
