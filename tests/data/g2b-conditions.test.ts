import { describe, expect, it } from 'vitest'
import { CONDITION_CODES } from './consumer/codes'
import { COND_EXPECT, EXHAUSTION } from './consumer/expected/conditions'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str, strs } from './consumer/util'

const token = (e: Record<string, unknown>): string => `${str(e.kind)}:${str(e.on) || str(e.mode) || ''}`

describe('G2b 状态与专注（b6）', () => {
  it('15 个状态的机制要点；力竭 6 级；法术与怪物里的状态代码都合法', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-conditions')
    const structMissing: string[] = []
    const textMissing: string[] = []
    const againstTextOnly: string[] = []
    let checks = 0
    const conds = l.of('condition')
    expect(conds.map((c) => c.id.split('.')[1]).sort()).toEqual(Object.keys(COND_EXPECT).concat(['exhaustion']).sort())
    for (const [name, items] of Object.entries(COND_EXPECT)) {
      const row = l.need(`condition.${name}.phb`)
      const eff = arr(row.data.effects).map(rec)
      const tokens = eff.filter((e) => e.kind !== 'note').map(token)
      const notes = eff.filter((e) => e.kind === 'note').map((e) => str(e.text)).join('；')
      for (const it of items) {
        checks++
        const structured = it.s ? tokens.some((t) => t.startsWith(it.s!)) : false
        const inText = it.n ? it.n.test(notes) : false
        if (it.s && !structured) structMissing.push(`${name}：${it.k}`)
        else if (it.n && !inText) textMissing.push(`${name}：${it.k}`)
        else if (it.against && inText) againstTextOnly.push(`${name}：${it.k}`)
      }
    }
    // 力竭：6 级逐级
    const lv = arr(l.need('condition.exhaustion.phb').data.levels).map(rec)
    expect(lv.map((x) => x.level)).toEqual([1, 2, 3, 4, 5, 6])
    for (const x of EXHAUSTION) {
      checks++
      const eff = arr(lv[x.level - 1].effects).map(rec)
      const tokens = eff.filter((e) => e.kind !== 'note').map(token)
      const notes = eff.filter((e) => e.kind === 'note').map((e) => str(e.text)).join('；')
      if (x.s && !x.s.every((s) => tokens.includes(s))) structMissing.push(`exhaustion：${x.level} 级`)
      if (x.n && !x.n.test(notes)) textMissing.push(`exhaustion：${x.level} 级`)
    }
    rec2.stat('b6', 'conditions', conds.length)
    rec2.stat('b6', 'checks', checks)
    // 法术、怪物、疾病里写到的状态代码都在这 15 个里
    const codes = new Set<string>()
    for (const r of l.rows) for (const k of ['conditionInflict', 'conditionImmune']) for (const c of strs(r.data[k])) codes.add(c)
    rec2.stat('b6', 'conditionCodesUsed', codes.size)
    expect([...codes].filter((c) => !CONDITION_CODES.includes(c))).toEqual([])
    if (structMissing.length) rec2.find({ id: 'b6-structured-missing', check: 'b6', kind: 'data-defect', fixSource: 'self-structure', entries: structMissing, expected: 'PHB 附录 A 状态', note: '这个状态的机制要点应当是结构化效果（自己的攻击/检定/豁免劣势、免疫等），数据里没有' })
    if (textMissing.length) rec2.find({ id: 'b6-text-missing', check: 'b6', kind: 'data-defect', fixSource: 'self-structure', entries: textMissing, expected: 'PHB 附录 A 状态', note: '这个状态的机制要点连说明文字里都没写（例：魅惑者对被魅惑者的社交检定优势、麻痹/石化/昏迷时针对它的攻击优势）' })
    if (againstTextOnly.length) rec2.find({ id: 'b6-against-text-only', check: 'b6', kind: 'decision', fixSource: 'decision', entries: againstTextOnly, expected: 'PHB 附录 A 状态', note: '“针对该生物的攻击有优势/劣势/自动重击”只有说明文字：现有效果类型只能表达“自己”的优势劣势，表达不了“别人打它”。要让掷骰自动判定，需要给优势/劣势效果加一个“针对它”的标记' })
    expect(rec2.settle()).toEqual([])
  })
})
