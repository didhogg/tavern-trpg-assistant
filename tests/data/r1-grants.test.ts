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
    if (!existsSync(file)) throw new Error(`缺少 ${file}，先运行 npm run build:data`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) for (const entry of JSON.parse(strFromU8(data)) as Entry[]) out.set(entry.id, entry)
  }
  return out
}

const advancement = (e: Entry | undefined): Array<Record<string, unknown>> => ((e?.data.advancement as Array<Record<string, unknown>> | undefined) ?? [])
const itemsAt = (e: Entry | undefined, level: number): string[] => advancement(e).filter((a) => a.kind === 'itemGrant' && a.level === level).flatMap((a) => (a.items as string[] | undefined) ?? [])
const choicesAt = (e: Entry | undefined, level: number): Array<Record<string, unknown>> => advancement(e).filter((a) => a.kind === 'itemChoice' && a.level === level)

describe('R1 特性授予金样', () => {
  it('野蛮人 1 级与 2 级', async () => {
    const all = await load()
    expect(itemsAt(all.get('class.barbarian.phb'), 1)).toEqual(expect.arrayContaining(['feature.barbarian-rage.phb', 'feature.barbarian-unarmored-defense.phb']))
    expect(itemsAt(all.get('class.barbarian.phb'), 2)).toEqual(expect.arrayContaining(['feature.barbarian-reckless-attack.phb', 'feature.barbarian-danger-sense.phb']))
  })

  it('武僧 2 级气与无甲移动', async () => {
    const all = await load()
    expect(itemsAt(all.get('class.monk.phb'), 2)).toEqual(expect.arrayContaining([
      'feature.monk-ki.phb', 'feature.monk-flurry-of-blows.phb', 'feature.monk-patient-defense.phb',
      'feature.monk-step-of-the-wind.phb', 'feature.monk-unarmored-movement.phb',
    ]))
  })

  it('猎人 3 级与 7 级各 3 选 1', async () => {
    const all = await load()
    const hunter = all.get('subclass.ranger-hunter.phb')
    const three = choicesAt(hunter, 3)
    const seven = choicesAt(hunter, 7)
    expect(three).toHaveLength(1)
    expect(seven).toHaveLength(1)
    expect(three[0].count).toBe(1)
    expect(seven[0].count).toBe(1)
    expect(three[0].pool).toEqual(expect.arrayContaining([
      'feature.ranger-hunter-colossus-slayer.phb', 'feature.ranger-hunter-giant-killer.phb', 'feature.ranger-hunter-horde-breaker.phb',
    ]))
    expect(seven[0].pool).toEqual(expect.arrayContaining([
      'feature.ranger-hunter-escape-the-horde.phb', 'feature.ranger-hunter-multiattack-defense.phb', 'feature.ranger-hunter-steel-will.phb',
    ]))
  })

  it('死亡领域 1 级附赠熟练与收割者', async () => {
    const all = await load()
    expect(itemsAt(all.get('subclass.cleric-death-domain.dmg'), 1)).toEqual(expect.arrayContaining([
      'feature.cleric-death-domain-bonus-proficiency.dmg', 'feature.cleric-death-domain-reaper.dmg',
    ]))
  })

  it('孤儿特性为 0', async () => {
    const all = await load()
    const refs = new Set<string>()
    for (const entry of all.values()) for (const step of advancement(entry)) {
      for (const id of (step.items as string[] | undefined) ?? []) refs.add(id)
      for (const id of (step.pool as string[] | undefined) ?? []) refs.add(id)
    }
    const orphan = [...all.values()].filter((e) => e.type === 'feature' && ['class', 'subclass'].includes(String((e.data.owner as { type?: string } | undefined)?.type)) && !refs.has(e.id))
    expect(orphan.map((e) => e.id)).toEqual([])
  })
})
