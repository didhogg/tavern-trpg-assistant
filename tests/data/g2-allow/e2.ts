import type { Added, Allow, AllowRequires } from './types'

/** E2 子站（补充层数据文件产生的变化）的放行规则：每条用 `ids` 精确列条目，`expect` ＝ 条目数（来自 E_逐条站.md／规格，不是跑出来再抄）。 */
export const ALLOW: Allow[] = [
  {
    name: 'e2-1-condition-essentials',
    station: 2,
    ids: ['condition.prone.phb', 'condition.restrained.phb', 'condition.petrified.phb', 'condition.paralyzed.phb', 'condition.unconscious.phb'],
    path: /^\/data\/effects(?:\/|$)/,
    expect: 5,
    reason: 'b6-structured-missing 3→0、b6-text-missing 4→0；b6-against-text-only 预计升到 11',
  },
  {
    name: 'e2-2-against-autocrit',
    station: 2,
    ids: ['condition.blinded.phb', 'condition.invisible.phb', 'condition.prone.phb', 'condition.restrained.phb', 'condition.stunned.phb', 'condition.paralyzed.phb', 'condition.petrified.phb', 'condition.unconscious.phb'],
    path: /^\/data\/effects(?:\/|$)/,
    expect: 8,
    reason: 'b6-against-text-only 11→0：针对它的攻击优势/劣势/自动重击',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
