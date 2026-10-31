import type { Raw } from '../extract/load'
import type { FluffRecord } from '../extract/fluff'
import type { PlannedEntry } from './plan'
import type { R9PlanResult } from './planR9'
import type { BookData } from '../extract/books'
import { BOOK_BY_SOURCE, PACK_BY_SOURCE } from '../config/books'
import { slug } from '../lib/slug'
import { addRef, type RefIndex } from '../markup/inline'
import type { R12OutlineItem, R12PlanResult, R12Stats } from './r12Types'

const SKIP = new Set(['table', 'tableGroup', 'image', 'gallery', 'statblock', 'list'])
const SOURCES = new Set(['PHB', 'SCAG', 'MM', 'VGM', 'MTF', 'DMG', 'XGE', 'TCE', 'MPMM', 'BMT'])
const WHITELIST = new Set(['entries', 'section', 'inset', 'insetReadaloud', 'statblock', 'table', 'tableGroup', 'list', 'item', 'itemSub', 'quote', 'image', 'internal', 'gallery', 'square', 'none', 'abilityGeneric', 'inlineBlock', 'cell', 'row'])
const TAGTYPE: Record<string, string> = { creature: 'monster', spell: 'spell', item: 'item', race: 'race', subclass: 'subclass', optfeature: 'feature', reward: 'reward', feat: 'feat', condition: 'condition', trap: 'hazard', hazard: 'hazard', background: 'background', class: 'class', action: 'rule:action', variantrule: 'rule:variant', object: 'object', deity: 'deity', disease: 'disease' }
const obj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string => typeof v === 'string' ? v : ''

export interface R12Options { embeds: boolean; tables: boolean }
export interface R12Input { books: BookData[]; fluff: FluffRecord[]; r9: R9PlanResult; existing: PlannedEntry[]; options?: R12Options }

interface RefItem { tag: string; name: string; nameEn?: string; source?: string }

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

function sameName(node: Raw, item: Raw): boolean {
  const name = str(node.name), en = str(node.ENG_name)
  const itemName = str(item.name), itemEn = str(item.ENG_name)
  if (!name && !en) return true
  return name === itemName || en === itemEn || en === itemName || name === itemEn
}

function unwrap(value: unknown, item: Raw): unknown[] {
  const list = Array.isArray(value) ? value : value === undefined ? [] : [value]
  const first = list[0]
  if (obj(first) && (first.type === 'section' || first.type === 'entries') && str(first.name) && sameName(first, item)) {
    const inner = Array.isArray(first.entries) ? first.entries : first.entries === undefined ? [] : [first.entries]
    return [...inner, ...list.slice(1)]
  }
  return list
}

function makeIndex(entries: PlannedEntry[], r9: R9PlanResult): RefIndex {
  const index: RefIndex = { byTypeName: new Map(), byTypeNameSource: new Map() }
  for (const entry of [...entries, ...r9.tables]) {
    const category = entry.context.ruleCategory
    addRef(index, { id: entry.id, type: entry.type, name: entry.name, packId: entry.packId, category }, entry.source)
    if (entry.nameEn && entry.nameEn !== entry.name) addRef(index, { id: entry.id, type: entry.type, name: entry.nameEn, packId: entry.packId, category }, entry.source)
  }
  return index
}

function resolve(index: RefIndex, type: string, name: string, enName: string, src: string | undefined, book: string): string | undefined {
  for (const nm of [name, enName]) {
    const key = `${type}|${nm}`
    const target = (src ? index.byTypeNameSource.get(`${key}|${src.toUpperCase()}`) : undefined) ?? index.byTypeNameSource.get(`${key}|${book}`) ?? index.byTypeName.get(key)?.[0] ?? (type.startsWith('rule:') ? index.byTypeName.get(`rule|${nm}`)?.[0] : undefined)
    if (target) return target.id
  }
  return undefined
}

function rewrite(value: unknown, input: R12Input, index: RefIndex, source: string, stats: R12Stats): unknown {
  if (Array.isArray(value)) {
    const out: unknown[] = []
    let pending: RefItem[] = []
    const flush = (): void => { if (pending.length) { out.push({ type: 'bookRefList', items: pending }); pending = [] } }
    for (const item of value) {
      if (!obj(item) || item.type !== 'statblock') { flush(); out.push(rewrite(item, input, index, source, stats)); continue }
      stats.statblocks += 1
      const tag = str(item.tag)
      const fluff = item.prop === 'monsterFluff'
      if (tag) {
        stats.statblockRefs += 1
        pending.push({ tag, name: str(item.name), ...(str(item.ENG_name) ? { nameEn: str(item.ENG_name) } : {}), ...(str(item.source) ? { source: str(item.source) } : {}) })
        let target = resolve(index, TAGTYPE[tag], str(item.name), str(item.ENG_name), str(item.source) || undefined, source)
        if (!target && tag === 'race') {
          const match = /^(.*?) \((.*)\)$/.exec(str(item.ENG_name))
          if (match) target = resolve(index, 'subrace', `${match[2]} ${match[1]}`, `${match[2]} ${match[1]}`, str(item.source) || undefined, source)
        }
        if (!target) throw new Error(`R12 statblock 未解析：${source} ${str(item.ENG_name)}`)
      }
      if (fluff) {
        stats.fluffEmbeds += 1
        flush()
        const record = input.fluff.find((row) => row.kind === 'monster' && row.raw.source === item.source && (row.raw.ENG_name === item.ENG_name || row.raw.name === item.name))
        if (!record) throw new Error(`R12 背景文字未找到：${source} ${str(item.ENG_name)}`)
        const cloned = structuredClone(record.raw.entries)
        out.push(...(rewrite(unwrap(cloned, item), input, index, source, stats) as unknown[]))
      }
      if (!tag && !fluff) throw new Error(`R12 statblock 既没有 tag 也没有 monsterFluff：${source}`)
    }
    flush()
    return out
  }
  if (!obj(value)) return value
  const type = str(value.type)
  if (type === 'table' || type === 'tableGroup') stats.tableBlocks += 1
  if (type === 'image' || type === 'internal' || type === 'gallery' || type === 'square' || type === 'none') stats.images += 1
  if (!type && !value.name && !value.entries) stats.metadata += 1
  const copy: Raw = { ...value }
  for (const [key, item] of Object.entries(value)) if (item && typeof item === 'object') copy[key] = rewrite(item, input, index, source, stats)
  return copy
}

export function planR12(input: R12Input): R12PlanResult {
  const options = input.options ?? { embeds: true, tables: true }
  const entries: R12PlanResult['entries'] = []
  const stats: R12Stats = { chapters: 0, statblocks: 0, statblockRefs: 0, fluffEmbeds: 0, tableBlocks: 0, tableRefs: 0, inlineTables: 0, images: 0, metadata: 0 }
  const index = makeIndex(input.existing, input.r9)
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
      const rewritten = options.embeds ? rewrite(chapter.entries, input, index, book.source, stats) : structuredClone(chapter.entries)
      const raw: Raw = { ...chapter, _chapter: { ...structuredClone(chapter), entries: rewritten }, _outline: outline, _order: order, ...(ordinal ? { _ordinal: ordinal } : {}), _anchor: anchor, _summary: summaryOf(book.source, ordinal) }
      entries.push({ key: `book|${book.source}|${order}|${id}`, type: 'book', raw, source: book.source, packId: PACK_BY_SOURCE.get(book.source)!, srd: false, name: str(chapter.name), nameEn: str(chapter.ENG_name), page, id, missingName: false, missingPage: page === 0, context: {} })
      stats.chapters += 1
    }
  }
  if (options.tables) { /* table rewrite is added in stage D; keep this flag explicit */ }
  return { entries, stats }
}
