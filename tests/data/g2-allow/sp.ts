import type { Added, Allow, AllowRequires } from './types'

/**
 * P 管线站（规划者改转换器后重建）的放行规则：整类变化用「按类型＋路径」的规则，`expect` 是实测的条目数。
 * 这些变化是转换器照 5etools 原始数据生成的（不是逐条手改），所以验收靠扫全库的数据测试（见 P_管线站.md），这里只防"改到别处"。
 * 依据与每项的根因：docs/probes/D1.2-G2.5_根因与数据源台账.md。
 */
const RESIST = '(?:resist|immune|vulnerable)(?:Conditional)?'
export const ALLOW: Allow[] = [
  { name: 'sp-item-kind', station: 5, type: 'item', path: /^(?:\/data\/(?:itemKind|focusType|poisonDelivery)|\/i18n\/en\/fields\/poisonDelivery\.\d+)$/, expect: 2069, reason: 'P2：物品标准类型 itemKind（类型表）、法器类别、毒药方式' },
  { name: 'sp-item-category', station: 5, type: 'item', path: /^(?:\/data\/category|\/summary)$/, expect: 140, reason: 'P2：category 的转换器 bug（类型代码后缀、VE 笔误、$ 系列缺规则）；摘要里的类别词随之更正' },
  { name: 'sp-item-consumable', station: 5, type: 'item', path: /^\/data\/consumable$/, expect: 77, reason: 'P2：consumable 以 5etools 消耗品标记 CNS 为准' },
  { name: 'sp-item-use', station: 5, type: 'item', path: /^\/data\/(?:activities|charges|extra)(?:\/|$)/, expect: 156, reason: 'P7：Foundry dnd5e 开源数据补缺——物品的使用次数／恢复，消耗品与带次数物品的使用动作；其余消耗品给兜底的"使用"动作（消耗 1 份）' },
  { name: 'sp-item-effects', station: 5, type: 'item', path: /^\/data\/effects(?:\/|$)/, expect: 2, reason: 'P1：Foundry 映射不再写 0、补映射' },
  { name: 'sp-monster-mechanics', station: 5, type: 'monster', path: /^\/data\/(?:actions|bonusActions|traits|reactions|legendary|summon)(?:\/|$)/, expect: 652, reason: 'P3：充能骰 rechargeRoll、休息恢复 uses、传奇动作花费 cost、攻击所用武器 item、召唤物／同伴随环阶或职业等级的公式 summon' },
  { name: 'sp-monster-resist', station: 5, type: 'monster', path: new RegExp(`^(?:/data/${RESIST}(?:/|$)|/i18n/en/fields/${RESIST}\\.\\d+(?:\\.when)?$)`), expect: 294, reason: 'P3：带条件抗性／免疫／易伤拆成纯代码＋*Conditional' },
  { name: 'sp-monster-ac', station: 5, type: 'monster', path: /^\/data\/ac(?:\/|$)/, expect: 202, reason: 'P3：护甲来源连到物品 id（ac[].items）' },
  { name: 'sp-spell-classes', station: 5, type: 'spell', path: /^\/data\/classes(?:\/|$)/, expect: 54, reason: 'P5：塔莎等书的可选扩展法术不再混进 PHB 法术的核心职业表（改由锚点特性 spellLists 登记）' },
  { name: 'sp-feature-activities', station: 5, type: 'feature', path: /^\/data\/activities(?:\/|$)/, expect: 114, reason: 'P1：职业／子职业特性的 consumes 也读（以前只读可选特性），池名解析成池特性编号' },
  { name: 'sp-feature-effects', station: 5, type: 'feature', path: /^\/data\/effects(?:\/|$)/, expect: 33, reason: 'P1：Foundry 映射（数字容忍空格、@scale 公式、暴击、护甲计算、豁免／检定加值…），不再写 0' },
  { name: 'sp-table-binding', station: 5, type: 'table', path: /^(?:\/data\/(?:parent|at)(?:\/|$)|\/i18n\/en\/fields\/at\.heading\.\d+$)/, expect: 670, reason: 'P4：书里的表记原位置 at（锚点、小标题路径、顺序）；按章节标题字典绑到怪物／种族（parent.appliesTo 记其余适用的）' },
  { name: 'sp-background-equipment', station: 5, type: 'background', path: /^\/data\/equipment(?:\/|$)/, expect: 11, reason: 'P6：背景起始装备里的"一件乐器／工匠工具／游戏用品（自选）"（5etools equipmentType）以前被转换器丢掉，现在读出来' },
  { name: 'sp-feat', station: 5, type: 'feat', path: /^\/data\/(?:advancement|effects)(?:\/|$)/, expect: 10, reason: 'P5：专长的自选法术池（5etools additionalSpells 的 choose 串）；P1：Foundry 映射' },
]

const ANCHOR = (short: string, n: string): Added => ({ id: `feature.${short}-additional-spells.tce`, pack: 'dnd5e2014-tce', station: 5, basis: `P5：TCE 给${n}的可选扩展法术列表（5etools gendata-spell-source-lookup 的 classVariant），由转换器生成锚点特性` })
export const ADDED: Added[] = [
  ANCHOR('bard', '吟游诗人'), ANCHOR('cleric', '牧师'), ANCHOR('druid', '德鲁伊'), ANCHOR('paladin', '圣武士'),
  ANCHOR('ranger', '游侠'), ANCHOR('sorcerer', '术士'), ANCHOR('warlock', '魔契师'), ANCHOR('wizard', '法师'),
]
export const ALLOW_REQUIRES: AllowRequires[] = []
