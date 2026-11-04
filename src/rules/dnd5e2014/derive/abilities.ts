import { ABILITY_KEYS, SKILLS, type AbilityKey, type SkillKey } from '../data/enums'
import { withOverride, type DeriveContext, type DerivePerson, type AbilityResult, type DerivedNumber, type SaveResult, type SkillResult, type SkillLevel, type Part } from './types'
import { crKey } from './tables'

const LEVEL_RANK: Record<SkillLevel, number> = { none: 0, half: 1, proficient: 2, expertise: 3 }
const PASSIVE_KEYS = ['perception', 'investigation', 'insight'] as const

export function abilityModifier(score: number | null): number | null {
  return score === null ? null : Math.floor((score - 10) / 2)
}

export function totalLevel(ctx: DeriveContext): number {
  return Math.min(20, ctx.classes.reduce((sum, row) => sum + (Number.isFinite(row.level) ? row.level : 0), 0))
}

export function crValue(person: DerivePerson): number | null {
  const cr = person.block.cr
  if (typeof cr === 'number') return cr
  return cr && typeof cr === 'object' ? cr.value : null
}

export function proficiencyFor(person: DerivePerson, ctx: DeriveContext): DerivedNumber {
  const level = totalLevel(ctx)
  const cr = crValue(person)
  let value: number | null
  const sources: string[] = []
  let parts: Part[] = []
  if (level > 0) {
    // 熟练加值读库里的「角色升级」表；没有这张表就读不到（显示为空），不用公式替代
    value = ctx.tables?.profByLevel[Math.min(20, level) - 1] ?? null
    if (value !== null) { sources.push(`${level} 级：${value}`); parts.push({ label: `${level} 级`, amount: value, kind: 'base' }) }
  } else if (cr !== null) {
    value = ctx.tables?.profByCr[crKey(cr)] ?? null
    if (value !== null) { sources.push(`挑战 ${cr}：${value}`); parts.push({ label: `挑战 ${cr}`, amount: value, kind: 'base' }) }
  } else {
    value = null
  }
  const adjust = person.block.adjust?.proficiency
  if (adjust) { value = (value ?? 0) + adjust; sources.push(`其他 ${adjust > 0 ? '+' : ''}${adjust}`); parts.push({ label: '其他', amount: adjust, kind: 'add' }) }
  const override = person.block.overrides?.proficiency
  if (override !== undefined) { value = override; sources.push(`覆盖 ${override}`); parts = withOverride(parts, override) }
  return { value, sources, parts }
}

function racialBonus(ctx: DeriveContext, key: AbilityKey): number {
  const base = ctx.race?.abilityBonus
  const sub = ctx.subrace?.abilityBonus
  if (sub?.replace) return sub.fixed?.[key] ?? 0
  return (base?.fixed?.[key] ?? 0) + (sub?.fixed?.[key] ?? 0)
}

function equipmentBonus(ctx: DeriveContext, key: AbilityKey): number {
  let total = 0
  for (const effect of ctx.equipmentEffects) {
    if (effect.kind === 'abilityBonus' && effect.ability === key && typeof effect.amount === 'number') total += effect.amount
  }
  return total
}

function abilitySet(ctx: DeriveContext, key: AbilityKey): number | null {
  let value: number | null = null
  for (const effect of ctx.equipmentEffects) {
    if (effect.kind === 'abilitySet' && effect.ability === key) value = Math.max(value ?? 0, effect.value)
  }
  return value
}

function abilityCap(ctx: DeriveContext): number {
  let cap = 20
  for (const effect of ctx.equipmentEffects) {
    if (effect.kind === 'abilityBonus' && effect.max !== undefined) cap = Math.max(cap, effect.max)
  }
  return cap
}

export function deriveAbilities(person: DerivePerson, ctx: DeriveContext): Record<AbilityKey, AbilityResult> {
  const block = person.block
  const cap = abilityCap(ctx)
  const out = {} as Record<AbilityKey, AbilityResult>
  for (const key of ABILITY_KEYS) {
    const base = block.abilities?.[key] ?? null
    const racial = racialBonus(ctx, key)
    const growth = block.abilityGrowth?.[key] ?? 0
    const equipment = equipmentBonus(ctx, key)
    const other = block.abilityOther?.[key] ?? 0
    const override = block.overrides?.abilities?.[key] ?? null
    const set = abilitySet(ctx, key)
    const sources: string[] = []
    const parts: Part[] = []
    if (base !== null) { sources.push(`基础 ${base}`); parts.push({ label: '基础', amount: base, kind: 'base' }) }
    if (racial) { sources.push(`种族 ${racial > 0 ? '+' : ''}${racial}`); parts.push({ label: '种族', amount: racial, kind: 'add' }) }
    if (growth) { sources.push(`成长 ${growth > 0 ? '+' : ''}${growth}`); parts.push({ label: '成长', amount: growth, kind: 'add' }) }
    if (equipment) { sources.push(`装备 ${equipment > 0 ? '+' : ''}${equipment}`); parts.push({ label: '装备', amount: equipment, kind: 'add' }) }
    if (other) { sources.push(`其他 ${other > 0 ? '+' : ''}${other}`); parts.push({ label: '其他', amount: other, kind: 'add' }) }
    if (set !== null) sources.push(`设为 ${set}`)
    if (override !== null) sources.push(`覆盖 ${override}`)
    const computed = base === null ? null : base + racial + growth + equipment + other
    let final: number | null = null
    if (override !== null) final = override
    else if (computed !== null) {
      final = Math.min(cap, Math.max(computed, set ?? computed))
      if (computed > cap || (set ?? 0) > cap) sources.push(`上限 ${cap}`)
      if (set !== null && set > computed && set <= cap) parts.push({ label: `设为 ${set}`, amount: set - computed, kind: 'add' })
      if (final !== computed && !(set !== null && set > computed && set <= cap)) parts.push({ label: `上限 ${cap}`, amount: final - computed, kind: 'cap' })
    }
    out[key] = {
      key,
      base,
      racial,
      growth,
      equipment,
      other,
      override,
      value: final,
      parts: withOverride(parts, override),
      modifier: abilityModifier(final),
      cap,
      capped: computed !== null && (computed > cap || (set ?? 0) > cap),
      sources,
    }
  }
  return out
}

export function deriveSaves(person: DerivePerson, _ctx: DeriveContext, abilities: Record<AbilityKey, AbilityResult>, prof: DerivedNumber): Record<AbilityKey, SaveResult> {
  const out = {} as Record<AbilityKey, SaveResult>
  const selected = new Set((person.block.proficiencies?.saves ?? []).map((row) => row.ability))
  for (const key of ABILITY_KEYS) {
    const override = person.block.saves?.[key] ?? person.block.overrides?.saves?.[key]
    const proficient = selected.has(key)
    const ability = abilities[key]
    const sources = [`${ability.key === key ? '' : ''}调整值 ${ability.modifier ?? '—'}`]
    let value: number | null = ability.modifier
    let parts: Part[] = value === null ? [] : [{ label: '属性调整值', amount: value, kind: 'base' }]
    if (proficient) {
      if (prof.value === null) value = null
      else { value = (value ?? 0) + prof.value; parts.push({ label: '熟练加值', amount: prof.value, kind: 'add' }) }
      sources.push(`熟练 ${prof.value ?? '—'}`)
    }
    if (override !== undefined) { value = override; sources.push(`覆盖 ${override}`); parts = withOverride(parts, override) }
    out[key] = { key, value, parts, proficient, override: override !== undefined, sources: sources.filter((s) => !s.startsWith('调整值 —') || value !== null) }
  }
  return out
}

export function deriveSkills(person: DerivePerson, _ctx: DeriveContext, abilities: Record<AbilityKey, AbilityResult>, prof: DerivedNumber): Record<SkillKey, SkillResult> {
  const out = {} as Record<SkillKey, SkillResult>
  const chosen = new Map<SkillKey, SkillLevel>()
  for (const row of person.block.proficiencies?.skills ?? []) {
    const before = chosen.get(row.skill) ?? 'none'
    if (LEVEL_RANK[row.level] > LEVEL_RANK[before]) chosen.set(row.skill, row.level)
  }
  for (const [key, meta] of Object.entries(SKILLS) as Array<[SkillKey, (typeof SKILLS)[SkillKey]]>) {
    const level = chosen.get(key) ?? 'none'
    const ability = abilities[meta.ability]
    const override = person.block.skills?.[key] ?? person.block.overrides?.skills?.[key]
    let value = ability.modifier
    let parts: Part[] = value === null ? [] : [{ label: `${meta.ability.toUpperCase()} 调整值`, amount: value, kind: 'base' }]
    const sources: string[] = [`${meta.label}：${meta.ability.toUpperCase()} 调整值 ${ability.modifier ?? '—'}`]
    if (level !== 'none') {
      if (prof.value === null) value = null
      else {
        const bonus = level === 'expertise' ? prof.value * 2 : level === 'half' ? Math.floor(prof.value / 2) : prof.value
        value = (value ?? 0) + bonus
        sources.push(`${level === 'half' ? '半熟练' : level === 'expertise' ? '专精' : '熟练'} +${bonus}`)
        parts.push({ label: level === 'half' ? '半熟练' : level === 'expertise' ? '专精' : '熟练', amount: bonus, kind: 'add' })
      }
    }
    if (override !== undefined) { value = override; sources.push(`覆盖 ${override}`); parts = withOverride(parts, override) }
    if (value === null) { sources.length = 0; parts = [] }
    out[key] = { key, ability: meta.ability, level, value, parts, override: override !== undefined, sources }
  }
  return out
}

export function deriveInitiative(person: DerivePerson, ctx: DeriveContext, abilities: Record<AbilityKey, AbilityResult>): DerivedNumber {
  const dex = abilities.dex
  let value = dex.modifier
  const sources: string[] = value === null ? [] : [`敏捷 ${value >= 0 ? '+' : ''}${value}`]
  let parts: Part[] = value === null ? [] : [{ label: '敏捷调整值', amount: value, kind: 'base' }]
  for (const effect of ctx.equipmentEffects) {
    if (effect.kind === 'initiative' && typeof effect.bonus === 'number') {
      value = (value ?? 0) + effect.bonus
      sources.push(`效果 ${effect.bonus >= 0 ? '+' : ''}${effect.bonus}`)
      parts.push({ label: '效果', amount: effect.bonus, kind: 'add' })
    }
  }
  const adjust = person.block.adjust?.initiative
  if (adjust) { value = (value ?? 0) + adjust; sources.push(`其他 ${adjust > 0 ? '+' : ''}${adjust}`); parts.push({ label: '其他', amount: adjust, kind: 'add' }) }
  const override = person.block.overrides?.initiative
  if (override !== undefined) { value = override; sources.push(`覆盖 ${override}`); parts = withOverride(parts, override) }
  return { value, sources, parts }
}

export function derivePassives(person: DerivePerson, ctx: DeriveContext, skills: Record<SkillKey, SkillResult>): Record<(typeof PASSIVE_KEYS)[number], DerivedNumber> {
  const out = {} as Record<(typeof PASSIVE_KEYS)[number], DerivedNumber>
  for (const key of PASSIVE_KEYS) {
    let value = skills[key].value === null ? null : 10 + (skills[key].value ?? 0)
    const sources: string[] = value === null ? [] : [`10 + ${skills[key].key}`]
    let parts: Part[] = value === null ? [] : [{ label: '10', amount: 10, kind: 'base' }, { label: '技能加值', amount: skills[key].value ?? 0, kind: 'add' }]
    for (const effect of ctx.equipmentEffects) {
      if (effect.kind === 'passive' && effect.skill === key) {
        value = (value ?? 0) + effect.bonus
        sources.push(`效果 ${effect.bonus >= 0 ? '+' : ''}${effect.bonus}`)
        parts.push({ label: '效果', amount: effect.bonus, kind: 'add' })
      }
    }
    const adjust = person.block.adjust?.passive?.[key]
    if (adjust) { value = (value ?? 0) + adjust; sources.push(`其他 ${adjust > 0 ? '+' : ''}${adjust}`); parts.push({ label: '其他', amount: adjust, kind: 'add' }) }
    const override = person.block.overrides?.passive?.[key]
    if (override !== undefined) { value = override; sources.push(`覆盖 ${override}`); parts = withOverride(parts, override) }
    out[key] = { value, sources, parts }
  }
  return out
}
