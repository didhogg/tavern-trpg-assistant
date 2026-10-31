import type { Raw } from '../extract/load'
import type { FluffRecord } from '../extract/fluff'
import type { PlannedEntry } from './plan'
import type { R9PlanResult } from './planR9'
import type { BookData } from '../extract/books'
import { BOOK_BY_SOURCE, PACK_BY_SOURCE } from '../config/books'
import { slug } from '../lib/slug'
import type { R12OutlineItem, R12PlanResult, R12Stats } from './r12Types'

const SKIP = new Set(['table', 'tableGroup', 'image', 'gallery', 'statblock', 'list'])
const SOURCES = new Set(['PHB', 'SCAG', 'MM', 'VGM', 'MTF', 'DMG', 'XGE', 'TCE', 'MPMM', 'BMT'])
const WHITELIST = new Set(['entries', 'section', 'inset', 'insetReadaloud', 'statblock', 'table', 'tableGroup', 'list', 'item', 'itemSub', 'quote', 'image', 'internal', 'gallery', 'square', 'none', 'abilityGeneric', 'inlineBlock', 'cell', 'row'])
const obj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string => typeof v === 'string' ? v : ''

export interface R12Options { embeds: boolean; tables: boolean }
export interface R12Input { books: BookData[]; fluff: FluffRecord[]; r9: R9PlanResult; existing: PlannedEntry[]; options?: R12Options }

function plainTitle(input: string): string {
  let out = input
  for (let i = 0; i < 8 && out.includes('{@'); i++) out = out.replace(/\{@\w+ ([^{}]*)\}/g, (_m, inner: string) => inner.split('|')[0])
  return out
}

function collectOutline(ch: Raw, source: string): R12OutlineItem[] {
  const chapterAnchor = `${source.toLowerCase()}-${str(ch.id)}`
  const out: R12OutlineItem[] = [{ anchor: chapterAnchor, level: 0, kind: 'section', title: plainTitle(str(ch.name)), ...(str(ch.ENG_name) ? { titleEn: plainTitle(str(ch.ENG_name)) } : {}), ...(typeof ch.page === 'number' ? { page: ch.page } : {}) }]
  const walk = (value: unknown, parent: string, level: number): void => {
    if (Array.isArray(value)) { for (const item of value) walk(item, parent, level); return }
    if (!obj(value) || SKIP.has(str(value.type))) return
    let nextParent = parent
    let nextLevel = level
    if (['section', 'entries', 'inset'].includes(str(value.type)) && str(value.name)) {
      const anchor = `${source.toLowerCase()}-${str(value.id)}`
      out.push({ anchor, parent, level: level + 1, kind: str(value.type) as R12OutlineItem['kind'], title: plainTitle(str(value.name)), ...(str(value.ENG_name) ? { titleEn: plainTitle(str(value.ENG_name)) } : {}), ...(typeof value.page === 'number' ? { page: value.page } : {}) })
      nextParent = anchor
      nextLevel = level + 1
    }
    for (const item of Object.values(value)) if (item && typeof item === 'object') walk(item, nextParent, nextLevel)
  }
  walk(ch.entries, chapterAnchor, 0)
  return out
}

function checkTypes(value: unknown, source: string): void {
  if (Array.isArray(value)) { for (const item of value) checkTypes(item, source); return }
  if (!obj(value)) return
  const type = str(value.type)
  if (type && !WHITELIST.has(type)) throw new Error(`R12 白名单外的块类型 ${type}（${source}）`)
  for (const item of Object.values(value)) if (item && typeof item === 'object') checkTypes(item, source)
}

function ordinalOf(value: unknown): { type: 'chapter' | 'appendix'; identifier?: number | string } | undefined {
  if (!obj(value)) return undefined
  const type = value.type === 'appendix' ? 'appendix' : value.type === 'chapter' ? 'chapter' : undefined
  if (!type) return undefined
  const id = value.identifier
  return { type, ...(typeof id === 'number' || typeof id === 'string' ? { identifier: id } : {}) }
}

function summaryOf(source: string, ordinal: ReturnType<typeof ordinalOf>): string {
  const book = BOOK_BY_SOURCE.get(source)?.name ?? source
  if (!ordinal) return book
  if (ordinal.type === 'chapter') return `${book} · 第${ordinal.identifier ?? ''}章`
  return `${book} · 附录${ordinal.identifier ?? ''}`
}

export function planR12(input: R12Input): R12PlanResult {
  const options = input.options ?? { embeds: true, tables: true }
  const entries: R12PlanResult['entries'] = []
  const stats: R12Stats = { chapters: 0, statblocks: 0, statblockRefs: 0, fluffEmbeds: 0, tableBlocks: 0, tableRefs: 0, inlineTables: 0, images: 0, metadata: 0 }
  for (const book of input.books) {
    if (!SOURCES.has(book.source)) continue
    for (const [order, chapter] of book.chapters.entries()) {
      const content = book.contents[order]
      if (!obj(content)) throw new Error(`${book.source} contents[${order}] 不是对象`)
      const id = `book.${slug(str(content.ENG_name))}.${book.source.toLowerCase()}`
      const anchor = `${book.source.toLowerCase()}-${str(chapter.id)}`
      const outline = collectOutline(chapter, book.source)
      checkTypes(chapter.entries, book.source)
      const ordinal = ordinalOf(content.ordinal)
      const page = typeof chapter.page === 'number' ? chapter.page : 0
      const raw: Raw = { ...chapter, _chapter: structuredClone(chapter), _outline: outline, _order: order, ...(ordinal ? { _ordinal: ordinal } : {}), _anchor: anchor, _summary: summaryOf(book.source, ordinal) }
      entries.push({ key: `book|${book.source}|${order}|${id}`, type: 'book', raw, source: book.source, packId: PACK_BY_SOURCE.get(book.source)!, srd: false, name: str(chapter.name), nameEn: str(chapter.ENG_name), page, id, missingName: false, missingPage: page === 0, context: {} })
      stats.chapters += 1
    }
  }
  void input.fluff; void input.r9; void input.existing; void options
  return { entries, stats }
}
