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

describe('P6 状态、力竭与动作规则', () => {
  it('15 个状态、2 个其他状态都有机械效果；力竭六级完整', async () => {
    const entries = await load()
    const conditions = entries.filter((e) => e.type === 'condition')
    const statuses = entries.filter((e) => e.type === 'status')
    expect(conditions.length).toBe(15)
    expect(statuses.length).toBe(2)
    for (const e of [...conditions, ...statuses]) expect((e.data.effects as unknown[]).length, e.id).toBeGreaterThan(0)
    const exhaustion = entries.find((e) => e.id === 'condition.exhaustion.phb')!
    expect(exhaustion.data.levels).toHaveLength(6)
    expect((exhaustion.data.levels as Array<{ level: number; effects: unknown[] }>).map((l) => l.level)).toEqual([1, 2, 3, 4, 5, 6])
    expect(entries.find((e) => e.id === 'condition.poisoned.phb')?.data.effects).toEqual([{ kind: 'disadvantage', on: 'attack' }, { kind: 'disadvantage', on: 'check' }])
    expect(entries.find((e) => e.id === 'condition.invisible.phb')?.data.effects).toContainEqual({ kind: 'advantage', on: 'initiative' })
  })

  it('九个 PHB 动作都有 activation、活动与效果', async () => {
    const entries = await load()
    const ids = ['dash', 'disengage', 'dodge', 'help', 'hide', 'ready', 'search', 'grapple', 'shove']
    for (const id of ids) {
      const e = entries.find((x) => x.id === `rule.${id}.phb`)
      expect(e, id).toBeTruthy()
      expect(e!.data.activation, id).toMatchObject({ type: 'action' })
      expect((e!.data.activities as unknown[]).length, id).toBeGreaterThan(0)
      expect((e!.data.effects as unknown[]).length, id).toBeGreaterThan(0)
    }
  })
})
