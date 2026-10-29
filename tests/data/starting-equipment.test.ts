import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'

const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
async function load(): Promise<Entry[]> {
  const files = [join(process.cwd(), 'packs', `${SRD_PACK_ID}.trpgpack`), ...BOOKS.map((b) => join(DATA_REPO, 'packs', 'dnd5e2014', `${b.packId}-${b.version}.trpgpack`))]
  const out: Entry[] = []
  for (const file of files) {
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) out.push(...(JSON.parse(strFromU8(data)) as Entry[]))
  }
  return out
}

describe('P10 起始装备', () => {
  it('12 个基础职业 + 奇械师都有结构化起装', async () => {
    const entries = await load()
    const classes = entries.filter((e) => e.type === 'class')
    for (const c of classes) expect(Array.isArray(c.data.startingEquipment), c.id).toBe(true)
    const wizard = entries.find((e) => e.id === 'class.wizard.phb')!
    expect(wizard.data.startingEquipment).toEqual(expect.arrayContaining([expect.objectContaining({ gold: { dice: '4d4', multiplier: 10 } })]))
    const fighter = entries.find((e) => e.id === 'class.fighter.phb')!
    expect(JSON.stringify(fighter.data.startingEquipment)).toContain('链甲')
    const artificer = entries.find((e) => e.id === 'class.artificer.tce')!
    expect((artificer.data.startingEquipment as unknown[]).length).toBeGreaterThan(0)
  })

  it('所有背景（自定义背景除外）都有结构化装备与金币选项', async () => {
    const entries = await load()
    for (const bg of entries.filter((e) => e.type === 'background')) {
      if (bg.id === 'background.custom-background.phb') continue
      expect((bg.data.equipment as unknown[]).length, bg.id).toBeGreaterThan(0)
    }
    const acolyte = entries.find((e) => e.id === 'background.acolyte.phb')!
    expect(JSON.stringify(acolyte.data.equipment)).toContain('圣徽')
  })
})
