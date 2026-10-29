import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import type { ConvertedPack } from '../../tools/data/convert'

const ROOT = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const EXPECTED_REQUIRES: Record<string, string[]> = {
  PHB: [], SCAG: ['PHB'], DMG: ['PHB', 'SCAG'], MM: ['DMG', 'SCAG'],
  XGE: ['PHB', 'DMG', 'SCAG'], TCE: ['PHB'], VGM: ['PHB'], MTF: ['PHB'], MPMM: ['PHB'], BMT: ['DMG', 'SCAG'],
}
const MOVED = [
  ['Advanced Detention Drone', 'dnd5e2014-bmt'],
  ['Animated Armor Detention Drone', 'dnd5e2014-bmt'],
  ['Adult Red Dracolich', 'dnd5e2014-tce'],
  ['Reflection', 'dnd5e2014-tce'],
  ['Hound of Ill Omen', 'dnd5e2014-xge'],
  ['Booyahg Booyahg Booyahg', 'dnd5e2014-vgm'],
  ['Booyahg Caster', 'dnd5e2014-vgm'],
  ['Booyahg Whip', 'dnd5e2014-vgm'],
  ['Booyahg Wielder', 'dnd5e2014-vgm'],
] as const

function fileOf(id: string): string {
  return id === SRD_PACK_ID
    ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`)
    : join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${BOOKS.find((b) => b.packId === id)!.version}.trpgpack`)
}

async function loadPacks(): Promise<ConvertedPack[]> {
  return Promise.all([{ id: SRD_PACK_ID }, ...BOOKS.map((x) => ({ id: x.packId }))].map(async (b) => {
    const file = fileOf(b.id)
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    const entries: Entry[] = []
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) entries.push(...(JSON.parse(strFromU8(data)) as Entry[]))
    return { manifest: JSON.parse(strFromU8(zip['trpg-manifest.json'])).pack as ConvertedPack['manifest'], entries, features: [] }
  }))
}

const packOf = (packs: ConvertedPack[], id: string): string => packs.find((p) => p.entries.some((e) => e.id === id))!.manifest.id

describe('R7 补丁二：SRD 标记与 _copy 归属', () => {
  it('J 非 SRD 包没有 credit.srd 为真，SRD 包没有 credit.srd 为假', async () => {
    const packs = await loadPacks()
    const nonSrd = packs.filter((p) => p.manifest.id !== SRD_PACK_ID).flatMap((p) => p.entries)
    const srd = packs.find((p) => p.manifest.id === SRD_PACK_ID)!.entries
    expect(nonSrd.filter((e) => (e.data.credit as { srd?: boolean } | undefined)?.srd === true).map((e) => e.id)).toEqual([])
    expect(srd.filter((e) => (e.data.credit as { srd?: boolean } | undefined)?.srd === false).map((e) => e.id)).toEqual([])
  })

  it('K 9 个 _copy 怪物在来源包，SRD 只有 PHB/DMG/MM 且为 2,227 条', async () => {
    const packs = await loadPacks()
    const srd = packs.find((p) => p.manifest.id === SRD_PACK_ID)!
    expect(srd.entries).toHaveLength(2227)
    expect(srd.manifest.entryCount).toBe(2227)
    expect([...new Set(srd.entries.map((e) => (e.data.src as { book?: string } | undefined)?.book))].sort()).toEqual(['DMG', 'MM', 'PHB'])
    for (const [name, expectedPack] of MOVED) {
      const entry = packs.flatMap((p) => p.entries).find((e) => e.nameEn === name)
      expect(entry, name).toBeDefined()
      expect(packOf(packs, entry!.id), name).toBe(expectedPack)
      expect((entry!.data.credit as { srd?: boolean }).srd, name).toBe(false)
    }
    for (const p of packs) {
      const source = p.manifest.id.replace('dnd5e2014-', '').toUpperCase()
      expect(p.manifest.relationships.requires.map((d) => d.id).sort(), p.manifest.id).toEqual((EXPECTED_REQUIRES[source] ?? []).map((s) => `dnd5e2014-${s.toLowerCase()}`).sort())
    }
  })
})
