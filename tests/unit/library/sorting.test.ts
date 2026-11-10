// B-18 排序：名次由作者的 ModalFilter 在小窗里算（真实数据见 tests/e2e/library/p5-1-backend.mjs）；这里测插件这边做的事——缓存、按名次排行。
import { describe, expect, it } from 'vitest'
import { Sorting, sortByRank } from '../../../src/library/sorting'

describe('sortByRank', () => {
  const rows = [{ h: 'c' }, { h: 'a' }, { h: 'x' }, { h: 'b' }, { h: 'y' }]
  it('按名次排；名次表里没有的排最后并保持原来的先后；不改原数组', () => {
    const out = sortByRank(rows, (r) => r.h, { a: 0, b: 1, c: 2 })
    expect(out.map((r) => r.h)).toEqual(['a', 'b', 'c', 'x', 'y'])
    expect(rows.map((r) => r.h)).toEqual(['c', 'a', 'x', 'b', 'y'])
  })
  it('作者没有这一列的排序（名次表为空）：保持原顺序', () => {
    expect(sortByRank(rows, (r) => r.h, null).map((r) => r.h)).toEqual(['c', 'a', 'x', 'b', 'y'])
  })
})

describe('Sorting 缓存', () => {
  function fake() {
    const calls: string[] = []
    const lib = {
      generation: 0,
      frameOf: async () => ({ call: async (fn: string, ...a: unknown[]) => { calls.push(`${fn}:${a.join('|')}`); return fn === 'sortColumns' ? [{ sort: 'level', text: '环阶', title: null }] : { a: 0 } } }),
    }
    return { lib, calls, sorting: new Sorting(lib as never) }
  }
  it('同一类同一列只问小窗一次；正序倒序分开', async () => {
    const { sorting, calls } = fake()
    await sorting.ranks('cn', 'spell', 'level'); await sorting.ranks('cn', 'spell', 'level'); await sorting.ranks('cn', 'spell', 'level', 'desc')
    await sorting.columns('cn', 'spell'); await sorting.columns('cn', 'spell')
    expect(calls).toEqual(['sortRanks:spell|level|asc', 'sortRanks:spell|level|desc', 'sortColumns:spell'])
  })
  it('装 / 删 / 改自制后小窗重开（generation 变）：名次与列重新问', async () => {
    const { sorting, calls, lib } = fake()
    await sorting.ranks('cn', 'spell', 'level')
    lib.generation++
    await sorting.ranks('cn', 'spell', 'level')
    expect(calls.length).toBe(2)
  })
  it('sort：把行按名次排好', async () => {
    const { sorting } = fake()
    expect((await sorting.sort('cn', 'spell', [{ h: 'z' }, { h: 'a' }], (r) => r.h, 'level')).map((r) => r.h)).toEqual(['a', 'z'])
  })
})

describe('Sorting.cells（B-35 列显示值）', () => {
  it('同一类只问小窗一次；小窗重开后重新问', async () => {
    const calls: string[] = []
    const lib = { generation: 0, frameOf: async () => ({ call: async (fn: string, ...a: unknown[]) => { calls.push(`${fn}:${a.join('|')}`); return { columns: [{ sort: 'level', text: '环阶', title: null }], cells: { h1: ['3 环'] } } } }) }
    const sorting = new Sorting(lib as never)
    expect((await sorting.cells('cn', 'spell'))?.cells.h1).toEqual(['3 环'])
    await sorting.cells('cn', 'spell')
    expect(calls).toEqual(['listCells:spell'])
    lib.generation++
    await sorting.cells('cn', 'spell')
    expect(calls.length).toBe(2)
  })
})
