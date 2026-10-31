import { describe, expect, it } from 'vitest'
import { parseFormula } from '../../src/rules/dnd5e2014/data/formula'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

function visit(value: unknown, fn: (block: Rec) => void): void {
  if (Array.isArray(value)) { for (const item of value) visit(item, fn); return }
  if (!isObj(value)) return
  fn(value)
  for (const item of Object.values(value)) visit(item, fn)
}

describe('R14 体检（从包里独立重算）', () => {
  const entries = allEntries()

  it('D2 武器属性里没有来源代码', () => {
    const bad = entries.filter((e) => e.type === 'item').filter((e) => { const list = ((e.data.properties as string[] | undefined) ?? []).concat(((e.data.weapon as Rec | undefined)?.properties as string[] | undefined) ?? []); return list.some((p) => String(p).includes('|')) })
    expect(bad.map((e) => e.id)).toEqual([])
  })

  it('D7 没有空段落或空列表项；D4 没有空单元格', () => {
    let empty = 0, cells = 0
    for (const e of entries) visit(e.data.text, (b) => {
      if (b.p === '') empty++
      if (Array.isArray(b.list)) { if (b.list.length === 0) empty++; empty += b.list.filter((x) => x === '').length }
      const table = b.table as { rows?: unknown[][] } | undefined
      if (table?.rows) for (const row of table.rows) for (const cell of row) if (cell === '') cells++
    })
    expect({ empty, cells }).toEqual({ empty: 0, cells: 0 })
  })

  it('A5 没有 {{spellcasting_mod}}，所有文字公式能被 parseFormula 读懂', () => {
    expect(JSON.stringify(entries.map((e) => e.data)).includes('{{spellcasting_mod}}')).toBe(false)
    const bad = entries.filter((e) => typeof (e.data.uses as Rec | undefined)?.max === 'string' && !parseFormula((e.data.uses as { max: string }).max).ok).map((e) => e.id)
    expect(bad).toEqual([])
  })

  it('D5 职业表列名没有英文序数词；每环法术位列名是「N环」', () => {
    const cols = entries.filter((e) => e.type === 'class').flatMap((e) => ((e.data.table as { cols?: string[] } | undefined)?.cols ?? []))
    expect(cols.filter((c) => /\d(?:st|nd|rd|th)\b/i.test(c))).toEqual([])
    expect(cols).toContain('每环法术位·1环')
  })

  it('D6、B2b：气、变体背景名称', () => {
    expect(entries.filter((e) => (((e.data.credit as Rec | undefined)?.missing as string[] | undefined) ?? []).includes('name'))).toHaveLength(0)
    const byId = new Map(entries.map((e) => [e.id, e]))
    expect(byId.get('feature.monk-ki.phb')?.name).toBe('气')
    expect(byId.get('feature.monk-ki.phb')?.nameEn).toBe('Ki')
    expect(byId.get('background.variant-noble-retainers.phb')?.name).toBe('变体贵族：家仆')
    expect(byId.get('background.variant-city-watch-investigator.scag')?.name).toBe('变体城市守卫：调查员')
  })
})
