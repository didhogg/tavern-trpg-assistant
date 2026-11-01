import type { Added, Allow, AllowRequires } from './types'

/** E1 子站（补充层数据文件产生的变化）的放行规则：每条用 `ids` 精确列条目，`expect` ＝ 条目数（来自 E_逐条站.md／规格，不是跑出来再抄）。 */
export const ALLOW: Allow[] = [
  {
    name: 'e1-1-when-formula',
    station: 1,
    ids: [
      'feature.barbarian-rage.phb',
      'feature.barbarian-unarmored-defense.phb',
      'feature.monk-unarmored-defense.phb',
      'feature.wizard-school-of-abjuration-arcane-ward.phb',
    ],
    path: /^(?:\/data\/effects(?:\/|$)|\/data\/uses\/max$)/,
    expect: 4,
    reason: 'b2-when-text 3→0、b2-formula-unsupported-variable 1→0：条件结构化与奥术守御公式',
  },
  {
    name: 'e1-2-feature-uses',
    station: 1,
    ids: [
      'feature.fighter-battle-master-combat-superiority.phb',
      'feature.paladin-divine-sense.phb',
      'feature.wizard-school-of-divination-portent.phb',
    ],
    path: /^\/data\/uses\/max$/,
    expect: 3,
    reason: 'b5-max-feature.*：卓越骰、神圣感知、预兆的次数改成成长值/公式',
  },
  {
    name: 'e1-2-subclass-advancement',
    station: 1,
    ids: ['subclass.fighter-battle-master.phb', 'subclass.wizard-school-of-divination.phb'],
    path: /^\/data\/advancement(?:\/|$)/,
    expect: 2,
    reason: 'b5-max-feature.*：两个子职业新增数值型 scaleValue',
  },
  {
    name: 'e1-2-paladin-advancement',
    station: 1,
    ids: ['class.paladin.phb'],
    path: /^\/data\/advancement(?:\/|$)/,
    expect: 1,
    reason: 'b5-max-feature.paladin-channel-divinity.phb：引导神力不随等级增加',
  },
  {
    name: 'e1-3-delete-uses',
    station: 1,
    ids: [
      'feature.barbarian-path-of-the-zealot-rage-beyond-death.xge',
      'feature.bard-college-of-swords-masters-flourish.xge',
      'feature.fighter-extra-attack-3.phb',
      'feature.fighter-extra-attack.phb',
      'feature.monk-way-of-the-drunken-master-intoxicated-frenzy.xge',
      'feature.ranger-fey-wanderer-fey-wanderer-magic.tce',
      'feature.pact-of-the-tome.phb',
    ],
    path: /^\/data\/uses$/,
    expect: 7,
    reason: 'a18-no-support-in-text 6→0；书之魔契在 a18-foundry-extra-uses 里一并删除',
  },
  {
    name: 'e1-3-special-resource',
    station: 1,
    ids: ['feature.rogue-phantom-tokens-of-the-departed.tce'],
    path: /^\/data\/uses(?:\/|$)/,
    expect: 1,
    reason: 'a18-special-resource 1→0：逝者遗物改为熟练加值上限、特殊恢复',
  },
  {
    name: 'e1-3-add-uses',
    station: 1,
    ids: ['feat.artificer-initiate.tce', 'feat.metamagic-adept.tce', 'feature.spell-refueling-ring.tce'],
    path: /^\/data\/uses$/,
    expect: 3,
    reason: 'rest-spell-once-no-uses 2→0、rest-daily-no-uses 1→0',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
