import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import type { Entry } from '../../src/schemas/pack'
import type { TextBlock } from '../../src/schemas/text'

export const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
export const R9_OLD_TYPES = new Set(['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'disease', 'status', 'rule', 'lore'])

export function packPath(id: string): string {
  if (id === SRD_PACK_ID) return join(process.cwd(), 'packs', `${id}.trpgpack`)
  const book = BOOKS.find((item) => item.packId === id)!
  return join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${book.version}.trpgpack`)
}

export function loadPack(id: string): { id: string; entries: Entry[] } {
  const file = packPath(id)
  if (!existsSync(file)) throw new Error(`缺少 ${file}；先运行 npm run build:data`)
  const entries: Entry[] = []
  for (const [name, data] of Object.entries(unzipSync(new Uint8Array(readFileSync(file))))) if (name.startsWith('entries/')) entries.push(...(JSON.parse(strFromU8(data)) as Entry[]))
  return { id, entries }
}

export function loadAllPacks(): Array<{ id: string; entries: Entry[] }> {
  return [SRD_PACK_ID, ...BOOKS.map((book) => book.packId)].map(loadPack)
}

export function allEntries(): Entry[] {
  return loadAllPacks().flatMap((pack) => pack.entries)
}

export interface Replacement { entryId: string; where: string; blockIndex: number; tableId: string; label: string }

export function applyReplacements(data: Record<string, unknown>, replacements: Replacement[]): Record<string, unknown> {
  const out = structuredClone(data)
  const byIndex = new Map(replacements.map((row) => [row.blockIndex, row]))
  let seen = 0
  const walk = (list: TextBlock[]): TextBlock[] => list.map((block) => {
    if ('table' in block) {
      const index = seen++
      const replacement = byIndex.get(index)
      return replacement ? { tableRef: { id: replacement.tableId, label: replacement.label } } : block
    }
    if ('h' in block) return { h: block.h, body: walk(block.body) }
    if ('read' in block) return { read: walk(block.read) }
    return block
  })
  if (Array.isArray(out.text)) out.text = walk(out.text as TextBlock[])
  if (Array.isArray(out.lore)) out.lore = walk(out.lore as TextBlock[])
  return out
}
