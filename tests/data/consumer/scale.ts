import { arr, rec, str } from './util'
import type { Row } from './load'

/** 成长数值（advancement 里 kind=scaleValue）：scale 只记变化的等级，某级的值 = 不高于该级的最大键对应的值。 */
export function findScale(rows: Row[], id: string): { type: string; scale: Record<string, number | string> } | undefined {
  for (const r of rows) for (const a of arr(r.data.advancement).map(rec)) if (a.kind === 'scaleValue' && a.id === id) return { type: str(a.type), scale: rec(a.scale) as Record<string, number | string> }
  return undefined
}

export function scaleAt(s: { scale: Record<string, number | string> }, level: number): number | string | undefined {
  const keys = Object.keys(s.scale).map(Number).filter((k) => k <= level).sort((a, b) => a - b)
  return keys.length ? s.scale[String(keys[keys.length - 1])] : undefined
}
