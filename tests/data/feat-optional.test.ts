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

describe('P4 专长与可选特性', () => {
  it('健壮、警觉、重甲大师、战地施法者、哨兵金样', async () => {
    const all = await load()
    expect(all.get('feat.tough.phb')?.data.effects).toContainEqual({ kind: 'hpMax', perLevel: 2, transfer: true })
    expect(all.get('feat.alert.phb')?.data.effects).toContainEqual({ kind: 'initiative', bonus: 5, transfer: true })
    expect(all.get('feat.heavy-armor-master.phb')?.data.abilityIncrease).toEqual([{ ability: 'str', amount: 1 }])
    expect(all.get('feat.heavy-armor-master.phb')?.data.requires).toMatchObject({ all: [{ proficiency: { armor: 'heavy' } }] })
    expect((all.get('feat.heavy-armor-master.phb')?.data.effects as Array<{ kind: string }>)[0].kind).toBe('note')
    expect(all.get('feat.war-caster.phb')?.data.requires).toMatchObject({ all: [{ spellcasting: true }] })
    expect(all.get('feat.war-caster.phb')?.data.effects).toContainEqual({ kind: 'advantage', on: 'save', scope: 'concentration', transfer: true })
    expect((all.get('feat.sentinel.phb')?.data.effects as Array<{ kind: string }>)[0].kind).toBe('note')
  })

  it('可选特性的前置条件、消耗与苦痛魔爆效果', async () => {
    const all = await load()
    const agonizing = all.get('feature.agonizing-blast.phb')!
    expect(agonizing.data.requires).toMatchObject({ all: [{ text: expect.stringContaining('魔能爆') }] })
    expect(agonizing.data.effects).toContainEqual({ amount: 'cha.mod', kind: 'damageBonus', scope: 'spell', transfer: true })
    const trip = all.get('feature.trip-attack.phb')!
    expect(trip.data.activities).toContainEqual(expect.objectContaining({ kind: 'utility', consumption: { targets: [expect.objectContaining({ type: 'resource', target: '卓越骰' })] } }))
  })

  it('专长属性提升与可选特性数量统计', async () => {
    const all = await load()
    const feats = [...all.values()].filter((e) => e.type === 'feat')
    expect(feats.length).toBeGreaterThanOrEqual(74)
    expect(feats.filter((e) => e.data.abilityIncrease).length).toBeGreaterThan(0)
    const optional = [...all.values()].filter((e) => e.type === 'feature' && e.data.optional === true)
    expect(optional.length).toBe(151)
    expect(optional.every((e) => (e.data.owner as { type?: string } | undefined)?.type !== 'optional')).toBe(true)
    expect(optional.every((e) => Array.isArray(e.data.optionKind) && e.data.optionKind.length > 0)).toBe(true)
    expect(optional.filter((e) => e.data.requires).length).toBeGreaterThan(0)
    expect(all.get('feature.agonizing-blast.phb')?.data.requires).toMatchObject({ all: [{ text: expect.stringContaining('魔能爆') }] })
    expect(all.get('feature.thirsting-blade.phb')?.data.requires).toBeTruthy()
    const warlock = all.get('class.warlock.phb')!
    const level2 = (warlock.data.advancement as Array<Record<string, unknown>>).find((a) => a.kind === 'itemChoice' && a.level === 2)
    expect(level2).toMatchObject({ count: 2, optionKind: ['EI'] })
    const fighter = all.get('class.fighter.phb')!
    expect((fighter.data.advancement as Array<Record<string, unknown>>).find((a) => a.kind === 'itemChoice' && a.level === 1)).toMatchObject({ count: 1, optionKind: ['FS:F'] })
  })
})
