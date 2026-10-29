/** 5etools 顶层数组键 → 稳定来源类型名。禁止按字符串去 s。 */
export const TYPE_BY_KEY: Record<string, string> = {
  action: 'action', artObjects: 'art-object', background: 'background', backgroundFluff: 'background-fluff', baseitem: 'base-item',
  boon: 'boon', card: 'card', bookData: 'book', charoption: 'charoption', charoptionFluff: 'charoption-fluff',
  class: 'class', classFeature: 'class-feature', classFluff: 'class-fluff', condition: 'condition',
  conditionFluff: 'condition-fluff', cr: 'cr', cult: 'cult', deck: 'deck', deity: 'deity', disease: 'disease',
  dragon: 'dragon', dragonMundaneItems: 'dragon-mundane-item', encounter: 'encounter', feat: 'feat',
  featFluff: 'feat-fluff', gems: 'gems', hazard: 'hazard', hazardFluff: 'hazard-fluff', hoard: 'hoard',
  individual: 'individual', item: 'item', itemEntry: 'item-entry', itemFluff: 'item-fluff', itemGroup: 'item-group',
  itemMastery: 'item-mastery', itemProperty: 'item-property', itemType: 'item-type',
  itemTypeAdditionalEntries: 'item-type-additional-entries', language: 'language', languageFluff: 'language-fluff',
  languageScript: 'language-script', legendaryGroup: 'legendary-group', legendaryGroupTemplate: 'legendary-group-template',
  lifeBackground: 'life-background', lifeClass: 'life-class', lifeTrinket: 'life-trinket', magicItems: 'magic-item',
  magicvariant: 'magic-variant', makebrewCreatureAction: 'makebrew-creature-action', makebrewCreatureTrait: 'makebrew-creature-trait',
  monster: 'monster', monsterFluff: 'monster-fluff', monsterTemplate: 'monster-template', monsterfeatures: 'monster-feature',
  msbcr: 'msbcr', name: 'name', object: 'object', objectFluff: 'object-fluff', optionalfeature: 'optional-feature',
  optionalfeatureFluff: 'optional-feature-fluff', race: 'race', raceFeature: 'race-feature', raceFluff: 'race-fluff',
  recipe: 'recipe', recipeFluff: 'recipe-fluff', reducedItemProperty: 'reduced-item-property', reducedItemType: 'reduced-item-type',
  reward: 'reward', rewardFluff: 'reward-fluff', sense: 'sense', skill: 'skill', spell: 'spell', spellFluff: 'spell-fluff',
  status: 'status', subrace: 'subrace', subclass: 'subclass', subclassFeature: 'subclass-feature', subclassFluff: 'subclass-fluff',
  table: 'table', tableGroup: 'table-group', trap: 'trap', trapFluff: 'trap-fluff', vehicle: 'vehicle', vehicleFluff: 'vehicle-fluff',
  vehicleUpgrade: 'vehicle-upgrade', variantrule: 'variant-rule'
}

export function sourceTypeOf(key: string): string {
  const type = TYPE_BY_KEY[key]
  if (!type) throw new Error(`未映射的 5etools 来源键：${key}`)
  return type
}
