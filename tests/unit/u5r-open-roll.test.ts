import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDiceStore } from '../../src/stores/dice'
import { useUiStore } from '../../src/stores/ui'

describe('U5R openRoll 载荷', () => {
  beforeEach(() => { setActivePinia(createPinia()) })
  it('检定：打开骰盘、切到检定标签、记下载荷，不掷骰', () => {
    const dice = useDiceStore()
    dice.openRoll({ actorId: 'p1', kind: 'check', ability: 'wis', skill: 'insight' })
    expect(useUiStore().diceOpen).toBe(true)
    expect(dice.tab).toBe('check')
    expect(dice.request).toMatchObject({ actorId: 'p1', ability: 'wis', skill: 'insight' })
    expect(dice.last).toBeNull()
    expect(dice.history).toHaveLength(0)
  })
  it('豁免、死亡豁免进豁免标签；先攻、被动进检定标签；被动可带 DC', () => {
    const dice = useDiceStore()
    dice.openRoll({ actorId: 'p1', kind: 'save', ability: 'dex' }); expect(dice.tab).toBe('save')
    dice.openRoll({ actorId: 'p1', kind: 'death-save' }); expect(dice.tab).toBe('save')
    dice.openRoll({ actorId: 'p1', kind: 'initiative' }); expect(dice.tab).toBe('check')
    dice.openRoll({ actorId: 'p1', kind: 'passive', skill: 'perception', dc: 17 })
    expect(dice.tab).toBe('check'); expect(dice.request?.dc).toBe(17)
  })
  it('每次 openRoll 序号加一（同一载荷连点也能重置）', () => {
    const dice = useDiceStore()
    const before = dice.requestSeq
    dice.openRoll({ actorId: 'p1', kind: 'check', ability: 'str' })
    dice.openRoll({ actorId: 'p1', kind: 'check', ability: 'str' })
    expect(dice.requestSeq).toBe(before + 2)
  })
  it('free 与旧 prefill：骰式填入自由标签，不掷', () => {
    const dice = useDiceStore()
    dice.prefill({ expression: '1d20+6', note: '盖尔 攻击' })
    expect(dice.tab).toBe('free'); expect(dice.text).toBe('1d20+6'); expect(dice.note).toBe('盖尔 攻击'); expect(dice.last).toBeNull()
  })
})
