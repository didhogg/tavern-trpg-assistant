import type { Entry } from '../../../src/schemas/pack'
import { hasHan, isBlocks, mapTableRefs, tableRefIds } from './cjk'
import { alignTables } from './tables'

type Rec = Record<string, unknown>
export type Reason = 'noEnglish' | 'enHasCjk' | 'enHasTag' | 'typeDiffers' | 'lengthDiffers' | 'tableRefDiffers'

export interface Miss { id: string; type: string; path: string; reason: Reason }
export interface TypeStats { entries: number; withEnglish: number; noEnglishEntry: number; fields: number; aligned: number; blockCountDiffers: number; reasons: Partial<Record<Reason, number>>; nameMismatch: number; summaries: number; derived: number }

/** 任何层级都不翻译、不对齐的键：与语言无关或属于出处信息。 */
export const SKIP_KEYS = new Set(['credit', 'src', 'anchor', 'order', 'ordinal', 'book', 'level', 'kind', 'page', 'titleEn', 'nameEn'])

/**
 * 由中文正文推导出来或在配置里手写的结构字段（活动、效果、升级）：英文原版里没有对应的数据，
 * 不对齐，也不计入应对齐字段，另外单独计数写进报告。
 */
export const DERIVED_KEYS = new Set(['activities', 'effects', 'advancement', 'keyValue'])

interface Ctx {
  entry: Entry
  fields: Record<string, unknown>
  misses: Miss[]
  tableMap: ReadonlyMap<string, string>
  blockCountDiffers: number
  fieldCount: number
  aligned: number
  derived: number
}

const clean = (value: unknown): boolean => !hasHan(value) && !JSON.stringify(value).includes('{@')

function miss(ctx: Ctx, path: string, reason: Reason): void {
  ctx.fieldCount++
  ctx.misses.push({ id: ctx.entry.id, type: ctx.entry.type, path, reason })
}

function walk(cn: unknown, en: unknown, path: string, ctx: Ctx): void {
  if (typeof cn === 'string') {
    if (!hasHan(cn)) return
    if (en === undefined) return miss(ctx, path, 'noEnglish')
    if (typeof en !== 'string') return miss(ctx, path, 'typeDiffers')
    if (hasHan(en)) return miss(ctx, path, 'enHasCjk')
    if (en.includes('{@')) return miss(ctx, path, 'enHasTag')
    if (!en.trim()) return miss(ctx, path, 'noEnglish')
    ctx.fieldCount++; ctx.aligned++; ctx.fields[path] = en
    return
  }
  if (Array.isArray(cn)) {
    if (!hasHan(cn)) return
    if (isBlocks(cn)) {
      if (en === undefined) return miss(ctx, path, 'noEnglish')
      if (!isBlocks(en)) return miss(ctx, path, 'typeDiffers')
      if (hasHan(en)) return miss(ctx, path, 'enHasCjk')
      if (!clean(en)) return miss(ctx, path, 'enHasTag')
      const mapped = mapTableRefs(en, ctx.tableMap)
      if (JSON.stringify(tableRefIds(mapped)) !== JSON.stringify(tableRefIds(cn))) return miss(ctx, path, 'tableRefDiffers')
      ctx.fieldCount++; ctx.aligned++; ctx.fields[path] = mapped
      if (en.length !== cn.length) ctx.blockCountDiffers++
      return
    }
    if (en === undefined) return miss(ctx, path, 'noEnglish')
    if (!Array.isArray(en)) return miss(ctx, path, 'typeDiffers')
    if (en.length !== cn.length) return miss(ctx, path, 'lengthDiffers')
    cn.forEach((item, index) => walk(item, en[index], path ? `${path}.${index}` : String(index), ctx))
    return
  }
  if (cn && typeof cn === 'object') {
    if (!hasHan(cn)) return
    if (en === undefined) return miss(ctx, path, 'noEnglish')
    if (!en || typeof en !== 'object' || Array.isArray(en)) return miss(ctx, path, 'typeDiffers')
    for (const [key, child] of Object.entries(cn as Rec)) {
      if (SKIP_KEYS.has(key)) continue
      if (DERIVED_KEYS.has(key)) { if (hasHan(child)) ctx.derived++; continue }
      walk(child, (en as Rec)[key], path ? `${path}.${key}` : key, ctx)
    }
  }
}

export interface AlignResult { stats: Record<string, TypeStats>; misses: Miss[]; tableMap: Map<string, string>; unmatchedEnglish: string[] }

export function alignAll(cn: Entry[], english: { entries: Entry[]; tableOrder: string[] }, cnTableOrder: string[]): AlignResult {
  const enById = new Map(english.entries.map((entry) => [entry.id, entry]))
  const cnById = new Map(cn.map((entry) => [entry.id, entry]))
  const cnTables = cnTableOrder.map((id) => cnById.get(id)).filter((entry): entry is Entry => !!entry)
  const enTables = english.tableOrder.map((id) => enById.get(id)).filter((entry): entry is Entry => !!entry)
  const tableMap = alignTables(cnTables, enTables)
  const cnToEn = new Map<string, string>()
  for (const [enId, cnId] of tableMap) cnToEn.set(cnId, enId)
  const stats: Record<string, TypeStats> = {}
  const misses: Miss[] = []
  const matchedEn = new Set<string>()
  for (const entry of cn) {
    const stat = stats[entry.type] ??= { entries: 0, withEnglish: 0, noEnglishEntry: 0, fields: 0, aligned: 0, blockCountDiffers: 0, reasons: {}, nameMismatch: 0, summaries: 0, derived: 0 }
    stat.entries++
    const enId = entry.type === 'table' ? cnToEn.get(entry.id) : entry.id
    const en = enId ? enById.get(enId) : undefined
    if (!en || en.type !== entry.type) { stat.noEnglishEntry++; continue }
    matchedEn.add(en.id)
    const ctx: Ctx = { entry, fields: {}, misses: [], tableMap, blockCountDiffers: 0, fieldCount: 0, aligned: 0, derived: 0 }
    walk(entry.data, en.data, '', ctx)
    if (hasHan(en.name)) { stat.noEnglishEntry++; continue }
    if (en.nameEn && entry.nameEn && en.nameEn !== entry.nameEn && !entry.nameEn.includes(en.nameEn)) stat.nameMismatch++
    const i18n: { name: string; summary?: string; fields: Record<string, unknown> } = { name: en.name, ...(!hasHan(en.summary) && en.summary ? { summary: en.summary } : {}), fields: ctx.fields }
    if (i18n.summary) stat.summaries++
    ;(entry as { i18n?: unknown }).i18n = { en: i18n }
    stat.withEnglish++
    stat.fields += ctx.fieldCount; stat.aligned += ctx.aligned; stat.blockCountDiffers += ctx.blockCountDiffers; stat.derived += ctx.derived
    for (const m of ctx.misses) { stat.reasons[m.reason] = (stat.reasons[m.reason] ?? 0) + 1; misses.push(m) }
  }
  return { stats, misses, tableMap, unmatchedEnglish: english.entries.filter((entry) => !matchedEn.has(entry.id)).map((entry) => entry.id) }
}
