import { describe, expect, it } from 'vitest'
import { checkJoins } from '../../src/rules/dnd5e2014/data/joins'
import { loadAllPacks } from './r9-pack-helpers'
import { manifestOf } from './g1-snapshot'

type Rec = Record<string, unknown>

/**
 * G1：跨包扩展只有一条通用规则——「扩展包自己登记」（joins）。期望值：29 条塔莎可选职业特性的（职业、等级）来自 R15 对照英文版塔莎核对的结果。
 */
describe('G1 joins：全库合规与金样', () => {
  const packs = loadAllPacks()
  const all = new Map(packs.flatMap((p) => p.entries.map((e) => [e.id, { entry: e, pack: p.id }] as const)))
  const lookup = (id: string) => { const x = all.get(id); return x ? { type: x.entry.type, data: x.entry.data as Rec } : undefined }

  it('全库每个 joins 都通过语义检查，共 51 个特性登记（可选 45、选择池选项 6）', () => {
    const withJoins = [...all.values()].filter((x) => Array.isArray(x.entry.data.joins))
    expect(withJoins).toHaveLength(51)
    const problems = withJoins.flatMap((x) => checkJoins({ id: x.entry.id, type: x.entry.type, data: x.entry.data as Rec }, lookup))
    expect(problems).toEqual([])
    const kinds = withJoins.flatMap((x) => (x.entry.data.joins as Rec[]).map((j) => j.as))
    expect(kinds.filter((k) => k === 'optional')).toHaveLength(45)
    expect(kinds.filter((k) => k === 'option')).toHaveLength(6)
  })

  it('旧写法全部清除：没有 optional:"tce-ocf"、labels、升级授予上的 packId、joinsChoice', () => {
    for (const { entry } of all.values()) {
      expect(entry.data.joinsChoice, entry.id).toBeUndefined()
      for (const a of (entry.data.advancement as Rec[] | undefined) ?? []) {
        expect(a.optional, entry.id).not.toBe('tce-ocf')
        expect(a.labels, entry.id).toBeUndefined()
        expect(a.packId, entry.id).toBeUndefined()
      }
    }
  })

  it('升级授予、选择池、joins 的目标所在的包 ∈ 本包 + 声明的依赖（含间接依赖）+ SRD：不再有向上或越界的引用', () => {
    const direct = new Map(packs.map((p) => [p.id, manifestOf(p.id).requires]))
    const reach = (id: string): Set<string> => {
      const out = new Set<string>([id, 'dnd5e2014-srd'])
      const visit = (p: string): void => { for (const d of direct.get(p) ?? []) if (!out.has(d)) { out.add(d); visit(d) } }
      visit(id)
      return out
    }
    const bad: string[] = []
    for (const [id, { entry, pack }] of all) {
      const allowed = reach(pack)
      const targets = [
        ...((entry.data.advancement as Rec[] | undefined) ?? []).flatMap((a) => [...((a.items as string[] | undefined) ?? []), ...((a.pool as string[] | undefined) ?? [])]),
        ...((entry.data.joins as Rec[] | undefined) ?? []).flatMap((j) => [String(j.to), ...(j.replaces ? [String(j.replaces)] : []), ...(j.pool ? [String(j.pool)] : [])]),
      ]
      for (const target of targets) { const where = all.get(target)?.pack; if (!where || !allowed.has(where)) bad.push(`${id}（${pack}）→ ${target}（${where ?? '不存在'}）`) }
    }
    expect(bad.slice(0, 10)).toEqual([])
  })

  it('金样：德鲁伊 2 级「荒野伙伴」、牧师 2 级「神力掌控」、法师 3 级「戏法公式」都由塔莎自己登记，且职业里没有塔莎的授予', () => {
    const joinOf = (id: string) => ((all.get(id)!.entry.data.joins as Rec[]) ?? [])[0]
    expect(joinOf('feature.druid-wild-companion.tce')).toEqual({ to: 'class.druid.phb', level: 2, as: 'optional' })
    expect(joinOf('feature.cleric-channel-divinity-harness-divine-power.tce')).toMatchObject({ to: 'class.cleric.phb', level: 2, as: 'optional' })
    expect(joinOf('feature.wizard-cantrip-formulas.tce')).toEqual({ to: 'class.wizard.phb', level: 3, as: 'optional' })
    for (const cls of ['druid', 'cleric', 'wizard']) expect(JSON.stringify(all.get(`class.${cls}.phb`)!.entry.data.advancement)).not.toContain('.tce')
    expect(all.get('feature.druid-wild-companion.tce')!.pack).toBe('dnd5e2014-tce')
  })

  it('29 条塔莎可选职业特性：登记在 12 个职业上，数量与（职业、等级）对得上', () => {
    const rows = [...all.values()].filter((x) => x.entry.type === 'feature' && x.pack === 'dnd5e2014-tce' && ((x.entry.data.joins as Rec[] | undefined) ?? []).some((j) => String(j.to).startsWith('class.')))
    expect(rows).toHaveLength(29)
    const classes = new Set(rows.map((x) => String(((x.entry.data.joins as Rec[])[0]).to)))
    expect(classes.size).toBe(12)
  })

  it('负例：不合规的 joins 都会被检查出来', () => {
    const feat = (joins: unknown) => ({ id: 'feature.x.tce', type: 'feature', data: { joins } as Rec })
    const ok = [{ to: 'class.cleric.phb', level: 2, as: 'optional' }]
    expect(checkJoins(feat(ok), lookup)).toEqual([])
    expect(checkJoins(feat([{ to: 'class.nope.phb', level: 2, as: 'optional' }]), lookup)[0]).toContain('不存在')
    expect(checkJoins(feat([{ to: 'item.dagger.phb', level: 2, as: 'optional' }]), lookup)[0]).toContain('职业或子职业')
    expect(checkJoins(feat([{ to: 'class.cleric.phb', as: 'optional' }]), lookup)[0]).toContain('level')
    expect(checkJoins(feat([{ to: 'class.cleric.phb', level: 21, as: 'optional' }]), lookup)[0]).toContain('level')
    expect(checkJoins(feat([{ to: 'class.cleric.phb', level: 2, as: 'optional', replaces: 'feature.nope.phb' }]), lookup)[0]).toContain('replaces')
    expect(checkJoins(feat([{ to: 'class.cleric.phb', level: 2, as: 'optional', replaces: 'feature.wizard-spellcasting.phb' }]), lookup)[0]).toContain('目标自己的特性')
    expect(checkJoins(feat([{ to: 'subclass.barbarian-path-of-the-totem-warrior.phb', level: 5, as: 'option' }]), lookup)[0]).toContain('没有选择池')
    expect(checkJoins({ id: 'item.y.mm', type: 'item', data: { joins: [{ to: 'class.cleric.phb', level: 2, as: 'optional' }] } }, lookup)[0]).toContain('只能由特性登记')
    expect(checkJoins({ id: 'item.y.mm', type: 'item', data: { joins: [{ to: 'item.dagger.phb', as: 'member' }] } }, lookup)[0]).toContain('物品家族')
  })
})
