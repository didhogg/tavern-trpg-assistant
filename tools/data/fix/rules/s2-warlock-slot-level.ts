import type { Rule } from '../engine'

const SLOT_BY_LEVEL = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

export const RULE: Rule = {
  name: 's2-warlock-slot-level',
  expectCount: 1,
  apply(packs): string[] {
    const entry = packs.flatMap((pack) => pack.entries).find((row) => row.id === 'class.warlock.phb')
    if (!entry) throw new Error('缺少 class.warlock.phb')
    const table = entry.data.table as { rows?: Array<{ level?: number; values?: unknown[] }> } | undefined
    const rows = table?.rows
    if (!Array.isArray(rows) || rows.length !== 20) throw new Error(`魔契师职业表应有 20 行，实际 ${rows?.length ?? 0}`)
    let changed = 0
    rows.forEach((row, i) => {
      const value = row.values?.[3]
      if (typeof value !== 'string') throw new Error(`魔契师第 ${i + 1} 行环阶列不是字符串`)
      const match = /^(\d+)(?:环|th)$/.exec(value)
      if (!match) throw new Error(`魔契师第 ${i + 1} 行环阶列无法识别：${value}`)
      if (match[1] !== String(SLOT_BY_LEVEL[i])) throw new Error(`魔契师第 ${i + 1} 行环阶与 PHB 序列不符：${value}`)
      const next = `${match[1]}环`
      if (value !== next) { row.values![3] = next; changed += 1 }
    })
    if (changed !== 12) throw new Error(`魔契师环阶列应改 12 个单元格，实际 ${changed}`)
    return ['class.warlock.phb']
  },
}
