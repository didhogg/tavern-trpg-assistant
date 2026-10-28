import { describe, expect, it } from 'vitest'
import { commentText, cryptoRng, lineText, parseDice, rollDice, type Rng } from '../../src/rules/dice'

/** 依次返回给定点数对应的随机数（点数 → (点数-1)/面数）。 */
function seq(values: Array<[value: number, sides: number]>): Rng {
  let i = 0
  return () => {
    const [v, s] = values[i++ % values.length]
    return (v - 0.5) / s
  }
}

describe('骰式解析', () => {
  it('接受 XdY、省略个数、多组相加与常数，忽略空格与大小写', () => {
    const r = parseDice(' 2D6 + d4 - 1 + 3 ')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.terms).toEqual([
      { kind: 'dice', count: 2, sides: 6, sign: 1 },
      { kind: 'dice', count: 1, sides: 4, sign: 1 },
      { kind: 'const', value: 1, sign: -1 },
      { kind: 'const', value: 3, sign: 1 },
    ])
  })

  it.each(['', '   ', 'abc', '2d', 'd', '2d6++3', '2d6d4', '5', '+', '2d1', '0d6', '101d6', '1d1001'])('拒绝 %j 并给出中文原因', (text) => {
    const r = parseDice(text)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/[一-龥]/)
  })

  it('项数过多时拒绝', () => {
    expect(parseDice(Array(25).fill('1d6').join('+')).ok).toBe(false)
  })
})

describe('掷骰', () => {
  it('点数在 1 到面数之间，总和 = 各项之和', () => {
    for (let i = 0; i < 300; i++) {
      const r = rollDice('3d6+2', { rng: cryptoRng })
      expect(r.total).toBeGreaterThanOrEqual(5)
      expect(r.total).toBeLessThanOrEqual(20)
      expect(r.terms[0].rolls).toHaveLength(3)
      expect(r.terms.reduce((s, t) => s + t.subtotal, 0)).toBe(r.total)
    }
  })

  it('随机数取 0 与接近 1 时分别得到最小与最大点数', () => {
    expect(rollDice('1d20', { rng: () => 0 }).total).toBe(1)
    expect(rollDice('1d20', { rng: () => 0.9999999 }).total).toBe(20)
  })

  it('优势取高、劣势取低，两颗都记下来', () => {
    const adv = rollDice('1d20+5', { mode: 'adv', rng: seq([[7, 20], [12, 20]]) })
    expect(adv.terms[0].rolls).toEqual([7, 12])
    expect(adv.total).toBe(17)
    const dis = rollDice('1d20+5', { mode: 'dis', rng: seq([[7, 20], [12, 20]]) })
    expect(dis.total).toBe(12)
  })

  it('优势 / 劣势只作用于单独的 1d20，不影响其他骰子', () => {
    const r = rollDice('1d20+2d6', { mode: 'adv', rng: seq([[3, 20], [15, 20], [4, 6], [5, 6]]) })
    expect(r.terms[0].rolls).toEqual([3, 15])
    expect(r.terms[1].rolls).toEqual([4, 5])
    expect(r.total).toBe(15 + 9)
    expect(rollDice('2d20', { mode: 'adv', rng: seq([[1, 20], [2, 20]]) }).terms[0].rolls).toHaveLength(2)
  })

  it('天然 20 与天然 1 按采用的那颗判断', () => {
    expect(rollDice('1d20', { rng: seq([[20, 20]]) }).natural).toBe(20)
    expect(rollDice('1d20', { rng: seq([[1, 20]]) }).natural).toBe(1)
    expect(rollDice('1d20', { rng: seq([[10, 20]]) }).natural).toBeUndefined()
    expect(rollDice('1d20', { mode: 'adv', rng: seq([[1, 20], [20, 20]]) }).natural).toBe(20)
    expect(rollDice('1d20', { mode: 'dis', rng: seq([[1, 20], [20, 20]]) }).natural).toBe(1)
    expect(rollDice('1d6', { rng: seq([[6, 6]]) }).natural).toBeUndefined()
  })

  it('加值作为额外常数；负加值相减', () => {
    expect(rollDice('1d20', { bonus: 5, rng: seq([[10, 20]]) }).total).toBe(15)
    const neg = rollDice('1d20', { bonus: -2, rng: seq([[10, 20]]) })
    expect(neg.total).toBe(8)
    expect(neg.expression).toBe('1d20-2')
  })

  it('错误的骰式抛出中文原因', () => {
    expect(() => rollDice('abc')).toThrow(/骰式看不懂/)
  })
})

describe('结果文字', () => {
  it('一行文字与注释格式', () => {
    const r = rollDice('1d20+5', { rng: seq([[12, 20]]) })
    expect(lineText(r)).toBe('1d20+5 = 17（12 + 5）')
    expect(commentText(r, '感知检定')).toBe('<!-- [掷骰] 感知检定：1d20+5 = 17（12 + 5） -->')
    expect(commentText(r, '')).toBe('<!-- [掷骰] 1d20+5 = 17（12 + 5） -->')
  })

  it('优势在文字里标明取高与两颗点数', () => {
    const r = rollDice('1d20+5', { mode: 'adv', rng: seq([[7, 20], [12, 20]]) })
    expect(lineText(r)).toBe('1d20+5 优势 = 17（取高 7/12 + 5）')
  })

  it('说明里的 -- 与尖括号不会提前结束注释', () => {
    const r = rollDice('1d6', { rng: seq([[3, 6]]) })
    const text = commentText(r, '危险--> <script>')
    expect(text.match(/-->/g)).toHaveLength(1)
    expect(text).not.toContain('<script>')
  })
})
