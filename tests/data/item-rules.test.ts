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

describe('P8 物品结构化', () => {
  it('护甲、盾牌、武器金样', async () => {
    const all = await load()
    expect(all.get('item.plate-armor.phb')?.data.armor).toMatchObject({ category: 'heavy', ac: 18, strReq: 15, stealthDisadvantage: true })
    expect(all.get('item.leather-armor.phb')?.data.armor).toMatchObject({ category: 'light', ac: 11 })
    expect(all.get('item.half-plate-armor.phb')?.data.armor).toMatchObject({ category: 'medium', ac: 15, dexCap: 2, stealthDisadvantage: true })
    expect(all.get('item.shield.phb')?.data.armor).toMatchObject({ category: 'shield', ac: 2 })
    expect(all.get('item.longsword-plus-1.dmg')?.data).toMatchObject({ weapon: { damage: [{ dice: '1d8+1', type: 'slashing' }] }, bonuses: { attack: '+1' } })
  })

  it('魔法物品被动效果与药水行动', async () => {
    const all = await load()
    expect(all.get('item.ring-of-protection.dmg')?.data.bonuses).toEqual({ ac: '+1', save: '+1' })
    expect(all.get('item.gauntlets-of-ogre-power.dmg')?.data.effects).toContainEqual({ kind: 'abilitySet', ability: 'str', value: 19 })
    expect(all.get('item.boots-of-speed.dmg')?.data.effects).toContainEqual({ kind: 'speed', mode: 'walk', multiplier: 2 })
    expect((all.get('item.potion-of-healing.dmg')?.data.activities as Array<{ kind: string; formula: string }>)[0]).toMatchObject({ kind: 'heal', formula: '2d4+2' })
    for (const item of all.values()) if (item.type === 'item' && item.data.effects) expect(Array.isArray(item.data.effects)).toBe(true)
  })
})
