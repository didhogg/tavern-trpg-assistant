import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import { FIELD_COVERAGE, coverageOf } from '../../tools/data/config/fieldCoverage'
import { validateCoverageEntry } from '../../tools/data/config/fieldCoverage/validate'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'

const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
async function load(): Promise<Entry[]> {
  const files = [join(process.cwd(), 'packs', `${SRD_PACK_ID}.trpgpack`), ...BOOKS.map((b) => join(DATA_REPO, 'packs', 'dnd5e2014', `${b.packId}-${b.version}.trpgpack`))]
  const out: Entry[] = []
  for (const file of files) {
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) out.push(...(JSON.parse(strFromU8(data)) as Entry[]))
  }
  return out
}
function hasMetadataKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(hasMetadataKey)
  for (const [key, child] of Object.entries(value)) {
    if (['_copy', '_mod', '_preserve', '_abstract', '_trait'].includes(key)) return true
    if (hasMetadataKey(child)) return true
  }
  return false
}

describe('RW14–RW16 矩阵规则', () => {
  it('mapped 不能指向自由正文容器', () => {
    expect(() => validateCoverageEntry('feat.entries', { how: 'mapped', to: 'data.text', wp: 'R5' })).toThrow()
  })

  it('RW15 展开元数据规则命中，且不在静态登记中', () => {
    const hit = coverageOf('item._copy._mod.entries.items')
    expect(hit).toMatchObject({ how: 'dropped', kind: 'derived' })
    expect(FIELD_COVERAGE['item._copy._mod.entries.items']).toBeUndefined()
  })

  it('构建包中不残留 _copy/_mod/_preserve/_abstract/_trait', async () => {
    const entries = await load()
    const residual = entries.filter((e) => hasMetadataKey(e.data)).map((e) => e.id)
    expect(residual).toEqual([])
  })
})
