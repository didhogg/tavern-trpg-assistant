import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, DAMAGE_FROM_CN, keywordsOf, pageOf, str } from './common'
import { CONDITIONS, DAMAGE_TYPES, SKILL_KEYS } from '../../../src/rules/dnd5e2014/data/enums'
import { convertBlocks } from './blocks'
import { activitiesFromText } from './activities'
import { plainText, summaryOf } from '../summary/summary'
import type { InlineContext } from '../markup/inline'
import { dedupeEffects, foundryFeature, foundryRulesFor, usesFromText } from './foundry'
import { FEAT_EFFECTS } from '../config/featureRules'
import { ACTION_RULES, CONDITION_EFFECTS, EXHAUSTION_LEVELS } from '../config/conditionEffects'

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

/** 速度值 true 表示「与步行速度相同」（如鸟羽人的飞行）。 */
function speed(raw: Record<string, unknown>): Record<string, number> {
  const value = raw.speed
  if (typeof value === 'number') return { walk: value }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    const walk = entries.find(([key, v]) => key === 'walk' && typeof v === 'number')?.[1] as number | undefined
    const out: Record<string, number> = {}
    for (const [key, v] of entries) {
      if (typeof v === 'number') out[key] = v
      else if (v === true && walk !== undefined) out[key] = walk
    }
    return out
  }
  return { walk: 0 }
}

function fixedAndChoose(value: unknown, from: string[]): { fixed: string[]; choose?: { count: number; from?: string[] } } {
  const fixed: string[] = []
  let choose: { count: number; from?: string[] } | undefined
  for (const item of Array.isArray(value) ? value : []) {
    if (!item || typeof item !== 'object') continue
    for (const [key, v] of Object.entries(item as Record<string, unknown>)) {
      if (key === 'choose' && v && typeof v === 'object') {
        const c = v as Record<string, unknown>
        choose = { count: Number(c.count ?? 1), ...(Array.isArray(c.from) ? { from: c.from.map(String) } : {}) }
      } else if (key === 'any' && typeof v === 'number') {
        choose = { count: v, from }
      } else if (v === true) {
        fixed.push(key)
      } else if (typeof v === 'number' && v > 0) {
        choose = { count: v, from: [key] }
      }
    }
  }
  return { fixed, ...(choose ? { choose } : {}) }
}

function langSet(value: unknown): { fixed: string[]; choose?: number } {
  const fixed: string[] = []
  let choose = 0
  for (const item of Array.isArray(value) ? value : []) {
    if (!item || typeof item !== 'object') continue
    for (const [key, v] of Object.entries(item as Record<string, unknown>)) {
      if (key === 'anyStandard' && typeof v === 'number') choose += v
      else if (v === true && key !== 'choose') fixed.push(key)
      else if (typeof v === 'number' && v > 0) choose += v
    }
  }
  return { fixed, ...(choose ? { choose } : {}) }
}

function damageCodes(value: unknown): string[] {
  const list = Array.isArray(value) ? value : []
  return list.flatMap((item) => {
    if (typeof item !== 'string') return []
    const code = DAMAGE_FROM_CN[item] ?? (DAMAGE_TYPES.includes(item as never) ? item : undefined)
    return code ? [code] : []
  })
}

function conditionCodes(value: unknown): string[] {
  const list = Array.isArray(value) ? value : []
  return list.filter((item): item is string => typeof item === 'string' && (CONDITIONS as readonly string[]).includes(item))
}

function spellNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.replace(/#\w+$/, ''))
}

export function spellGrants(raw: Record<string, unknown>, ctx: ConvertContext): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  const ability = typeof raw.ability === 'string' ? raw.ability : undefined
  for (const item of Array.isArray(raw.additionalSpells) ? raw.additionalSpells : []) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const abilityValue = typeof rec.ability === 'string' && ['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(rec.ability) ? rec.ability : ability && ['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(ability) ? ability : undefined
    for (const [mode, groups] of [['known', rec.known], ['innate', rec.innate]] as const) {
      if (!groups || typeof groups !== 'object') continue
      for (const value of Object.values(groups as Record<string, unknown>)) {
        const names = Array.isArray(value) ? spellNames(value) : []
        if (!names.length) continue
        const ids = names.map((name) => ctx.resolveEntryId('spell', name)).filter((id): id is string => !!id)
        if (ids.length) out.push({ spell: ids[0], mode, ...(abilityValue ? { ability: abilityValue } : {}), ...(mode === 'innate' ? { uses: { max: 1, recharge: 'long' } } : {}) })
      }
    }
    const daily = rec.innate && typeof rec.innate === 'object' ? (rec.innate as Record<string, unknown>) : undefined
    if (daily) for (const value of Object.values(daily)) {
      if (!value || typeof value !== 'object' || !('daily' in value)) continue
      const list = (value as Record<string, unknown>).daily
      if (list && typeof list === 'object') for (const names of Object.values(list as Record<string, unknown>)) {
        for (const name of spellNames(names)) {
          const id = ctx.resolveEntryId('spell', name)
          if (id) out.push({ spell: id, mode: 'innate', ...(abilityValue ? { ability: abilityValue } : {}), uses: { max: 1, recharge: 'long' } })
        }
      }
    }
  }
  const seen = new Set<string>()
  return out.filter((item) => {
    const key = `${String(item.spell)}|${String(item.mode)}|${String(item.uses ? 'uses' : '')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}


export function startingEquipmentOf(raw: Record<string, unknown>): Array<Record<string, unknown>> {
  const source = raw.startingEquipment
  const groups = Array.isArray(source) ? source : source && typeof source === 'object' && Array.isArray((source as Record<string, unknown>).defaultData) ? (source as Record<string, unknown>).defaultData as unknown[] : []
  const out: Array<Record<string, unknown>> = []
  const item = (value: unknown): Record<string, unknown> | undefined => {
    if (typeof value === 'string') return { item: value.split('|')[0], qty: 1 }
    if (!value || typeof value !== 'object') return undefined
    const rec = value as Record<string, unknown>
    const name = typeof rec.item === 'string' ? rec.item.split('|')[0] : typeof rec.special === 'string' ? rec.special : undefined
    if (!name) return undefined
    return { item: name, qty: typeof rec.quantity === 'number' ? rec.quantity : 1 }
  }
  for (const group of groups) {
    if (!group || typeof group !== 'object') continue
    const rec = group as Record<string, unknown>
    const fixed = Array.isArray(rec._) ? rec._.map(item).filter((x): x is Record<string, unknown> => !!x) : []
    const choice: Array<Array<Record<string, unknown>>> = []
    for (const key of Object.keys(rec).filter((k) => /^[a-z]$/.test(k)).sort()) {
      const list = rec[key]
      if (!Array.isArray(list)) continue
      const options = list.map(item).filter((x): x is Record<string, unknown> => !!x)
      if (options.length) choice.push(options)
    }
    const row: Record<string, unknown> = {}
    if (fixed.length) row.fixed = fixed
    if (choice.length) row.choice = choice
    if (Object.keys(row).length) out.push(row)
  }
  const alternative = str((raw.startingEquipment as Record<string, unknown> | undefined)?.goldAlternative) || str(raw.goldAlternative)
  const goldMatch = /(\d+d\d+)\s*[×x*]\s*(\d+)/.exec(alternative)
  if (goldMatch) out.push({ gold: { dice: goldMatch[1], multiplier: Number(goldMatch[2]) } })
  return out
}

export function convertRace(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const traits = (ctx.featuresByOwner.get(entry.id) ?? []).map((f) => f.id)
  const sources = raw.additionalSpells
  const grants = spellGrants({ ...raw, additionalSpells: sources }, ctx)
  const effects: Array<Record<string, unknown>> = []
  const resist = damageCodes(raw.resist)
  const immune = damageCodes(raw.immune)
  const conditionImmune = conditionCodes(raw.conditionImmune)
  const resistChoice = Array.isArray(raw.resist) && raw.resist.some((x) => x && typeof x === 'object' && 'choose' in (x as Record<string, unknown>))
    ? (raw.resist as Array<Record<string, unknown>>).flatMap((x) => {
        const choose = x.choose as { from?: unknown[] } | undefined
        return Array.isArray(choose?.from) ? choose.from.map(String) : []
      })
    : []
  if (resistChoice.length) effects.push({ kind: 'note', text: `选择一种伤害抗性：${resistChoice.join('、')}` })
  const clean = (value: { fixed: string[]; choose?: { count: number; from?: string[] } }): { fixed: string[]; choose?: { count: number; from?: string[] } } => ({
    fixed: value.fixed.map((v) => ctx.resolveEntryId('item', v.split('|')[0]) ?? v.split('|')[0]),
    ...(value.choose ? { choose: { ...value.choose, ...(value.choose.from ? { from: value.choose.from.map((v) => ctx.resolveEntryId('item', v.split('|')[0]) ?? v.split('|')[0]) } : {}) } } : {}),
  })
  const prof = {
    skills: fixedAndChoose(raw.skillProficiencies, SKILL_KEYS),
    tools: clean(fixedAndChoose(raw.toolProficiencies, [])),
    weapons: clean(fixedAndChoose(raw.weaponProficiencies, [])),
    armor: fixedAndChoose(raw.armorProficiencies, []),
  }
  let speedData: Record<string, number> | undefined
  if (raw.speed !== undefined) speedData = speed(raw)
  else if (entry.context.parentSpeed) {
    try { const parent = JSON.parse(entry.context.parentSpeed) as unknown; if (typeof parent === 'number') speedData = { walk: parent }; else if (parent && typeof parent === 'object') speedData = speed({ speed: parent }) } catch { speedData = undefined }
  }
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    ...(entry.type === 'subrace' ? { parentRace: entry.context.parentRace } : {}),
    size: Array.isArray(raw.size) ? raw.size.map(String) : [String(raw.size ?? 'M')],
    ...(speedData ? { speed: speedData } : {}),
    ...(abilityBonus(raw) ? { abilityBonus: abilityBonus(raw) } : {}),
    ...(!raw.ability && entry.source === 'MPMM'
      ? { flexibleAbility: { modes: [{ count: 1, amount: 2 }, { count: 2, amount: 1 }], alternative: { count: 3, amount: 1 } } }
      : {}),
    ...(typeof raw.darkvision === 'number' ? { darkvision: raw.darkvision, senses: [{ type: 'darkvision', range: raw.darkvision }] } : {}),
    languages: langSet(raw.languageProficiencies),
    proficiencies: prof,
    ...(resist.length ? { resist } : {}),
    ...(immune.length ? { immune } : {}),
    ...(conditionImmune.length ? { conditionImmune } : {}),
    ...(grants.length ? { spellGrants: grants } : {}),
    ...(effects.length ? { effects } : {}),
    traits,
    advancement: [
      ...traits.map((id) => ({ kind: 'itemGrant', level: 1, items: [id], optional: false })),
      ...(Array.isArray(raw.feats) && raw.feats.some((f) => f && typeof f === 'object' && 'any' in (f as Record<string, unknown>))
        ? [{ kind: 'itemChoice', level: 1, count: 1, featureType: '专长' }]
        : []),
    ],
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
    proficiencies: {
      skills: fixedAndChoose(raw.skillProficiencies, SKILL_KEYS),
      tools: fixedAndChoose(raw.toolProficiencies, []),
      languages: (() => { const l = langSet(raw.languageProficiencies); return { fixed: l.fixed, ...(l.choose ? { choose: { count: l.choose } } : {}) } })(),
    },
    equipment: startingEquipmentOf(raw),
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
    if (Array.isArray(obj.spell)) all.push({ text: `需要法术：${obj.spell.map((name) => String(name).replace(/#\w+$/, '')).join('、')}` })
  }
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
    ...(grants.length ? { spellGrants: grants } : {}),
    ...(uses ? { uses } : {}),
    ...(effects.length ? { effects } : {}),
    advancement: [],
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

export { activitiesFromText }
