import { describe, expect, it } from 'vitest'
import { EMPTY_BUILDER, addDie, authorFormula, builderText, canUseMode, countOf, diceTotal, heroSides, lineText, mergeGroups, removeDie, resultOf, stepMod, type Builder } from '../../src/rules/dice'

const g = (count: number, sides: number, sign: 1 | -1 = 1) => ({ count, sides, sign })
const b = (dice: ReturnType<typeof g>[], mod = 0): Builder => mergeGroups(dice, mod)

describe('骰盘按钮（骰式由作者程序读出后的各组骰子）', () => {
  it('点骰子：从空开始，同一种骰子再点一次多一颗，面数从小到大排', () => {
    let x = addDie(EMPTY_BUILDER, 20)
    expect(builderText(x)).toBe('1d20')
    x = addDie(addDie(x, 6), 6)
    expect(builderText(x)).toBe('2d6 + 1d20')
    expect(builderText(addDie(x, 20))).toBe('2d6 + 2d20')
  })

  it('减一颗：减到 0 就从骰式里去掉', () => {
    expect(builderText(removeDie(b([g(2, 6), g(1, 20)]), 6))).toBe('1d6 + 1d20')
    expect(builderText(removeDie(b([g(1, 6), g(1, 20)]), 6))).toBe('1d20')
    expect(builderText(removeDie(b([g(1, 20)]), 6))).toBe('1d20')
  })

  it('加减值：写在骰式最后，限制在 -20 到 +30，减到 0 就消失', () => {
    expect(builderText(stepMod(b([g(1, 20)]), 1))).toBe('1d20 + 1')
    expect(builderText(stepMod(b([g(1, 20)], 5), -5))).toBe('1d20')
    expect(builderText(stepMod(b([g(1, 20)]), -3))).toBe('1d20 - 3')
    expect(builderText(stepMod(b([g(1, 20)], 30), 1))).toBe('1d20 + 30')
    expect(builderText(stepMod(b([g(1, 20)], -20), -1))).toBe('1d20 - 20')
    expect(builderText(stepMod(EMPTY_BUILDER, 2))).toBe('+2')
  })

  it('作者读出的各组：同面数同符号合并；减号的骰子不计入点出来的颗数', () => {
    const x = b([g(1, 6), g(1, 6)], 3)
    expect(countOf(x, 6)).toBe(2)
    expect(builderText(x)).toBe('2d6 + 3')
    const y = b([g(1, 20), g(1, 4, -1)])
    expect(builderText(y)).toBe('1d20 - 1d4')
    expect(countOf(y, 4)).toBe(0)
    expect(builderText(addDie(y, 4))).toBe('1d4 + 1d20 - 1d4')
  })

  it('优势劣势只在恰好一个 1d20 时可用', () => {
    expect(canUseMode(b([g(1, 20)]))).toBe(true)
    expect(canUseMode(b([g(1, 20), g(2, 6)], 3))).toBe(true)
    expect(canUseMode(b([g(2, 20)]))).toBe(false)
    expect(canUseMode(b([g(1, 6)]))).toBe(false)
    expect(canUseMode(EMPTY_BUILDER)).toBe(false)
    expect(canUseMode(b([g(1, 20), g(1, 4, -1)]))).toBe(true)
    expect(canUseMode(b([g(1, 20), g(1, 20)]))).toBe(false)
  })

  it('骰子颗数与结果卡的骰子形状', () => {
    expect(diceTotal(b([g(2, 6), g(1, 20)], 3))).toBe(3)
    expect(heroSides(6)).toBe(6)
    expect(heroSides(20)).toBe(20)
    expect(heroSides(3)).toBe(4)
    expect(heroSides(30)).toBe(100)
    expect(heroSides(0)).toBe(20)
  })
})

describe('交给作者的骰式与结果排版', () => {
  it('优势 / 劣势写成作者写法 2d20kh1 / 2d20kl1，顺序与按钮文字相同', () => {
    const x = b([g(1, 20), g(2, 6)], 5)
    expect(authorFormula(x, 'normal').formula).toBe('2d6+1d20+5')
    expect(authorFormula(x, 'adv').formula).toBe('2d6+2d20kh1+5')
    expect(authorFormula(x, 'dis').formula).toBe('2d6+2d20kl1+5')
    expect(authorFormula(b([g(1, 20)], -2), 'normal').formula).toBe('1d20-2')
  })

  it('作者掷出的点数按顺序分回各组；优势落选的那颗变淡；天然 20', () => {
    const x = b([g(1, 20)], 5)
    const plan = authorFormula(x, 'adv')
    const r = resultOf({ ...plan, mod: 5, mode: 'adv' }, { total: 25, used: [{ max: 20, value: 7 }, { max: 20, value: 20 }], text: null })
    expect(lineText(r)).toBe('1d20+5 优势 = 25（取高 7/20 + 5）')
    expect(r.dice).toEqual([{ sides: 20, value: 7, dim: true }, { sides: 20, value: 20, dim: false }])
    expect(r.natural).toBe(20)
  })

  it('分回的点数与作者总数对不上、或不是按钮能拆的骰式：照作者原样显示', () => {
    const r = resultOf({ formula: '4d6kh3', groups: null, mod: 0, mode: 'normal' }, { total: 12, used: [3, 5, 4, 1].map((value) => ({ max: 6, value })), text: '[3]+[5]+[4]+[1]' })
    expect(lineText(r)).toBe('4d6kh3 = 12（[3]+[5]+[4]+[1]）')
    expect(r.dice).toHaveLength(4)
  })
})
