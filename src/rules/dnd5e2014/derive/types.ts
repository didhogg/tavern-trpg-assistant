import type { Person } from '../../../schemas/people'
import type { AbilityKey, SkillKey } from '../data/enums'
import type { Effect } from '../data/effects'
import type { BackgroundData, ClassData, RaceData } from '../data/entries/character'

/** 解析器读库后交给派生函数的上下文；读不到的条目为 undefined（U5 §6）。 */
export interface DeriveContext {
  race?: RaceData
  subrace?: RaceData
  background?: BackgroundData
  classes: Array<{ id?: string; entry?: ClassData; level: number }>
  /** UNIT5 起由背包提供；UNIT2 恒为空数组。 */
  equipmentEffects: Effect[]
}

/** 来源明细（U5R §13）：除 override 行外，amount 之和 = value；有覆盖时其余行标 overridden。 */
export interface Part {
  label: string
  amount: number
  kind: 'base' | 'add' | 'cap' | 'override'
  /** 被覆盖盖住、不计入 value。 */
  overridden?: boolean
}

export interface DerivedNumber {
  value: number | null
  sources: string[]
  parts: Part[]
}

/** 有覆盖时：其余行标 overridden，再追加 override 行。 */
export function withOverride(parts: Part[], override: number | null | undefined): Part[] {
  if (override === null || override === undefined) return parts
  return [...parts.map((row) => ({ ...row, overridden: true })), { label: '覆盖', amount: override, kind: 'override' as const }]
}
export function sumParts(parts: Part[]): number {
  const over = parts.find((row) => row.kind === 'override')
  return over ? over.amount : parts.reduce((n, row) => n + (row.overridden ? 0 : row.amount), 0)
}

export interface AbilityResult extends DerivedNumber {
  key: AbilityKey
  base: number | null
  racial: number
  growth: number
  equipment: number
  other: number
  override: number | null
  modifier: number | null
  cap: number
  capped: boolean
}

export type SkillLevel = 'none' | 'half' | 'proficient' | 'expertise'

export interface SaveResult extends DerivedNumber {
  key: AbilityKey
  proficient: boolean
  override: boolean
}

export interface SkillResult extends DerivedNumber {
  key: SkillKey
  ability: AbilityKey
  level: SkillLevel
  override: boolean
}

export interface AcResult extends DerivedNumber {
  from: string
  override: boolean
}

export interface HpResult extends DerivedNumber {
  /** 生命骰：按骰面分组。 */
  dice: Array<{ sides: number; total: number; used: number }>
}

export interface SpeedResult {
  walk: number | null
  /** 各移动方式的来源明细。 */
  parts: Partial<Record<'walk' | 'fly' | 'swim' | 'climb' | 'burrow', Part[]>>
  /** 其他移动方式；没有这个方式就不出现。 */
  others: Partial<Record<'fly' | 'swim' | 'climb' | 'burrow', number>>
  sources: string[]
}

export interface SpellSlotRow {
  key: string
  level: number
  max: number
  used: number
  pact?: boolean
}

export interface SpellSlotsResult {
  rows: SpellSlotRow[]
  sources: string[]
}

export interface PersonDerived {
  level: number | null
  proficiency: DerivedNumber
  abilities: Record<AbilityKey, AbilityResult>
  saves: Record<AbilityKey, SaveResult>
  skills: Record<SkillKey, SkillResult>
  initiative: DerivedNumber
  passives: Record<'perception' | 'investigation' | 'insight', DerivedNumber>
  ac: AcResult
  hp: HpResult
  speed: SpeedResult
  spellSlots: SpellSlotsResult | null
}

export type DerivePerson = Pick<Person, 'block' | 'hp' | 'hitDiceUsed' | 'slotsUsed'> & Partial<Pick<Person, 'hpAdj' | 'hitDiceOverride' | 'hpRolls'>>
