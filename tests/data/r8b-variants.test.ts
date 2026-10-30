import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import type { TextBlock } from '../../src/schemas/text'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'

const ROOT = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const fileOf = (id: string): string => id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${BOOKS.find((b) => b.packId === id)!.version}.trpgpack`)

async function allEntries(): Promise<Map<string, Entry>> {
  const out = new Map<string, Entry>()
  for (const b of [{ id: SRD_PACK_ID }, ...BOOKS.map((x) => ({ id: x.packId }))]) {
    const file = fileOf(b.id)
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) out.set(e.id, e)
  }
  return out
}
const variants = (entry: Entry | undefined): Array<{ name: string; nameEn?: string; kind: string; text: TextBlock[]; version?: { name: string; addHeadersAs?: string } }> => (entry?.data.variants as never) ?? []
const findHeading = (blocks: TextBlock[], heading: string): TextBlock | undefined => {
  for (const b of blocks) {
    if ('h' in b && b.h === heading) return b
    if ('h' in b) { const found = findHeading(b.body, heading); if (found) return found }
    if ('read' in b) { const found = findHeading(b.read, heading); if (found) return found }
  }
  return undefined
}

describe('R8b-C 怪物变体', () => {
  it('7 活体星辰内嵌变体，第一项名称与 5 个星辰列表', async () => {
    const e = (await allEntries()).get('monster.living-portent.bmt')!
    const v = variants(e)
    expect(v).toHaveLength(1)
    expect(v[0].name).toBe('活体星辰之碎片')
    expect(v[0].nameEn).toBe('Servants of Living Stars')
    expect(v[0].kind).toBe('variant')
    const list = v[0].text.find((b): b is { list: string[] } => 'list' in b)
    expect(list?.list).toHaveLength(5)
    expect(list?.list.join('')).toContain('埃克马')
    expect(list?.list.join('')).toContain('烛顿')
  })

  it('8 安祖魔带 version', async () => {
    const v = variants((await allEntries()).get('monster.amnizu.mpmm'))
    expect(v[0].version).toEqual({ name: '安祖魔（召唤师）', addHeadersAs: '动作' })
  })

  it('9 成年黑龙变体在 lore 补丁，SRD 条目无 variants', async () => {
    const all = await allEntries()
    const srd = all.get('monster.adult-black-dragon.mm')!
    expect(srd.data.variants).toBeUndefined()
    const patch = all.get('lore.monster.adult-black-dragon.mm')!
    expect(patch).toBeDefined()
    expect(variants(patch)[0].kind).toBe('inset')
    expect(variants(patch)[0].name).toBe('定制龙类')
  })

  it('10 绿鬼婆补丁里的共享施法 6 行', async () => {
    const all = await allEntries()
    expect(all.get('monster.green-hag.mm')!.data.variants).toBeUndefined()
    const patch = all.get('lore.monster.green-hag.mm')!
    const heading = findHeading(variants(patch)[0].text, '共享施法 (仅集会)')
    expect(heading && 'h' in heading).toBe(true)
    if (!heading || !('h' in heading)) throw new Error('missing heading')
    const list = heading.body.find((b): b is { list: string[] } => 'list' in b)
    expect(list?.list).toHaveLength(6)
    expect(list?.list[0]).toContain('1 环（4 个法术位）')
    expect(list?.list[5]).toContain('6 环（1 个法术位）')
  })

  it('V 151 个怪物、167 个变体块全部落位，SRD 条目无 variants', async () => {
    const all = await allEntries()
    const patches = new Map([...all.values()].filter((e) => e.type === 'lore').map((e) => [String(e.data.target), e]))
    const rows = [...all.values()].filter((e) => e.type === 'monster').map((e) => ({ e, v: variants(e).length ? variants(e) : variants(patches.get(e.id)) })).filter((x) => x.v.length)
    expect(rows).toHaveLength(154)
    expect(rows.reduce((n, x) => n + x.v.length, 0)).toBe(170)
    expect(rows.filter((x) => (x.e.data.credit as { srd?: boolean } | undefined)?.srd === true && x.e.data.variants !== undefined)).toEqual([])
  })

  it('11 萨堤补丁含 variantSub 小标题', async () => {
    const patch = (await allEntries()).get('lore.monster.satyr.mm')!
    const heading = findHeading(variants(patch)[0].text, '牧神笛')
    expect(heading && 'h' in heading).toBe(true)
  })
})
