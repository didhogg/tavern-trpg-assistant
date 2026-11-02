import { describe, expect, it } from 'vitest'
import { rollTable, tableCopyText } from '../../src/rules/dice/table'

const table = { dice: '1d6', rows: [{ min: 1, max: 2, cells: ['甲'] }, { min: 3, max: 6, cells: ['乙', '丙'], then: { table: 'table.next' } }] }

describe('G3 掷表', () => {
  it('命中行与边界', () => {
    expect(rollTable(table, () => 0).rowIndex).toBe(0)
    expect(rollTable(table, () => 0.99).rowIndex).toBe(1)
    expect(rollTable(table, () => 0.5).text).toBe('乙／丙')
  })
  it('没命中不抛错', () => {
    expect(rollTable({ dice: '1d6', rows: [{ min: 7, max: 8, cells: ['x'] }] }, () => 0).rowIndex).toBeNull()
  })
  it('修正值与连环', () => {
    const r = rollTable(table, () => 0, 2)
    expect(r.total).toBe(3); expect(r.then).toEqual({ table: 'table.next', times: 1 })
  })
  it('复制格式', () => {
    expect(tableCopyText([{ label: '表', roll: { formula: '1d6', total: 3, rowIndex: 1, text: '乙' } }])).toBe('表：1d6 = 3 乙')
    expect(tableCopyText([{ label: 'A', roll: { formula: '1d6', total: 1, rowIndex: 0, text: '甲' } }, { label: 'B', roll: { formula: '1d6', total: 2, rowIndex: 0, text: '乙' } }])).toBe('A：甲\nB：乙')
  })
})
