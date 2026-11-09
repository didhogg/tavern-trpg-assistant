import { describe, expect, it } from 'vitest'
import { fillPrompts, parsePrompts, rowIndexOf, splitFormulas } from '../../../src/library/table-roll'

// 例子来自作者数据里的真实变量骰表（XGE 童年居所、VRGR 围攻之中）
const SIMPLE = 'd100 + #$prompt_number:title=输入生活方式调整值$#'
const MULTI = '1d6 + #$prompt_number:default=0,min=0,max=2,title=输入+2如果角色忽略了一个事件$#;2d6 + #$prompt_number:default=0,min=0,max=2,title=输入+2如果角色忽略了一个事件$#'

describe('表格掷骰的占位符', () => {
  it('读出标题、默认、最小、最大；没给的按作者默认（0 / 无上限 / 0）', () => {
    expect(parsePrompts(SIMPLE)).toEqual([{ raw: '#$prompt_number:title=输入生活方式调整值$#', title: '输入生活方式调整值', default: 0, min: 0, max: null }])
    expect(parsePrompts(splitFormulas(MULTI)[0])[0]).toMatchObject({ default: 0, min: 0, max: 2, title: '输入+2如果角色忽略了一个事件' })
  })

  it('分号分开的多种骰式写法各自成一项', () => {
    expect(splitFormulas(MULTI)).toHaveLength(2)
    expect(splitFormulas('d20')).toEqual(['d20'])
  })

  it('按顺序把玩家填的数替换进去', () => {
    expect(fillPrompts(SIMPLE, [7])).toBe('d100 + 7')
    expect(fillPrompts('d6 + #$prompt_number$# + #$prompt_number:min=1$#', [2, 3])).toBe('d6 + 2 + 3')
  })

  it('个数不对、不是数字、超出范围都拒绝并说明哪一项', () => {
    expect(() => fillPrompts(SIMPLE, [])).toThrow(/要填 1 个数/)
    expect(() => fillPrompts(SIMPLE, [Number.NaN])).toThrow(/不是数字/)
    expect(() => fillPrompts(splitFormulas(MULTI)[0], [3])).toThrow(/0～2/)
    expect(() => fillPrompts(splitFormulas(MULTI)[0], [-1])).toThrow(/输入\+2如果角色忽略了一个事件/)
  })

  it('没有占位符的骰式原样交回', () => {
    expect(parsePrompts('d100')).toEqual([])
    expect(fillPrompts('d100', [])).toBe('d100')
  })
})

describe('点数落在哪一行', () => {
  it('范围、单点、补零写法', () => {
    const rolls = [{ min: 1, max: 20 }, { exact: 21 }, { min: 22, max: 99 }, { exact: 0, pad: true }]
    expect(rowIndexOf(rolls, 10)).toBe(0)
    expect(rowIndexOf(rolls, 21)).toBe(1)
    expect(rowIndexOf(rolls, 100)).toBe(3)
    expect(rowIndexOf(rolls, 500)).toBeNull()
  })

  it('变量骰表首行 / 末行延伸到无穷：超出范围也能找到', () => {
    const inf = [{ min: -Infinity, max: 20 }, { min: 21, max: 40 }, { min: 41, max: Infinity }]
    expect(rowIndexOf(inf, -3)).toBe(0)
    expect(rowIndexOf(inf, 1000)).toBe(2)
  })

  it('没有行首范围的行跳过，不会误中', () => {
    expect(rowIndexOf([null, undefined, { min: 1, max: 6 }], 3)).toBe(2)
  })
})
