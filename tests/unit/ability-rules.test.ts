// 建卡属性值规则：和作者 statgen 原文核对（作者改了、登记表没改就报错）+ 三种方式的检查。
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ABILITY_RULES, checkAbilities } from '../../src/rules/kernel/ability-rules'

const author = readFileSync('vendor/cn/js/statgen/statgen-ui.js', 'utf8')
const KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']

describe('属性值规则登记表 = 作者 statgen', () => {
  it('标准数组', () => {
    const m = author.match(/_STANDARD_ARRAY = \[([^\]]+)\]/)
    expect(m?.[1].split(',').map(Number)).toEqual([...ABILITY_RULES.standardArray])
  })
  it('购点花费表和预算', () => {
    const rows = [...author.matchAll(/\{score: (\d+), cost: (\d+)\}/g)].map((x) => [Number(x[1]), Number(x[2])])
    expect(Object.fromEntries(rows)).toEqual(ABILITY_RULES.pointBuy.costs)
    expect(Number(author.match(/pb_budget: (\d+)/)?.[1])).toBe(ABILITY_RULES.pointBuy.budget)
  })
})

describe('checkAbilities', () => {
  it('标准数组：每个数只能用一次，没放的不算违规', () => {
    const r = checkAbilities({ method: 'standardArray', base: { str: 15, dex: 15, con: 12 } }, KEYS, 20)
    expect(r.ok).toBe(false)
    expect(r.problems).toEqual([{ key: 'dex', code: 'not-in-array' }])
    const ok = checkAbilities({ method: 'standardArray', base: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 } }, KEYS, 20)
    expect(ok).toMatchObject({ ok: true, complete: true, pool: [] })
  })
  it('购点：花费、剩余、超预算', () => {
    const r = checkAbilities({ method: 'pointBuy', base: { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 } }, KEYS, 20)
    expect(r).toMatchObject({ ok: true, cost: 27, left: 0 })
    const over = checkAbilities({ method: 'pointBuy', base: { str: 15, dex: 15, con: 15, int: 15, wis: 8, cha: 8 } }, KEYS, 20)
    expect(over.problems).toEqual([{ key: null, code: 'over-budget' }])
    expect(checkAbilities({ method: 'pointBuy', base: { str: 16 } }, KEYS, 20).problems).toEqual([{ key: 'str', code: 'not-in-table' }])
  })
  it('手填：整数、0 到上限', () => {
    expect(checkAbilities({ method: 'manual', base: { str: 21, dex: 1.5, con: -1, int: 20 } }, KEYS, 20).problems)
      .toEqual([{ key: 'dex', code: 'not-integer' }, { key: 'str', code: 'out-of-range' }, { key: 'con', code: 'out-of-range' }])
  })
})
