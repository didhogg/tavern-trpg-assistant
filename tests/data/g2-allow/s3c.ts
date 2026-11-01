import type { Added, Allow, AllowRequires } from './types'

/** 第 3 站 3c 怪物与世界 的放行规则。 */
export const ALLOW: Allow[] = [
  {
    name: 's3c-hp',
    station: 3,
    ids: ['monster.duergar.mm', 'monster.vine-blight.mm', 'monster.ulitharid.mpmm', 'monster.ulitharid.vgm', 'monster.cloud-giant-smiling-one.vgm', 'monster.master-thief.vgm', 'monster.shadow-mastiff-alpha.vgm'],
    path: /^\/data\/hp(?:\/|$)/,
    expect: 7,
    reason: 'c1-mm-hp-formula / c1-hp-formula-mismatch：7 个怪物生命骰式/固定值',
  },
  {
    name: 's3c-passive',
    station: 3,
    ids: ['monster.homunculus-servant.tce', 'monster.steel-defender.tce'],
    path: /^\/data\/(?:passive|skills\/)/,
    expect: 2,
    reason: 'c1-passive-missing：两个人造伙伴补被动察觉与 TCE 的 +PB 技能基线',
  },
  {
    name: 's3c-spell-links',
    station: 3,
    ids: ['monster.black-abishai.mpmm', 'monster.conjurer.vgm', 'monster.diviner.vgm', 'monster.evoker.vgm', 'monster.illusionist.vgm', 'monster.necromancer.vgm', 'monster.death-knight.mm'],
    path: /^(?:\/data\/spellcasting\/|\/i18n\/en\/fields\/spellcasting\.)/,
    expect: 7,
    reason: 'c5-spell-plain-unknown：7 个怪物、8 处法术名补链接',
  },
  {
    name: 's3c-object-activities',
    station: 3,
    ids: ['object.ballista.dmg', 'object.cannon.dmg', 'object.mangonel.dmg', 'object.ram.dmg', 'object.trebuchet.dmg', 'object.eldritch-cannon-force-ballista.tce', 'object.eldritch-cannon-flamethrower.tce', 'object.suspended-cauldron.dmg', 'object.eldritch-cannon-protector.tce'],
    path: /^\/data\/activities$/,
    expect: 9,
    reason: 'c10-object-actions-text-only：9 个器械补条目层 activities',
  },
  {
    name: 's3c-object-immune',
    station: 3,
    ids: ['object.generic-object.dmg'],
    path: /^(?:\/data\/immune(?:\/|$)|\/i18n\/en\/fields\/immune\.)/,
    expect: 1,
    reason: 'c10-object-immune-text：通用物件免疫文字改伤害代码',
  },
  {
    name: 's3c-planar-raider',
    station: 3,
    ids: ['vehicle.planar-raider.mtf'],
    path: /^\/data\/weapon\/\d+\/count$/,
    expect: 1,
    reason: '位面掠夺者弩炮数 2→3（无登记项，按 MTF p90）',
  },
  {
    name: 's3c-fixed-hp',
    station: 3,
    ids: ['monster.animated-object-tiny.phb', 'monster.animated-object-small.phb', 'monster.animated-object-medium.phb', 'monster.animated-object-large.phb', 'monster.animated-object-huge.phb', 'monster.troll-loathsome-limb-severed-arm.mm', 'monster.troll-loathsome-limb-severed-head.mm', 'monster.troll-loathsome-limb-severed-leg.mm'],
    path: /^\/data\/hp\/average$/,
    expect: 8,
    reason: 'c13-hp-special-other：8 个固定生命值怪物写 average，special 保留',
  },
  {
    name: 's3c-ki-keyword',
    station: 3,
    ids: ['feature.monk-ki.phb'],
    path: /^\/keywords\//,
    expect: 1,
    reason: 'd4-keywords-miss-name-en：气补英文名 Ki',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
