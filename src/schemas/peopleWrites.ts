/** U5 §7.1：当场状态与设定类的写入集合，供 store 与「改 A 不动 B」测试共用。 */
export const LIVE_WRITE_KEYS = ['hp', 'inspiration', 'exhaustion', 'hitDiceUsed', 'slotsUsed', 'resourcesUsed', 'effects'] as const
export const DRAFT_WRITE_KEYS = ['name', 'nameEn', 'avatar', 'avatarSource', 'block', 'hpAdj', 'hitDiceOverride', 'hpRolls'] as const
export const LIVE_WRITE_PATHS = [
  'hp.current', 'hp.temp', 'hp.deathSaves', 'inspiration', 'exhaustion', 'hitDiceUsed', 'slotsUsed', 'resourcesUsed', 'effects',
] as const
export const DRAFT_WRITE_PATHS = [
  'name', 'nameEn', 'avatar', 'avatarSource', 'block.alignment', 'block.race', 'block.subrace', 'block.background',
  'block.abilities', 'block.abilityOther', 'block.overrides', 'block.adjust', 'block.proficiencies', 'block.speed',
  'block.senses', 'block.resist', 'block.immune', 'block.vulnerable', 'block.conditionImmune', 'block', 'hpAdj', 'hitDiceOverride', 'hpRolls',
] as const

export type LiveWriteKey = (typeof LIVE_WRITE_KEYS)[number]
export type DraftWriteKey = (typeof DRAFT_WRITE_KEYS)[number]
