export interface TraitGrant {
  grants?: string[]
  choices?: Array<{ count: number; pool: string[] }>
}
/** 附赠熟练特性的 trait 授予（来源：5etools 特性正文；R5）。 */
export const PROFICIENCY_TRAITS: Record<string, TraitGrant> = {
  'feature.cleric-death-domain-bonus-proficiency.dmg': { grants: ['weapon:martial'] },
  'feature.cleric-life-domain-bonus-proficiency.phb': { grants: ['armor:heavy'] },
  'feature.cleric-nature-domain-bonus-proficiency.phb': { grants: ['armor:heavy'] },
  'feature.cleric-tempest-domain-bonus-proficiencies.phb': { grants: ['weapon:martial', 'armor:heavy'] },
  'feature.cleric-war-domain-bonus-proficiencies.phb': { grants: ['weapon:martial', 'armor:heavy'] },
  'feature.cleric-order-domain-bonus-proficiencies.tce': { grants: ['armor:heavy'], choices: [{ count: 1, pool: ['skill:intimidation', 'skill:persuasion'] }] },
  'feature.cleric-twilight-domain-bonus-proficiencies.tce': { grants: ['weapon:martial', 'armor:heavy'] },
  'feature.cleric-forge-domain-bonus-proficiency.xge': { grants: ['armor:heavy', 'tool:smiths-tools'] },
  'feature.bard-college-of-lore-bonus-proficiencies.phb': { choices: [{ count: 3, pool: ['skill:*'] }] },
  'feature.bard-college-of-valor-bonus-proficiencies.phb': { grants: ['armor:medium', 'armor:shield', 'weapon:martial'] },
  'feature.bard-college-of-swords-bonus-proficiencies.xge': { grants: ['armor:medium', 'weapon:scimitar'] },
  'feature.rogue-assassin-bonus-proficiencies.phb': { grants: ['tool:disguise-kit', 'tool:poisoners-kit'] },
  'feature.fighter-rune-knight-bonus-proficiencies.tce': { grants: ['tool:smiths-tools', 'lang:giant'] },
  'feature.fighter-cavalier-bonus-proficiency.xge': { choices: [{ count: 1, pool: ['skill:animal-handling', 'skill:history', 'skill:insight', 'skill:performance', 'skill:persuasion', 'lang:*'] }] },
  'feature.fighter-samurai-bonus-proficiency.xge': { choices: [{ count: 1, pool: ['skill:history', 'skill:insight', 'skill:performance', 'skill:persuasion', 'lang:*'] }] },
  'feature.monk-way-of-the-drunken-master-bonus-proficiencies.xge': { grants: ['skill:performance', 'tool:brewers-supplies'] },
  'feature.expert-sidekick-bonus-proficiencies.tce': { choices: [{ count: 2, pool: ['skill:*'] }] },
  'feature.spellcaster-sidekick-bonus-proficiencies.tce': { choices: [{ count: 1, pool: ['skill:*'] }] },
  'feature.warrior-sidekick-bonus-proficiencies.tce': { grants: ['armor:medium', 'armor:shield', 'weapon:martial'] },
}
