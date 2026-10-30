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
describe('R7 怪物子结构与法术标签', () => {
  it('成年红龙有巢穴动作/区域效应与山地环境', async () => {
    const all = await load()
    const dragon = all.get('monster.adult-red-dragon.mm')!
    const leg = dragon.data.legendary as Record<string, unknown>
    expect(leg.lairActions).toBeTruthy()
    expect(leg.regionalEffects).toBeTruthy()
    expect(dragon.data.tags).toEqual(expect.arrayContaining(['山地']))
  })
  it('传说动作组覆盖至少 66 组', async () => {
    const all = await load()
    const ids = new Set([...all.values()].filter((e) => e.type === 'monster' && (e.data.legendary as Record<string, unknown> | undefined)?.group).map((e) => (e.data.legendary as { group: string }).group))
    expect(ids.size).toBeGreaterThanOrEqual(66)
  })
  it('法术标签存在', async () => {
    const all = await load()
    const fireball = all.get('spell.fireball.phb')!.data
    expect(fireball.tags as string[]).toEqual(expect.arrayContaining(['BO']))
    expect(fireball.tags as string[]).not.toContain('fire')
    expect(fireball.damageInflict as string[]).toContain('fire')
  })
})
