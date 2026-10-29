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
    if (!existsSync(file)) throw new Error(`缺少 ${file}，先运行 npm run build:data`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) for (const entry of JSON.parse(strFromU8(data)) as Entry[]) out.set(entry.id, entry)
  }
  return out
}

function prof(d: Entry['data'], key: string): Record<string, unknown> {
  return ((d.proficiencies as Record<string, unknown> | undefined)?.[key] ?? {}) as Record<string, unknown>
}

describe('P3 种族、亚种族与背景', () => {
  it('人类、变体人类、半精灵、矮人、精灵、提夫林金样', async () => {
    const all = await load()
    expect(all.get('race.human.phb')?.data.abilityBonus).toEqual({ fixed: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } })
    const variant = all.get('subrace.human-variant.phb')!
    expect(variant.data.abilityBonus).toMatchObject({ choose: { count: 2, amount: 1 } })
    expect((variant.data.proficiencies as { skills: { choose: { count: number } } }).skills.choose.count).toBe(1)
    expect((variant.data.advancement as Array<{ kind: string; featureType?: string }>).some((a) => a.kind === 'itemChoice' && a.featureType === '专长')).toBe(true)
    expect(all.get('race.half-elf.phb')?.data.abilityBonus).toMatchObject({ fixed: { cha: 2 }, choose: { count: 2, amount: 1 } })
    expect(all.get('subrace.dwarf-hill.phb')?.data.speed).toEqual({ walk: 25 })
    expect(prof(all.get('subrace.dwarf-mountain.phb')!.data, 'armor').fixed).toEqual(['light', 'medium'])
    expect(all.get('race.elf.phb')?.data.darkvision).toBe(60)
    expect(prof(all.get('race.elf.phb')!.data, 'skills').fixed).toEqual(['perception'])
    expect(all.get('subrace.elf-high.phb')?.data.parentRace).toBe('race.elf.phb')
    expect(all.get('race.tiefling.phb')?.data.resist).toEqual(['fire'])
    expect((all.get('race.tiefling.phb')!.data.effects as Array<{kind?:string}>).filter((x)=>x.kind==='spellGrant').length).toBe(3)
  })

  it('龙裔抗性选择有说明；MPMM 自选属性结构完整', async () => {
    const all = await load()
    expect((all.get('race.dragonborn.phb')!.data.effects as Array<{ kind: string; text?: string }>)[0]).toMatchObject({ kind: 'note' })
    expect((all.get('race.dragonborn.phb')!.data.effects as Array<{ text: string }>)[0].text).toContain('强酸')
    const aarakocra = all.get('race.aarakocra.mpmm')!
    expect(aarakocra.data.flexibleAbility).toMatchObject({ modes: [{ count: 1, amount: 2 }, { count: 2, amount: 1 }], alternative: { count: 3, amount: 1 } })
  })

  it('全部书籍包里的种族有加值或 MPMM 自选，背景都有结构化装备', async () => {
    const all = await load()
    const races = [...all.values()].filter((e) => e.type === 'race')
    for (const race of races) {
      if ((race.data.src as { book?: string } | undefined)?.book === 'DMG') continue
      expect(Boolean(race.data.abilityBonus || race.data.flexibleAbility), race.id).toBe(true)
    }
    const backgrounds = [...all.values()].filter((e) => e.type === 'background')
    for (const bg of backgrounds) {
      if (bg.id === 'background.custom-background.phb') continue
      expect((bg.data.equipment as unknown[]).length, bg.id).toBeGreaterThan(0)
    }
    const acolyte = all.get('background.acolyte.phb')!
    expect(prof(acolyte.data, 'skills').fixed).toEqual(['insight', 'religion'])
    expect((acolyte.data.proficiencies as { languages: { choose: { count: number } } }).languages.choose.count).toBe(2)
    expect((acolyte.data.equipment as Array<{ fixed?: unknown[]; choice?: unknown[] }>).length).toBeGreaterThan(0)
  })
})
