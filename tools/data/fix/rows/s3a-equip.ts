import type { Fix } from '../engine'

const simple = (label = '任意一把简易武器', qty = 1) => ({ category: 'weapon:simple', label, qty })
const simpleMelee = (label = '任意一把简易近战武器', qty = 1) => ({ category: 'weapon:simple-melee', label, qty })
const martial = (label = '任意一把军用武器', qty = 1) => ({ category: 'weapon:martial', label, qty })
const martialMelee = (label = '任意一把军用近战武器', qty = 1) => ({ category: 'weapon:martial-melee', label, qty })
const focus = (category: 'focus:arcane' | 'focus:druidic' | 'focus:holy', label: string) => ({ category, label, qty: 1 })

export const ROWS: Fix[] = [
  // 先插入靠后的“固定类别项”块，避免块号后移影响前面的路径。
  {
    id: 'class.cleric.phb',
    path: '/data/startingEquipment/5',
    op: 'insert',
    after: { choice: [[focus('focus:holy', '圣徽')]] },
    basis: 'PHB 牧师“装备”小节 p56：一个盾牌和一个圣徽',
  },
  {
    id: 'class.druid.phb',
    path: '/data/startingEquipment/3',
    op: 'insert',
    after: { choice: [[focus('focus:druidic', '德鲁伊法器')]] },
    basis: 'PHB 德鲁伊“装备”小节 p64：皮甲、探索套组和一件德鲁伊法器',
  },
  {
    id: 'class.paladin.phb',
    path: '/data/startingEquipment/4',
    op: 'insert',
    after: { choice: [[focus('focus:holy', '圣徽')]] },
    basis: 'PHB 圣武士“装备”小节 p82：链甲和一个圣徽',
  },
  {
    id: 'class.warlock.phb',
    path: '/data/startingEquipment/4',
    op: 'insert',
    after: { choice: [[simple('任意一把简易武器')]] },
    basis: 'PHB 魔契师“装备”小节 p105：皮甲、任意简易武器和两把匕首',
  },
  {
    id: 'class.artificer.tce',
    path: '/data/startingEquipment/3',
    op: 'insert',
    after: { choice: [[simple('任意两把简易武器', 2)]] },
    basis: 'TCE 奇械师“装备”小节 p9：any two simple weapons of your choice',
  },

  {
    id: 'class.barbarian.phb',
    path: '/data/startingEquipment/0/choice/1',
    op: 'insert',
    after: [martialMelee()],
    basis: 'PHB 野蛮人“装备”小节 p46：一把巨斧或任意一把军用近战武器',
  },
  {
    id: 'class.barbarian.phb',
    path: '/data/startingEquipment/1/choice/1',
    op: 'insert',
    after: [simple()],
    basis: 'PHB 野蛮人“装备”小节 p46：两把手斧或任意一把简易武器',
  },
  {
    id: 'class.bard.phb',
    path: '/data/startingEquipment/0/choice/2',
    op: 'insert',
    after: [simple()],
    basis: 'PHB 吟游诗人“装备”小节 p51：刺剑、长剑或任一把简易武器',
  },
  {
    id: 'class.bard.phb',
    path: '/data/startingEquipment/2/choice/1',
    op: 'insert',
    after: [{ category: 'tool:anyMusicalInstrument', label: '其它乐器', qty: 1 }],
    basis: 'PHB 吟游诗人“装备”小节 p51：一个鲁特琴或其它乐器',
  },
  {
    id: 'class.cleric.phb',
    path: '/data/startingEquipment/2/choice/1',
    op: 'insert',
    after: [simple()],
    basis: 'PHB 牧师“装备”小节 p56：一把轻弩和20支弩矢或任意简易武器',
  },
  {
    id: 'class.druid.phb',
    path: '/data/startingEquipment/0/choice/1',
    op: 'insert',
    after: [simple()],
    basis: 'PHB 德鲁伊“装备”小节 p64：一个木盾或任意简易武器',
  },
  {
    id: 'class.druid.phb',
    path: '/data/startingEquipment/1/choice/1',
    op: 'insert',
    after: [simpleMelee()],
    basis: 'PHB 德鲁伊“装备”小节 p64：一把弯刀或任意简易近战武器',
  },
  {
    id: 'class.fighter.phb',
    path: '/data/startingEquipment/1/choice',
    op: 'set',
    before: [[{ item: '盾牌', qty: 1 }]],
    after: [
      [martial(), { item: '盾牌', qty: 1 }],
      [martial('任意两把军用武器', 2)],
    ],
    basis: 'PHB 战士“装备”小节 p70：一把军用武器和一面盾牌或两把军用武器',
  },
  {
    id: 'class.monk.phb',
    path: '/data/startingEquipment/0/choice/1',
    op: 'insert',
    after: [simple()],
    basis: 'PHB 武僧“装备”小节 p76：一把短剑或任意一把简易武器',
  },
  {
    id: 'class.paladin.phb',
    path: '/data/startingEquipment/0/choice',
    op: 'set',
    before: [[{ item: '盾牌', qty: 1 }]],
    after: [
      [martial(), { item: '盾牌', qty: 1 }],
      [martial('任意两把军用武器', 2)],
    ],
    basis: 'PHB 圣武士“装备”小节 p82：一把军用武器和一面盾牌或两把军用武器',
  },
  {
    id: 'class.paladin.phb',
    path: '/data/startingEquipment/1/choice/1',
    op: 'insert',
    after: [simpleMelee()],
    basis: 'PHB 圣武士“装备”小节 p82：五支标枪或任意简易近战武器',
  },
  {
    id: 'class.ranger.phb',
    path: '/data/startingEquipment/1/choice/1',
    op: 'insert',
    after: [simpleMelee('任意两把简易近战武器', 2)],
    basis: 'PHB 英文原文 p89：two simple melee weapons；中译 v1.72 漏了“近战”',
  },
  {
    id: 'class.sorcerer.phb',
    path: '/data/startingEquipment/0/choice/1',
    op: 'insert',
    after: [simple()],
    basis: 'PHB 术士“装备”小节 p99：一把轻弩和20支弩矢或任意一件简单武器',
  },
  {
    id: 'class.sorcerer.phb',
    path: '/data/startingEquipment/1/choice/1',
    op: 'insert',
    after: [focus('focus:arcane', '奥术法器')],
    basis: 'PHB 术士“装备”小节 p99：一个材料包或一件奥术法器',
  },
  {
    id: 'class.warlock.phb',
    path: '/data/startingEquipment/0/choice/1',
    op: 'insert',
    after: [simple()],
    basis: 'PHB 魔契师“装备”小节 p105：一把轻弩和20支弩矢或任意一把简易武器',
  },
  {
    id: 'class.warlock.phb',
    path: '/data/startingEquipment/1/choice/1',
    op: 'insert',
    after: [focus('focus:arcane', '奥术法器')],
    basis: 'PHB 魔契师“装备”小节 p105：一个材料包或一件奥术法器',
  },
  {
    id: 'class.wizard.phb',
    path: '/data/startingEquipment/1/choice/1',
    op: 'insert',
    after: [focus('focus:arcane', '奥术法器')],
    basis: 'PHB 法师“装备”小节 p112：一个材料包或一件奥术法器',
  },
]
