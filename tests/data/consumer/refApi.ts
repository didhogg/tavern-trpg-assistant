import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** 本地核对材料：D&D 5e API 的 SRD 职业逐级表。文件不存在（没下载）时返回 undefined，对应测试跳过。 */
const DIR = join(process.cwd(), 'reference', 'dnd5eapi-SRD法术（核对用）')

export interface ApiLevel {
  level: number
  prof_bonus: number
  ability_score_bonuses: number
  features?: Array<{ index: string; name: string }>
  spellcasting?: Record<string, number>
  class_specific?: Record<string, unknown>
}
export interface ApiClasses { classes: Record<string, Record<string, unknown>>; levels: Record<string, ApiLevel[]> }
export interface ApiSpell { index: string; name: string; level: number; damage?: Array<{ damage_type?: { index: string }; damage_at_slot_level?: Record<string, string>; damage_at_character_level?: Record<string, string> }>; heal_at_slot_level?: Record<string, string>; material?: string; higher_level?: string[]; area_of_effect?: { type: string; size: number }; dc?: { dc_type: { index: string }; dc_success: string }; concentration: boolean; ritual: boolean; attack_type?: string; school: { index: string }; casting_time: string; range: string; duration: string; components: string[]; classes: Array<{ index: string }> }

export const hasApi = (): boolean => existsSync(join(DIR, 'classes.json')) && existsSync(join(DIR, 'spells.json'))
export const apiClasses = (): ApiClasses => JSON.parse(readFileSync(join(DIR, 'classes.json'), 'utf8')) as ApiClasses
export const apiSpells = (): Record<string, ApiSpell> => JSON.parse(readFileSync(join(DIR, 'spells.json'), 'utf8')) as Record<string, ApiSpell>

export interface ApiEquip {
  index: string; name: string
  equipment_category: { index: string }
  weapon_category?: string; weapon_range?: string; category_range?: string
  armor_category?: string; armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number }; str_minimum?: number; stealth_disadvantage?: boolean
  cost: { quantity: number; unit: string }; weight?: number; quantity?: number; throw_range?: { normal: number; long?: number }
  damage?: { damage_dice: string; damage_type: { index: string } }
  two_handed_damage?: { damage_dice: string }
  range?: { normal: number; long?: number }
  properties?: Array<{ index: string }>
  contents?: Array<{ item: { index: string; name: string }; quantity: number }>
}
export const apiEquipment = (): Record<string, ApiEquip> => JSON.parse(readFileSync(join(DIR, 'equipment.json'), 'utf8')) as Record<string, ApiEquip>

export interface ApiMonsterAction { name: string; desc: string; attack_bonus?: number; damage?: Array<{ damage_type?: { index: string }; damage_dice: string }>; dc?: { dc_type: { index: string }; dc_value: number; success_type: string }; usage?: { type: string; times?: number; dice?: string; min_value?: number }; actions?: Array<{ action_name: string; count: string | number; type: string }> }
export interface ApiMonster {
  index: string; name: string; size: string; type: string
  armor_class: Array<{ type: string; value: number }>
  hit_points: number; hit_points_roll: string
  speed: Record<string, string | boolean>
  strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number
  proficiencies: Array<{ value: number; proficiency: { index: string } }>
  damage_vulnerabilities: string[]; damage_resistances: string[]; damage_immunities: string[]
  condition_immunities: Array<{ index: string }>
  senses: Record<string, string | number>
  languages: string
  challenge_rating: number; proficiency_bonus: number; xp: number
  special_abilities?: ApiMonsterAction[]; actions?: ApiMonsterAction[]; legendary_actions?: ApiMonsterAction[]; reactions?: ApiMonsterAction[]
}
export const apiMonsters = (): Record<string, ApiMonster> => JSON.parse(readFileSync(join(DIR, 'monsters.json'), 'utf8')) as Record<string, ApiMonster>
export const hasApiMonsters = (): boolean => existsSync(join(DIR, 'monsters.json'))
