const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

// ---------- 随机表 ----------
export interface TableView {
  caption?: string
  colLabels: string[]
  rows: unknown[][]
  dice: string | null
}

const TABLE_DICE = /(\d*)d(\d+)/i

function diceOfTable(colLabels: string[], rows: unknown[][]): string | null {
  for (const label of colLabels) {
    const m = label.match(TABLE_DICE)
    if (m) return `${m[1] || '1'}d${m[2]}`
  }
  for (const row of rows) {
    const m = String(row[0] ?? '').match(TABLE_DICE)
    if (m) return `${m[1] || '1'}d${m[2]}`
  }
  return null
}

/** 从 raw 数据里读一张 5etools 表；不是表就返回 null。 */
export function tableView(value: unknown): TableView | null {
  if (!isObj(value) || value.type !== 'table' || !Array.isArray(value.rows) || !Array.isArray(value.colLabels)) return null
  const colLabels = value.colLabels.map(String)
  const rows = (value.rows as unknown[][]).filter(Array.isArray)
  return {
    ...(typeof value.caption === 'string' ? { caption: value.caption } : {}),
    colLabels,
    rows,
    dice: diceOfTable(colLabels, rows),
  }
}

/** 从一棵 raw 数据里找出全部表（顶层表、书/冒险/职业条目里嵌套的表）。 */
export function findTables(value: unknown): TableView[] {
  const out: TableView[] = []
  const walk = (v: unknown): void => {
    const t = tableView(v)
    if (t) { out.push(t); return }
    if (Array.isArray(v)) { for (const x of v) walk(x); return }
    if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x)
  }
  walk(value)
  return out
}

/** 按骰值找一行；只按第一列的数字/范围匹配，不猜。 */
export function rollTable(table: TableView, value: number): unknown[] | null {
  for (const row of table.rows) {
    const text = String(row[0] ?? '')
    const m = text.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/)
    if (!m) continue
    const lo = Number(m[1])
    const hi = Number(m[2] ?? m[1])
    if (value >= lo && value <= hi) return row
  }
  return null
}
