import type { RuleDefinition } from '../registry'
import { dnd5e2014 } from '../dnd5e2014'

export const DND5E2024_RULE_ID = 'dnd5e2024'

/** D&D 5e 的 2024 版（5.5e）。和 2014 版同一个体系、同一个【库】；结算内核还没接入（kernel/input.ts 没有它这一行），所以先不能建战役。 */
export const dnd5e2024: RuleDefinition = {
  id: DND5E2024_RULE_ID,
  name: 'D&D 5e（2024）',
  nameShort: 'D&D 5.5e',
  description: '龙与地下城第五版（2024 修订规则），核心规则含 2024 版玩家手册、地下城主指南与怪物图鉴',
  family: dnd5e2014.family,
  familyName: dnd5e2014.familyName,
  versionLabel: '5.5e',
  defaultBanner: dnd5e2014.defaultBanner,
}
