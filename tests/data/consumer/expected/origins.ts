/** PHB 第 4 章背景（13 个）与第 6 章专长。 */
export interface BgExpect { skills: string[]; toolsFixed: string[]; toolChoose?: string; langChoose: number }
export const BG_EXPECT: Record<string, BgExpect> = {
  'background.acolyte.phb': { skills: ['insight', 'religion'], toolsFixed: [], langChoose: 2 },
  'background.charlatan.phb': { skills: ['deception', 'sleight of hand'], toolsFixed: ['disguise kit', 'forgery kit'], langChoose: 0 },
  'background.criminal.phb': { skills: ['deception', 'stealth'], toolsFixed: ["thieves' tools"], toolChoose: 'anyGamingSet', langChoose: 0 },
  'background.entertainer.phb': { skills: ['acrobatics', 'performance'], toolsFixed: ['disguise kit'], toolChoose: 'anyMusicalInstrument', langChoose: 0 },
  'background.folk-hero.phb': { skills: ['animal handling', 'survival'], toolsFixed: ['vehicles (land)'], toolChoose: 'anyArtisansTool', langChoose: 0 },
  'background.guild-artisan.phb': { skills: ['insight', 'persuasion'], toolsFixed: [], toolChoose: 'anyArtisansTool', langChoose: 1 },
  'background.hermit.phb': { skills: ['medicine', 'religion'], toolsFixed: ['herbalism kit'], langChoose: 1 },
  'background.noble.phb': { skills: ['history', 'persuasion'], toolsFixed: [], toolChoose: 'anyGamingSet', langChoose: 1 },
  'background.outlander.phb': { skills: ['athletics', 'survival'], toolsFixed: [], toolChoose: 'anyMusicalInstrument', langChoose: 1 },
  'background.sage.phb': { skills: ['arcana', 'history'], toolsFixed: [], langChoose: 2 },
  'background.sailor.phb': { skills: ['athletics', 'perception'], toolsFixed: ["navigator's tools", 'vehicles (water)'], langChoose: 0 },
  'background.soldier.phb': { skills: ['athletics', 'intimidation'], toolsFixed: ['vehicles (land)'], toolChoose: 'anyGamingSet', langChoose: 0 },
  'background.urchin.phb': { skills: ['sleight of hand', 'stealth'], toolsFixed: ['disguise kit', "thieves' tools"], langChoose: 0 },
}

/** 专长：前置条件（能力值/熟练/施法）与属性提升。未列出的 PHB 专长既无前置也无属性提升。 */
export interface FeatExpect { requires?: { all?: Array<Record<string, unknown>>; any?: Array<Record<string, unknown>> }; asi?: { fixed?: [string, number]; choose?: string[] } }
export const FEAT_EXPECT: Record<string, FeatExpect> = {
  'feat.actor.phb': { asi: { fixed: ['cha', 1] } },
  'feat.athlete.phb': { asi: { choose: ['str', 'dex'] } },
  'feat.defensive-duelist.phb': { requires: { all: [{ ability: { dex: 13 } }] } },
  'feat.durable.phb': { asi: { fixed: ['con', 1] } },
  'feat.elemental-adept.phb': { requires: { all: [{ spellcasting: true }] } },
  'feat.grappler.phb': { requires: { all: [{ ability: { str: 13 } }] } },
  'feat.heavily-armored.phb': { requires: { all: [{ proficiency: { armor: 'medium' } }] }, asi: { fixed: ['str', 1] } },
  'feat.heavy-armor-master.phb': { requires: { all: [{ proficiency: { armor: 'heavy' } }] }, asi: { fixed: ['str', 1] } },
  'feat.inspiring-leader.phb': { requires: { all: [{ ability: { cha: 13 } }] } },
  'feat.keen-mind.phb': { asi: { fixed: ['int', 1] } },
  'feat.lightly-armored.phb': { asi: { choose: ['str', 'dex'] } },
  'feat.linguist.phb': { asi: { fixed: ['int', 1] } },
  'feat.medium-armor-master.phb': { requires: { all: [{ proficiency: { armor: 'medium' } }] } },
  'feat.moderately-armored.phb': { requires: { all: [{ proficiency: { armor: 'light' } }] }, asi: { choose: ['str', 'dex'] } },
  'feat.observant.phb': { asi: { choose: ['int', 'wis'] } },
  'feat.ritual-caster.phb': { requires: { any: [{ ability: { int: 13 } }, { ability: { wis: 13 } }] } },
  'feat.resilient.phb': { asi: { choose: ['str', 'dex', 'con', 'int', 'wis', 'cha'] } },
  'feat.skulker.phb': { requires: { all: [{ ability: { dex: 13 } }] } },
  'feat.spell-sniper.phb': { requires: { all: [{ spellcasting: true }] } },
  'feat.tavern-brawler.phb': { asi: { choose: ['str', 'con'] } },
  'feat.war-caster.phb': { requires: { all: [{ spellcasting: true }] } },
  'feat.weapon-master.phb': { asi: { choose: ['str', 'dex'] } },
}
