// B-33 变体挂在母条目旁边：反查沿用作者写在生成条目上的出处字段（版本 / 魔法变体），不写类别清单。
import { describe, expect, it } from 'vitest'
import { variantLinks } from '../../../src/library/variants'

const list = (rows: Array<[string, Record<string, unknown>]>) => ({ hashes: rows.map((r) => r[0]), items: rows.map((r) => r[1]), sources: rows.map((r) => String(r[1].source)) })

describe('variantLinks', () => {
  const l = list([
    ['长剑_phb', { name: '长剑', source: 'PHB' }],
    ['+1 长剑_dmg', { name: '+1 长剑', source: 'DMG', baseItem: '长剑|phb', genericVariant: { name: '+1 武器', source: 'DMG' } }],
    ['+2 长剑_dmg', { name: '+2 长剑', source: 'DMG', baseItem: '长剑|phb', genericVariant: { name: '+2 武器', source: 'DMG' } }],
    ['巨魔_mm', { name: '巨魔', source: 'MM', _versions: [] }],
    ['巨魔（战斗形态）_mm', { name: '巨魔（战斗形态）', source: 'MM', _versionBase_hash: '巨魔_mm', _versionBase_name: '巨魔' }],
  ])
  it('母条目 → 它的变体（魔法变体按基础物品、版本按 _versionBase_hash）', () => {
    expect(variantLinks(l, '长剑_phb').variants.map((v) => [v.hash, v.kind, v.source])).toEqual([['+1 长剑_dmg', 'variant', 'DMG'], ['+2 长剑_dmg', 'variant', 'DMG']])
    expect(variantLinks(l, '巨魔_mm').variants.map((v) => v.hash)).toEqual(['巨魔（战斗形态）_mm'])
  })
  it('变体自己 → 母条目；普通条目没有母条目也没有变体', () => {
    expect(variantLinks(l, '+1 长剑_dmg').parent).toBe('长剑_phb')
    expect(variantLinks(l, '巨魔（战斗形态）_mm').parent).toBe('巨魔_mm')
    expect(variantLinks(l, '不存在')).toEqual({ parent: null, variants: [] })
  })
})
