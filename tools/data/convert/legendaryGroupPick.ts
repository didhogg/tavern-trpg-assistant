import { BOOK_BY_SOURCE } from '../config/books'

/** 传奇组只能从同层或更低层来源取；先按名字＋来源，再按名字/英文名。 */
export function pickLegendaryGroup(raw: Record<string, unknown>, groupRef: Record<string, unknown> | undefined, groups: Record<string, unknown>[]): Record<string, unknown> | undefined {
  if (!groupRef) return undefined
  const layer = BOOK_BY_SOURCE.get(String(raw.source))?.layer ?? Number.POSITIVE_INFINITY
  const allowed = groups.filter((g) => (BOOK_BY_SOURCE.get(String(g.source))?.layer ?? Number.POSITIVE_INFINITY) <= layer)
  return allowed.find((g) => String(g.name) === String(groupRef.name) && String(g.source) === String(groupRef.source))
    ?? allowed.find((g) => String(g.name) === String(groupRef.name) || String(g.ENG_name) === String(groupRef.ENG_name))
}
