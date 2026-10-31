import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

describe('R9 表内 {@table}', () => {
  it('所有表内 {@table} 都解析成 then，没有未解析', () => {
    const entries = allEntries()
    const ids = new Set(entries.map((entry) => entry.id))
    let tags = 0, unresolved = 0, thens = 0
    for (const entry of entries) {
      if (entry.type !== 'table') continue
      for (const row of (entry.data.rows as Array<{ cells?: string[]; then?: { table?: string } }>) ?? []) {
        for (const cell of row.cells ?? []) if (cell.includes('{@table')) { tags += 1; if (!row.then?.table) unresolved += 1 }
        if (row.then?.table) { thens += 1; expect(ids.has(row.then.table), row.then.table).toBe(true) }
      }
    }
    expect(tags).toBe(0)
    expect(unresolved).toBe(0)
    expect(thens).toBe(18)
  })
})
