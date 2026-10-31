import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'
import type { TextBlock } from '../../src/schemas/text'

const reference = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R12_参考小节目录.json'), 'utf8')) as Record<string, Array<Record<string, unknown>>>
const SOURCES = ['PHB', 'SCAG', 'MM', 'VGM', 'MTF', 'DMG', 'XGE', 'TCE', 'MPMM', 'BMT']
const SKIP = new Set(['table', 'tableGroup', 'image', 'gallery', 'statblock', 'list'])

function plainTitle(input: string): string {
  let out = input
  for (let i = 0; i < 8 && out.includes('{@'); i++) out = out.replace(/\{@\w+ ([^{}]*)\}/g, (_m, inner: string) => inner.split('|')[0])
  return out
}

function independent(source: string): Record<string, Array<Record<string, unknown>>> {
  const data = JSON.parse(readFileSync(join(process.cwd(), 'reference/5etools-cn-main（数据库）/data/book', `book-${source.toLowerCase()}.json`), 'utf8')) as { bookData: Array<{ data: Array<Record<string, unknown>> }> }
  const books = JSON.parse(readFileSync(join(process.cwd(), 'reference/5etools-cn-main（数据库）/data/books.json'), 'utf8')) as { book: Array<{ source: string; contents: Array<Record<string, unknown>> }> }
  const contents = books.book.find((book) => book.source === source)!.contents
  const out: Record<string, Array<Record<string, unknown>>> = {}
  for (const [order, chapter] of data.bookData[0].data.entries()) {
    const id = `book.${String(contents[order].ENG_name).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\+\s*(\d+)/g, ' plus $1 ').replace(/['’`]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-')}.${source.toLowerCase()}`
    const chapterAnchor = `${source.toLowerCase()}-${String(chapter.id)}`
    const list: Array<Record<string, unknown>> = [{ anchor: chapterAnchor, parent: null, level: 0, kind: 'section', title: plainTitle(String(chapter.name)), titleEn: chapter.ENG_name ? plainTitle(String(chapter.ENG_name)) : null, page: chapter.page ?? null }]
    const walk = (value: unknown, parent: string, level: number): void => {
      if (Array.isArray(value)) { for (const item of value) walk(item, parent, level); return }
      if (!value || typeof value !== 'object') return
      const node = value as Record<string, unknown>
      if (SKIP.has(String(node.type))) return
      let nextParent = parent
      let nextLevel = level
      if (['section', 'entries', 'inset'].includes(String(node.type)) && node.name) {
        const anchor = `${source.toLowerCase()}-${String(node.id)}`
        list.push({ anchor, parent, level: level + 1, kind: node.type, title: plainTitle(String(node.name)), titleEn: node.ENG_name ? plainTitle(String(node.ENG_name)) : null, page: node.page ?? null })
        nextParent = anchor
        nextLevel = level + 1
      }
      for (const item of Object.values(node)) if (item && typeof item === 'object') walk(item, nextParent, nextLevel)
    }
    walk(chapter.entries, chapterAnchor, 0)
    out[id] = list
  }
  return out
}

describe('R12 小节目录与锚点', () => {
  const books = loadAllPacks().flatMap((pack) => pack.entries).filter((entry) => entry.type === 'book')
  it('96 章目录逐项等于参考文件，总数 4,501', () => {
    expect(books).toHaveLength(96)
    expect(books.reduce((n, entry) => n + (entry.data.outline as unknown[]).length, 0)).toBe(4501)
    const diff: string[] = []
    for (const entry of books) {
      const actual = (entry.data.outline as Array<Record<string, unknown>>).map((item) => ({ ...item, parent: item.parent ?? null, titleEn: item.titleEn ?? null, page: item.page ?? null }))
      try { expect(actual).toEqual(reference[entry.id]) } catch { diff.push(entry.id) }
    }
    expect(diff).toEqual([])
  })

  it('独立重算目录与输出相等', () => {
    const expected = Object.assign({}, ...SOURCES.map((source) => independent(source)))
    const diff: string[] = []
    for (const entry of books) {
      const actual = (entry.data.outline as Array<Record<string, unknown>>).map((item) => ({ ...item, parent: item.parent ?? null, titleEn: item.titleEn ?? null, page: item.page ?? null }))
      try { expect(actual).toEqual(expected[entry.id]) } catch { diff.push(entry.id) }
    }
    expect(diff).toEqual([])
  })

  it('锚点格式、唯一、parent 与 level 关系', () => {
    const anchors = new Set<string>()
    const bad: string[] = []
    for (const entry of books) {
      const outline = entry.data.outline as Array<{ anchor: string; parent?: string; level: number }>
      if (!/^(phb|scag|mm|vgm|mtf|dmg|xge|tce|mpmm|bmt)-[0-9a-f]{3}$/.test(outline[0].anchor)) bad.push(`${entry.id} 章锚点`)
      if (outline[0].parent !== undefined || outline[0].level !== 0) bad.push(`${entry.id} 第 0 项`)
      for (const item of outline) {
        if (anchors.has(item.anchor)) bad.push(`${item.anchor} 重复`)
        anchors.add(item.anchor)
        if (!item.parent) continue
        const parent = outline.find((x) => x.anchor === item.parent)
        if (!parent) bad.push(`${item.anchor} parent 不存在`)
        else if (item.level !== parent.level + 1) bad.push(`${item.anchor} level`)
      }
    }
    expect(bad).toEqual([])
  })

  it('正文 h 锚点与目录第 1 项起一一对应，章标题不在 text', () => {
    const bad: string[] = []
    for (const entry of books) {
      const anchors: string[] = []
      const walk = (blocks: TextBlock[]): void => {
        for (const block of blocks) {
          if ('h' in block) { if (block.anchor) anchors.push(block.anchor); walk(block.body) }
          else if ('read' in block) walk(block.read)
        }
      }
      walk(entry.data.text as TextBlock[])
      const outline = entry.data.outline as Array<{ anchor: string }>
      if (JSON.stringify(anchors) !== JSON.stringify(outline.slice(1).map((item) => item.anchor))) bad.push(entry.id)
    }
    expect(bad).toEqual([])
  })
})
