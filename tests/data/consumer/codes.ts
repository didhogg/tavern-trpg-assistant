import { ABILITY_KEYS, DAMAGE_TYPES, SKILL_KEYS, CONDITIONS } from '../../../src/rules/dnd5e2014/data/enums'

/** 合法代码表（取自项目自己的定义，只用来判断“这个代码合不合法”，不当期望值）。 */
export const ABILITIES: readonly string[] = ABILITY_KEYS
export const SKILLS_ALL: readonly string[] = SKILL_KEYS
export const DAMAGE: readonly string[] = DAMAGE_TYPES
export const CONDITION_CODES: readonly string[] = CONDITIONS

/** 书上的 18 个技能，与代码一一对应（PHB 第 7 章），用来独立核对代码表。 */
export const PHB_SKILLS = ['acrobatics', 'animal handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight of hand', 'stealth', 'survival']
export const PHB_DAMAGE = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']
