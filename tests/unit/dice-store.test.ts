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

describe('自由掷骰（骰式构建器）', () => {
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

  it('点骰子、加减值只改骰式，不出结果，也不产生记录', () => {
    const dice = useDiceStore()
    dice.addOne(20)
    dice.addOne(6)
    dice.addOne(6)
    dice.step(5)
    expect(dice.text).toBe('2d6 + 1d20 + 5')
    expect(dice.last).toBeNull()
    expect(dice.lastResult).toBeNull()
    expect(dice.history).toHaveLength(0)
  })

  it('没有骰子或骰式不合法时不能掷；原因就近显示', () => {
    const dice = useDiceStore()
    expect(dice.canRoll).toBe(false)
    expect(dice.roll()).toBeNull()
    dice.setText('abc')
    expect(dice.error).toContain('骰式看不懂')
    expect(dice.canRoll).toBe(false)
    expect(dice.roll()).toBeNull()
    dice.setText('+5')
    expect(dice.canRoll).toBe(false)
    dice.setText('2d6+3')
    expect(dice.error).toBe('')
    expect(dice.canRoll).toBe(true)
  })

  it('只有 roll() 出结果；掷完骰式保持不变，可以直接再掷', () => {
    const dice = useDiceStore()
    dice.setRng(fixed(12, 20))
    dice.addOne(20)
    dice.step(5)
    const rec = dice.roll()!
    expect(rec.total).toBe(17)
    expect(rec.line).toBe('1d20+5 = 17（12 + 5）')
    expect(dice.text).toBe('1d20 + 5')
    dice.setRng(fixed(3, 20))
    expect(dice.roll()!.total).toBe(8)
    expect(dice.history).toHaveLength(2)
  })

  it('优势劣势：骰式里恰好一个 1d20 时才生效，否则按普通掷', () => {
    const dice = useDiceStore()
    dice.addOne(20)
    expect(dice.canMode).toBe(true)
    dice.setMode('adv')
    dice.setRng(fixed(10, 20))
    expect(dice.roll()!.line).toContain('优势')
    dice.addOne(20)
    expect(dice.canMode).toBe(false)
    expect(dice.roll()!.mode).toBe('normal')
    dice.clear()
    dice.addOne(6)
    expect(dice.canMode).toBe(false)
    expect(dice.mode).toBe('normal')
  })

  it('点「最近」的一行：载入骰式与掷法，不掷骰', () => {
    const dice = useDiceStore()
    dice.setText('2d6+3')
    const rec = dice.roll()!
    dice.clear()
    expect(dice.text).toBe('')
    dice.loadRecord(rec)
    expect(dice.text).toBe('2d6 + 3')
    expect(dice.history).toHaveLength(1)
  })

  it('记录最多保留 20 条，最新的在最前', () => {
    const dice = useDiceStore()
    dice.addOne(6)
    for (let i = 0; i < HISTORY_MAX + 5; i++) dice.roll()
    expect(dice.history).toHaveLength(HISTORY_MAX)
    expect(dice.history[0].id).toBeGreaterThan(dice.history[1].id)
  })

  it('填入输入框：成功与失败的状态，2 秒后恢复；注释带说明；新一次掷骰清掉「已填入」', () => {
    vi.useFakeTimers()
    const dice = useDiceStore()
    expect(dice.fill()).toBe(false)
    dice.setRng(fixed(12, 20))
    dice.addOne(20)
    dice.step(5)
    dice.setNote('感知检定')
    dice.roll()
    expect(dice.fill()).toBe(true)
    expect(append).toHaveBeenCalledWith('<!-- [掷骰] 感知检定：1d20+5 = 17（12 + 5） -->')
    expect(dice.fillState).toBe('done')
    vi.advanceTimersByTime(2000)
    expect(dice.fillState).toBe('idle')
    dice.fill()
    dice.roll()
    expect(dice.fillState).toBe('idle')
    append.mockReturnValue(false)
    expect(dice.fill()).toBe(false)
    expect(dice.fillState).toBe('failed')
    expect(dice.last).not.toBeNull()
  })

  it('说明在填入时才取用：掷完再写说明也会带上', () => {
    const dice = useDiceStore()
    dice.setRng(fixed(4, 6))
    dice.addOne(6)
    dice.roll()
    dice.setNote('撬锁')
    dice.fill()
    expect(append).toHaveBeenCalledWith('<!-- [掷骰] 撬锁：1d6 = 4（4） -->')
  })

  it('骰式、掷法、说明与记录按角色卡分开保存，重启后读回', () => {
    const dice = useDiceStore()
    dice.setOwner('char:a')
    dice.setText('1d20+3')
    dice.setMode('adv')
    dice.setNote('甲')
    dice.roll()
    dice.setOwner('char:b')
    expect(dice.history).toHaveLength(0)
    expect(dice.text).toBe('')
    dice.setOwner('char:a')
    expect(dice.text).toBe('1d20+3')
    expect(dice.mode).toBe('adv')
    expect(dice.note).toBe('甲')
    expect(dice.history).toHaveLength(1)
    setActivePinia(createPinia())
    const fresh = useDiceStore()
    fresh.setOwner('char:a')
    expect(fresh.history).toHaveLength(1)
  })

  it('本机存储损坏时回到空状态而不是报错', () => {
    localStorage.setItem('trpg-assistant:dice:char:x', '{坏的')
    const dice = useDiceStore()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    dice.setOwner('char:x')
    expect(dice.history).toEqual([])
    expect(dice.text).toBe('')
  })
})
