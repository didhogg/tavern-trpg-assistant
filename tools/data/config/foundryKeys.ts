import type { Recharge } from '../../../src/rules/dnd5e2014/data/enums'

/** Foundry scale 标识 → 本项目稳定 id。 */
export const SCALE_ALIASES: Record<string, string> = {
  'barbarian.rages': 'rage-uses',
  'barbarian.rage-damage': 'rage-damage',
  'monk.ki': 'ki-points',
  'monk.martial-arts': 'martial-arts',
  'monk.unarmored-movement': 'unarmored-movement',
  'rogue.sneak-attack': 'sneak-attack',
  'sorcerer.sorcery-points': 'sorcery-points',
  'bard.inspiration': 'bardic-inspiration',
  'fighter.action-surge': 'action-surge',
  'fighter.indomitable': 'indomitable',
  'fighter.second-wind': 'second-wind',
  'artificer.infused': 'infusions-active',
  'artificer.infusions': 'infusions-known',
  superiority: 'superiority-dice',
}

export const RECOVERY_PERIOD: Record<string, Recharge> = {
  sr: 'short',
  lr: 'long',
  day: 'long',
  dawn: 'dawn',
  dusk: 'dusk',
  turn: 'turn',
  round: 'round',
}

/** Foundry 属性/技能/豁免/加值的稳定键。 */
export const CHANGE_KEYS = {
  resistance: 'system.traits.dr.value',
  immunity: 'system.traits.di.value',
  vulnerability: 'system.traits.dv.value',
  conditionImmunity: 'system.traits.ci.value',
  acBonus: 'system.attributes.ac.bonus',
  acFormula: 'system.attributes.ac.formula',
  hpPerLevel: 'system.attributes.hp.bonuses.level',
  hpOverall: 'system.attributes.hp.bonuses.overall',
  initiativeBonus: 'system.attributes.init.bonus',
  initiativeAlert: 'flags.dnd5e.initiativeAlert',
  initiativeAdvantage: 'flags.dnd5e.initiativeAdv',
  weaponProficiency: 'system.traits.weaponProf.value',
  armorProficiency: 'system.traits.armorProf.value',
  toolProficiency: 'system.traits.toolProf.value',
  languageProficiency: 'system.traits.languages.value',
} as const

export const SENSE_KEYS: Record<string, string> = {
  darkvision: 'system.attributes.senses.ranges.darkvision',
  blindsight: 'system.attributes.senses.ranges.blindsight',
  tremorsense: 'system.attributes.senses.ranges.tremorsense',
  truesight: 'system.attributes.senses.ranges.truesight',
}

export const MOVE_KEYS: Record<string, string> = {
  walk: 'system.attributes.movement.walk',
  fly: 'system.attributes.movement.fly',
  swim: 'system.attributes.movement.swim',
  climb: 'system.attributes.movement.climb',
  burrow: 'system.attributes.movement.burrow',
}

export const DAMAGE_BONUS_KEYS: Record<string, { scope: 'melee' | 'ranged' | 'spell' | 'weapon' | 'all' }> = {
  'system.bonuses.mwak.damage': { scope: 'melee' },
  'system.bonuses.rwak.damage': { scope: 'ranged' },
  'system.bonuses.msak.damage': { scope: 'spell' },
  'system.bonuses.rsak.damage': { scope: 'spell' },
  'system.bonuses.weapon.damage': { scope: 'weapon' },
  'system.bonuses.all.damage': { scope: 'all' },
}

export const ATTACK_BONUS_KEYS: Record<string, { scope: 'melee' | 'ranged' | 'spell' | 'weapon' | 'all' }> = {
  'system.bonuses.mwak.attack': { scope: 'melee' },
  'system.bonuses.rwak.attack': { scope: 'ranged' },
  'system.bonuses.msak.attack': { scope: 'spell' },
  'system.bonuses.rsak.attack': { scope: 'spell' },
  'system.bonuses.weapon.attack': { scope: 'weapon' },
}
