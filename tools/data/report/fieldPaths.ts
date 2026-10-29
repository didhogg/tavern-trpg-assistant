import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { BOOK_SOURCES } from '../config/books'
import { readJson } from '../lib/io'
import { DATA_5ETOOLS } from '../extract/load'
import { excludedReason } from '../config/excludedFiles'
import { SOURCELESS_RECORDS, sourcelessFor } from '../config/sourcelessRecords'
import { sourceTypeOf } from '../config/sourceTypes'

export interface SourceRecord {
  type: string
  file: string
  key: string
  value: Record<string, unknown>
  source: string
  scope: 'core' | 'd1.2b'
  sourceKind: 'source' | 'inherits' | 'sourceless'
}

export interface FileScan {
  file: string
  total: number
  core: number
  d1b2: number
  skipped: Record<string, number>
  excluded?: string
}

export interface ScanResult {
  records: SourceRecord[]
  files: FileScan[]
  totalRecords: number
  coreRecords: number
  d1b2Records: number
  skippedRecords: number
}

const CUTOFF = '2024-09-17'
const CORE_SOURCES = new Set([...BOOK_SOURCES, 'SRD'])

interface Catalog { dates: Map<string, string>; adventures: Set<string> }

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function addSkip(map: Record<string, number>, reason: string): void {
  map[reason] = (map[reason] ?? 0) + 1
}

async function jsonFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name)
    if (item.isDirectory()) out.push(...await jsonFiles(path))
    else if (item.name.endsWith('.json')) out.push(path)
  }
  return out.sort()
}

async function catalog(): Promise<Catalog> {
  const books = (await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'books.json'))).book as Array<Record<string, unknown>>
  const adv = (await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'adventures.json'))).adventure as Array<Record<string, unknown>>
  return {
    dates: new Map(books.filter((b) => typeof b.source === 'string' && typeof b.published === 'string').map((b) => [String(b.source), String(b.published)])),
    adventures: new Set(adv.filter((a) => typeof a.source === 'string').map((a) => String(a.source))),
  }
}

function bookOf(record: Record<string, unknown>, file: string, key: string): { source: string; kind: 'source' | 'inherits' | 'sourceless' } | undefined {
  if (typeof record.source === 'string') return { source: record.source, kind: 'source' }
  const inherits = record.inherits
  if (isObj(inherits) && typeof inherits.source === 'string') return { source: inherits.source, kind: 'inherits' }
  const config = sourcelessFor(file, key)
  if (config) return { source: config.book, kind: 'sourceless' }
  return undefined
}

export async function scanSourceRecords(): Promise<ScanResult> {
  const cat = await catalog()
  const files = await jsonFiles(DATA_5ETOOLS)
  const records: SourceRecord[] = []
  const report: FileScan[] = []
  let totalRecords = 0
  let coreRecords = 0
  let d1b2Records = 0
  let skippedRecords = 0
  for (const path of files) {
    const file = path.slice(DATA_5ETOOLS.length + 1)
    const excluded = excludedReason(file)
    const raw = await readJson<Record<string, unknown>>(path)
    const entry: FileScan = { file, total: 0, core: 0, d1b2: 0, skipped: {}, excluded }
    for (const [key, list] of Object.entries(raw)) {
      if (!Array.isArray(list)) continue
      entry.total += list.length
      if (excluded) {
        entry.skipped['excluded-file'] = (entry.skipped['excluded-file'] ?? 0) + list.length
        continue
      }
      sourceTypeOf(key)
      for (const item of list) {
        const value: Record<string, unknown> | undefined = isObj(item) ? item : typeof item === 'string' ? { text: item } : undefined
        if (!value) { addSkip(entry.skipped, 'not-a-record'); continue }
        const source = bookOf(value, file, key)
        if (!source) { addSkip(entry.skipped, 'no-source'); continue }
        const published = cat.dates.get(source.source)
        if (!CORE_SOURCES.has(source.source) && (!published || published >= CUTOFF)) {
          addSkip(entry.skipped, !published && cat.adventures.has(source.source) ? `d1.2b-adventure:${source.source}` : `source-outside-2014:${source.source}`)
          continue
        }
        const scope = CORE_SOURCES.has(source.source) ? 'core' : 'd1.2b'
        records.push({ type: sourceTypeOf(key), file, key, value, source: source.source, scope, sourceKind: source.kind })
        if (scope === 'core') { entry.core += 1; coreRecords += 1 } else { entry.d1b2 += 1; d1b2Records += 1 }
      }
    }
    totalRecords += entry.total
    skippedRecords += Object.values(entry.skipped).reduce((a, b) => a + b, 0)
    report.push(entry)
  }
  // 仅在扫描器运行时检查无来源配置是否覆盖了实际出现的无来源键。
  const known = new Set(SOURCELESS_RECORDS.map((x) => `${x.file}|${x.key}`))
  for (const entry of report) {
    if (!entry.skipped['no-source']) continue
    for (const [key, list] of Object.entries(await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, entry.file)))) {
      if (!Array.isArray(list) || !list.length) continue
      if (!known.has(`${entry.file}|${key}`)) throw new Error(`无来源记录没有登记：${entry.file} / ${key}`)
    }
  }
  return { records, files: report, totalRecords, coreRecords, d1b2Records, skippedRecords }
}

export function collectPaths(records: SourceRecord[]): Map<string, { type: string; count: number; example: string }> {
  const out = new Map<string, { type: string; count: number; example: string }>()
  const walk = (value: unknown, path: string, type: string, record: SourceRecord): void => {
    if (Array.isArray(value)) {
      const next = `${path}[]`
      for (const item of value) walk(item, next, type, record)
      return
    }
    if (!isObj(value)) return
    for (const [key, child] of Object.entries(value)) {
      const next = path ? `${path}.${key}` : key
      const keyPath = `${type}.${next}`
      const current = out.get(keyPath) ?? { type, count: 0, example: record.file }
      current.count += 1
      out.set(keyPath, current)
      if (Array.isArray(child) || isObj(child)) walk(child, next, type, record)
    }
  }
  for (const record of records) walk(record.value, '', record.type, record)
  return out
}
