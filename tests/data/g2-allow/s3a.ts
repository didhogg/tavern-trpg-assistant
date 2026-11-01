import type { Added, Allow, AllowRequires } from './types'

/** 第 3 站 3a 装备与职业 的放行规则（规则见 docs/handoff/D1.2-G2.5_执行包/00 第 7 节；每个文件不超过 400 行）。 */
export const ALLOW: Allow[] = [
  {
    name: 's3a-equip',
    station: 3,
    ids: [
      'class.barbarian.phb',
      'class.bard.phb',
      'class.cleric.phb',
      'class.druid.phb',
      'class.fighter.phb',
      'class.monk.phb',
      'class.paladin.phb',
      'class.ranger.phb',
      'class.sorcerer.phb',
      'class.warlock.phb',
      'class.wizard.phb',
      'class.artificer.tce',
    ],
    path: /^(?:\/data\/startingEquipment\/|\/i18n\/en\/fields\/startingEquipment\.)/,
    expect: 12,
    reason: 'a1-equipChoices / a1-equipFixed：12 个职业补类别选项与固定类别项',
  },
  {
    name: 's3a-tool-choose',
    station: 3,
    ids: ['class.bard.phb', 'class.monk.phb', 'class.artificer.tce'],
    path: /^\/data\/(?:multiclass\/)?proficiencies\/toolChoose$/,
    expect: 3,
    reason: 'a2-tool-choice-prose：3 个职业加结构化 toolChoose（吟游诗人另含多职业）',
  },
  {
    name: 's3a-artificer-firearms',
    station: 3,
    ids: ['class.artificer.tce'],
    path: /^\/data\/text\//,
    expect: 1,
    reason: 'a1-weaponCats 决定项：奇械师火器熟练的条件说明补文字，不改结构',
  },
  {
    name: 's3a-subclass-casting',
    station: 3,
    ids: ['subclass.monk-way-of-the-four-elements.phb', 'subclass.barbarian-path-of-the-ancestral-guardian.xge'],
    path: /^\/data\/spellcasting(?:\/|$)/,
    expect: 2,
    reason: 'a4-progression-without-slots：四象武僧、先祖守护者整块删 spellcasting',
  },
  {
    name: 's3a-pack-contents',
    station: 3,
    ids: ['item.priests-pack.phb', 'item.scholars-pack.phb', 'item.burglars-pack.phb'],
    path: /^\/data\/contents\//,
    expect: 3,
    reason: 'a15-contents-differ：3 个套组补内容物',
  },
  {
    name: 's3a-shawm',
    station: 3,
    ids: ['item.shawm.scag'],
    path: /^\/data\/value$/,
    expect: 1,
    reason: 'a15-value：芦笛 shawm 补 2 gp＝200 铜币',
  },
]
export const ADDED: Added[] = [
  { id: 'item.alms-box.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p151 祭司套组' },
  { id: 'item.block-of-incense.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p151 祭司套组' },
  { id: 'item.censer.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p151 祭司套组' },
  { id: 'item.vestments.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p151 祭司套组' },
  { id: 'item.little-bag-of-sand.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p151 学者套组' },
  { id: 'item.small-knife.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p151 学者套组' },
  { id: 'item.string-10-feet.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p151 窃贼套组' },
  { id: 'item.animal-feed-1-day.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p150 饲料表' },
  { id: 'item.flask-or-tankard.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p150 冒险用品表' },
  { id: 'item.jug-or-pitcher.phb', pack: 'dnd5e2014-srd', station: 3, basis: 'PHB p150 冒险用品表' },
]
export const ALLOW_REQUIRES: AllowRequires[] = []
