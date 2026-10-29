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
const grants = (e: Entry | undefined): Array<Record<string, unknown>> => (e?.data.advancement as Array<Record<string, unknown>> | undefined) ?? []

describe('R3 TCE 可选职业特性', () => {
  it('29 条 TCE 职业特性带 owner/optional', async () => {
    const all = await load()
    const tce = [...all.values()].filter((e) => e.type === 'feature' && e.data.optional === true && (e.data.src as { book?: string } | undefined)?.book === 'TCE' && (e.data.owner as { type?: string } | undefined)?.type === 'class')
    expect(tce).toHaveLength(29)
    expect(tce.every((e) => e.data.optional === true)).toBe(true)
  })

  it('游侠夙敌替换宿敌；原初学识不替换', async () => {
    const all = await load()
    const ranger = grants(all.get('class.ranger.phb')).filter((a) => a.optional === 'tce-ocf' && a.level === 1)
    expect(ranger.some((a) => (a.items as string[]).includes('feature.ranger-favored-foe.tce'))).toBe(true)
    expect(ranger.every((a) => a.replaces === 'feature.ranger-natural-explorer.phb' || a.replaces === 'feature.ranger-favored-enemy.phb' || a.replaces === undefined)).toBe(true)
    const barbarian = grants(all.get('class.barbarian.phb')).filter((a) => a.optional === 'tce-ocf' && a.level === 3)
    expect(barbarian.some((a) => (a.items as string[]).includes('feature.barbarian-primal-knowledge.tce'))).toBe(true)
    expect(barbarian.some((a) => a.replaces)).toBe(false)
  })
})
