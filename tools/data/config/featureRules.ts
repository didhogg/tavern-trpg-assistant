import type { Uses } from '../../../src/rules/dnd5e2014/data/common'

/** 少数关键特性的资源在 5etools 正文/职业表里，不从 Foundry 猜。 */
export const FEATURE_USES: Record<string, Uses> = {
  'feature.barbarian-rage.phb': { max: 'scale.rage-uses', recharge: 'long' },
  'feature.fighter-action-surge.phb': { max: 'scale.action-surge', recharge: 'shortOrLong' },
  'feature.fighter-second-wind.phb': { max: 'scale.second-wind', recharge: 'shortOrLong' },
  'feature.fighter-indomitable.phb': { max: 'scale.indomitable', recharge: 'long' },
  'feature.monk-ki.phb': { max: 'scale.ki-points', recharge: 'shortOrLong' },
  'feature.bard-bardic-inspiration.phb': { max: 'max(1,cha.mod)', recharge: 'long' },
  'feature.cleric-channel-divinity.phb': { max: 'scale.channel-divinity', recharge: 'shortOrLong' },
  'feature.paladin-channel-divinity.phb': { max: 'scale.channel-divinity', recharge: 'shortOrLong' },
  'feature.wizard-arcane-recovery.phb': { max: 1, recharge: 'long' },
  'feature.druid-wild-shape.phb': { max: 2, recharge: 'shortOrLong' },
  'feature.sorcerer-sorcery-points.phb': { max: 'scale.sorcery-points', recharge: 'long' },
  'feature.artificer-flash-of-genius.tce': { max: 'max(1,int.mod)', recharge: 'long' },
  'feature.artificer-infuse-item.tce': { max: 'scale.infusions-known', recharge: 'long' },
  'feature.dragonborn-breath-weapon.phb': { max: 1, recharge: 'shortOrLong' },
  'feature.half-orc-relentless-endurance.phb': { max: 1, recharge: 'long' },
}

/** 引擎没有对应 kind 的关键效果先写成 note，并在报告里列为未映射。 */

/** 专长金样的补充效果；Foundry 有数据时仍会保留其结构化效果。 */
export const FEAT_EFFECTS: Record<string, Array<Record<string, unknown>>> = {
  'feat.heavy-armor-master.phb': [{ kind: 'note', text: '着装重甲时，非魔法攻击的钝击、穿刺、挥砍伤害减少 3 点' }],
  'feat.sentinel.phb': [{ kind: 'note', text: '借机攻击命中后目标速度降为 0；撤离仍会引发借机攻击；可对攻击盟友者用反应反击' }],
  'feat.war-caster.phb': [{ kind: 'advantage', on: 'save', scope: 'concentration' }],
}
export const FEATURE_EFFECTS: Record<string, Array<Record<string, unknown>>> = {
  'feature.barbarian-rage.phb': [
    { kind: 'damageBonus', amount: 'scale.rage-damage', scope: 'melee', when: { all: [{ text: '狂暴中' }] } },
    { kind: 'resistance', damage: ['bludgeoning', 'piercing', 'slashing'], when: { all: [{ text: '狂暴中' }] } },
    { kind: 'advantage', on: 'check', scope: 'str', when: { all: [{ text: '狂暴中' }] } },
    { kind: 'advantage', on: 'save', scope: 'str', when: { all: [{ text: '狂暴中' }] } },
  ],
  'feature.barbarian-unarmored-defense.phb': [
    { kind: 'ac', mode: 'base', formula: '10 + dex.mod + con.mod', when: { all: [{ text: '未穿护甲' }] } },
  ],
  'feature.monk-unarmored-defense.phb': [
    { kind: 'ac', mode: 'base', formula: '10 + dex.mod + wis.mod', when: { all: [{ text: '未穿护甲且未持盾' }] } },
  ],
  'feature.rogue-sneak-attack.phb': [{ kind: 'damageBonus', amount: 'scale.sneak-attack', scope: 'weapon' }],
  'feature.fighter-action-surge.phb': [{ kind: 'note', text: '在自己回合内获得一个额外的动作' }],
  'feature.heavy-armor-master.phb': [{ kind: 'note', text: '着装重甲时，非魔法攻击的钝击、穿刺、挥砍伤害减少 3 点' }],
  'feature.sentinel.phb': [{ kind: 'note', text: '借机攻击命中后目标速度降为 0；撤离仍会引发借机攻击；可对攻击盟友者用反应反击' }],
  'feature.war-caster.phb': [{ kind: 'advantage', on: 'save', scope: 'concentration' }],
  'feature.dragonborn-breath-weapon.phb': [
    { kind: 'note', text: '吐息武器伤害随等级为 2d6/3d6/4d6/5d6；范围与豁免由所选龙种决定' },
  ],
  'feature.dwarf-dwarven-resilience.phb': [
    { kind: 'resistance', damage: ['poison'] },
    { kind: 'advantage', on: 'save', scope: 'poison' },
  ],
  'feature.stout-halfling-stout-resilience.phb': [{ kind: 'resistance', damage: ['poison'] }],
}
