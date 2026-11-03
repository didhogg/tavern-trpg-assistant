import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDiceStore } from '../../src/stores/dice'
import { useUiStore } from '../../src/stores/ui'

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

describe('U5 详情页 prefill 钩子', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
    setActivePinia(createPinia())
  })
  it('只填骰式与说明并打开骰盘，不掷骰、不写最近记录', () => {
    const dice = useDiceStore()
    const ui = useUiStore()
    dice.prefill({ expression: '1d20+6', note: '盖尔 洞悉检定', object: '盖尔', type: 'skill', item: '洞悉检定', bonus: 6 })
    expect(dice.text).toBe('1d20+6')
    expect(dice.note).toBe('盖尔 洞悉检定')
    expect(ui.diceOpen).toBe(true)
    expect(dice.last).toBeNull()
    expect(dice.history).toHaveLength(0)
    expect(dice.roll).toBeTypeOf('function')
  })
  it('负数加值写成 1d20-1', () => {
    const dice = useDiceStore()
    dice.prefill({ expression: '1d20-1', note: '盖尔 力量检定' })
    expect(dice.text).toBe('1d20-1')
    expect(dice.error).toBe('')
  })
})
