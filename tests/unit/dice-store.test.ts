import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const append = vi.fn<(text: string) => boolean>()
vi.mock('../../src/host/input', () => ({ appendToInput: (text: string) => append(text) }))
vi.mock('../../src/host/clipboard', () => ({ copyText: async () => true }))

import { HISTORY_MAX, useDiceStore } from '../../src/stores/dice'
import type { Rng } from '../../src/rules/dice'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() { return data.size },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  }
}
const fixed = (value: number, sides: number): Rng => () => (value - 0.5) / sides

describe('自由掷骰', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
    setActivePinia(createPinia())
    append.mockReset()
    append.mockReturnValue(true)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('d20 带上加值与优势；其他骰子不受影响', () => {
    const dice = useDiceStore()
    dice.setRng(fixed(10, 20))
    dice.setBonus(5)
    dice.setMode('adv')
    const r20 = dice.rollQuick(20)
    expect(r20.total).toBe(15)
    expect(r20.line).toContain('优势')
    dice.setRng(fixed(3, 6))
    const r6 = dice.rollQuick(6)
    expect(r6.total).toBe(3)
    expect(r6.line).not.toContain('优势')
  })

  it('加值限制在 -20 到 +30', () => {
    const dice = useDiceStore()
    dice.setBonus(999)
    expect(dice.bonus).toBe(30)
    dice.setBonus(-999)
    expect(dice.bonus).toBe(-20)
  })

  it('记录最多保留 20 条，最新的在最前', () => {
    const dice = useDiceStore()
    for (let i = 0; i < HISTORY_MAX + 5; i++) dice.rollQuick(6)
    expect(dice.history).toHaveLength(HISTORY_MAX)
    expect(dice.history[0].id).toBeGreaterThan(dice.history[1].id)
  })

  it('骰式不合法时给出原因，不产生记录，保留上一次结果', () => {
    const dice = useDiceStore()
    dice.rollQuick(6)
    const last = dice.last
    dice.expression = 'abc'
    expect(dice.rollExpression()).toBeNull()
    expect(dice.error).toContain('骰式看不懂')
    expect(dice.history).toHaveLength(1)
    expect(dice.last).toBe(last)
    dice.expression = '2d6+3'
    expect(dice.rollExpression()).not.toBeNull()
    expect(dice.error).toBe('')
  })

  it('再掷一次沿用同样的骰式与模式', () => {
    const dice = useDiceStore()
    dice.setRng(fixed(8, 20))
    dice.setMode('dis')
    dice.setBonus(2)
    const first = dice.rollQuick(20)
    dice.setBonus(0)
    dice.setMode('normal')
    const again = dice.reroll(first)
    expect(again.expression).toBe(first.expression)
    expect(again.mode).toBe('dis')
    expect(dice.history).toHaveLength(2)
  })

  it('填入输入框：成功与失败的状态，2 秒后恢复；注释包含说明', () => {
    vi.useFakeTimers()
    const dice = useDiceStore()
    expect(dice.fill()).toBe(false)
    dice.setNote('感知检定')
    dice.setRng(fixed(12, 20))
    dice.setBonus(5)
    dice.rollQuick(20)
    expect(dice.fill()).toBe(true)
    expect(append).toHaveBeenCalledWith('<!-- [掷骰] 感知检定：1d20+5 = 17（12 + 5） -->')
    expect(dice.fillState).toBe('done')
    vi.advanceTimersByTime(2000)
    expect(dice.fillState).toBe('idle')
    append.mockReturnValue(false)
    expect(dice.fill()).toBe(false)
    expect(dice.fillState).toBe('failed')
    expect(dice.last).not.toBeNull()
  })

  it('新的一次掷骰会清掉「已填入」状态', () => {
    const dice = useDiceStore()
    dice.rollQuick(6)
    dice.fill()
    expect(dice.fillState).toBe('done')
    dice.rollQuick(6)
    expect(dice.fillState).toBe('idle')
  })

  it('记录、加值与说明按角色卡分开保存，重启后读回', () => {
    const dice = useDiceStore()
    dice.setOwner('char:a')
    dice.setBonus(3)
    dice.setNote('甲')
    dice.rollQuick(20)
    dice.setOwner('char:b')
    expect(dice.history).toHaveLength(0)
    expect(dice.bonus).toBe(0)
    dice.setOwner('char:a')
    expect(dice.history).toHaveLength(1)
    expect(dice.bonus).toBe(3)
    expect(dice.note).toBe('甲')
    setActivePinia(createPinia())
    const fresh = useDiceStore()
    fresh.setOwner('char:a')
    expect(fresh.history).toHaveLength(1)
  })

  it('本机存储损坏时回到空记录而不是报错', () => {
    localStorage.setItem('trpg-assistant:dice:char:x', '{坏的')
    const dice = useDiceStore()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    dice.setOwner('char:x')
    expect(dice.history).toEqual([])
  })
})
