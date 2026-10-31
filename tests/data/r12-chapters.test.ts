import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'

const reference = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R12_参考章节.json'), 'utf8')) as { chapters: Array<Record<string, unknown>>; totals: { perBook: Record<string, number> } }

describe('R12 章节条目', () => {
  const packs = loadAllPacks()
  const packOf = new Map(packs.flatMap((pack) => pack.entries.map((entry) => [entry.id, pack.id] as const)))
  const books = packs.flatMap((pack) => pack.entries).filter((entry) => entry.type === 'book')

  it('96 个 id 集合与参考一致', () => {
    expect(books).toHaveLength(96)
    expect(new Set(books.map((entry) => entry.id))).toEqual(new Set(reference.chapters.map((row) => String(row.id))))
  })

  it('名称、英文名、摘要、来源、页码、序号、锚点、包完全一致', () => {
    const byId = new Map(books.map((entry) => [entry.id, entry]))
    const diff: string[] = []
    for (const row of reference.chapters) {
      const entry = byId.get(String(row.id))
      if (!entry) { diff.push(`${row.id} 缺失`); continue }
      const data = entry.data as Record<string, unknown>
      const src = data.src as { book?: string; page?: number }
      const actual = { name: entry.name, nameEn: entry.nameEn, summary: entry.summary, source: src.book, page: src.page, book: data.book, order: data.order, ordinal: data.ordinal ?? null, anchor: data.anchor, packId: packOf.get(entry.id) }
      const expected = { name: row.name, nameEn: row.nameEn, summary: row.summary, source: row.source, page: row.page ?? 0, book: row.source, order: row.order, ordinal: row.ordinal, anchor: row.anchor, packId: row.packId }
      for (const key of Object.keys(expected) as Array<keyof typeof expected>) { try { expect(actual[key]).toEqual(expected[key]) } catch { diff.push(`${row.id} ${key}`) } }
      if (entry.data.nameSuffix !== undefined) diff.push(`${row.id} nameSuffix`)
    }
    expect(diff).toEqual([])
  })

  it('每本书章数、SRD 无 book、14 个缺页章带 credit.missing', () => {
    const perBook: Record<string, number> = {}
    for (const entry of books) { const source = String((entry.data.src as { book?: string }).book); perBook[source] = (perBook[source] ?? 0) + 1 }
    expect(perBook).toEqual(reference.totals.perBook)
    expect(packs.find((pack) => pack.id === 'dnd5e2014-srd')!.entries.filter((entry) => entry.type === 'book')).toEqual([])
    const missing = books.filter((entry) => (entry.data.credit as { missing?: string[] }).missing?.includes('page'))
    expect(missing).toHaveLength(14)
  })
})
