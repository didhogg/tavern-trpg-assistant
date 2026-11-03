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

export interface DerivedNumber {
  value: number | null
  sources: string[]
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

export type DerivePerson = Pick<Person, 'block' | 'hp' | 'hitDiceUsed' | 'slotsUsed'>
