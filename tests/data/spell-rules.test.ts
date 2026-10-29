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

describe('P9 法术结构化', () => {
  it('法术都有职业列表；有攻击/豁免/伤害/治疗标记的都有行动', async () => {
    const spells = (await load()).filter((e) => e.type === 'spell')
    expect(spells).toHaveLength(480)
    expect(spells.filter((e) => !(e.data.classes as string[]).length)).toHaveLength(0)
    const marked = spells.filter((e) => e.data.spellAttack || e.data.save || e.data.damage || (e.data.activities as Array<{ kind: string }>).some((a) => a.kind === 'heal'))
    const covered = marked.filter((e) => (e.data.activities as unknown[]).length > 0)
    expect(covered.length / marked.length).toBeGreaterThanOrEqual(0.95)
  })

  it('火球术、魔法飞弹、疗伤术、致病射线、灼热射线、魅惑类人、脚底抹油金样', async () => {
    const byId = new Map((await load()).map((e) => [e.id, e]))
    expect(byId.get('spell.fireball.phb')?.data).toMatchObject({ classes: ['class.sorcerer.phb', 'class.wizard.phb'], save: ['dex'], damage: [{ dice: '8d6', type: 'fire' }] })
    expect((byId.get('spell.fireball.phb')?.data.activities as Array<{ kind: string; onSave: string }>)[0]).toMatchObject({ kind: 'save', onSave: 'half' })
    expect((byId.get('spell.magic-missile.phb')?.data.activities as Array<{ kind: string }>)[0].kind).toBe('damage')
    expect(byId.get('spell.cure-wounds.phb')?.data.classes).toContain('class.cleric.phb')
    expect((byId.get('spell.cure-wounds.phb')?.data.activities as Array<{ kind: string; formula: string }>)[0]).toMatchObject({ kind: 'heal', formula: '1d8' })
    expect((byId.get('spell.ray-of-sickness.phb')?.data.activities as Array<{ kind: string }>).map((a) => a.kind)).toEqual(['attack', 'save'])
    expect((byId.get('spell.scorching-ray.phb')?.data.activities as Array<{ attackKind: string }>)[0].attackKind).toBe('rs')
    expect((byId.get('spell.charm-person.phb')?.data.activities as Array<{ kind: string; damage?: unknown }>)[0]).toMatchObject({ kind: 'save' })
    expect((byId.get('spell.expeditious-retreat.phb')?.data.classes as string[]).length).toBeGreaterThan(0)
  })
})
