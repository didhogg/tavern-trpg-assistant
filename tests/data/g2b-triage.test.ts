import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { isPlainMechanic, triage } from './consumer/triage'

const OUT = join(process.cwd(), 'docs/probes/D1.2-G2_纯文字特性分诊.json')

describe('G2b 纯文字机制特性分诊（b3）', () => {
  it('A 影响派生数值 / B 影响行动与资源 / C 叙述', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-triage')
    const all = l.of('feature').filter((r) => r.data.role === 'mechanic')
    const plain = all.filter(isPlainMechanic)
    const rows = plain.map((r) => ({ id: r.id, name: r.name, ...triage(r) }))
    const by = (c: string): typeof rows => rows.filter((x) => x.cls === c)
    rec2.stat('b3', 'mechanicFeatures', all.length)
    rec2.stat('b3', 'plainMechanic', plain.length)
    rec2.stat('b3', 'A', by('A').length)
    rec2.stat('b3', 'B', by('B').length)
    rec2.stat('b3', 'C', by('C').length)
    const tags = new Map<string, number>()
    for (const x of by('A')) for (const t of x.tags) tags.set(t, (tags.get(t) ?? 0) + 1)
    for (const [t, n] of tags) rec2.stat('b3', `A.${t}`, n)
    if (process.env.G2_WRITE === '1') writeFileSync(OUT, JSON.stringify({ note: '关键词初筛；A 类需逐条对照原书确认后再结构化', counts: { A: by('A').length, B: by('B').length, C: by('C').length }, features: rows }, null, 1) + '\n')
    rec2.find({ id: 'b3-A-derived-in-text', check: 'b3', kind: 'data-defect', fixSource: 'self-structure', entries: by('A').map((x) => `${x.id} ${x.name}：${x.tags.join('、')}`), expected: '各特性原文（初筛，逐条确认见分诊清单）', note: '影响护甲等级、速度、生命上限、熟练、抗性、感官、先攻、属性值的机制只有文字（初筛结果，含误报，需对照原书确认后结构化）' })
    rec2.find({ id: 'b3-B-action-in-text', check: 'b3', kind: 'decision', fixSource: 'decision', entries: by('B').map((x) => `${x.id} ${x.name}：${x.tags.join('、')}`), expected: '各特性原文', note: '影响行动、伤害、资源的机制只有文字：按此前的决定在 U5.3 行动、U5.5 资源、M6 结算时细化，G2 不要求现在结构化' })
    expect(plain.length).toBeGreaterThan(500)
    expect(rec2.settle()).toEqual([])
  })
})
