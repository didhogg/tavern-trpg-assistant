import { describe, expect, it } from 'vitest'
import { crText } from '../../tools/data/summary/summary'

describe('G3 摘要', () => {
  it('CR 分数显示', () => {
    expect(crText(0.125)).toBe('1/8')
    expect(crText(0.25)).toBe('1/4')
    expect(crText(0.5)).toBe('1/2')
    expect(crText(0)).toBe('0')
    expect(crText(1)).toBe('1')
    expect(crText(30)).toBe('30')
  })
})
