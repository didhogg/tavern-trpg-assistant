/** 戏法数、已知法术数、准备公式的期望值（SRD 职业用 5e API 在测试里直接取；这里只放 API 里没有的）。 */
// TCE 奇械师职业表“已知戏法”：1 级 2 个，10 级 3 个，14 级 4 个
export const ARTIFICER_CANTRIPS = [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4]
// PHB 第 3 章战士·奥法骑士、游荡者·奥法诡术师表：3 级 2 个戏法，10 级 3 个；已知法术 3 级 3 个……20 级 13 个
export const EK_AT_CANTRIPS = [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
export const EK_AT_KNOWN = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]

type Prep = { mode: string; formula?: { ability: string; level: string; min: number } }
/** 准备法术：法师用法术书（智力 + 法师等级）；牧师（感知 + 牧师等级）、德鲁伊（感知 + 德鲁伊等级）；圣武士（魅力 + 一半圣武士等级）；奇械师（智力 + 一半奇械师等级）；其余是“已知”。 */
export const PREP: Record<string, Prep> = {
  'class.wizard.phb': { mode: 'spellbook', formula: { ability: 'int', level: 'full', min: 1 } },
  'class.cleric.phb': { mode: 'prepared', formula: { ability: 'wis', level: 'full', min: 1 } },
  'class.druid.phb': { mode: 'prepared', formula: { ability: 'wis', level: 'full', min: 1 } },
  'class.paladin.phb': { mode: 'prepared', formula: { ability: 'cha', level: 'half', min: 1 } },
  'class.artificer.tce': { mode: 'prepared', formula: { ability: 'int', level: 'half', min: 1 } },
  'class.bard.phb': { mode: 'known' },
  'class.sorcerer.phb': { mode: 'known' },
  'class.warlock.phb': { mode: 'known' },
  'class.ranger.phb': { mode: 'known' },
  'subclass.fighter-eldritch-knight.phb': { mode: 'known' },
  'subclass.rogue-arcane-trickster.phb': { mode: 'known' },
}
