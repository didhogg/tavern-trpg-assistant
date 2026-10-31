import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

type Raw = Record<string, unknown>
const isObj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)
const CORE = new Set(['PHB', 'SCAG', 'MM', 'VGM', 'MTF', 'DMG', 'XGE', 'TCE', 'MPMM', 'BMT'])

/** 独立读来源：核心书里「行里套着子表」的表。 */
function sourceNested(): Array<{ parent: string; min: number; max: number; table: Raw }> {
  const file = JSON.parse(readFileSync(join(process.cwd(), 'reference/5etools-cn-main（数据库）/data/generated/gendata-tables.json'), 'utf8')) as { table?: Raw[]; tableGroup?: Array<{ tables?: Raw[]; source?: string; name?: string }> }
  const out: Array<{ parent: string; min: number; max: number; table: Raw }> = []
  const scan = (table: Raw, name: string, source: string): void => {
    if (!CORE.has(source)) return
    for (const row of Array.isArray(table.rows) ? table.rows : []) {
      if (!Array.isArray(row)) continue
      for (const cell of row.slice(1)) {
        if (!isObj(cell) || cell.type !== 'table') continue
        const [lo, hi] = String(row[0]).replace(/[–—−]/g, '-').split('-').map(Number)
        out.push({ parent: name, min: lo, max: hi ?? lo, table: cell })
      }
    }
  }
  for (const table of file.table ?? []) scan(table, String(table.name), String(table.source))
  for (const group of file.tableGroup ?? []) for (const table of group.tables ?? []) scan(table, String(group.name), String(group.source))
  return out
}

describe('R9 行内子表', () => {
  const entries = allEntries()
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  const nested = sourceNested()

  it('来源里只有 2 张行内子表：异能塑像（d8）与魔法护甲（d12）', () => {
    expect(nested.map((n) => [n.parent, n.min, n.max, String(n.table.caption)])).toEqual([['魔法物品表G', 12, 14, '异能塑像'], ['魔法物品表I', 76, 76, '魔法护甲']])
  })

  it('每张子表有独立的可掷表条目，行数、骰子、每行内容与来源一致；外层表对应行带 then', () => {
    const parents = entries.filter((entry) => entry.type === 'table' && ['魔法物品表G', '魔法物品表I'].includes(entry.name))
    expect(parents).toHaveLength(2)
    for (const n of nested) {
      const parent = parents.find((entry) => entry.name === n.parent)!
      const rows = parent.data.rows as Array<{ min: number; max: number; cells: string[]; then?: { table: string } }>
      const row = rows.filter((r) => r.min === n.min && r.max === n.max)
      expect(row).toHaveLength(1)
      const target = byId.get(row[0].then!.table)!
      expect(target.type).toBe('table')
      expect(target.name).toBe(`${n.parent}·${String(n.table.caption)}`)
      expect(target.data.kind).toBe('roll')
      const label = String((n.table.colLabels as string[])[0])
      expect(target.data.dice).toBe(label.replace(/^1(?=d)/, ''))
      const source = (n.table.rows as unknown[][])
      const actual = target.data.rows as Array<{ min: number; max: number; cells: string[] }>
      expect(actual).toHaveLength(source.length)
      const plain = (text: string): string => text.replace(/\{\{[a-z]+:[^|}]*\|([^}]*)\}\}/g, '$1')
      const cleanSource = (text: string): string => text.replace(/\{@\w+ ([^}|]*)[^}]*\}/g, '$1')
      source.forEach((src, i) => {
        const [lo, hi] = String(src[0]).replace(/[–—−]/g, '-').split('-').map(Number)
        expect([actual[i].min, actual[i].max]).toEqual([lo, hi ?? lo])
        expect(plain(actual[i].cells[0])).toBe(cleanSource(String(src[1])))
      })
    }
  })
})
