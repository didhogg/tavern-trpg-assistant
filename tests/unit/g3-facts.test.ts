import { describe, expect, it } from 'vitest'
import { entryFacts, factsToText } from '../../src/ui/library/facts'
import { itemKindGroup } from '../../src/ui/library/itemKinds'

describe('G3 事实与物品分类', () => {
  it('起始装备分三段，全角括号', () => {
    const facts = entryFacts({ type: 'class', data: { startingEquipment: [{ fixed: [{ item: '长剑' }], choice: [[{ item: '链甲' }], [{ item: '皮甲' }]], gold: { dice: '5d4', multiplier: 10 } }] } } as never)
    expect(facts.map((f) => f.label)).toEqual(['起始装备', '任选其一', '或改用金币'])
    expect(facts[1].parts).toEqual(['（链甲）（皮甲）'])
  })
  it('factsToText 一行一条', () => {
    expect(factsToText([{ label: '类型', parts: ['类人'] }, { label: '速度', parts: ['30 尺'] }])).toBe('类型：类人\n速度：30 尺')
  })
  it('itemKind 分组', () => {
    expect(itemKindGroup('meleeWeapon')).toBe('weapon')
    expect(itemKindGroup('wondrousItem')).toBe('magic')
    expect(itemKindGroup('unknown-key')).toBe('other')
  })
})
