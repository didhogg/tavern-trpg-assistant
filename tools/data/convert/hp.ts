/**
 * 怪物生命值的整理（G3 续做 §12.6）：
 * - 原书是纯数字却放在 special 里（如 "58"）→ 写成固定值；
 * - 原书没给生命值（没有固定值也没有 special）→ 写 special「原书未给出」，不留一个让人误会的 0；
 * - 其余 special（召唤物随环阶变化等）原样保留。
 */
export interface MonsterHp { average: number; formula?: string; special?: string }

export const HP_NOT_GIVEN = '原书未给出'

export function normalizeHp(average: number, formula: string, special: string): MonsterHp {
  const withFormula = formula ? { formula } : {}
  if (!(average > 0)) {
    const n = /^\s*(\d+)\s*$/.exec(special)
    if (n) return { average: Number(n[1]), ...withFormula }
    if (!special) return { average: 0, ...withFormula, special: HP_NOT_GIVEN }
  }
  return { average, ...withFormula, ...(special ? { special } : {}) }
}
