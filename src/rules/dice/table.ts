import { parseDice, type DiceTerm } from './parse'

export interface TableRowLike { min?: number; max?: number; cells: string[]; then?: { table: string; times?: number } }
export interface TableDataLike { dice?: string; modifier?: { prompt: string }; rows: TableRowLike[] }
export interface TableRoll { formula: string; total: number; rowIndex: number | null; text: string; then?: { table: string; times: number } }

function rollTerm(term: DiceTerm, rng: () => number): number {
  if (term.kind === 'const') return term.sign * term.value
  let sum = 0
  for (let i = 0; i < term.count; i++) sum += 1 + Math.floor(rng() * term.sides)
  return term.sign * sum
}

/** 只掷一个骰式，不查表；单元格里的 `{{roll:…}}` 也用它。 */
export function rollExpression(formula: string, rng: () => number, modifier = 0): number {
  const parsed = parseDice(formula)
  return (parsed.ok ? parsed.terms.reduce((n, t) => n + rollTerm(t, rng), 0) : 0) + modifier
}

/** 按 `min ≤ total ≤ max` 命中一行；没有命中返回 rowIndex: null，不抛错。 */
export function rollTable(table: TableDataLike, rng: () => number, modifier = 0): TableRoll {
  const formula = table.dice ?? '1'
  const total = rollExpression(formula, rng, modifier)
  const index = table.rows.findIndex((r) => (r.min === undefined || total >= r.min) && (r.max === undefined || total <= r.max))
  const row = index >= 0 ? table.rows[index] : undefined
  return {
    formula, total, rowIndex: index >= 0 ? index : null, text: row?.cells.join('／') ?? '没有对应的行',
    ...(row?.then ? { then: { table: row.then.table, times: row.then.times ?? 1 } } : {}),
  }
}

export function tableCopyText(results: Array<{ label: string; roll: TableRoll }>, opts: { multiColumn?: boolean } = {}): string {
  void opts
  if (!results.length) return ''
  if (results.length === 1) {
    const r = results[0]
    return `${r.label}：${r.roll.formula} = ${r.roll.total}${r.roll.text ? ` ${r.roll.text}` : ''}${r.roll.then ? ` → ${r.roll.then.table}` : ''}`
  }
  return results.map((r) => `${r.label}：${r.roll.text}${r.roll.then ? ` → ${r.roll.then.table}` : ''}`).join('\n')
}
