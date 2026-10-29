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
    expect(fireball.data).toMatchObject({ level: 3, school: 'evocation', range: { amount: 150 }, save: ['dex'], damage: [{ dice: '8d6', type: 'fire' }] })
    expect(fireball.data.classes).toEqual(['class.sorcerer.phb', 'class.wizard.phb'])
    expect((fireball.data.activities as Array<{ kind: string; onSave: string }>)[0]).toMatchObject({ kind: 'save', onSave: 'half' })
    const missile = all.get('spell.magic-missile.phb')!
    expect(missile.data).toMatchObject({ level: 1, damage: [{ dice: '1d4+1', type: 'force' }] })
    const dragon = all.get('monster.adult-red-dragon.mm')!
    expect(dragon.data).toMatchObject({ size: ['H'], ac: [{ value: 19 }], hp: { average: 256 }, cr: 17 })
    expect((dragon.data.actions as Array<{ name: string; activities?: Array<{ bonus: number; damage: Array<{ dice: string }> }> }>).find((a) => a.name === '啃咬')?.activities?.[0]).toMatchObject({ bonus: 14, damage: [{ dice: '2d10+8' }] })
    const goblin = all.get('monster.goblin.mm')!
    expect(goblin.data).toMatchObject({ size: ['S'], ac: [{ value: 15 }], hp: { average: 7 }, cr: 0.25 })
    const sword = all.get('item.longsword.phb')!
    expect(sword.data).toMatchObject({ category: 'weapon', weapon: { damage: [{ dice: '1d8', type: 'slashing' }], versatile: '1d10' } })
    const plus = all.get('item.longsword-plus-1.dmg')!
    expect(plus.data).toMatchObject({ rarity: 'uncommon', weapon: { damage: [{ dice: '1d8+1', type: 'slashing' }] } })
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
    expect(acolyte.data).toMatchObject({ proficiencies: { skills: { fixed: ['insight', 'religion'] } } })
    expect((acolyte.data.characteristics as unknown[]).length).toBe(4)
    expect(all.get('feat.alert.phb')?.data.requires).toBeUndefined()
    expect(all.get('feat.grappler.phb')?.data.requires).toEqual({ all: [{ ability: { str: 13 } }] })
    expect(JSON.stringify(all.get('condition.poisoned.phb')?.data)).toContain('劣势')
    const table = all.get('table.magic-item-table-a.dmg')!
    expect(table.data).toMatchObject({ dice: 'd100' })
    expect((table.data.rows as unknown[]).length).toBe(8)
  })
  it('复核中发现并修复的转换问题：子职业 id、等级表、阵营、抗性、施法、宝藏堆、属性加值', async () => {
    const all = await allEntries()
    const json = (id: string) => JSON.stringify(all.get(id)?.data)
    expect(all.get('subclass.cleric-light-domain.phb')?.data).toMatchObject({ classId: 'class.cleric.phb' })
    expect([...all.keys()].filter((id) => /(^|[.-])entry([.-]|$)/.test(id))).toEqual([])
    const rogue = all.get('class.rogue.phb')!.data.table as { cols: string[]; rows: Array<{ level: number; values: string[] }> }
    expect(rogue.cols).toEqual(['偷袭'])
    expect(rogue.rows[4].values).toEqual(['3d6'])
    const bard = all.get('class.bard.phb')!.data.proficiencies as { skills?: { choose: number; from: string[] } }
    expect(bard.skills?.choose).toBe(3)
    expect(bard.skills?.from.length).toBe(18)
    expect(all.get('class.druid.phb')!.data.multiclass).toMatchObject({ proficiencies: { armor: ['light', 'medium', 'shield'] } })
    expect(all.get('monster.empyrean.mm')!.data.alignment).not.toContain('object')
    expect(all.get('monster.lich.mm')!.data.immune).toContain('bludgeoning、piercing、slashing（来自非魔法攻击）')
    const lich = (all.get('monster.lich.mm')!.data.spellcasting as Array<{ spells?: Record<string, { slots?: number; spells: string[] }> }>)[0]
    expect(lich.spells?.['9']).toMatchObject({ slots: 1 })
    expect(lich.spells?.['1'].spells.length).toBe(4)
    expect(all.get('race.half-elf.phb')!.data.abilityBonus).toEqual({ fixed: { cha: 2 }, choose: { count: 2, amount: 1, from: ['str', 'dex', 'con', 'int', 'wis'] } })
    const hoard = all.get('table.treasure-hoard-challenge-0-4.dmg')!
    expect(hoard.data.caption).toContain('固定钱币')
    expect(JSON.stringify(hoard.data.rows)).toContain('魔法物品表A')
    expect(json('monster.goblin.mm')).toContain('命中：')
    expect(json('monster.adult-red-dragon.mm')).toContain('（充能5–6）')
  })
  it('第二轮核对修复：物品正文模板、变体价格、种族飞行速度、同调法术要求', async () => {
    const all = await allEntries()
    expect(JSON.stringify(all.get('item.breastplate-of-acid-resistance.dmg')?.data.text)).toContain('强酸')
    expect([...all.values()].filter((e) => JSON.stringify(e.data).includes('{#'))).toEqual([])
    expect(all.get('item.breastplate-barding.phb')?.data).toMatchObject({ value: 160000, weight: 40 })
    expect(all.get('race.aarakocra.mpmm')?.data.speed).toEqual({ walk: 30, fly: 30 })
    expect(JSON.stringify(all.get('feature.agonizing-blast.phb')?.data.requires)).not.toContain('#c')
  })
})
