import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import type { Entry } from '../../src/schemas/pack'

const REPO = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'

async function allEntries(): Promise<Map<string, Entry>> {
  const files = [join(REPO, 'packs', `${SRD_PACK_ID}.trpgpack`), ...BOOKS.map((b) => join(DATA_REPO, 'packs', 'dnd5e2014', `${b.packId}-${b.version}.trpgpack`))]
  for (const file of files) if (!existsSync(file)) throw new Error(`缺少 ${file}；先运行 npm run build:data`)
  const out = new Map<string, Entry>()
  for (const file of files) {
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) {
      if (!name.startsWith('entries/')) continue
      for (const entry of JSON.parse(strFromU8(data)) as Entry[]) out.set(entry.id, entry)
    }
  }
  return out
}

describe('D1 §12 转换器金样', () => {
  it('火球术、魔法飞弹、成年红龙、地精、长剑、长剑 +1、板甲', async () => {
    const all = await allEntries()
    const fireball = all.get('spell.fireball.phb')!
    expect(fireball.data).toMatchObject({ level: 3, school: 'evocation', range: { amount: 150 }, save: ['dex'], damage: [{ dice: '8d6', type: '火焰' }] })
    expect(fireball.data.classes).toEqual(['class.sorcerer.phb', 'class.wizard.phb'])
    expect((fireball.data.activities as Array<{ kind: string; onSave: string }>)[0]).toMatchObject({ kind: 'save', onSave: 'half' })
    const missile = all.get('spell.magic-missile.phb')!
    expect(missile.data).toMatchObject({ level: 1, damage: [{ dice: '1d4+1', type: '力场' }] })
    const dragon = all.get('monster.adult-red-dragon.mm')!
    expect(dragon.data).toMatchObject({ size: ['H'], ac: [{ value: 19 }], hp: { average: 256 }, cr: 17 })
    expect((dragon.data.actions as Array<{ name: string; activities?: Array<{ bonus: number; damage: Array<{ dice: string }> }> }>).find((a) => a.name === '啃咬')?.activities?.[0]).toMatchObject({ bonus: 14, damage: [{ dice: '2d10+8' }] })
    const goblin = all.get('monster.goblin.mm')!
    expect(goblin.data).toMatchObject({ size: ['S'], ac: [{ value: 15 }], hp: { average: 7 }, cr: 0.25 })
    const sword = all.get('item.longsword.phb')!
    expect(sword.data).toMatchObject({ category: 'weapon', weapon: { damage: [{ dice: '1d8', type: '挥砍' }], versatile: '1d10' } })
    const plus = all.get('item.longsword-plus-1.dmg')!
    expect(plus.data).toMatchObject({ rarity: 'uncommon', weapon: { damage: [{ dice: '1d8+1', type: '挥砍' }] } })
    const plate = all.get('item.plate-armor.phb')!
    expect(plate.data).toMatchObject({ category: 'armor', armor: { category: 'heavy', ac: 18, strReq: 15, stealthDisadvantage: true } })
  })

  it('动作如潮、偷袭、精灵、高等精灵、侍僧、警觉、擒抱者、中毒与 DMG 宝藏表', async () => {
    const all = await allEntries()
    expect(all.get('feature.fighter-action-surge.phb')?.data).toMatchObject({ owner: { type: 'class', id: 'class.fighter.phb' }, level: 2 })
    expect(all.get('feature.rogue-sneak-attack.phb')?.data).toMatchObject({ owner: { type: 'class', id: 'class.rogue.phb' }, level: 1 })
    expect(all.get('race.elf.phb')?.data).toMatchObject({ size: ['M'], darkvision: 60 })
    expect(all.get('subrace.elf-high.phb')?.data).toMatchObject({ parentRace: 'race.elf.phb' })
    const acolyte = all.get('background.acolyte.phb')!
    expect(acolyte.data).toMatchObject({ proficiencies: { skills: ['insight', 'religion'] } })
    expect((acolyte.data.characteristics as unknown[]).length).toBe(4)
    expect(all.get('feat.alert.phb')?.data.requires).toBeUndefined()
    expect(all.get('feat.grappler.phb')?.data.requires).toEqual({ all: [{ ability: { str: 13 } }] })
    expect(JSON.stringify(all.get('condition.poisoned.phb')?.data)).toContain('劣势')
    const table = all.get('table.magic-item-table-a.dmg')!
    expect(table.data).toMatchObject({ dice: 'd100' })
    expect((table.data.rows as unknown[]).length).toBe(8)
  })
})
