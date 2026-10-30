import { describe, expect, it } from 'vitest'
import { buildLoreIndex, loreOf, type LoreSource } from '../../src/core/library/lore'

const target = { id: 'class.barbarian.phb', type: 'class', data: {} }

describe('lore 索引', () => {
  it('内嵌 lore 优先于补丁', () => {
    const own: LoreSource = { id: 'class.barbarian.phb', type: 'class', packId: 'dnd5e2014-srd', data: { lore: [{ p: '内嵌' }] } }
    const index = buildLoreIndex([{ id: 'lore.class.barbarian.phb', type: 'lore', packId: 'dnd5e2014-phb', layer: 1, data: { target: target.id, lore: [{ p: '补丁' }] } }])
    expect(loreOf(own, index)).toEqual([{ p: '内嵌' }])
  })

  it('没有内嵌时取补丁，没有补丁返回空数组', () => {
    const index = buildLoreIndex([{ id: 'lore.class.barbarian.phb', type: 'lore', packId: 'dnd5e2014-phb', layer: 1, data: { target: target.id, lore: [{ p: '补丁' }] } }])
    expect(loreOf(target, index)).toEqual([{ p: '补丁' }])
    expect(loreOf({ id: 'class.other.phb', type: 'class', data: {} }, index)).toEqual([])
  })

  it('两个补丁指向同一目标时拒绝建索引', () => {
    expect(() => buildLoreIndex([
      { id: 'lore.class.barbarian.phb', type: 'lore', packId: 'dnd5e2014-phb', layer: 1, data: { target: target.id, lore: [{ p: 'a' }] } },
      { id: 'lore.class.barbarian.phb-2', type: 'lore', packId: 'dnd5e2014-xge', layer: 2, data: { target: target.id, lore: [{ p: 'b' }] } },
    ])).toThrow(/重复/)
  })
})
