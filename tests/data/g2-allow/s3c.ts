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
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
