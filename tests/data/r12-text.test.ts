import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'

const SOURCES = ['PHB', 'SCAG', 'MM', 'VGM', 'MTF', 'DMG', 'XGE', 'TCE', 'MPMM', 'BMT']
const WHITELIST = new Set(['entries', 'section', 'inset', 'insetReadaloud', 'statblock', 'table', 'tableGroup', 'list', 'item', 'itemSub', 'quote', 'image', 'internal', 'gallery', 'square', 'none', 'abilityGeneric', 'inlineBlock', 'cell', 'row'])
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

function sourceStats(): { quoteFrom: number; abilityGeneric: string[]; types: Set<string> } {
  let quoteFrom = 0
  const abilityGeneric: string[] = []
  const types = new Set<string>()
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) { for (const item of value) walk(item); return }
    if (!obj(value)) return
    const type = String(value.type ?? '')
    if (type) types.add(type)
    if (type === 'quote' && value.from) quoteFrom += 1
    if (type === 'abilityGeneric' && typeof value.entry === 'string') abilityGeneric.push(value.entry)
    for (const item of Object.values(value)) if (item && typeof item === 'object') walk(item)
  }
  for (const source of SOURCES) {
    const file = JSON.parse(readFileSync(join(process.cwd(), 'reference/5etools-cn-main（数据库）/data/book', `book-${source.toLowerCase()}.json`), 'utf8')) as { bookData: Array<{ data: Array<Record<string, unknown>> }> }
    for (const chapter of file.bookData[0].data) walk(chapter.entries)
  }
  return { quoteFrom, abilityGeneric, types }
}

describe('R12 正文', () => {
  const books = loadAllPacks().flatMap((pack) => pack.entries).filter((entry) => entry.type === 'book')
  const stats = sourceStats()
  it('输出没有图片/statblock/bookRefList/bookTable/tableGroup', () => {
    const bad: string[] = []
    for (const entry of books) {
      const json = JSON.stringify(entry.data.text)
      for (const key of ['"image"', '"internal"', '"gallery"', '"square"', '"none"', '"statblock"', '"bookRefList"', '"bookTable"', '"tableGroup"']) if (json.includes(key)) bad.push(`${entry.id} ${key}`)
    }
    expect(bad).toEqual([])
  })

  it('8 处 quote.from 与 1 处 abilityGeneric 都在输出里', () => {
    expect(stats.quoteFrom).toBe(8)
    expect(stats.abilityGeneric).toHaveLength(1)
    const text = JSON.stringify(books.map((entry) => entry.data.text))
    expect(text).toContain(stats.abilityGeneric[0])
    let quotes = 0
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) { for (const item of value) walk(item); return }
      if (!obj(value)) return
      if (typeof value.quote === 'string' && typeof value.by === 'string') quotes += 1
      for (const item of Object.values(value)) walk(item)
    }
    for (const entry of books) walk(entry.data.text)
    expect(quotes).toBeGreaterThanOrEqual(8)
  })

  it('来源块类型都在白名单内', () => {
    expect([...stats.types].filter((type) => !WHITELIST.has(type))).toEqual([])
  })
})
