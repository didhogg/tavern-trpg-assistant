/** 5etools 来源类型 → 目标条目类型。 */
export const OUTPUT_TYPE_BY_SOURCE: Record<string, string> = {
  action: 'rule', 'art-object': 'table', background: 'background', 'background-fluff': 'background',
  'base-item': 'item', boon: 'reward', book: 'book', card: 'table', charoption: 'charoption',
  'charoption-fluff': 'charoption', 'class': 'class', 'class-feature': 'feature', 'class-fluff': 'class',
  condition: 'condition', 'condition-fluff': 'condition', cr: 'table', cult: 'cult', deck: 'table', deity: 'deity',
  disease: 'disease', dragon: 'table', 'dragon-mundane-item': 'table', encounter: 'table', feat: 'feat',
  'feat-fluff': 'feat', gems: 'table', hazard: 'hazard', 'hazard-fluff': 'hazard', hoard: 'table', individual: 'table',
  item: 'item', 'item-entry': 'item', 'item-fluff': 'item', 'item-group': 'item', 'item-mastery': 'rule',
  'item-property': 'rule', 'item-type': 'rule', 'item-type-additional-entries': 'rule', language: 'language',
  'language-fluff': 'language', 'language-script': 'rule', 'legendary-group': 'monster',
  'legendary-group-template': 'monster', 'life-background': 'table', 'life-class': 'table', 'life-trinket': 'table',
  'magic-item': 'table', 'magic-variant': 'item', 'makebrew-creature-action': 'monsterPart',
  'makebrew-creature-trait': 'monsterPart', monster: 'monster', 'monster-fluff': 'monster',
  'monster-template': 'monster', 'monster-feature': 'monsterPart', name: 'table', object: 'object',
  'object-fluff': 'object', 'optional-feature': 'feature', 'optional-feature-fluff': 'feature', race: 'race',
  'race-feature': 'feature', 'race-fluff': 'race', recipe: 'recipe', 'recipe-fluff': 'recipe',
  'reduced-item-property': 'rule', 'reduced-item-type': 'rule', reward: 'reward', 'reward-fluff': 'reward',
  sense: 'rule', skill: 'rule', spell: 'spell', 'spell-fluff': 'spell', status: 'status', subrace: 'subrace',
  subclass: 'subclass', 'subclass-feature': 'feature', 'subclass-fluff': 'subclass', table: 'table',
  'table-group': 'table', trap: 'hazard', 'trap-fluff': 'hazard', vehicle: 'vehicle', 'vehicle-fluff': 'vehicle',
  'vehicle-upgrade': 'vehicle', 'variant-rule': 'rule'
}

export function outputTypeOf(sourceType: string): string {
  const type = OUTPUT_TYPE_BY_SOURCE[sourceType]
  if (!type) throw new Error(`未映射的来源类型目标：${sourceType}`)
  return type
}
