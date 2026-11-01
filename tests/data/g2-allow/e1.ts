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
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
