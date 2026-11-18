// P6 取下 / 装回：运行时准备账本（src/rules/kernel/prepared.ts）与存档兼容读取。
import { describe, expect, it } from 'vitest'
import { PreparedActors } from '../../src/rules/kernel/prepared'
import { kernelActorSchema } from '../../src/schemas/kernel'

describe('准备账本：完整基准 / 取下后视图 / 原始选择', () => {
  it('没有取下时视图就是基准；有取下时差别相对视图', () => {
    const p = new PreparedActors()
    p.set('a', { name: 'base' })
    expect(p.view('a')).toEqual({ name: 'base' })
    p.set('a', { name: 'base' }, { name: 'view' })
    expect(p.base('a')).toEqual({ name: 'base' })
    expect(p.view('a')).toEqual({ name: 'view' })
  })
  it('保存时取下动过的成长用原始选择（同一来源、同一成长、同一级），其他照当前记下的', () => {
    const p = new PreparedActors()
    p.set('a', {}, {}, { 'race|PHB|elf_phb': [{ id: 't1', type: 'Trait', level: 0, data: { chosen: ['skills:prc'] } }] })
    const captured = { 'race|PHB|elf_phb': [{ id: 't1', level: 0, data: { chosen: [] } }, { id: 'a1', level: 0, data: { assignments: { dex: 2 } } }], 'class|PHB|fighter_phb': [{ id: 'h1', level: 1, data: {} }] }
    const out = p.protect('a', captured) as Record<string, Array<{ id: string; data: unknown }>>
    expect(out['race|PHB|elf_phb'].find((r) => r.id === 't1')?.data).toEqual({ chosen: ['skills:prc'] })
    expect(out['race|PHB|elf_phb'].find((r) => r.id === 'a1')?.data).toEqual({ assignments: { dex: 2 } })
    expect(out['class|PHB|fighter_phb']).toEqual(captured['class|PHB|fighter_phb'])
  })
  it('加条目：新条目同时进完整基准和视图', () => {
    const p = new PreparedActors()
    p.set('a', { items: [{ _id: 'x' }] }, { items: [{ _id: 'x' }] })
    p.addItems('a', [{ _id: 'y' }])
    expect((p.base('a')!.items as unknown[]).length).toBe(2)
    expect((p.view('a')!.items as unknown[]).length).toBe(2)
  })
})

describe('存档兼容：取下安排', () => {
  it('旧存档没有 off = 什么都没取下；新存档原样读回', () => {
    expect(kernelActorSchema.parse({ id: 'a', name: 'x' }).off).toEqual([])
    const rows = [{ ref: 'race|PHB|elf_phb', advancement: 't1', level: 0, part: 'skills:prc' }, { ref: 'feat|PHB|alert_phb' }]
    expect(kernelActorSchema.parse({ id: 'a', name: 'x', off: rows }).off).toEqual(rows)
  })
})
