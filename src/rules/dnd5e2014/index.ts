import type { RuleDefinition } from '../registry'

export const DND5E2014_RULE_ID = 'dnd5e2014'

/** 规则引擎（派生数值、掷骰、结算）在 M4 加入；此处只提供数据层需要的静态定义。 */
export const dnd5e2014: RuleDefinition = {
  id: DND5E2014_RULE_ID,
  name: 'D&D 5e（2014）',
  nameShort: 'D&D 5e',
  description: '龙与地下城第五版（2014 规则），核心规则含玩家手册、地下城主指南与怪物图鉴',
  corePackIds: ['dnd5e2014-core'],
  defaultBanner: {
    wide: 'https://a1.ax1x.com/2026/10/28/wwHs9.png',
    narrow: 'https://a1.ax1x.com/2026/10/28/wwHs9.md.png',
    alt: 'D&D 5e 默认战役横幅',
  },
}
