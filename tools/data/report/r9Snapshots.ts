import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../config/books'
import type { Entry } from '../../../src/schemas/pack'
import { REPO_ROOT } from '../lib/io'

const DATA_REPO = '/Users/xxx/tavern-trpg-data'
const OLD_TYPES = new Set(['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'disease', 'status', 'rule', 'lore'])

function packBytes(packId: string): Uint8Array {
  if (packId === SRD_PACK_ID) return new Uint8Array(execFileSync('git', ['-C', REPO_ROOT, 'show', `39e5291:packs/${packId}.trpgpack`]))
  const book = BOOKS.find((item) => item.packId === packId)!
  return new Uint8Array(execFileSync('git', ['-C', DATA_REPO, 'show', `e8d967d:packs/dnd5e2014/${packId}-${book.version}.trpgpack`]))
}

const out: Record<string, unknown> = {}
for (const packId of [SRD_PACK_ID, ...BOOKS.map((book) => book.packId)]) {
  const zip = unzipSync(packBytes(packId))
  for (const [name, data] of Object.entries(zip)) {
    if (!name.startsWith('entries/')) continue
    for (const entry of JSON.parse(strFromU8(data)) as Entry[]) if (OLD_TYPES.has(entry.type)) out[`${packId}|${entry.id}`] = entry.data
  }
}
const dir = join(REPO_ROOT, 'tests', 'data', 'fixtures')
mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, 'r9-old-entries-before.json.gz'), gzipSync(JSON.stringify(out)))
console.log(`old entries ${Object.keys(out).length}`)
