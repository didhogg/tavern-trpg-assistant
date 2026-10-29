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
describe('R4 流程型特性与 explain', () => {
  it('属性值提升是 procedure，额外攻击/无甲防御是 mechanic', async () => {
    const all = await load()
    expect(all.get('feature.fighter-ability-score-improvement.phb')?.data.role).toBe('procedure')
    expect(all.get('feature.fighter-extra-attack.phb')?.data.role).toBe('mechanic')
    expect(all.get('feature.barbarian-unarmored-defense.phb')?.data.role).toBe('mechanic')
  })
  it('属性值提升和子职业步骤有 explain，子职业 text 非空', async () => {
    const all = await load()
    const fighter = all.get('class.fighter.phb')!
    const adv = fighter.data.advancement as Array<Record<string, unknown>>
    expect(adv.filter((a) => a.kind === 'abilityScoreImprovement').every((a) => typeof a.explain === 'string')).toBe(true)
    expect(adv.find((a) => a.kind === 'subclass')?.explain).toBeTruthy()
    const sub = all.get('subclass.fighter-champion.phb')!
    expect((sub.data.text as unknown[]).length).toBeGreaterThan(0)
  })
  it('role 清单可统计', async () => {
    const all = await load()
    const features = [...all.values()].filter((e) => e.type === 'feature')
    expect(features.filter((e) => e.data.role === 'procedure').length).toBeGreaterThan(0)
    expect(features.filter((e) => e.data.role === 'intro').length).toBeGreaterThan(0)
    expect(features.filter((e) => e.data.role === 'mechanic').length).toBeGreaterThan(0)
  })
})
