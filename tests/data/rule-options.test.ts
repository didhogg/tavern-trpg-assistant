import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'

const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'

describe('P7 规则选项 engine/group', () => {
  it('10 个选项都有 engine 或明确为空，分组正确，且不再有 implemented', async () => {
    const files = [join(process.cwd(), 'packs', `${SRD_PACK_ID}.trpgpack`), ...BOOKS.map((b) => join(DATA_REPO, 'packs', 'dnd5e2014', `${b.packId}-${b.version}.trpgpack`))]
    const features: Array<Record<string, unknown>> = []
    for (const file of files) {
      if (!existsSync(file)) throw new Error(`缺少 ${file}`)
      const zip = unzipSync(new Uint8Array(await readFile(file)))
      const data = zip['features/ruleoptions.json']
      if (data) features.push(...(JSON.parse(strFromU8(data)) as Array<Record<string, unknown>>))
    }
    expect(features).toHaveLength(10)
    const byId = new Map(features.map((f) => [String((f.data as Record<string, unknown>).id), (f.data as Record<string, unknown>)]))
    expect(byId.get('encumbrance')).toMatchObject({ engine: 'encumbrance.variant' })
    expect(byId.get('gritty-realism')).toMatchObject({ engine: 'rest.gritty', group: 'rest' })
    expect(byId.get('epic-heroism')).toMatchObject({ engine: 'rest.epic', group: 'rest' })
    expect(byId.get('lingering-injuries')?.engine).toBeUndefined()
    for (const data of byId.values()) expect(data.implemented).toBeUndefined()
  })
})
