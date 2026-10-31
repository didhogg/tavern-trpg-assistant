import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'
import { loadG1Before, manifestOf } from './g1-snapshot'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

/**
 * G1 只允许三种数据变化（与 G1 开工快照逐条对照）：
 * ① 删除 45 处指向塔莎的「可选授予」（optional: 'tce-ocf'，职业 29、子职业 16）；
 * ② 这 45 个特性与 6 个剑湾图腾选项各新增一条 joins，内容与被删的授予 / joinsChoice 一一对应；
 * ③ 删除 6 个 joinsChoice。
 * 其余：条目集合、编号、名字、英文名、摘要、关键词、所在的包、每个包的依赖、名称与 lineage 逐字节不变。
 */
describe('G1 只改允许的地方', () => {
  const before = loadG1Before()
  const now = new Map(loadAllPacks().flatMap((p) => p.entries.map((e) => [e.id, { pack: p.id, entry: e }] as const)))

  it('条目集合、所在的包完全不变', () => {
    expect([...now.keys()].sort()).toEqual(Object.keys(before.entries).sort())
    for (const [id, old] of Object.entries(before.entries)) expect(now.get(id)!.pack, id).toBe(old.pack)
  })

  it('每个包的依赖、名称、lineage 不变（版本号另在 g1-books 里检查）', () => {
    for (const [id, old] of Object.entries(before.packs)) {
      const m = manifestOf(id)
      expect({ requires: m.requires, name: m.name, nameEn: m.nameEn, lineage: m.lineage }, id).toEqual({ requires: old.requires, name: old.name, nameEn: old.nameEn, lineage: old.lineage })
    }
  })

  it('名字、英文名、摘要、关键词不变；data 只有 ①②③ 三种变化', () => {
    const bad: string[] = []
    const expectedJoins = new Map<string, Rec>()
    for (const [id, old] of Object.entries(before.entries)) {
      const adv = (old.data.advancement as Rec[] | undefined) ?? []
      for (const a of adv) if (a.optional === 'tce-ocf') expectedJoins.set((a.items as string[])[0], { to: id, level: a.level, as: 'optional', ...(a.replaces ? { replaces: a.replaces } : {}) })
      const jc = old.data.joinsChoice as { id: string; level: number } | undefined
      if (jc) expectedJoins.set(id, { to: jc.id, level: jc.level, as: 'option' })
    }
    expect(expectedJoins.size).toBe(51)
    for (const [id, old] of Object.entries(before.entries)) {
      const e = now.get(id)!.entry
      for (const key of ['name', 'nameEn', 'summary'] as const) if (e[key] !== old[key]) bad.push(`${id} ${key} 变了`)
      if (JSON.stringify(e.keywords) !== JSON.stringify(old.keywords)) bad.push(`${id} keywords 变了`)
      const expected: Rec = structuredClone(old.data)
      if (isObj(expected) && Array.isArray(expected.advancement)) expected.advancement = (expected.advancement as Rec[]).filter((a) => a.optional !== 'tce-ocf')
      delete expected.joinsChoice
      const join = expectedJoins.get(id)
      if (join) expected.joins = [join]
      if (Array.isArray(expected.advancement) && expected.advancement.length === 0 && !('advancement' in old.data)) delete expected.advancement
      if (JSON.stringify(sortKeys(e.data)) !== JSON.stringify(sortKeys(expected))) bad.push(`${id} data 与预期不同`)
    }
    expect(bad.slice(0, 10)).toEqual([])
  }, 180_000)
})

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys)
  if (isObj(v)) return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]))
  return v
}
