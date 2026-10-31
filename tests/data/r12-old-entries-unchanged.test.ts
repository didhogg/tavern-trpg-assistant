import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stableStringify } from '../../src/core/hash'
import { allEntries } from './r9-pack-helpers'

const before = JSON.parse(readFileSync(join(process.cwd(), 'tests/data/fixtures/r12-hashes-before.json'), 'utf8')) as Record<string, string>
const hash = (entry: { id: string; type: string; name: string; nameEn?: string; keywords: string[]; summary: string; data: unknown }): string => createHash('sha256').update(stableStringify([entry.id, entry.type, entry.name, entry.nameEn, entry.keywords, entry.summary, entry.data])).digest('hex')

// 表「魔法物品表G/I」各有一行指向新补的子表：只允许多出这两行的 then，其余字节不变
const THEN_ROWS: Record<string, [number, number]> = { 'table.magic-item-table-g.dmg': [12, 14], 'table.magic-item-table-i.dmg': [76, 76] }

describe('R12 已有条目不变', () => {
  it('快照里的每个 id 都还在，且哈希相同；book 条目不在快照里', () => {
    const entries = allEntries()
    const byId = new Map(entries.map((entry) => [entry.id, entry]))
    const diff: string[] = []
    for (const [id, expected] of Object.entries(before)) {
      const entry = byId.get(id)
      if (!entry) { diff.push(`${id} 缺失`); continue }
      const span = THEN_ROWS[id]
      const rows = span ? (entry.data.rows as Array<Record<string, unknown>>) : []
      const stripped = span ? { ...entry, data: { ...(entry.data as object), rows: rows.map((row) => (row.min === span[0] && row.max === span[1] ? Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'then')) : row)) } } : entry
      if (span && rows.filter((row) => row.min === span[0] && row.max === span[1] && row.then).length !== 1) diff.push(`${id} 没有恰好一行 then`)
      if (hash(stripped) !== expected) diff.push(`${id} 哈希变化`)
    }
    expect(diff).toEqual([])
    const books = entries.filter((entry) => entry.type === 'book')
    expect(books.filter((entry) => before[entry.id]).length).toBe(0)
  })
})
