import { describe, expect, it } from 'vitest'
import { addSpeedMode, adjustOf, canReset, overrideOf, removeSpeedMode, resetKey, setAdjust, setHover, setOverride } from '../../src/ui/people/card/readoutOps'
import type { MonsterData } from '../../src/rules/dnd5e2014/data/entries/spell-monster'

const base = (): MonsterData => ({ speed: { walk: 30 }, senses: [], languages: [] }) as unknown as MonsterData
describe('U5R 读数写入', () => {
  it('手动调整与覆盖互不影响；[自动计算] 只清这一项', () => {
    let b = setAdjust(base(), { kind: 'ac' }, 2)
    b = setOverride(b, { kind: 'ac' }, 17)
    b = setAdjust(b, { kind: 'initiative' }, 1)
    expect(adjustOf(b, { kind: 'ac' })).toBe(2); expect(overrideOf(b, { kind: 'ac' })).toBe(17)
    const r = resetKey(b, { kind: 'ac' })
    expect(canReset(r, { kind: 'ac' })).toBe(false)
    expect(adjustOf(r, { kind: 'initiative' })).toBe(1)
  })
  it('清到空时不留空对象；被动与速度分项', () => {
    let b = setAdjust(base(), { kind: 'passive', skill: 'perception' }, 2)
    b = setOverride(b, { kind: 'speed', mode: 'walk' }, 40)
    expect(b.adjust?.passive).toEqual({ perception: 2 }); expect(b.overrides?.speed).toEqual({ walk: 40 })
    b = resetKey(resetKey(b, { kind: 'passive', skill: 'perception' }), { kind: 'speed', mode: 'walk' })
    expect(b.adjust).toBeUndefined(); expect(b.overrides).toBeUndefined()
  })
  it('其他移动方式：添加、悬浮、删除（连带清调整与覆盖）', () => {
    let b = addSpeedMode(base(), 'fly', 60)
    expect(b.speed.fly).toBe(60)
    expect(addSpeedMode(b, 'fly', 10)).toBe(b)
    b = setHover(b, true); expect(b.speed.canHover).toBe(true)
    b = setAdjust(b, { kind: 'speed', mode: 'fly' }, 10)
    b = removeSpeedMode(b, 'fly')
    expect(b.speed).toEqual({ walk: 30 }); expect(b.adjust).toBeUndefined()
  })
})
