import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { NPC_RACES } from '../../tools/data/config/npcRaces'
import type { Entry } from '../../src/schemas/pack'

const ROOT = process.cwd()
const file = (id: string): string => (id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(ROOT, '..', 'tavern-trpg-data', 'packs', 'dnd5e2014', `${id}-${BOOKS.find((x) => x.packId === id)!.version}.trpgpack`))
async function packs(): Promise<{ all: Map<string, Entry>; requires: Map<string, string[]> }> {
  const all = new Map<string, Entry>()
  const requires = new Map<string, string[]>()
  for (const id of [SRD_PACK_ID, ...BOOKS.map((x) => x.packId)]) {
    if (!existsSync(file(id))) throw new Error(`缺少 ${file(id)}`)
    const zip = unzipSync(new Uint8Array(await readFile(file(id))))
    for (const [name, data] of Object.entries(zip)) {
      if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) all.set(e.id, e)
      if (name === 'trpg-manifest.json') requires.set(id, ((JSON.parse(strFromU8(data)) as { pack: { relationships: { requires: Array<{ id: string }> } } }).pack.relationships.requires).map((r) => r.id))
    }
  }
  return { all, requires }
}
const d = (e: Entry | undefined): Record<string, unknown> => (e?.data ?? {}) as Record<string, unknown>

describe('R10 重印标记、NPC 种族、同书同名', () => {
  it('supersededBy：怪物 263、种族 14、亚种族 11，目标都存在且在范围内的书里', async () => {
    const { all } = await packs()
    const by: Record<string, number> = {}
    for (const e of all.values()) {
      const target = d(e).supersededBy
      if (typeof target !== 'string') continue
      by[e.type] = (by[e.type] ?? 0) + 1
      expect(all.has(target), `${e.id} → ${target}`).toBe(true)
    }
    expect(by).toEqual({ monster: 263, race: 14, subrace: 11, rule: 1, cult: 2, reward: 8 })
  })

  it('金样与跨包软引用', async () => {
    const { all, requires } = await packs()
    expect(d(all.get('monster.abjurer.vgm')).supersededBy).toBe('monster.abjurer-wizard.mpmm')
    expect(d(all.get('race.aasimar.vgm')).supersededBy).toBe('race.aasimar.mpmm')
    expect(d(all.get('race.aasimar.dmg')).supersededBy).toBeUndefined()
    expect(d(all.get('race.aasimar.mpmm')).supersededBy).toBeUndefined()
    expect(requires.get('dnd5e2014-vgm')).not.toContain('dnd5e2014-mpmm')
    expect(requires.get('dnd5e2014-mm')).not.toContain('dnd5e2014-mpmm')
  })

  it('范围内的重印里，没有解析出来的只剩 3 个布耶格之奴（来源数据里没有它们指向的 MPMM 条目，列入报告）', async () => {
    const { all } = await packs()
    const missing = [...all.values()].filter((e) => e.type === 'monster' && e.id.endsWith('.vgm') && /^monster\.booyahg-slave-of-/.test(e.id) && !d(e).supersededBy).map((e) => e.id).sort()
    expect(missing).toEqual(['monster.booyahg-slave-of-the-archfey.vgm', 'monster.booyahg-slave-of-the-fiend.vgm', 'monster.booyahg-slave-of-the-great-old-one.vgm'])
  })

  it('playable：DMG 282 页 16 个 NPC 种族为 false，阿斯莫没有该字段', async () => {
    const { all } = await packs()
    const off = [...all.values()].filter((e) => d(e).playable === false)
    expect(off).toHaveLength(16)
    expect(new Set(off.map((e) => e.nameEn))).toEqual(new Set(NPC_RACES))
    expect(off.every((e) => e.type === 'race' && e.id.endsWith('.dmg'))).toBe(true)
    expect(d(all.get('race.aasimar.dmg')).playable).toBeUndefined()
  })

  it('同书同名：非特性类为 0，捕网无伤害版带后缀', async () => {
    const { all } = await packs()
    const groups = new Map<string, string[]>()
    for (const e of all.values()) {
      if (e.type === 'feature' || e.type === 'deity') continue
      const key = `${e.type}|${(d(e).src as { book: string }).book}|${e.name}`
      groups.set(key, [...(groups.get(key) ?? []), e.id])
    }
    expect([...groups].filter(([, v]) => v.length > 1)).toEqual([])
    for (const n of [1, 2, 3]) {
      expect(all.get(`item.net-plus-${n}.dmg`)!.name).toBe(`捕网 +${n}`)
      expect(all.get(`item.net-plus-${n}-no-damage.dmg`)!.name).toBe(`捕网 +${n}（无伤害）`)
      expect(d(all.get(`item.net-plus-${n}-no-damage.dmg`)).nameSuffix).toBe('无伤害')
    }
  })
})
