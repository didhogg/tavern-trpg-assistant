import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import type { ConvertedPack } from '../../tools/data/convert'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { checkReferences } from '../../tools/data/validate/refs'
import { REQUIRES_TEXT_ALLOWED } from '../../tools/data/config/requiresTextAllowed'

const ROOT = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const BASELINE = JSON.parse(await readFile(join(ROOT, 'tests/fixtures/baseline-ids.json'), 'utf8')) as string[]
async function loadPacks(): Promise<ConvertedPack[]> {
  const files = [{ id: SRD_PACK_ID, file: join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) }, ...BOOKS.map((b) => ({ id: b.packId, file: join(DATA_REPO, 'packs', 'dnd5e2014', `${b.packId}-${b.version}.trpgpack`) }))]
  return Promise.all(files.map(async (p) => {
    if (!existsSync(p.file)) throw new Error(`缺少 ${p.file}`)
    const zip = unzipSync(new Uint8Array(await readFile(p.file)))
    const entries: Entry[] = []
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) entries.push(...(JSON.parse(strFromU8(data)) as Entry[]))
    return { manifest: { id: p.id } as ConvertedPack['manifest'], entries, features: [] }
  }))
}
const allOf = (packs: ConvertedPack[]): Map<string, Entry> => new Map(packs.flatMap((p) => p.entries).map((e) => [e.id, e]))
const hasTrait = (e: Entry): boolean => ((e.data.advancement as Array<Record<string, unknown>> | undefined) ?? []).some((a) => a.kind === 'trait')
const groups = (e: Entry): Array<Record<string, unknown>> => ((e.data.advancement as Array<Record<string, unknown>> | undefined) ?? []).filter((a) => a.kind === 'trait')

describe('RW20–RW25 验收（§20.8）', () => {
  it('1 条目 id 包含 5,985 基线', async () => {
    const all = allOf(await loadPacks())
    expect(BASELINE.filter((id) => !all.has(id))).toEqual([])
  })
  it('2 引用完整性悬空 0', async () => {
    expect((await checkReferences(await loadPacks())).dangling).toEqual([])
  })
  it('3 变体模板 82、variantOf/baseItem 可解析、每模板至少一件', async () => {
    const all = allOf(await loadPacks())
    const templates = [...all.values()].filter((e) => e.type === 'item' && e.data.category === 'template')
    expect(templates).toHaveLength(82)
    const variants = [...all.values()].filter((e) => e.type === 'item' && e.data.variantOf)
    expect(variants.every((e) => all.has(String(e.data.variantOf)))).toBe(true)
    expect(variants.every((e) => all.has(String(e.data.baseItem)))).toBe(true)
    for (const t of templates) expect([...all.values()].some((e) => e.data.variantOf === t.id), t.id).toBe(true)
  })
  it('4 +1 长剑金样', async () => {
    const all = allOf(await loadPacks())
    const sword = all.get('item.longsword-plus-1.dmg')!
    expect(sword.data.variantOf).toBe('item.plus-1-weapon.dmg')
    expect(sword.data.baseItem).toBe('item.longsword.phb')
  })
  it('5 家族 37 与关键成员数', async () => {
    const all = allOf(await loadPacks())
    const families = [...all.values()].filter((e) => e.type === 'item' && e.data.category === 'family')
    expect(families).toHaveLength(37)
    for (const family of families) { expect(family.name.endsWith('（系列）'), family.id).toBe(true); expect(String(family.nameEn).endsWith(' (Family)'), family.id).toBe(true) }
    const byName = new Map(families.map((f) => [f.name, f]))
    expect((byName.get('治疗药水（系列）')?.data.members as string[])).toHaveLength(4)
    expect((byName.get('抗性护甲（系列）')?.data.members as string[])).toHaveLength(10)
    expect((byName.get('巨人之力腰带（系列）')?.data.members as string[])).toHaveLength(6)
    expect((byName.get('工匠工具（系列）')?.data.members as string[])).toHaveLength(17)
    expect((byName.get('艾恩石（系列）')?.data.members as string[])).toHaveLength(14)
    expect([...all.values()].filter((e) => e.type === 'item' && e.data.family !== undefined).length).toBe(0)
  })
  it('6 前置条件金样与 text 兜底', async () => {
    const all = allOf(await loadPacks())
    expect(all.get('feature.agonizing-blast.phb')?.data.requires).toEqual({ all: [{ spell: ['spell.eldritch-blast.phb'] }] })
    expect(all.get('feature.thirsting-blade.phb')?.data.requires).toEqual({ all: [{ level: 5, class: ['class.warlock.phb'] }, { pact: 'blade' }] })
    expect(all.get('feat.ritual-caster.phb')?.data.requires).toEqual({ any: [{ ability: { int: 13 } }, { ability: { wis: 13 } }] })
    const textCount = [...all.values()].reduce((n, e) => { const walk = (v: unknown): number => { if (Array.isArray(v)) return v.reduce((a, x) => a + walk(x), 0); if (v && typeof v === 'object') return Object.entries(v).reduce((a, [k, x]) => a + (k === 'text' ? 1 : walk(x)), 0); return 0 }; return n + walk(e.data.requires) }, 0)
    expect(textCount).toBeLessThanOrEqual(Object.keys(REQUIRES_TEXT_ALLOWED).length)
  })
  it('7 简介特性 109、子职业 text 不是 mechanic 正文、协力者例外', async () => {
    const all = allOf(await loadPacks())
    const subs = [...all.values()].filter((e) => e.type === 'subclass')
    expect([...all.values()].filter((e) => e.type === 'feature' && e.data.role === 'intro')).toHaveLength(109)
    for (const sub of subs) {
      const text = JSON.stringify(sub.data.text)
      const mechanic = [...all.values()].find((e) => e.type === 'feature' && e.data.role === 'mechanic' && JSON.stringify(e.data.text) === text)
      expect(mechanic, sub.id).toBeUndefined()
    }
    const missing = [...all.values()].filter((e) => e.type === 'class').flatMap((c) => ((c.data.advancement as Array<Record<string, unknown>> | undefined) ?? []).filter((a) => a.kind === 'subclass' && !a.explain)).map((a) => a)
    expect(missing).toHaveLength(1)
  })
  it('8 种族/亚种族/专长 trait 数', async () => {
    const all = allOf(await loadPacks())
    expect([...all.values()].filter((e) => e.type === 'race' && hasTrait(e))).toHaveLength(54)
    expect([...all.values()].filter((e) => e.type === 'subrace' && hasTrait(e))).toHaveLength(15)
    expect([...all.values()].filter((e) => e.type === 'feat' && hasTrait(e))).toHaveLength(14)
    expect(groups(all.get('race.elf.phb')!)).toContainEqual(expect.objectContaining({ grants: expect.arrayContaining(['skill:perception']) }))
    expect(groups(all.get('subrace.elf-high.phb')!).some((a) => (a.grants as string[]).includes('weapon:longsword'))).toBe(true)
    expect(groups(all.get('race.half-elf.phb')!).some((a) => (a.choices as Array<{ count: number }>).some((c) => c.count === 2))).toBe(true)
  })
  it('9 spellGrants 字段为 0，spellGrant 效果足够', async () => {
    const all = allOf(await loadPacks())
    expect([...all.values()].filter((e) => e.data.spellGrants !== undefined)).toHaveLength(0)
    expect([...all.values()].flatMap((e) => (e.data.effects as Array<{ kind?: string }> | undefined) ?? []).filter((x) => x.kind === 'spellGrant').length).toBeGreaterThanOrEqual(70)
  })
  it('10 传说动作组 66 与唯一基础模板例外', async () => {
    const all = allOf(await loadPacks())
    const group = [...all.values()].filter((e) => e.type === 'monster' && (e.data.legendary as { group?: string } | undefined)?.group).map((e) => (e.data.legendary as { group: string }).group)
    expect(new Set(group).size).toBe(66)
    expect(new Set(group)).not.toContain('legendary.hag.vgm')
  })
  it('11 套组 17 且内容物可解析', async () => {
    const all = allOf(await loadPacks())
    const packs = [...all.values()].filter((e) => e.type === 'item' && Array.isArray(e.data.contents) && (e.data.contents as unknown[]).length)
    expect(packs).toHaveLength(17)
    for (const p of packs) for (const c of p.data.contents as Array<{ item: string }>) expect(all.has(c.item)).toBe(true)
  })
  it('12 孤儿特性 0', async () => {
    const all = allOf(await loadPacks())
    const refs = new Set<string>()
    for (const e of all.values()) for (const a of (e.data.advancement as Array<Record<string, unknown>> | undefined) ?? []) for (const id of [...((a.items as string[] | undefined) ?? []), ...((a.pool as string[] | undefined) ?? [])]) refs.add(id)
    expect([...all.values()].filter((e) => e.type === 'feature' && ['class', 'subclass'].includes(String((e.data.owner as { type?: string } | undefined)?.type)) && !refs.has(e.id))).toEqual([])
  })
})
