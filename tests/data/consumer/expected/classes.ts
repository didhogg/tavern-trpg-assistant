/** 12 个 PHB 职业 + 奇械师的期望值，逐项取自书：PHB 各职业“生命值/熟练项/装备”小节（职业章），TCE 第 2 章奇械师。 */
export interface ClassExpect {
  die: number
  saves: string[]
  armor: string[]
  weaponCats: string[]
  weaponNames: string[]
  /** 固定给的工具（英文名） */
  toolsFixed: string[]
  /** 书上还有“自选 N 种…”这类选择；数据里只能是文字 */
  toolsChoiceProse: boolean
  skillChoose: number
  skillFrom: string[] | 'any'
  subclassLevel: number
  /** 起始装备里“二选一/三选一”的各小条选项数（书上的顺序） */
  equipChoices: number[]
  /** 起始装备里固定给的物品种数（含“任意简易武器”之类的类别项） */
  equipFixed: number
}

const S = (...x: string[]): string[] => x
export const CLASS_EXPECT: Record<string, ClassExpect> = {
  'class.barbarian.phb': { die: 12, saves: S('str', 'con'), armor: S('light', 'medium', 'shield'), weaponCats: S('simple', 'martial'), weaponNames: [], toolsFixed: [], toolsChoiceProse: false, skillChoose: 2, skillFrom: S('animal handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'), subclassLevel: 3, equipChoices: [2, 2], equipFixed: 2 },
  'class.bard.phb': { die: 8, saves: S('dex', 'cha'), armor: S('light'), weaponCats: S('simple'), weaponNames: S('hand crossbow', 'longsword', 'rapier', 'shortsword'), toolsFixed: [], toolsChoiceProse: true, skillChoose: 3, skillFrom: 'any', subclassLevel: 3, equipChoices: [3, 2, 2], equipFixed: 2 },
  'class.cleric.phb': { die: 8, saves: S('wis', 'cha'), armor: S('light', 'medium', 'shield'), weaponCats: S('simple'), weaponNames: [], toolsFixed: [], toolsChoiceProse: false, skillChoose: 2, skillFrom: S('history', 'insight', 'medicine', 'persuasion', 'religion'), subclassLevel: 1, equipChoices: [2, 3, 2, 2], equipFixed: 2 },
  'class.druid.phb': { die: 8, saves: S('int', 'wis'), armor: S('light', 'medium', 'shield'), weaponCats: [], weaponNames: S('club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'scimitar', 'sickle', 'sling', 'spear'), toolsFixed: S('herbalism kit'), toolsChoiceProse: false, skillChoose: 2, skillFrom: S('arcana', 'animal handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'), subclassLevel: 2, equipChoices: [2, 2], equipFixed: 3 },
  'class.fighter.phb': { die: 10, saves: S('str', 'con'), armor: S('light', 'medium', 'heavy', 'shield'), weaponCats: S('simple', 'martial'), weaponNames: [], toolsFixed: [], toolsChoiceProse: false, skillChoose: 2, skillFrom: S('acrobatics', 'animal handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'), subclassLevel: 3, equipChoices: [2, 2, 2, 2], equipFixed: 0 },
  'class.monk.phb': { die: 8, saves: S('str', 'dex'), armor: [], weaponCats: S('simple'), weaponNames: S('shortsword'), toolsFixed: [], toolsChoiceProse: true, skillChoose: 2, skillFrom: S('acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'), subclassLevel: 3, equipChoices: [2, 2], equipFixed: 1 },
  'class.paladin.phb': { die: 10, saves: S('wis', 'cha'), armor: S('light', 'medium', 'heavy', 'shield'), weaponCats: S('simple', 'martial'), weaponNames: [], toolsFixed: [], toolsChoiceProse: false, skillChoose: 2, skillFrom: S('athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'), subclassLevel: 3, equipChoices: [2, 2, 2], equipFixed: 2 },
  'class.ranger.phb': { die: 10, saves: S('str', 'dex'), armor: S('light', 'medium', 'shield'), weaponCats: S('simple', 'martial'), weaponNames: [], toolsFixed: [], toolsChoiceProse: false, skillChoose: 3, skillFrom: S('animal handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'), subclassLevel: 3, equipChoices: [2, 2, 2], equipFixed: 2 },
  'class.rogue.phb': { die: 8, saves: S('dex', 'int'), armor: S('light'), weaponCats: S('simple'), weaponNames: S('hand crossbow', 'longsword', 'rapier', 'shortsword'), toolsFixed: S("thieves' tools"), toolsChoiceProse: false, skillChoose: 4, skillFrom: S('acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight of hand', 'stealth'), subclassLevel: 3, equipChoices: [2, 2, 3], equipFixed: 3 },
  'class.sorcerer.phb': { die: 6, saves: S('con', 'cha'), armor: [], weaponCats: [], weaponNames: S('dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'), toolsFixed: [], toolsChoiceProse: false, skillChoose: 2, skillFrom: S('arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'), subclassLevel: 1, equipChoices: [2, 2, 2], equipFixed: 1 },
  'class.warlock.phb': { die: 8, saves: S('wis', 'cha'), armor: S('light'), weaponCats: S('simple'), weaponNames: [], toolsFixed: [], toolsChoiceProse: false, skillChoose: 2, skillFrom: S('arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'), subclassLevel: 1, equipChoices: [2, 2, 2], equipFixed: 3 },
  'class.wizard.phb': { die: 6, saves: S('int', 'wis'), armor: [], weaponCats: [], weaponNames: S('dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'), toolsFixed: [], toolsChoiceProse: false, skillChoose: 2, skillFrom: S('arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'), subclassLevel: 2, equipChoices: [2, 2, 2], equipFixed: 1 },
  // TCE 第 2 章起始装备：任意两把简易武器；轻弩与 20 支弩矢；镶钉皮甲或鳞甲（二选一）；盗贼工具与地城套组。固定物品共 5 项（含“任意两把简易武器”这个类别项）
  // TCE 第 2 章：武器只有简易武器（火器熟练是“DM 使用火器规则且你接触过火器时”的条件，不是无条件熟练）
  'class.artificer.tce': { die: 8, saves: S('con', 'int'), armor: S('light', 'medium', 'shield'), weaponCats: S('simple'), weaponNames: [], toolsFixed: S("thieves' tools", "tinker's tools"), toolsChoiceProse: true, skillChoose: 2, skillFrom: S('arcana', 'history', 'investigation', 'medicine', 'nature', 'perception', 'sleight of hand'), subclassLevel: 3, equipChoices: [2], equipFixed: 5 },
}
