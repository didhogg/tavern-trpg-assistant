import { describe, expect, it } from 'vitest'
import { addDie, builderText, canUseMode, countOf, diceTotal, heroSides, readBuilder, removeDie, stepMod } from '../../src/rules/dice'

const b = (text: string) => {
  const r = readBuilder(text)
  if (!r.ok) throw new Error(r.error)
  return r.builder
}

describe('骰式构建器', () => {
  it('点骰子：从空开始，同一种骰子再点一次多一颗，面数从小到大排', () => {
    let t = addDie('', 20)
    expect(t).toBe('1d20')
    t = addDie(t, 6)
    t = addDie(t, 6)
    expect(t).toBe('2d6 + 1d20')
    t = addDie(t, 20)
    expect(t).toBe('2d6 + 2d20')
  })

  it('减一颗：减到 0 就从骰式里去掉', () => {
    expect(removeDie('2d6 + 1d20', 6)).toBe('1d6 + 1d20')
    expect(removeDie('1d6 + 1d20', 6)).toBe('1d20')
    expect(removeDie('1d20', 6)).toBe('1d20')
  })

  it('加减值：写在骰式最后，可以加减，限制在 -20 到 +30，减到 0 就消失', () => {
    expect(stepMod('1d20', 1)).toBe('1d20 + 1')
    expect(stepMod('1d20 + 5', -5)).toBe('1d20')
    expect(stepMod('1d20', -3)).toBe('1d20 - 3')
    expect(stepMod('1d20 + 30', 1)).toBe('1d20 + 30')
    expect(stepMod('1d20 - 20', -1)).toBe('1d20 - 20')
    expect(stepMod('', 2)).toBe('+ 2'.replace(' ', ''))
  })

  it('手写的骰式读回构建器：同面数合并，常数合并成加减值', () => {
    const x = b('1d6+1d6 + 4 - 1')
    expect(countOf(x, 6)).toBe(2)
    expect(x.mod).toBe(3)
    expect(builderText(x)).toBe('2d6 + 3')
  })

  it('减号的骰子保留在骰式里，不计入点出来的颗数', () => {
    const x = b('1d20 - 1d4')
    expect(builderText(x)).toBe('1d20 - 1d4')
    expect(countOf(x, 4)).toBe(0)
    expect(addDie('1d20 - 1d4', 4)).toBe('1d4 + 1d20 - 1d4')
  })

  it('不合法的骰式读不出来，并给出原因；空文字是合法的空骰式', () => {
    const bad = readBuilder('abc')
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(bad.error).toContain('骰式看不懂')
    expect(readBuilder('   ')).toEqual({ ok: true, builder: { dice: [], mod: 0 } })
    expect(addDie('abc', 8)).toBe('1d8')
  })

  it('优势劣势只在恰好一个 1d20 时可用', () => {
    expect(canUseMode(b('1d20'))).toBe(true)
    expect(canUseMode(b('1d20 + 2d6 + 3'))).toBe(true)
    expect(canUseMode(b('2d20'))).toBe(false)
    expect(canUseMode(b('1d6'))).toBe(false)
    expect(canUseMode(b(''))).toBe(false)
    expect(canUseMode(b('1d20 - 1d4'))).toBe(true)
    expect(canUseMode(b('1d20 + 1d20'))).toBe(false)
  })

  it('骰子颗数与结果卡的骰子形状', () => {
    expect(diceTotal(b('2d6 + 1d20 + 3'))).toBe(3)
    expect(heroSides(b('2d6'))).toBe(6)
    expect(heroSides(b('2d6 + 1d20'))).toBe(20)
    expect(heroSides(b('1d3'))).toBe(4)
    expect(heroSides(b('1d30'))).toBe(100)
    expect(heroSides(b(''))).toBe(20)
  })
})
