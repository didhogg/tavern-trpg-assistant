import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import { createServices } from '../../src/core/services'
import { uuid } from '../../src/core/ids'
import { uninstallPack } from '../../src/core/library/uninstall'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { ID_REDIRECTS } from '../../tools/data/config/idRedirects'
import type { ConvertedPack } from '../../tools/data/convert'
import { checkReferences } from '../../tools/data/validate/refs'

const ROOT = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const EXPECTED: Record<string, string[]> = {
  PHB: [], SCAG: ['PHB'], DMG: ['PHB', 'SCAG'], MM: ['DMG', 'SCAG'],
  XGE: ['PHB', 'DMG', 'SCAG'], TCE: ['PHB', 'SCAG', 'DMG', 'XGE'], VGM: ['PHB'], MTF: ['PHB'], MPMM: ['PHB'], BMT: ['DMG', 'SCAG'],
}
const fileOf = (id: string): string => id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${BOOKS.find((b) => b.packId === id)!.version}.trpgpack`)
async function loadPacks(): Promise<ConvertedPack[]> {
  const all: Array<{ id: string; layer: number }> = [{ id: SRD_PACK_ID, layer: 0 }, ...BOOKS.map((b) => ({ id: b.packId, layer: b.layer }))]
  return Promise.all(all.map(async (b) => {
    const file = fileOf(b.id)
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    const entries: Entry[] = []
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) entries.push(...JSON.parse(strFromU8(data)) as Entry[])
    const manifest = JSON.parse(strFromU8(zip['trpg-manifest.json'])).pack as ConvertedPack['manifest']
    return { manifest, entries, features: [] }
  }))
}
const allOf = (packs: ConvertedPack[]): Map<string, Entry> => new Map(packs.flatMap((p) => p.entries).map((e) => [e.id, e]))
const packOf = (packs: ConvertedPack[], id: string): string => packs.find((p) => p.entries.some((e) => e.id === id))!.manifest.id

describe('R7 第二轮补丁验收（§21.9）', () => {
  it('A 基线 5,985 且 §20.8 核心结构仍在', async () => {
    const baseline = JSON.parse(await readFile(join(ROOT, 'tests/fixtures/baseline-ids.json'), 'utf8')) as string[]
    const all = allOf(await loadPacks())
    const missing = baseline.filter((id) => !all.has(id) && !(ID_REDIRECTS[id] && all.has(ID_REDIRECTS[id].to)))
    expect(missing).toEqual([])
    for (const [oldId, redirect] of Object.entries(ID_REDIRECTS)) expect(all.has(redirect.to), `${oldId} → ${redirect.to}`).toBe(true)
    expect([...all.values()].filter((e) => e.type === 'item' && e.data.category === 'template')).toHaveLength(82)
    expect([...all.values()].filter((e) => e.type === 'item' && e.data.category === 'family')).toHaveLength(37)
    expect([...all.values()].filter((e) => e.type === 'feature' && e.data.role === 'intro')).toHaveLength(109)
  })
  it('B requires 表、layer 严格向下、无环', async () => {
    const packs = await loadPacks()
    const byId = new Map(BOOKS.map((b) => [b.packId, b]))
    for (const b of BOOKS) expect([...b.requiresBooks].sort(), b.source).toEqual([...EXPECTED[b.source]].sort())
    for (const b of BOOKS) for (const s of b.requiresBooks) expect(byId.get(`dnd5e2014-${s.toLowerCase()}`)?.layer, `${b.source}->${s}`).toBeLessThan(b.layer)
    const graph = new Map(BOOKS.map((b) => [`dnd5e2014-${b.source.toLowerCase()}`, b.requiresBooks.map((s) => `dnd5e2014-${s.toLowerCase()}`)]))
    const visiting = new Set<string>(); const done = new Set<string>()
    const visit = (id: string): void => { if (done.has(id)) return; if (visiting.has(id)) throw new Error(`cycle ${id}`); visiting.add(id); for (const n of graph.get(id) ?? []) visit(n); visiting.delete(id); done.add(id) }
    for (const id of graph.keys()) visit(id)
    for (const p of packs) expect(p.manifest.relationships.requires.map((d) => d.id).sort()).toEqual((EXPECTED[p.manifest.id.replace('dnd5e2014-', '').toUpperCase()] ?? []).map((s) => `dnd5e2014-${s.toLowerCase()}`).sort())
  })
  it('C SRD 严格引用、30 条软引用、无跨层 baseItem', async () => {
    const packs = await loadPacks()
    const srd = packs.find((p) => p.manifest.id === SRD_PACK_ID)!
    expect(srd.entries).toHaveLength(2408)
    const srdIds = new Set(srd.entries.map((e) => e.id))
    const badBase = srd.entries.filter((e) => e.data.baseItem && !srdIds.has(String(e.data.baseItem)))
    expect(badBase).toEqual([])
    const refs = await checkReferences(packs)
    expect(refs.dangling).toEqual([])
    const soft = srd.entries.flatMap((e) => ((e.data.advancement as Array<Record<string, unknown>> | undefined) ?? []).filter((a) => a.optional === 'tce-ocf').flatMap((a) => (a.items as string[] | undefined) ?? []))
    expect(soft).toHaveLength(30)
    expect(soft.every((id) => packs.find((p) => p.manifest.id === 'dnd5e2014-tce')!.entries.some((e) => e.id === id))).toBe(true)
    expect(srd.entries.filter((e) => (e.data.credit as { srd?: boolean } | undefined)?.srd === false)).toHaveLength(0)
  })
  it('D 五条展开物品归属金样', async () => {
    const packs = await loadPacks()
    expect(packOf(packs, 'item.longsword-plus-1.dmg')).toBe(SRD_PACK_ID)
    expect(packOf(packs, 'item.antimatter-rifle-plus-1.dmg')).toBe('dnd5e2014-dmg')
    expect((allOf(packs).get('item.antimatter-rifle-plus-1.dmg')!.data.credit as { srd?: boolean }).srd).toBeFalsy()
    expect(packOf(packs, 'item.antimatter-rifle-silvered.phb')).toBe('dnd5e2014-dmg')
    expect(packOf(packs, 'item.spiked-armor-adamantine.dmg')).toBe('dnd5e2014-dmg')
    expect(packOf(packs, 'item.spiked-armor-barding.phb')).toBe('dnd5e2014-scag')
  })
  it('E 家族后缀、无成员指针、成员数与层级、沙姆管双家族', async () => {
    const packs = await loadPacks(); const all = allOf(packs)
    const families = [...all.values()].filter((e) => e.type === 'item' && e.data.category === 'family')
    expect(families).toHaveLength(37)
    for (const f of families) { expect(f.name.endsWith('（系列）'), f.id).toBe(true); expect(String(f.nameEn).endsWith(' (Family)'), f.id).toBe(true) }
    expect([...all.values()].filter((e) => e.type === 'item' && e.data.family !== undefined)).toEqual([])
    const counts = new Map(families.map((f) => [f.name, (f.data.members as string[]).length]))
    expect(counts.get('治疗药水（系列）')).toBe(4); expect(counts.get('抗性护甲（系列）')).toBe(10); expect(counts.get('巨人之力腰带（系列）')).toBe(6)
    expect(counts.get('工匠工具（系列）')).toBe(17); expect(counts.get('艾恩石（系列）')).toBe(14)
    const layerOf = (id: string) => id === SRD_PACK_ID ? 0 : BOOKS.find((b) => b.packId === id)!.layer
    for (const f of families) { const fp = packOf(packs, f.id); const ml = Math.max(...(f.data.members as string[]).map((id) => layerOf(packOf(packs, id)))); expect(layerOf(fp)).toBeGreaterThanOrEqual(ml) }
    const shamisen = [...all.values()].filter((e) => e.name.includes('沙姆管') || e.name === '芦笛' || e.nameEn === 'Shawm').map((e) => e.id)
    const memberFamilies = families.filter((f) => shamisen.some((id) => (f.data.members as string[]).includes(id)))
    expect(memberFamilies.length).toBe(2)
  })
  it('F 同书同名 0 组（捕网无伤害版已加后缀）与治疗药水关键字', async () => {
    const packs = await loadPacks(); const all = allOf(packs)
    const groups = new Map<string, number>()
    for (const e of all.values()) { if (e.type === 'feature' || e.type === 'deity') continue; const book = (e.data.src as { book?: string } | undefined)?.book ?? ''; const k = `${book}|${e.type}|${e.name}|${String(e.data.category ?? e.data.partKind ?? e.data.hazardKind ?? '')}`; groups.set(k, (groups.get(k) ?? 0) + 1) }
    const dup = [...groups].filter(([, n]) => n > 1).map(([k]) => k)
    expect(dup).toHaveLength(0)
    const family = [...all.values()].find((e) => e.name === '治疗药水（系列）')!
    expect((family.keywords as string[])).toContain('治疗药水')
  })
  it('G 从低到高安装、从高到低卸载，PHB 被 DMG 需要', async () => {
    const s = createServices({ dbName: `layers-${uuid()}`, appVersion: '99.0.0' })
    const OWNER = { ownerKey: 'char:layers.png', ownerLabel: '层级测试' }
    try {
      const srd = s.packs.recognize(new Uint8Array(await readFile(fileOf(SRD_PACK_ID))))
      if (srd.type !== 'pack') throw new Error('SRD 不是包')
      await s.packs.install(srd, { source: 'builtin' })
      const ordered = [...BOOKS].sort((a, b) => a.layer - b.layer)
      for (const b of ordered) {
        const rec = s.packs.recognize(new Uint8Array(await readFile(fileOf(b.packId))))
        if (rec.type !== 'pack') throw new Error(`${b.packId} 不是包`)
        const plan = await s.packs.plan(rec)
        expect(plan.missingRequires, b.packId).toEqual([])
        await s.packs.install(rec, { source: 'download' })
      }
      await s.campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', packIds: [SRD_PACK_ID, ...ordered.map((b) => b.packId)], name: '层级测试' })
      expect((await s.library.previewDisable(OWNER.ownerKey, 'dnd5e2014-phb')).dependents).toContain('dnd5e2014-dmg')
      for (const b of [...ordered].sort((a, b) => b.layer - a.layer)) await uninstallPack({ db: s.db, packs: s.packs, rules: s.rules, now: s.now }, b.packId)
    } finally { s.db.close(); await s.db.delete() }
  }, 180_000)
})
