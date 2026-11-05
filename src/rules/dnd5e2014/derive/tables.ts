/**
 * 规则数值表（T2）：经验值、熟练加值、购点成本、全施法者法术位……一律读库里的表与条目，代码里不写这些数。
 * 这里只有"怎么从库里的表读出来"的纯函数；读不到的就是空——界面不显示，不回退到手写。
 * 表按**列的键**认（`columns[].key`：cr / xp / level / proficiencyBonus），不按编号、不按中文列名。
 */
import type { ClassData } from '../data/entries/character'

export interface RuleTables {
  /** 挑战等级（数字，1/8 = 0.125）→ 经验值。 */
  xpByCr: Record<string, number>
  /** 角色等级 1–20 → 熟练加值（下标 = 等级 − 1）。 */
  profByLevel: number[]
  /** 挑战等级 → 熟练加值（怪物）。 */
  profByCr: Record<string, number>
  /** 属性值 → 购点花费。 */
  buyCost: Record<number, number>
  /** 全施法者 1–20 级的 1–9 环法术位（取任一全施法职业的法术位表）。 */
  fullCasterSlots?: number[][]
}

export const emptyTables = (): RuleTables => ({ xpByCr: {}, profByLevel: [], profByCr: {}, buyCost: {} })
export const crKey = (cr: number): string => String(cr)

type Row = { cells?: unknown; values?: Record<string, unknown> }
export interface TableLike { columns?: Array<{ key?: string }>; rows?: Row[] }
const keysOf = (table: TableLike): string[] => (table.columns ?? []).map((c) => c.key ?? '')
export const hasColumns = (table: TableLike, ...want: string[]): boolean => { const have = keysOf(table); return want.every((w) => have.includes(w)) }

/** 挑战等级 → 经验值。`0或10` 这种写成两个数的取较大的（有攻击则 10）。 */
export function parseXpTable(table: TableLike): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of table.rows ?? []) {
    const cr = row.values?.crValue
    const xp = row.values?.xp
    const value = Array.isArray(xp) ? Math.max(...xp.filter((n): n is number => typeof n === 'number')) : xp
    if (typeof cr === 'number' && typeof value === 'number' && Number.isFinite(value)) out[crKey(cr)] = value
  }
  return out
}

/** 角色等级 → 熟练加值（下标 = 等级 − 1；缺的等级读不到就整张表作废）。 */
export function parseProfByLevel(table: TableLike): number[] {
  const out: number[] = []
  for (const row of table.rows ?? []) {
    const level = row.values?.level
    const bonus = row.values?.proficiencyBonus
    if (typeof level === 'number' && typeof bonus === 'number') out[level - 1] = bonus
  }
  return out.length >= 20 && out.slice(0, 20).every((n) => typeof n === 'number') ? out.slice(0, 20) : []
}

export function parseProfByCr(table: TableLike): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of table.rows ?? []) {
    const cr = row.values?.crValue
    const bonus = row.values?.proficiencyBonus
    if (typeof cr === 'number' && typeof bonus === 'number') out[crKey(cr)] = bonus
  }
  return out
}

/** 购点花费表：每行 [属性值, 花费, 属性值, 花费]（两栏并排）。 */
export function parseBuyCosts(table: TableLike): Record<number, number> {
  const out: Record<number, number> = {}
  for (const row of table.rows ?? []) {
    const cells = Array.isArray(row.cells) ? row.cells.map((c) => Number(String(c).trim())) : []
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const score = cells[i]!
      const cost = cells[i + 1]!
      if (Number.isInteger(score) && Number.isInteger(cost)) out[score] = cost
    }
  }
  return out
}

/** 取任一全施法者职业的法术位表（职业条目自己的 `slotsByLevel`）。 */
export function fullCasterSlotsOf(classes: Iterable<ClassData>): number[][] | undefined {
  for (const entry of classes) {
    const sc = entry.spellcasting
    if (sc?.progression !== 'full' || !sc.slotsByLevel || sc.slotsByLevel.length < 20) continue
    const rows = sc.slotsByLevel.map((r) => ('slots' in r ? r.slots : undefined))
    if (rows.every((r): r is number[] => Array.isArray(r))) return rows
  }
  return undefined
}
