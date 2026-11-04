import { describe, expect, it } from 'vitest'
import { concentrationConflict, customEffect, effectFromEntry, tabOf } from '../../src/ui/people/card/effectOps'
import type { Entry } from '../../src/schemas/pack'

const entry = (over: Partial<Entry> & { data: Record<string, unknown> }): Entry => ({ id: 'x', type: 'spell', name: '祝福术', keywords: [], unique: false, ...over }) as Entry
describe('U5R 添加效果', () => {
  it('法术：时长与专注取自 duration[]，effects 取快照', () => {
    const e = entry({ id: 'spell.bless.phb', data: { duration: [{ type: 'timed', amount: 1, unit: 'minute', concentration: true }], effects: [{ kind: 'rollBonus', on: 'save', dice: '1d4' }] } })
    expect(tabOf(e)).toBe('spell')
    const fx = effectFromEntry(e, 1000, 1)
    expect(fx).toMatchObject({ ref: 'spell.bless.phb', category: 'spell', concentration: true, duration: { type: 'timed', amount: 1, unit: 'minute', concentration: true } })
    expect(fx.effects).toEqual([{ kind: 'rollBonus', on: 'save', dice: '1d4' }])
  })
  it('分类：状态（不含力竭）、疾病、其他；瞬发法术不在列表里', () => {
    expect(tabOf(entry({ id: 'condition.blinded.phb', type: 'condition', data: {} }))).toBe('condition')
    expect(tabOf(entry({ id: 'condition.exhaustion.phb', type: 'condition', data: {} }))).toBeNull()
    expect(tabOf(entry({ type: 'disease', data: {} }))).toBe('disease')
    expect(tabOf(entry({ type: 'item', data: {} }))).toBe('other')
    expect(tabOf(entry({ data: { duration: [{ type: 'instant' }] } }))).toBeNull()
  })
  it('专注冲突只提示：返回已在专注的名字', () => {
    const a = effectFromEntry(entry({ id: 'spell.bless.phb', data: { duration: [{ type: 'timed', amount: 1, unit: 'minute', concentration: true }] } }), 1, 1)
    const b = effectFromEntry(entry({ id: 'spell.haste.phb', name: '加速术', data: { duration: [{ type: 'timed', amount: 1, unit: 'minute', concentration: true }] } }), 2, 2)
    expect(concentrationConflict([a], b)).toBe('祝福术')
    expect(concentrationConflict([], b)).toBeUndefined()
    expect(concentrationConflict([a], customEffect('自定义', '', '', 3, 3))).toBeUndefined()
  })
})
