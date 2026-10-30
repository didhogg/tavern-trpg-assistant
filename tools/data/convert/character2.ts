import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, DAMAGE_FROM_CN, keywordsOf, pageOf, str } from './common'
import { CONDITIONS, DAMAGE_TYPES, SKILL_KEYS } from '../../../src/rules/dnd5e2014/data/enums'
import { convertBlocks } from './blocks'
import { plainText, summaryOf } from '../summary/summary'
import type { InlineContext } from '../markup/inline'
import { prereqToRequires } from './featRule'

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']

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

export function proficiencyTrait(raw: Record<string, unknown>, level = 1): Record<string, unknown> | undefined {
  const grants: string[] = []
  const choices: Array<{ count: number; pool: string[] }> = []
  const add = (key: string, prefix: string): void => {
    const value = raw[key]
    for (const item of Array.isArray(value) ? value : []) {
      if (!item || typeof item !== 'object') continue
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        if (k === 'any' && typeof v === 'number') choices.push({ count: v, pool: [`${prefix}:*`] })
        else if (k === 'choose' && v && typeof v === 'object') {
          const c = v as Record<string, unknown>
          choices.push({ count: Number(c.count ?? 1), pool: Array.isArray(c.from) ? c.from.map((x) => `${prefix}:${String(x)}`) : [`${prefix}:*`] })
        } else if (v === true) grants.push(`${prefix}:${k.split('|')[0]}`)
        else if (typeof v === 'number' && v > 0) choices.push({ count: v, pool: [`${prefix}:${k}`] })
      }
    }
  }
  for (const item of Array.isArray(raw.skillToolLanguageProficiencies) ? raw.skillToolLanguageProficiencies : []) {
    if (!item || typeof item !== 'object') continue
    for (const c of Array.isArray((item as Record<string, unknown>).choose) ? (item as Record<string, unknown>).choose as Array<Record<string, unknown>> : []) {
      const from = Array.isArray(c.from) ? c.from.map(String) : []
      const pool = from.flatMap((x) => x.includes('技能') ? ['skill:*'] : x.includes('工具') ? ['tool:*'] : [])
      if (pool.length) choices.push({ count: Number(c.count ?? 1), pool })
    }
  }
  add('skillProficiencies', 'skill')
  add('toolProficiencies', 'tool')
  add('languageProficiencies', 'lang')
  add('weaponProficiencies', 'weapon')
  add('armorProficiencies', 'armor')
  return grants.length || choices.length ? { kind: 'trait', level, grants, choices } : undefined
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
    ...(raw.age ? { age: raw.age } : {}),
    ...(raw.heightAndWeight ? { heightWeight: raw.heightAndWeight } : {}),
    ...(raw.creatureTypes ? { creatureTypes: raw.creatureTypes } : {}),
    ...(raw.creatureTypeTags ? { creatureTypeTags: raw.creatureTypeTags } : {}),
    ...(raw.lineage ? { lineage: raw.lineage } : {}),
    ...(raw.overwrite ? { overwrite: raw.overwrite } : {}),
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
    ...(grants.length ? { effects: [...effects, ...grants.map((g) => ({ kind: 'spellGrant', spells: [g.spell], mode: g.mode, ...(g.ability ? { ability: g.ability } : {}), ...(g.uses ? { uses: g.uses } : {}) }))] } : effects.length ? { effects } : {}),
    traits,
    advancement: [
      ...(proficiencyTrait(raw) ? [proficiencyTrait(raw)!] : []),
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
    ...(prereqToRequires(raw.prerequisite, ctx) ? { requires: prereqToRequires(raw.prerequisite, ctx) } : {}),
    ...(feature ? { feature: feature.id } : {}),
    characteristics: tables.map((t) => ({ table: t.id, label: t.name })),
    ...(proficiencyTrait(raw) ? { advancement: [proficiencyTrait(raw)!] } : {}),
  }
  return { id: entry.id, type: 'background', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('background', entry.name, data, plainText(data.text as never)), data }
}
