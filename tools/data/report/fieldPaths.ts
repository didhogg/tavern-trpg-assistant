import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { BOOK_SOURCES, BOOKS } from '../config/books'
import { readJson } from '../lib/io'
import { DATA_5ETOOLS } from '../extract/load'

export interface SourceRecord {
  type: string
  file: string
  value: Record<string, unknown>
}

const CORE_BOOK_FILES = new Set(BOOKS.map((b) => `book-${b.source.toLowerCase()}.json`))
const EXCLUDED_DIRS = new Set(['adventure', 'bastions', 'recipes', 'homecrafts', 'psionics'])
const EXCLUDED_FILES = [/^changelog/, /^renderdemo/, /^converter/, /^makebrew/, /^makecards/, /^msbcr/, /^foundry-psionics/]

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function typeOf(key: string): string {
  if (key === 'bookData') return 'book'
  return key.replace(/s$/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function isCoreFile(rel: string): boolean {
  const parts = rel.split('/')
  if (parts.some((p) => EXCLUDED_DIRS.has(p))) return false
  if (EXCLUDED_FILES.some((r) => r.test(parts[0]))) return false
  if (parts[0] === 'book' && !CORE_BOOK_FILES.has(parts[1])) return false
  return true
}

function core(value: Record<string, unknown>, file: string): boolean {
  const source = typeof value.source === 'string' ? value.source : ''
  if (source) return BOOK_SOURCES.has(source)
  return file.startsWith('book/') || file.startsWith('generated/bookref-') || file === 'books.json'
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

export async function scanSourceRecords(): Promise<SourceRecord[]> {
  const files = (await jsonFiles(DATA_5ETOOLS)).filter((p) => isCoreFile(p.slice(DATA_5ETOOLS.length + 1)))
  const out: SourceRecord[] = []
  for (const path of files) {
    const rel = path.slice(DATA_5ETOOLS.length + 1)
    const raw = await readJson<Record<string, unknown>>(path)
    for (const [key, list] of Object.entries(raw)) {
      if (!Array.isArray(list)) continue
      for (const item of list) {
        if (!isObj(item) || !core(item, rel)) continue
        out.push({ type: typeOf(key), file: rel, value: item })
      }
    }
  }
  return out
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
      current.count++
      out.set(keyPath, current)
      if (Array.isArray(child) || isObj(child)) walk(child, next, type, record)
    }
  }
  for (const record of records) walk(record.value, '', record.type, record)
  return out
}

export { join }
