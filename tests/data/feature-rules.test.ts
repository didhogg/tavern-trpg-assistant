import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { FEATURE_NO_USES } from '../../tools/data/config/featureRules'
import { parseFormula } from '../../src/rules/dnd5e2014/data/formula'

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

const marker = /(使用|施展|消耗).{0,20}(\d+次|次数|长休|短休)|(完成|经过|直到).{0,8}(短休|长休).{0,20}(再次|恢复|重获|使用|施展)|每(次)?(长休|短休)|充能/
const text = (e: Entry): string => JSON.stringify(e.data.text ?? '')

function collectScaleIds(entries: Entry[]): Set<string> {
  const out = new Set<string>()
  for (const entry of entries) for (const item of (entry.data.advancement as Array<Record<string, unknown>> | undefined) ?? []) {
    if (item.kind === 'scaleValue' && typeof item.id === 'string') out.add(item.id)
  }
  return out
}

function walkFormulas(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    if (/scale\.|prof|\.mod|level/.test(value) && !/\s/.test(value)) out.push(value)
    return
  }
  if (Array.isArray(value)) { for (const item of value) walkFormulas(item, out); return }
  if (value && typeof value === 'object') for (const item of Object.values(value)) walkFormulas(item, out)
}

describe('P5 特性使用次数、效果与行动', () => {
  it('明确次数/恢复语言的使用次数覆盖率 ≥95%', async () => {
    const entries = await load()
    const features = entries.filter((e) => e.type === 'feature')
    const candidates = features.filter((e) => marker.test(text(e)) && !FEATURE_NO_USES.has(e.id))
    const covered = candidates.filter((e) => e.data.uses)
    expect(candidates.length).toBeGreaterThan(250)
    expect(covered.length / candidates.length).toBeGreaterThanOrEqual(0.95)
  })

  it('所有 uses 公式可解析、所有 scale 引用有定义', async () => {
    const entries = await load()
    const scales = collectScaleIds(entries)
    for (const e of entries) {
      const uses = e.data.uses as { max?: number | string } | undefined
      if (typeof uses?.max === 'string') {
        const parsed = parseFormula(uses.max)
        expect(parsed.ok, `${e.id} uses.max: ${uses.max}`).toBe(true)
        for (const match of uses.max.matchAll(/scale\.([a-z0-9-]+)/g)) expect(scales.has(match[1]), `${e.id} → ${match[1]}`).toBe(true)
      }
      const formulas: string[] = []
      walkFormulas(e.data.effects, formulas)
      for (const formula of formulas) expect(parseFormula(formula).ok || formula.endsWith('.mod') || formula.endsWith('.score'), `${e.id}: ${formula}`).toBe(true)
    }
  })

  it('金样：狂暴、无甲防御、回气、动作如潮、偷袭、吟游诗人灵感、圣疗、狂野变形、龙裔吐息、矮人坚韧', async () => {
    const entries = await load()
    const byId = new Map(entries.map((e) => [e.id, e]))
    const rage = byId.get('feature.barbarian-rage.phb')!.data
    expect(rage.uses).toEqual({ max: 'scale.rage-uses', recharge: 'long' })
    expect(rage.effects).toContainEqual(expect.objectContaining({ kind: 'damageBonus', amount: 'scale.rage-damage' }))
    expect(rage.effects).toContainEqual(expect.objectContaining({ kind: 'resistance', damage: ['bludgeoning', 'piercing', 'slashing'] }))
    expect((byId.get('feature.barbarian-unarmored-defense.phb')!.data.effects as Array<{ formula: string }>)[0].formula).toContain('con.mod')
    expect((byId.get('feature.monk-unarmored-defense.phb')!.data.effects as Array<{ formula: string }>)[0].formula).toContain('wis.mod')
    expect(byId.get('feature.fighter-second-wind.phb')!.data.activities).toContainEqual(expect.objectContaining({ kind: 'heal' }))
    expect(byId.get('feature.fighter-action-surge.phb')!.data.uses).toMatchObject({ max: 'scale.action-surge' })
    expect(byId.get('feature.rogue-sneak-attack.phb')!.data.effects).toContainEqual(expect.objectContaining({ kind: 'damageBonus', amount: 'scale.sneak-attack' }))
    expect(byId.get('feature.bard-bardic-inspiration.phb')!.data.uses).toMatchObject({ max: 'max(1,cha.mod)' })
    expect(byId.get('feature.paladin-lay-on-hands.phb')!.data.activities).toContainEqual(expect.objectContaining({ kind: 'heal' }))
    expect(byId.get('feature.druid-wild-shape.phb')!.data.uses).toMatchObject({ max: 2 })
    expect(byId.get('feature.dragonborn-breath-weapon.phb')!.data.uses).toMatchObject({ max: 1 })
    expect(byId.get('feature.dwarf-dwarven-resilience.phb')!.data.effects).toContainEqual(expect.objectContaining({ kind: 'resistance', damage: ['poison'] }))
  })
})
