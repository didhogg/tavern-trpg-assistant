import { describe, expect, it } from 'vitest'
import { buildLoreIndex, loreOf, variantsOf, type LoreSource } from '../../src/core/library/lore'
import { entryDataByType } from '../../src/rules/dnd5e2014/data/entries'

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

  it('variantsOf 内嵌优先，否则取补丁', () => {
    const variant = { name: '变体', kind: 'variant' as const, text: [{ p: '正文' }] }
    const own: LoreSource = { id: 'monster.x', type: 'monster', data: { variants: [variant] } }
    const index = buildLoreIndex([{ id: 'lore.monster.x', type: 'lore', packId: 'p', data: { target: 'monster.x', variants: [{ ...variant, name: '补丁变体' }] } }])
    expect(variantsOf(own, index)).toEqual([variant])
    expect(variantsOf({ id: 'monster.x', type: 'monster', data: {} }, index)[0].name).toBe('补丁变体')
    expect(variantsOf({ id: 'monster.y', type: 'monster', data: {} }, index)).toEqual([])
  })

  it('lore 补丁 schema 要求 lore 或 variants 至少一项', () => {
    const schema = entryDataByType.lore
    expect(schema.safeParse({ target: 'monster.x', lore: [], variants: [] }).success).toBe(false)
    expect(schema.safeParse({ target: 'monster.x', src: { book: 'TEST', page: 1 }, credit: { by: '共库', license: 'CC-BY-NC-SA-4.0', machine: false, missing: [] }, variants: [{ name: '变体', kind: 'variant', text: [] }] }).success).toBe(true)
  })

  it('两个补丁指向同一目标时拒绝建索引', () => {
    expect(() => buildLoreIndex([
      { id: 'lore.class.barbarian.phb', type: 'lore', packId: 'dnd5e2014-phb', layer: 1, data: { target: target.id, lore: [{ p: 'a' }] } },
      { id: 'lore.class.barbarian.phb-2', type: 'lore', packId: 'dnd5e2014-xge', layer: 2, data: { target: target.id, lore: [{ p: 'b' }] } },
    ])).toThrow(/重复/)
  })
})
