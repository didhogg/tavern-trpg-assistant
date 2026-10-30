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
const textOf = (entry: Entry): TextBlock[] => (entry.data.text as TextBlock[] | undefined) ?? []
const textLength = (blocks: TextBlock[]): number => blocks.map((b) => {
  if ('p' in b) return b.p.length
  if ('h' in b) return b.h.length + textLength(b.body)
  if ('list' in b) return b.list.join('').length
  if ('quote' in b) return b.quote.length
  if ('table' in b) return b.table.rows.flat().join('').length + b.table.cols.join('').length
  return textLength(b.read)
}).reduce((a, b) => a + b, 0)
function tables(blocks: TextBlock[]): Array<{ caption?: string; cols: string[]; rows: string[][] }> {
  const out: Array<{ caption?: string; cols: string[]; rows: string[][] }> = []
  for (const b of blocks) {
    if ('table' in b) out.push(b.table)
    else if ('h' in b) out.push(...tables(b.body))
    else if ('read' in b) out.push(...tables(b.read))
  }
  return out
}
const family = async (id: string): Promise<Entry> => {
  const entry = (await allEntries()).get(id)
  expect(entry, id).toBeDefined()
  return entry!
}

describe('R8b-B 家族来源说明文字', () => {
  it('1 维克那家族正文完整，首段正确', async () => {
    const e = await family('item.eye-and-hand-of-vecna-family.dmg')
    const blocks = textOf(e)
    const first = blocks[0]
    expect('p' in first && first.p.startsWith('维克那Vecna之名即为不语之代表')).toBe(true)
    expect(textLength(blocks)).toBeGreaterThanOrEqual(1500)
  })

  it('2 抗性护甲表 d10 / 伤害类型 10 行，首行指向强酸抗性护甲', async () => {
    const e = await family('item.armor-of-resistance-family.dmg')
    const t = tables(textOf(e)).find((x) => x.cols[0] === 'd10' && x.cols[1] === '伤害类型')
    expect(t).toBeDefined()
    expect(t!.rows).toHaveLength(10)
    expect(t!.rows[0][1]).toContain('item.armor-of-acid-resistance')
  })

  it('3 抗性戒指 3 列 10 行，夸尔羽符 d100 6 行', async () => {
    const ring = tables(textOf(await family('item.ring-of-resistance-family.dmg')))
    const rt = ring.find((x) => x.cols.length === 3)
    expect(rt?.rows).toHaveLength(10)
    const feather = tables(textOf(await family('item.quaals-feather-token-family.dmg')))
    const ft = feather.find((x) => x.cols[0] === 'd100')
    expect(ft?.rows).toHaveLength(6)
  })

  it('4 贤者印记 3 列 6 行', async () => {
    const t = tables(textOf(await family('item.sages-signet-family.bmt'))).find((x) => x.cols.length === 3)
    expect(t?.rows).toHaveLength(6)
  })

  it('5 没有来源正文的家族 text 为空数组', async () => {
    expect(textOf(await family('item.belt-of-giant-strength-family.dmg'))).toEqual([])
  })

  it('6 治疗药水脚注不导入，text 为空数组', async () => {
    expect(textOf(await family('item.potion-of-healing-family.dmg'))).toEqual([])
  })
})
