import type { Added, Allow, AllowRequires } from './types'

/** U5R 批 1：法术加值效果（补充层 U5R-法术-加值效果.json）。`expect` ＝ 条目数，来自规格 §12.2，不是跑出来再抄。 */
export const ALLOW: Allow[] = [
  {
    name: 'u5r-1-spell-roll-bonus',
    station: 5,
    ids: ['spell.bless.phb', 'spell.guidance.phb', 'spell.resistance.phb', 'spell.shield-of-faith.phb', 'spell.barkskin.phb'],
    path: /^\/data\/effects(?:\/|$)/,
    expect: 5,
    reason: '祝福术 / 神导术 / 抗御术（rollBonus）、信仰护盾 / 树肤术（ac）：正文里的加值变结构化',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
