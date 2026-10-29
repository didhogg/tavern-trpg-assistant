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

function scales(entry: Entry | undefined): Map<string, Record<string, unknown>> {
  const list = (entry?.data.advancement as Array<Record<string, unknown>> | undefined) ?? []
  return new Map(list.filter((a) => a.kind === 'scaleValue').map((a) => [String(a.id), a]))
}

function at(scale: Record<string, unknown> | undefined, level: number): unknown {
  const table = (scale?.scale ?? {}) as Record<string, unknown>
  for (let n = level; n >= 1; n--) if (table[String(n)] !== undefined) return table[String(n)]
  return undefined
}

describe('P2 职业与子职业结构化', () => {
  it('法师 5/20、圣武士 9、游侠 17、契约位与三分之一施法者', async () => {
    const all = await load()
    const wizard = all.get('class.wizard.phb')!
    const slots = wizard.data.spellcasting as { slotsByLevel: Array<{ level: number; slots: number[] }> }
    expect(slots.slotsByLevel).toHaveLength(20)
    expect(slots.slotsByLevel[4].slots).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0])
    expect(slots.slotsByLevel[19].slots).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1])
    expect(((all.get('class.paladin.phb')!.data.spellcasting as { slotsByLevel: Array<{ slots: number[] }> }).slotsByLevel[8]).slots).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0])
    expect(((all.get('class.ranger.phb')!.data.spellcasting as { slotsByLevel: Array<{ slots: number[] }> }).slotsByLevel[16]).slots).toEqual([4, 3, 3, 3, 1, 0, 0, 0, 0])
    const warlock = (all.get('class.warlock.phb')!.data.spellcasting as { slotsByLevel: Array<{ pact?: { count: number; level: number } }> }).slotsByLevel
    expect(warlock[4]).toEqual({ level: 5, pact: { count: 2, level: 3 } })
    const ek = (all.get('subclass.fighter-eldritch-knight.phb')!.data.spellcasting as { slotsByLevel: Array<{ slots: number[] }> }).slotsByLevel
    expect(ek[2].slots).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(ek[6].slots).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0])
    expect(ek[18].slots).toEqual([4, 3, 3, 1, 0, 0, 0, 0, 0])
  })

  it('每个施法进度都有 20 行，普通位非递减，契约位单列', async () => {
    const all = await load()
    for (const entry of all.values()) {
      const sc = entry.data.spellcasting as { progression?: string; slotsByLevel?: Array<Record<string, unknown>> } | undefined
      if (!sc?.slotsByLevel) continue
      expect(sc.slotsByLevel, entry.id).toHaveLength(20)
      for (const row of sc.slotsByLevel) {
        if (sc.progression === 'pact') {
          expect((row.pact as { count: number }).count).toBeGreaterThanOrEqual(1)
          expect((row.pact as { level: number }).level).toBeGreaterThanOrEqual(1)
        } else {
          const slots = row.slots as number[]
          expect(slots, entry.id).toHaveLength(9)
          for (let i = 1; i < slots.length; i++) expect(slots[i], `${entry.id} 第 ${i + 1} 环`).toBeLessThanOrEqual(slots[i - 1])
        }
      }
    }
  })

  it('职业资源 scaleValue 与专精、ASI、选择', async () => {
    const all = await load()
    const barbarian = scales(all.get('class.barbarian.phb'))
    expect(at(barbarian.get('rage-uses'), 9)).toBe(4)
    expect(at(barbarian.get('rage-damage'), 9)).toBe(3)
    const monk = scales(all.get('class.monk.phb'))
    expect(at(monk.get('martial-arts'), 9)).toBe('1d6')
    expect(at(monk.get('ki-points'), 9)).toBe(9)
    expect(at(monk.get('unarmored-movement'), 9)).toBe(15)
    expect(at(scales(all.get('class.rogue.phb')).get('sneak-attack'), 9)).toBe('5d6')
    expect(at(scales(all.get('class.sorcerer.phb')).get('sorcery-points'), 9)).toBe(9)
    expect(at(scales(all.get('class.bard.phb')).get('bardic-inspiration'), 1)).toBe('1d6')
    expect(at(scales(all.get('class.bard.phb')).get('bardic-inspiration'), 5)).toBe('1d8')
    expect(scales(all.get('subclass.fighter-battle-master.phb')).has('superiority-dice')).toBe(true)
    expect(scales(all.get('class.cleric.phb')).has('channel-divinity')).toBe(true)
    const fighter = all.get('class.fighter.phb')!
    expect((fighter.data.advancement as Array<{ kind: string; level: number }>).filter((a) => a.kind === 'abilityScoreImprovement').map((a) => a.level)).toEqual([4, 6, 8, 12, 14, 16, 19])
    const rogue = all.get('class.rogue.phb')!
    expect((rogue.data.advancement as Array<{ kind: string }>).some((a) => a.kind === 'expertise')).toBe(true)
    expect((rogue.data.advancement as Array<{ kind: string }>).some((a) => a.kind === 'abilityScoreImprovement')).toBe(true)
  })
})
