import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import type { Entry } from '../../src/schemas/pack'

export const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
export const OLD_TYPES = new Set(['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'disease', 'status', 'table', 'rule', 'lore'])
export const R11_TYPES = ['language', 'deity', 'reward', 'cult', 'hazard', 'object', 'vehicle', 'monsterPart'] as const

export function packPath(id: string): string {
  if (id === SRD_PACK_ID) return join(process.cwd(), 'packs', `${id}.trpgpack`)
  const book = BOOKS.find((item) => item.packId === id)!
  return join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${book.version}.trpgpack`)
}

export function loadPack(id: string): { id: string; entries: Entry[] } {
  const file = packPath(id)
  if (!existsSync(file)) throw new Error(`缺少 ${file}；先运行 npm run build:data`)
  const entries: Entry[] = []
  for (const [name, data] of Object.entries(unzipSync(new Uint8Array(readFileSync(file))))) {
    if (name.startsWith('entries/')) entries.push(...(JSON.parse(strFromU8(data)) as Entry[]))
  }
  return { id, entries }
}

export function loadAllPacks(): Array<{ id: string; entries: Entry[] }> {
  return [SRD_PACK_ID, ...BOOKS.map((book) => book.packId)].map(loadPack)
}

export function allEntries(packs = loadAllPacks()): Entry[] {
  return packs.flatMap((pack) => pack.entries)
}

export function normalizeRefs(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/\{\{ref:([^|}]+)(?:\|([^}]*))?\}\}/g, (_all, _id: string, display: string | undefined) => display ?? '')
  if (Array.isArray(value)) return value.map(normalizeRefs)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeRefs(item)]))
  return value
}

export function plainRefText(value: unknown): string {
  return JSON.stringify(normalizeRefs(value))
}
