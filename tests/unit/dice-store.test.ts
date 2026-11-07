import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const append = vi.fn<(text: string) => boolean>()
vi.mock('../../src/host/input', () => ({ appendToInput: (text: string) => append(text) }))
vi.mock('../../src/host/clipboard', () => ({ copyText: async () => true }))

import { HISTORY_MAX, useDiceStore } from '../../src/stores/dice'
import type { DiceBackend, DiceRead } from '../../src/library/runtime/dice'

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

// 照表回答的假骰子后端：只测骰盘流程。骰式到底怎么读、怎么掷，在浏览器里用真的作者小窗测（tests/e2e/suite-dice.mjs）。
const simple = (dice: Array<[number, number, (1 | -1)?]>, mod = 0): DiceRead => ({ ok: true, simple: true, dice: dice.map(([count, sides, sign = 1]) => ({ count, sides, sign })), mod })
const READS: Record<string, DiceRead> = {
  '': simple([]), '1d20': simple([[1, 20]]), '1d20 + 5': simple([[1, 20]], 5), '2d6 + 1d20': simple([[2, 6], [1, 20]]), '1d6 + 1d20': simple([[1, 6], [1, 20]]),
  '2d6 + 1d20 + 5': simple([[2, 6], [1, 20]], 5), '1d6 + 1d20 + 5': simple([[1, 6], [1, 20]], 5), '1d20 + 1d20': simple([[2, 20]]), '2d20': simple([[2, 20]]),
  '1d6': simple([[1, 6]]), '+5': simple([], 5), '2d6+3': simple([[2, 6]], 3), '2d6 + 3': simple([[2, 6]], 3), '1d20+3': simple([[1, 20]], 3), '1d20 + 3': simple([[1, 20]], 3),
  abc: { ok: false, error: 'Syntax error: unexpected character a' }, '4d6kh3': { ok: true, simple: false },
}
const fake: DiceBackend = {
  read: async (text) => READS[text.trim()] ?? (() => { throw Error(`表里没有：${text}`) })(),
  roll: async (formula, points = []) => {
    const faces = [...formula.matchAll(/(\d+)d(\d+)(k[hl]1)?/g)].flatMap((m) => Array<number>(Number(m[1])).fill(Number(m[2])))
    const used = faces.map((max, i) => ({ min: 1, max, value: points[i] ?? 1 }))
    const mod = Number(/[+-]\d+$/.exec(formula.replace(/\d+d\d+(k[hl]1)?/g, ''))?.[0] ?? 0)
    const keep = /kh1/.test(formula) ? Math.max : /kl1/.test(formula) ? Math.min : null
    const d20 = used.filter((u) => u.max === 20).map((u) => u.value)
    const rest = used.filter((u) => u.max !== 20 || !keep).reduce((n, u) => n + u.value, 0)
    return { status: 'complete', formula, total: rest + (keep ? keep(...d20) : 0) + mod, used, text: used.map((u) => `[${u.value}]`).join('+') }
  },
}
const settle = async (): Promise<void> => { for (let i = 0; i < 20; i++) await Promise.resolve() }
async function store() {
  const dice = useDiceStore()
  dice.setBackend(fake)
  await settle()
  return dice
}

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

  it('点骰子、加减值只改骰式，不出结果，也不产生记录', async () => {
    const dice = await store()
    dice.addOne(20)
    await settle()
    dice.addOne(6)
    await settle()
    dice.addOne(6)
    await settle()
    dice.step(5)
    await settle()
    expect(dice.text).toBe('2d6 + 1d20 + 5')
    expect(dice.last).toBeNull()
    expect(dice.lastResult).toBeNull()
    expect(dice.history).toHaveLength(0)
  })

  it('没有骰子或骰式不合法时不能掷；原因就近显示', async () => {
    const dice = await store()
    expect(dice.canRoll).toBe(false)
    expect(await dice.roll()).toBeNull()
    dice.setText('abc')
    await settle()
    expect(dice.error).toContain('骰式看不懂')
    expect(dice.canRoll).toBe(false)
    expect(await dice.roll()).toBeNull()
    dice.setText('+5')
    await settle()
    expect(dice.canRoll).toBe(false)
    dice.setText('2d6+3')
    await settle()
    expect(dice.error).toBe('')
    expect(dice.canRoll).toBe(true)
  })

  it('只有 roll() 出结果；掷完骰式保持不变，可以直接再掷', async () => {
    const dice = await store()
    dice.setPoints([12, 12])
    dice.addOne(20)
    await settle()
    dice.step(5)
    await settle()
    const rec = (await dice.roll())!
    expect(rec.total).toBe(17)
    expect(rec.line).toBe('1d20+5 = 17（12 + 5）')
    expect(dice.text).toBe('1d20 + 5')
    dice.setPoints([3, 3])
    expect((await dice.roll())!.total).toBe(8)
    expect(dice.history).toHaveLength(2)
  })

  it('优势劣势：骰式里恰好一个 1d20 时才生效，否则按普通掷', async () => {
    const dice = await store()
    dice.addOne(20)
    await settle()
    expect(dice.canMode).toBe(true)
    dice.setMode('adv')
    dice.setPoints([10, 10])
    expect((await dice.roll())!.line).toContain('优势')
    dice.addOne(20)
    await settle()
    expect(dice.canMode).toBe(false)
    expect((await dice.roll())!.mode).toBe('normal')
    dice.clear()
    await settle()
    dice.addOne(6)
    await settle()
    expect(dice.canMode).toBe(false)
    expect(dice.mode).toBe('normal')
  })

  it('点「最近」的一行：载入骰式与掷法，不掷骰', async () => {
    const dice = await store()
    dice.setText('2d6+3')
    await settle()
    const rec = (await dice.roll())!
    dice.clear()
    await settle()
    expect(dice.text).toBe('')
    dice.loadRecord(rec)
    await settle()
    expect(dice.text).toBe('2d6 + 3')
    expect(dice.history).toHaveLength(1)
  })

  it('记录最多保留 20 条，最新的在最前', async () => {
    const dice = await store()
    dice.addOne(6)
    await settle()
    for (let i = 0; i < HISTORY_MAX + 5; i++) await dice.roll()
    expect(dice.history).toHaveLength(HISTORY_MAX)
    expect(dice.history[0].id).toBeGreaterThan(dice.history[1].id)
  })

  it('填入输入框：成功与失败的状态，2 秒后恢复；注释带说明；新一次掷骰清掉「已填入」', async () => {
    vi.useFakeTimers()
    const dice = await store()
    expect(dice.fill()).toBe(false)
    dice.setPoints([12, 12])
    dice.addOne(20)
    await settle()
    dice.step(5)
    await settle()
    dice.setNote('感知检定')
    await dice.roll()
    expect(dice.fill()).toBe(true)
    expect(append).toHaveBeenCalledWith('<!-- [掷骰] 感知检定：1d20+5 = 17（12 + 5） -->')
    expect(dice.fillState).toBe('done')
    vi.advanceTimersByTime(2000)
    expect(dice.fillState).toBe('idle')
    dice.fill()
    await dice.roll()
    expect(dice.fillState).toBe('idle')
    append.mockReturnValue(false)
    expect(dice.fill()).toBe(false)
    expect(dice.fillState).toBe('failed')
    expect(dice.last).not.toBeNull()
  })

  it('说明在填入时才取用：掷完再写说明也会带上', async () => {
    const dice = await store()
    dice.setPoints([4, 4])
    dice.addOne(6)
    await settle()
    await dice.roll()
    dice.setNote('撬锁')
    dice.fill()
    expect(append).toHaveBeenCalledWith('<!-- [掷骰] 撬锁：1d6 = 4（4） -->')
  })

  it('骰式、掷法、说明与记录按角色卡分开保存，重启后读回', async () => {
    const dice = await store()
    dice.setOwner('char:a')
    await settle()
    dice.setText('1d20+3')
    await settle()
    dice.setMode('adv')
    dice.setNote('甲')
    await dice.roll()
    dice.setOwner('char:b')
    await settle()
    expect(dice.history).toHaveLength(0)
    expect(dice.text).toBe('')
    dice.setOwner('char:a')
    await settle()
    expect(dice.text).toBe('1d20+3')
    expect(dice.mode).toBe('adv')
    expect(dice.note).toBe('甲')
    expect(dice.history).toHaveLength(1)
    setActivePinia(createPinia())
    const fresh = await store()
    fresh.setOwner('char:a')
    await settle()
    expect(fresh.history).toHaveLength(1)
  })

  it('本机存储损坏时回到空状态而不是报错', async () => {
    localStorage.setItem('trpg-assistant:dice:char:x', '{坏的')
    const dice = await store()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    dice.setOwner('char:x')
    await settle()
    expect(dice.history).toEqual([])
    expect(dice.text).toBe('')
  })
})
