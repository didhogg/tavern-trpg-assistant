// 加条目后撤销：存档里已没有这批的引用，按存档退回时基准不能还留着它们（一批里有引用在 = 整批保留，连带授予的特性）。
import { describe, expect, it } from 'vitest'
import { PreparedActors } from '../../src/rules/kernel/prepared'

const ids = (d: Record<string, unknown> | null) => ((d?.items ?? []) as Array<{ _id: string }>).map((i) => i._id)

describe('PreparedActors 加条目批次', () => {
  it('存档里没有这批的引用：退回时从基准拿掉整批', () => {
    const b = new PreparedActors()
    b.set('a', { items: [{ _id: 'race' }] })
    b.addItems('a', [{ _id: 'torch' }])
    b.addItems('a', [{ _id: 'class2' }, { _id: 'feature' }])
    expect(ids(b.baseFor('a', [{ itemId: 'race' }, { itemId: 'class2' }]))).toEqual(['race', 'class2', 'feature'])
  })
  it('引用都还在：基准不变；已有的物品被替换时不算新加', () => {
    const b = new PreparedActors()
    b.set('a', { items: [{ _id: 'potion', q: 1 }] })
    b.addItems('a', [{ _id: 'potion', q: 2 }])
    expect(ids(b.baseFor('a', []))).toEqual(['potion'])
  })
})
