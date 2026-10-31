import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'
import type { TextBlock } from '../../src/schemas/text'

const reference = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R12_参考表对应.json'), 'utf8')) as Record<string, Array<{ mode: string; caption: string | null; rows: number; tableId: string | null; label: string | null; nestedIn: number | null }>>

type TableBlock = { mode: 'ref'; tableId: string; label: string } | { mode: 'inline'; caption: string | null; rows: number }
function tables(blocks: TextBlock[]): TableBlock[] {
  const out: TableBlock[] = []
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) { for (const item of value) walk(item); return }
    if (!value || typeof value !== 'object') return
    const rec = value as Record<string, unknown>
    if (rec.tableRef && typeof rec.tableRef === 'object') { const ref = rec.tableRef as { id: string; label: string }; out.push({ mode: 'ref', tableId: ref.id, label: ref.label }) }
    else if (rec.table && typeof rec.table === 'object') { const table = rec.table as { caption?: string; rows: unknown[] }; out.push({ mode: 'inline', caption: table.caption ?? null, rows: table.rows.length }) }
    for (const item of Object.values(rec)) walk(item)
  }
  walk(blocks)
  return out
}

describe('R12 表块', () => {
  const packs = loadAllPacks()
  const books = packs.flatMap((pack) => pack.entries).filter((entry) => entry.type === 'book')
  const ids = new Set(packs.flatMap((pack) => pack.entries.map((entry) => entry.id)))
  const packOf = new Map(packs.flatMap((pack) => pack.entries.map((entry) => [entry.id, pack.id] as const)))
  const bookPack = new Map(books.map((entry) => [entry.id, packOf.get(entry.id)!]))

  it('677 个表块（672 ref + 5 inline）与参考逐项一致', () => {
    let refs = 0, inline = 0
    const diff: string[] = []
    for (const entry of books) {
      const actual = tables(entry.data.text as TextBlock[])
      const expected = reference[entry.id] ?? []
      const normalized = expected.map((row) => row.mode === 'ref' ? { mode: 'ref' as const, tableId: row.tableId!, label: row.label! } : { mode: 'inline' as const, caption: row.caption, rows: row.rows })
      try { expect(actual).toEqual(normalized) } catch { diff.push(entry.id) }
      refs += actual.filter((row) => row.mode === 'ref').length
      inline += actual.filter((row) => row.mode === 'inline').length
    }
    expect(diff).toEqual([])
    expect(refs).toBe(672)
    expect(inline).toBe(5)
  })

  it('tableRef 目标存在且在本包或 SRD；输出无临时表节点', () => {
    const bad: string[] = []
    for (const entry of books) {
      for (const row of tables(entry.data.text as TextBlock[])) {
        if (row.mode !== 'ref') continue
        if (!ids.has(row.tableId)) bad.push(`${entry.id} ${row.tableId} 不存在`)
        else if (packOf.get(row.tableId) !== bookPack.get(entry.id) && packOf.get(row.tableId) !== 'dnd5e2014-srd') bad.push(`${entry.id} ${row.tableId} 跨包`)
      }
      const json = JSON.stringify(entry.data.text)
      for (const key of ['bookTable', 'bookGroup', 'tableGroup']) if (json.includes(key)) bad.push(`${entry.id} ${key}`)
    }
    expect(bad).toEqual([])
  })

  it('两个嵌套表紧跟外层之后', () => {
    const nested = Object.values(reference).flat().filter((row) => row.nestedIn !== null)
    expect(nested).toHaveLength(2)
    for (const rows of Object.values(reference)) for (const row of rows) if (row.nestedIn !== null) expect(rows[row.nestedIn + 1]).toEqual(row)
  })
})
