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
describe('R6 物品内部结构', () => {
  it('探索套组 8 种内容物', async () => {
    const all = await load()
    const pack = all.get('item.explorers-pack.phb')!
    expect((pack.data.contents as unknown[])).toHaveLength(8)
    expect(pack.data.contents).toContainEqual(expect.objectContaining({ qty: 10 }))
  })
  it('巨人力量腰带 6 个成员', async () => {
    const all = await load()
    const belt = all.get('item.belt-of-cloud-giant-strength.dmg')!
    const family = [...all.values()].find((e) => e.type === 'item' && e.data.category === 'family' && ((e.data.members as string[] | undefined) ?? []).includes(belt.id))!
    expect((family.data.members as string[])).toHaveLength(6)
  })
  it('+1 长剑有 variantOf 与 baseItem', async () => {
    const all = await load()
    const sword = all.get('item.longsword-plus-1.dmg')!
    expect(sword.data.variantOf).toBe('item.plus-1-weapon.dmg')
    expect(sword.data.baseItem).toBe('item.longsword.phb')
  })
  it('家族数量至少 38', async () => {
    const all = await load()
    const families = [...all.values()].filter((e) => e.type === 'item' && e.data.category === 'family')
    expect(families).toHaveLength(37)
  })
})
