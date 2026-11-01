import type { Added, Allow, AllowRequires } from './types'

/** E4 子站（补充层数据文件产生的变化）的放行规则：每条用 `ids` 精确列条目，`expect` ＝ 条目数（来自 E_逐条站.md／规格，不是跑出来再抄）。 */
export const ALLOW: Allow[] = [
  {
    name: 'e4-3-3c-leftovers',
    station: 4,
    ids: ['monster.archmage.mm', 'monster.archmage-familiar.mm', 'object.eldritch-cannon-flamethrower.tce', 'object.eldritch-cannon-force-ballista.tce', 'object.eldritch-cannon-protector.tce', 'monster.deck-defender.bmt'],
    path: /^(?:\/data\/(?:resist|resistConditional|hp)(?:\/|$)|\/i18n\/en\/fields\/hp\.special$)/,
    expect: 6,
    reason: 'c1-resist-text 3→1（狗头人保留）、c10-object-no-stats 3→0、c13-hp-special-other 1→0',
  },
  {
    name: 'e4-2-summon-mixed',
    station: 4,
    ids: ['monster.bestial-spirit.tce', 'monster.celestial-spirit.tce', 'monster.fiendish-spirit.tce', 'monster.undead-spirit.tce', 'monster.hound-of-ill-omen.xge', 'monster.beast-of-the-sea.tce', 'monster.fey-spirit-fuming.tce', 'monster.fey-spirit-mirthful.tce', 'monster.fey-spirit-tricksy.tce', 'monster.fey-spirit.tce'],
    path: /^(?:\/data\/summon(?:\/|$)|\/data\/actions\/\d+\/activities\/\d+\/damage\/\d+$)/,
    expect: 10,
    reason: 'c13-summon-placeholder 5→0；c13-summon-attack-snapshot 7→2（天界灵魄临时生命值/海洋野兽选择伤害的剩余项）',
  },
  {
    name: 'e4-closing-kobold-resist',
    station: 4,
    ids: ['monster.kobold-dragonshield.mpmm'],
    // 中文 resist 清空后，构建对齐时英文那一份（i18n.en.fields.resist.N）也随之去掉，两处一起放行
    path: /^(?:\/data\/resist(?:\/|$)|\/i18n\/en\/fields\/resist\.\d+$)/,
    expect: 1,
    reason: '规划者核验发现 2：MPMM 狗头人龙盾护卫 resist 里的「见下文龙之抗性」移走（resist 只放伤害代码，文字留在特性里）；c1-resist-text 1→0',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
