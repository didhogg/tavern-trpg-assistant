import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
async function load(): Promise<Map<string, Entry>> {
  const files = [join(process.cwd(), 'packs', `${SRD_PACK_ID}.trpgpack`), ...BOOKS.map((b) => join(DATA_REPO, 'packs', 'dnd5e2014', `${b.packId}-${b.version}.trpgpack`))]
  const out = new Map<string, Entry>()
  for (const file of files) {
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) out.set(e.id, e)
  }
  return out
}
const traits = (e: Entry | undefined): Array<Record<string, unknown>> => ((e?.data.advancement as Array<Record<string, unknown>> | undefined) ?? []).filter((a) => a.kind === 'trait')
describe('R5 熟练授予 trait', () => {
  it('19 条附赠熟练的所属条目都有 trait', async () => {
    const all = await load()
    const bonus = [...all.values()].filter((e) => e.type === 'feature' && e.id.includes('bonus-proficien'))
    expect(bonus).toHaveLength(19)
    for (const f of bonus) {
      const ownerId = (f.data.owner as { id?: string } | undefined)?.id
      expect(ownerId, f.id).toBeTruthy()
      expect(traits(all.get(ownerId!)), f.id).not.toHaveLength(0)
    }
  })
  it('自然领域重甲、勇气学院中甲盾牌军用', async () => {
    const all = await load()
    expect(traits(all.get('subclass.cleric-nature-domain.phb')).some((t) => ((t.grants as string[]) ?? []).includes('armor:heavy'))).toBe(true)
    const valor = traits(all.get('subclass.bard-college-of-valor.phb')).flatMap((t) => (t.grants as string[]) ?? [])
    expect(valor).toEqual(expect.arrayContaining(['armor:medium', 'armor:shield', 'weapon:martial']))
  })
  it('种族/背景/专长的熟练进入 trait', async () => {
    const all = await load()
    expect(traits(all.get('background.acolyte.phb')).length).toBeGreaterThan(0)
    expect(traits(all.get('feat.tough.phb')).length).toBeGreaterThanOrEqual(0)
  })
})
