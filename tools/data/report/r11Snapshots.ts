import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../config/books'
import type { Entry } from '../../../src/schemas/pack'
import { REPO_ROOT } from '../lib/io'

const DATA_REPO = '/Users/xxx/tavern-trpg-data'
const OLD_TYPES = new Set(['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'disease', 'status', 'table', 'rule', 'lore'])

function normalize(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/\{\{ref:([^|}]+)(?:\|([^}]*))?\}\}/g, (_all, _id: string, display: string | undefined) => display ?? '')
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]))
  return value
}

function packBytes(packId: string): Uint8Array {
  if (packId === SRD_PACK_ID) return new Uint8Array(execFileSync('git', ['-C', REPO_ROOT, 'show', `aafde63:packs/${packId}.trpgpack`]))
  const book = BOOKS.find((item) => item.packId === packId)!
  return new Uint8Array(execFileSync('git', ['-C', DATA_REPO, 'show', `c0e7c63:packs/dnd5e2014/${packId}-${book.version}.trpgpack`]))
}

function entriesOf(bytes: Uint8Array): Entry[] {
  const zip = unzipSync(bytes)
  const out: Entry[] = []
  for (const [name, data] of Object.entries(zip)) {
    if (!name.startsWith('entries/')) continue
    for (const entry of JSON.parse(strFromU8(data)) as Entry[]) out.push(entry)
  }
  return out
}

const oldEntries: Record<string, unknown> = {}
const allText: Record<string, unknown> = {}
for (const packId of [SRD_PACK_ID, ...BOOKS.map((book) => book.packId)]) {
  for (const entry of entriesOf(packBytes(packId))) {
    allText[`${packId}|${entry.id}`] = normalize(entry.data)
    if (OLD_TYPES.has(entry.type)) oldEntries[`${packId}|${entry.id}`] = normalize(entry.data)
  }
}
const dir = join(REPO_ROOT, 'tests', 'data', 'fixtures')
mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, 'r11-old-entries-before.json.gz'), gzipSync(JSON.stringify(oldEntries)))
writeFileSync(join(dir, 'r11-text-before.json.gz'), gzipSync(JSON.stringify(allText)))
console.log(`old ${Object.keys(oldEntries).length} / text ${Object.keys(allText).length}`)
