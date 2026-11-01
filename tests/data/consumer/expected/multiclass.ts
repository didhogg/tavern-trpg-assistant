/** 兼职（PHB 第 6 章“兼职”）：先决条件与兼职获得的熟练。
 * 先决条件：reqAll = 每项都要满足；reqAny = 满足其一即可（战士：力量 13 或 敏捷 13）。 */
export interface McExpect { reqAll: Array<[string, number]>; reqAny: Array<[string, number]>; armor: string[]; weaponCats: string[]; weaponNames: string[]; skillChoose: number; toolsFixed: string[]; toolsProse: boolean }
const E = (o: Partial<McExpect>): McExpect => ({ reqAll: [], reqAny: [], armor: [], weaponCats: [], weaponNames: [], skillChoose: 0, toolsFixed: [], toolsProse: false, ...o })
export const MC_EXPECT: Record<string, McExpect> = {
  'class.barbarian.phb': E({ reqAll: [['str', 13]], armor: ['shield'], weaponCats: ['simple', 'martial'] }),
  'class.bard.phb': E({ reqAll: [['cha', 13]], armor: ['light'], skillChoose: 1, toolsProse: true }),
  'class.cleric.phb': E({ reqAll: [['wis', 13]], armor: ['light', 'medium', 'shield'] }),
  'class.druid.phb': E({ reqAll: [['wis', 13]], armor: ['light', 'medium', 'shield'] }),
  'class.fighter.phb': E({ reqAny: [['str', 13], ['dex', 13]], armor: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'] }),
  'class.monk.phb': E({ reqAll: [['dex', 13], ['wis', 13]], weaponCats: ['simple'], weaponNames: ['shortsword'] }),
  'class.paladin.phb': E({ reqAll: [['str', 13], ['cha', 13]], armor: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'] }),
  'class.ranger.phb': E({ reqAll: [['dex', 13], ['wis', 13]], armor: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'], skillChoose: 1 }),
  'class.rogue.phb': E({ reqAll: [['dex', 13]], armor: ['light'], skillChoose: 1, toolsFixed: ["thieves' tools"] }),
  'class.sorcerer.phb': E({ reqAll: [['cha', 13]] }),
  'class.warlock.phb': E({ reqAll: [['cha', 13]], armor: ['light'], weaponCats: ['simple'] }),
  'class.wizard.phb': E({ reqAll: [['int', 13]] }),
  // TCE 奇械师：智力 13；轻甲、中甲、盾牌、盗贼工具、修补工具
  'class.artificer.tce': E({ reqAll: [['int', 13]], armor: ['light', 'medium', 'shield'], toolsFixed: ["thieves' tools", "tinker's tools"] }),
}

/** 属性值提升等级：所有职业 4/8/12/16/19；战士另有 6、14；游荡者另有 10（PHB 各职业表）。 */
export const ASI_BASE = [4, 8, 12, 16, 19]
export const ASI_EXTRA: Record<string, number[]> = { 'class.fighter.phb': [6, 14], 'class.rogue.phb': [10] }
