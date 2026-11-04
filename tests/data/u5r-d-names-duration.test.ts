import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>
const entries = allEntries()
const terms = (kind: string): Set<string> => {
  const e = entries.find((x) => x.type === 'rule' && x.data.category === 'glossary' && x.data.glossary === kind)
  expect(e, `名称表 ${kind}`).toBeDefined()
  const list = (e!.data.terms as Array<{ code: string; name: string }>)
  expect(list.length).toBeGreaterThan(0)
  expect(new Set(list.map((t) => t.code)).size, `${kind} 的代码不重复`).toBe(list.length)
  for (const t of list) expect(t.name.trim(), `${kind}.${t.code} 有中文名`).not.toBe('')
  return new Set(list.map((t) => t.code))
}
const monsters = entries.filter((e) => e.type === 'monster')

describe('名称表（D5）：覆盖数据里实际出现的代码', () => {
  it('名称表只在 SRD 包里，类别是 glossary', () => {
    const glossary = entries.filter((e) => e.data.category === 'glossary')
    expect(glossary.length).toBeGreaterThan(0)
    for (const e of glossary) { expect(e.type).toBe('rule'); expect(e.id).toMatch(/^rule\.glossary-/) }
  })

  it('怪物的体型、生物类型、阵营字母都能在名称表里查到', () => {
    const size = terms('size'); const type = terms('creature-type'); const align = terms('alignment')
    const bad: string[] = []
    for (const m of monsters) {
      for (const s of (m.data.size as string[] | undefined) ?? []) if (!size.has(s)) bad.push(`${m.id} 体型 ${s}`)
      const t = (m.data.creatureType as { type?: string } | undefined)?.type
      if (t && !type.has(t)) bad.push(`${m.id} 生物类型 ${t}`)
      const a = m.data.alignment
      if (typeof a === 'string' && /^[A-Z]{1,2}( [A-Z]{1,2})*$/.test(a)) for (const letter of a.split(/\s+/).filter(Boolean)) if (!align.has(letter)) bad.push(`${m.id} 阵营 ${letter}`)
    }
    expect([...new Set(bad)].slice(0, 20)).toEqual([])
  })

  it('抗性、免疫、易伤里的纯代码都是名称表里的伤害类型；法术学派、武器特性也都查得到', () => {
    const dmg = terms('damage-type'); const school = terms('spell-school'); const prop = terms('weapon-property')
    const bad: string[] = []
    for (const e of entries) {
      for (const k of ['resist', 'immune', 'vulnerable']) for (const v of (e.data[k] as unknown[] | undefined) ?? []) if (typeof v === 'string' && /^[a-z]+$/.test(v) && !dmg.has(v)) bad.push(`${e.id} ${k} ${v}`)
      if (e.type === 'spell' && typeof e.data.school === 'string' && !school.has(e.data.school)) bad.push(`${e.id} 学派 ${e.data.school}`)
      const w = e.data.weapon as { properties?: string[] } | undefined
      for (const p of w?.properties ?? []) if (!prop.has(String(p).split('|')[0]!)) bad.push(`${e.id} 武器特性 ${p}`)
    }
    expect([...new Set(bad)].slice(0, 20)).toEqual([])
  })
})

describe('时长借用（D4）', () => {
  it('借来的时长都有来源标记，且形状合法', () => {
    const borrowed = entries.filter((e) => (e.data.extra as Rec | undefined)?.durationFrom !== undefined)
    expect(borrowed.length).toBeGreaterThan(0)
    for (const e of borrowed) {
      const d = e.data.duration as { type: string; amount?: number; unit?: string } | undefined
      expect(d, e.id).toBeDefined()
      expect(['timed', 'permanent', 'instant', 'special']).toContain(d!.type)
      if (d!.type === 'timed') { expect(d!.amount, e.id).toBeGreaterThan(0); expect(['round', 'minute', 'hour', 'day'], e.id).toContain(d!.unit) }
      expect(String((e.data.extra as Rec).durationFrom)).toMatch(/^(XPHB|XDMG|XMM)(\+(XPHB|XDMG|XMM))*$/)
    }
  })

  it('两版规则不同、按 2014 原文写入的 6 条：值取原文', () => {
    const want: Record<string, [number, string]> = {
      'feature.paladin-oath-of-devotion-sacred-weapon.phb': [1, 'minute'],
      'item.potion-of-invulnerability.dmg': [1, 'minute'],
      'feature.cleric-trickery-domain-blessing-of-the-trickster.phb': [1, 'hour'],
    }
    for (const [id, [amount, unit]] of Object.entries(want)) {
      const e = entries.find((x) => x.id === id)
      expect(e?.data.duration, id).toMatchObject({ type: 'timed', amount, unit })
      expect((e!.data.extra as Rec | undefined)?.durationFrom, id).toBeUndefined() // 来自原文，不是借的
    }
  })
})
