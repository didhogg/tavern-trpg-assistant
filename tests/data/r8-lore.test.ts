import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import type { TextBlock } from '../../src/schemas/text'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import type { ConvertedPack } from '../../tools/data/convert'

const ROOT = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const fileOf = (id: string): string => id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${BOOKS.find((b) => b.packId === id)!.version}.trpgpack`)

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
const allOf = (packs: ConvertedPack[]): Map<string, Entry> => new Map(packs.flatMap((p) => p.entries).map((e) => [e.id, e]))
const packOf = (packs: ConvertedPack[], id: string): string => packs.find((p) => p.entries.some((e) => e.id === id))!.manifest.id
const blocks = (entry: Entry | undefined): TextBlock[] => (entry?.data.lore as TextBlock[] | undefined) ?? []
function hasHeading(list: TextBlock[], heading: string): boolean {
  return list.some((b) => ('h' in b && b.h === heading) || ('h' in b && hasHeading(b.body, heading)))
}
function tablesUnder(list: TextBlock[], heading: string): Array<{ caption: string; rows: number }> {
  const out: Array<{ caption: string; rows: number }> = []
  const walk = (blocks: TextBlock[]): void => {
    for (const b of blocks) {
      if ('table' in b) out.push({ caption: b.table.caption ?? '', rows: b.table.rows.length })
      else if ('h' in b) walk(b.body)
      else if ('read' in b) walk(b.read)
    }
  }
  for (const b of list) {
    if ('h' in b && b.h === heading) walk(b.body)
    else if ('h' in b) {
      const nested = tablesUnder(b.body, heading)
      out.push(...nested)
    }
  }
  return out
}
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const item of value) allStrings(item, out)
  else if (value && typeof value === 'object') for (const item of Object.values(value)) allStrings(item, out)
  return out
}

describe('R8 描述文字验收（§22.8）', () => {
  it('1 野蛮人补丁在 PHB，SRD 条目没有 lore，首段是正文', async () => {
    const packs = await loadPacks(); const all = allOf(packs)
    expect(all.get('class.barbarian.phb')!.data.lore).toBeUndefined()
    const patch = all.get('lore.class.barbarian.phb')!
    expect(patch).toBeDefined()
    expect(packOf(packs, patch.id)).toBe('dnd5e2014-phb')
    expect((patch.data.target as string)).toBe('class.barbarian.phb')
    const first = blocks(patch)[0]
    expect('p' in first && first.p.startsWith('披裘执斧的高个男人')).toBe(true)
  })

  it('2 矮人补丁在 PHB，包含标题「矮小而结实」', async () => {
    const all = allOf(await loadPacks())
    const patch = all.get('lore.race.dwarf.phb')!
    expect(patch).toBeDefined()
    expect(hasHeading(blocks(patch), '矮小而结实')).toBe(true)
  })

  it('3 妖鬼婆内嵌 lore，包含「折磨弱者」，没有补丁', async () => {
    const all = allOf(await loadPacks())
    const entry = all.get('monster.annis-hag.vgm')!
    expect(blocks(entry).length).toBeGreaterThan(0)
    expect(hasHeading(blocks(entry), '折磨弱者')).toBe(true)
    expect(all.has('lore.monster.annis-hag.vgm')).toBe(false)
  })

  it('4 堕落阿斯莫内嵌 lore，首段是 prependArr 的文字', async () => {
    const all = allOf(await loadPacks())
    const entry = all.get('subrace.aasimar-fallen.vgm')!
    const first = blocks(entry)[0]
    expect('p' in first && first.p.startsWith('一个在青年时期接触了黑暗力量')).toBe(true)
    expect(blocks(entry).length).toBeGreaterThan(1)
  })

  it('5 鸟羽人与蓝纱一梦内嵌 lore', async () => {
    const all = allOf(await loadPacks())
    expect(blocks(all.get('race.aarakocra.mpmm')).length).toBeGreaterThan(0)
    expect(blocks(all.get('spell.dream-of-the-blue-veil.tce')).length).toBeGreaterThan(0)
  })

  it('6 德鲁伊「学习野兽形态」下有 10 张表且行数正确', async () => {
    const all = allOf(await loadPacks())
    const tables = tablesUnder(blocks(all.get('lore.class.druid.phb')), '学习野兽形态')
    expect(tables.map((t) => t.caption)).toEqual(['极地', '海岸', '荒漠', '森林', '草地', '丘陵', '山地', '沼泽', '幽暗地域', '水下'])
    expect(tables.map((t) => t.rows)).toEqual([7, 12, 21, 37, 35, 27, 10, 14, 11, 10])
  })

  it('8 拘禁无人机动作、布耶格之奴的 _mod 已生效', async () => {
    const all = allOf(await loadPacks())
    const drone = all.get('monster.advanced-detention-drone.bmt')!
    const actionNames = ((drone.data.actions as Array<{ name?: string }> | undefined) ?? []).map((a) => a.name)
    expect(actionNames).toContain('拘禁球')
    const traitNames = ((drone.data.traits as Array<{ name?: string }> | undefined) ?? []).map((t) => t.name)
    expect(traitNames).not.toContain('连接')
    for (const id of ['monster.booyahg-slave-of-the-archfey.vgm', 'monster.booyahg-slave-of-the-fiend.vgm', 'monster.booyahg-slave-of-the-great-old-one.vgm']) {
      const text = JSON.stringify(all.get(id)!.data)
      expect(text, id).toContain('地精')
      expect(text, id).not.toContain('魔契师')
    }
  })

  it('9 全部 lore 没有转换残留、图片字段或空表格单元', async () => {
    const all = allOf(await loadPacks())
    const loreEntries = [...all.values()].filter((e) => Array.isArray(e.data.lore))
    const text = allStrings(loreEntries.map((e) => e.data.lore)).join('\n')
    expect(text).not.toContain('[object Object]')
    expect(text).not.toContain('undefined')
    expect(text).not.toContain('{@')
    expect(text).not.toContain('{=')
    expect(text).not.toContain('images')
    for (const e of loreEntries) {
      for (const block of blocks(e)) {
        if (!('table' in block)) continue
        for (const row of block.table.rows) for (const cell of row) expect(cell, e.id).not.toBe('')
      }
    }
  })

  it('10 SRD 包没有任何条目带 data.lore', async () => {
    const srd = (await loadPacks()).find((p) => p.manifest.id === SRD_PACK_ID)!
    expect(srd.entries.filter((e) => e.data.lore !== undefined).map((e) => e.id)).toEqual([])
  })

  it('12 每个 lore 补丁 target 可解析，目标在 SRD 包', async () => {
    const packs = await loadPacks(); const all = allOf(packs)
    const patches = [...all.values()].filter((e) => e.type === 'lore')
    expect(patches.length).toBeGreaterThan(0)
    for (const patch of patches) {
      const target = String(patch.data.target)
      expect(all.has(target), patch.id).toBe(true)
      expect(packOf(packs, target), patch.id).toBe(SRD_PACK_ID)
    }
  })
})
