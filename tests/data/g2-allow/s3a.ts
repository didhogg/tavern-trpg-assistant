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
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
