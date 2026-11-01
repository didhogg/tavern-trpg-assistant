import { rec } from './util'

/** 怪物读取器：挑战等级可以是数字，或 `{ value, lair, coven }`（巢穴/集会时的挑战等级）。 */
export const crValue = (cr: unknown): number => (typeof cr === 'number' ? cr : Number(rec(cr).value))
export const abilityMod = (score: number): number => Math.floor((score - 10) / 2)
/** 生命骰式的平均值（向下取整）：`4d8 + 4` → 22；读不了返回 undefined */
export function avgOf(formula: string): number | undefined {
  const m = /^\s*(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\s*$/.exec(formula)
  return m ? Math.floor((Number(m[1]) * (Number(m[2]) + 1)) / 2 + (m[3] === '-' ? -1 : 1) * Number(m[4] ?? 0)) : undefined
}
