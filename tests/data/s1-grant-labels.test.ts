import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'

type Rec = Record<string, unknown>

/** S1：跨包的可选授予（optional: 'tce-ocf'）都带显示名与目标所在的包；其余授予不带。 */
describe('S1 可选授予的显示名', () => {
  const packs = loadAllPacks()
  const where = new Map(packs.flatMap((p) => p.entries.map((e) => [e.id, { packId: p.id, name: e.name }] as const)))
  const steps = packs.flatMap((p) => p.entries.flatMap((e) => (((e.data as Rec).advancement as Rec[] | undefined) ?? []).filter((a) => a.kind === 'itemGrant').map((a) => ({ entry: e.id, step: a }))))

  it('45 处可选授予全部带 labels 与 packId，名字与目标条目一致，packId 是目标所在的包', () => {
    const optional = steps.filter((x) => x.step.optional === 'tce-ocf')
    expect(optional.length).toBeGreaterThan(0)
    for (const { entry, step } of optional) {
      const labels = step.labels as Record<string, string>
      expect(labels, entry).toBeDefined()
      for (const id of step.items as string[]) {
        expect(labels[id], `${entry} → ${id}`).toBe(where.get(id)!.name)
        expect(step.packId, `${entry} → ${id}`).toBe(where.get((step.items as string[])[0])!.packId)
      }
    }
  })

  it('金样：德鲁伊 2 级的荒野伙伴显示名「荒野伙伴」、目标包是塔莎', () => {
    const druid = steps.find((x) => x.entry === 'class.druid.phb' && (x.step.items as string[]).includes('feature.druid-wild-companion.tce'))!
    expect(druid.step.labels).toEqual({ 'feature.druid-wild-companion.tce': '荒野伙伴' })
    expect(druid.step.packId).toBe('dnd5e2014-tce')
  })

  it('必得授予与选择授予不带 labels / packId', () => {
    for (const { entry, step } of steps.filter((x) => x.step.optional !== 'tce-ocf')) {
      expect(step.labels, entry).toBeUndefined()
      expect(step.packId, entry).toBeUndefined()
    }
  })
})
