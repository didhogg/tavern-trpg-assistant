import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, refsIn, str } from './consumer/util'

/** 骰式 → 能掷出的最小值与最大值。支持 dN、XdN、dN+dM；其他（非标准骰）返回 undefined。 */
export function diceRange(dice: string): [number, number] | undefined {
  const d = dice.replace(/\s/g, '')
  let m = /^(\d*)d(\d+)$/.exec(d)
  if (m) { const n = Number(m[1] || 1); return [n, n * Number(m[2])] }
  m = /^d(\d+)\+d(\d+)$/.exec(d)
  if (m) return [2, Number(m[1]) + Number(m[2])]
  return undefined
}

describe('G2d 随机表（d1 d2）', () => {
  it('可掷的表：行范围盖满骰子；单元格数与列数一致；引用与“再掷”存在', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-tables')
    const T = l.of('table')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    const kinds = new Map<string, number>()
    let rolled = 0
    let rows = 0
    let refs = 0
    let thens = 0
    let verified = 0
    let skippedModifier = 0
    for (const t of T) {
      const d = t.data
      kinds.set(str(d.kind), (kinds.get(str(d.kind)) ?? 0) + 1)
      const cols = arr(d.cols).length
      const rs = arr(d.rows).map(rec)
      const tag = `${t.id} ${t.name}`
      for (const r of rs) {
        rows++
        if (arr(r.cells).length !== cols && r.indent !== true) add('cells-vs-cols', `${tag}：${arr(r.cells).length} 格 / ${cols} 列`)
        for (const c of arr(r.cells)) for (const id of refsIn(String(c))) { refs++; if (!l.get(id)) add('ref-missing', `${tag} → ${id}`) }
        const th = rec(r.then)
        if (th.table !== undefined) { thens++; if (l.get(str(th.table))?.type !== 'table') add('then-missing', `${tag} → ${str(th.table)}`) }
      }
      if (d.dice === undefined) continue
      rolled++
      const range = diceRange(str(d.dice))
      if (!range) { add('dice-unsupported', `${tag}：${str(d.dice)}`); continue }
      if (rec(d.modifier).prompt !== undefined) { skippedModifier++; continue } // 带修正值提示的表（生活方式、魅力调整值），范围可以超出骰子
      verified++
      const main = rs.filter((r) => r.indent !== true)
      const missing = main.filter((r) => typeof r.min !== 'number' || typeof r.max !== 'number')
      if (missing.length) { add('rows-without-range', `${tag}：${missing.length}/${main.length} 行没有 min/max`); continue }
      const sorted = [...main].sort((a, b) => Number(a.min) - Number(b.min))
      let expect = range[0]
      const problems: string[] = []
      for (const r of sorted) {
        if (Number(r.min) > Number(r.max)) problems.push(`行 ${String(r.min)}–${String(r.max)} 倒置`)
        if (Number(r.min) !== expect) problems.push(Number(r.min) > expect ? `缺 ${expect}${Number(r.min) - 1 > expect ? '–' + (Number(r.min) - 1) : ''}` : `重叠于 ${String(r.min)}`)
        expect = Math.max(expect, Number(r.max) + 1)
      }
      if (expect - 1 !== range[1]) problems.push(expect - 1 < range[1] ? `缺 ${expect}–${range[1]}` : `超出到 ${expect - 1}`)
      if (problems.length) add('range-not-covering', `${tag}（${str(d.dice)}）：${problems.slice(0, 3).join('；')}`)
    }
    rec2.stat('d1', 'tables', T.length)
    for (const [k, n] of kinds) rec2.stat('d1', `kind.${k}`, n)
    rec2.stat('d1', 'tablesWithDice', rolled)
    rec2.stat('d1', 'coverageVerified', verified)
    rec2.stat('d1', 'skippedBecauseModifier', skippedModifier)
    rec2.stat('d1', 'rows', rows)
    rec2.stat('d1', 'refsInCells', refs)
    rec2.stat('d1', 'thenLinks', thens)
    const NOTE: Record<string, string> = {
      'range-not-covering': '行的 min/max 没有盖满骰子的范围（缺行、重叠或超出）：掷出这个点数时查不到结果', 'rows-without-range': '有骰子的表，行没有 min/max', 'dice-unsupported': '骰式写法读取器不认识（非标准骰）',
      'cells-vs-cols': '一行的单元格数与列数不一致', 'ref-missing': '单元格里的引用指向不存在的条目', 'then-missing': '“再掷某表”指向的表不存在',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `d1-${k}`, check: 'd1', kind: k === 'dice-unsupported' ? 'decision' : 'data-defect', fixSource: k === 'dice-unsupported' ? 'decision' : 'self-structure', entries: ids, expected: '表自己的骰式与各行范围（自洽）；需对照 DMG、XGE、VGM 等原书', note: NOTE[k], selfCheck: true })
    expect(diceRange('d12+d8')).toEqual([2, 20])
    expect(rec2.settle()).toEqual([])
  })
})
