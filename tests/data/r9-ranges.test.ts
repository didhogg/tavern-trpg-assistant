import { describe, expect, it } from 'vitest'
import { parseDice } from '../../src/rules/dice/parse'
import { allEntries } from './r9-pack-helpers'

describe('R9 行范围', () => {
  it('可掷表覆盖骰子、无重叠；对照表没有点数', () => {
    const bad: string[] = []
    for (const entry of allEntries()) {
      if (entry.type !== 'table') continue
      const data = entry.data as Record<string, unknown>
      const rows = (data.rows as Array<{ min?: number; max?: number }>) ?? []
      if (data.kind === 'ref') {
        if (data.dice !== undefined) bad.push(`${entry.id} ref 有骰子`)
        for (const row of rows) if (row.min !== undefined || row.max !== undefined) bad.push(`${entry.id} ref 有点数`)
        continue
      }
      const parsed = parseDice(String(data.dice ?? ''))
      if (!parsed.ok) { bad.push(`${entry.id} 骰式`); continue }
      let lo = 0, hi = 0
      for (const term of parsed.terms) { if (term.kind === 'dice') { lo += term.count; hi += term.count * term.sides } else { lo += term.value; hi += term.value } }
      const seen = new Set<number>()
      for (const row of rows) {
        if (row.min === undefined || row.max === undefined || row.min > row.max) { bad.push(`${entry.id} 行`); continue }
        if (!data.modifier && (row.min < lo || row.max > hi)) bad.push(`${entry.id} 越界`)
        if (!data.modifier) for (let n = row.min; n <= row.max; n++) { if (seen.has(n)) bad.push(`${entry.id} 重叠 ${n}`); seen.add(n) }
      }
      if (!data.modifier && seen.size !== hi - lo + 1) bad.push(`${entry.id} 缺行`)
    }
    expect(bad).toEqual([])
  })
})
