import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'

type Raw = Record<string, unknown>
const obj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)

function sourceChapters(source: string): Raw[] {
  const file = JSON.parse(readFileSync(join(process.cwd(), 'reference/5etools-cn-main（数据库）/data/book', `book-${source.toLowerCase()}.json`), 'utf8')) as { bookData: Array<{ data: Raw[] }> }
  return file.bookData[0].data
}

/** 来源章节里所有不含行内标签的文字（名称与正文）。 */
function plainStrings(value: unknown, out: string[]): string[] {
  if (typeof value === 'string') { if (!value.includes('{') && value.trim().length >= 2) out.push(value.trim()); return out }
  if (Array.isArray(value)) { for (const item of value) plainStrings(item, out); return out }
  if (!obj(value)) return out
  for (const key of ['name', 'entries', 'entry', 'items']) if (key in value) plainStrings(value[key], out)
  return out
}

describe('R12 列表与内嵌块', () => {
  const books = loadAllPacks().flatMap((pack) => pack.entries).filter((entry) => entry.type === 'book')

  it('正文里没有空段落', () => {
    const empty: string[] = []
    const walk = (value: unknown, id: string): void => {
      if (Array.isArray(value)) { for (const item of value) walk(item, id); return }
      if (!obj(value)) return
      if (value.p === '') empty.push(id)
      for (const item of Object.values(value)) walk(item, id)
    }
    for (const entry of books) walk(entry.data.text, entry.id)
    expect(empty).toEqual([])
  })

  it('PHB「状态」章保留了内嵌块里的说明文字', () => {
    const entry = books.find((item) => item.id === 'book.conditions.phb')
    expect(JSON.stringify(entry?.data.text)).toContain('完整状态列表请参阅')
  })

  it('十本书的「制作组」章：来源里的每个名字与人名都在输出里（含列表套列表）', () => {
    const credits = books.filter((entry) => entry.name === '制作组')
    expect(credits).toHaveLength(10)
    const missing: string[] = []
    for (const entry of credits) {
      const source = String(entry.data.book)
      const id = String(entry.data.anchor).split('-')[1]
      const chapter = sourceChapters(source).find((item) => item.id === id)
      expect(chapter).toBeDefined()
      const text = JSON.stringify(entry.data.text)
      for (const value of plainStrings(chapter?.entries, [])) if (!text.includes(JSON.stringify(value).slice(1, -1))) missing.push(`${entry.id} ${value.slice(0, 40)}`)
    }
    expect(missing).toEqual([])
  })
})
