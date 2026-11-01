import type { Rule } from '../engine'

const TABLES = new Set(['table.dmg-p82-r1', 'table.dmg-p84-r1'])

export const RULE: Rule = {
  name: 's2-table-level-labels',
  expectCount: 2,
  apply(packs): string[] {
    const changed = new Set<string>()
    let cells = 0
    for (const pack of packs) for (const entry of pack.entries) {
      if (!TABLES.has(entry.id)) continue
      const table = entry.data as { rows?: Array<{ cells?: unknown[]; values?: { level?: unknown } }> }
      const rows = table.rows
      if (!Array.isArray(rows) || rows.length !== 20) throw new Error(`${entry.id} 应有 20 行，实际 ${rows?.length ?? 0}`)
      rows.forEach((row, i) => {
        const level = row.values?.level
        if (typeof level !== 'number' || level !== i + 1) throw new Error(`${entry.id} 第 ${i + 1} 行 values.level 不是 ${i + 1}`)
        const cell = row.cells?.[0]
        if (typeof cell !== 'string') throw new Error(`${entry.id} 第 ${i + 1} 行等级列不是字符串`)
        const match = /^(\d+)(?:环|st|nd|rd|th)$/.exec(cell)
        if (!match || match[1] !== String(level)) throw new Error(`${entry.id} 第 ${i + 1} 行等级列与行号不符：${cell}`)
        const next = String(level)
        if (cell !== next) { row.cells![0] = next; cells += 1 }
      })
      changed.add(entry.id)
    }
    if (cells !== 40) throw new Error(`等级列应改 40 个单元格，实际 ${cells}`)
    return [...changed]
  },
}
