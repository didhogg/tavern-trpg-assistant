// 生成条目配英文：母条目 + 组内标识；解析结果按各自语言排序，不能按位置配。
import { describe, expect, it } from 'vitest'
import { pairGenerated } from '../../../src/library/english-generated'
import type { EnglishPairs } from '../../../src/library/service-types'

type Pairs = EnglishPairs['pairs']

const list = (rows: Array<[string, Record<string, unknown>]>) => ({ hashes: rows.map((r) => r[0]), items: rows.map((r) => r[1]), sources: rows.map((r) => String(r[1].source)) })

describe('pairGenerated', () => {
  it('魔法变体：模板按作者 ENG_name 换成英文模板，再按（基础物品, 模板）一对一；中文排序和英文不同也不会配错', () => {
    const cn = list([
      ['长剑_phb', { name: '长剑', source: 'PHB' }],
      ['+2 长剑_dmg', { name: '+2 长剑', source: 'DMG', baseItem: '长剑|phb', genericVariant: { name: '+2 武器', source: 'DMG' }, rarity: 'rare' }],
      ['+1 长剑_dmg', { name: '+1 长剑', source: 'DMG', baseItem: '长剑|phb', genericVariant: { name: '+1 武器', source: 'DMG' }, rarity: 'uncommon' }],
    ])
    const en = list([
      ['longsword_phb', { name: 'Longsword', source: 'PHB' }],
      ['+1 longsword_dmg', { name: '+1 Longsword', source: 'DMG', baseItem: 'longsword|phb', genericVariant: { name: '+1 Weapon', source: 'DMG' }, rarity: 'uncommon' }],
      ['+2 longsword_dmg', { name: '+2 Longsword', source: 'DMG', baseItem: 'longsword|phb', genericVariant: { name: '+2 Weapon', source: 'DMG' }, rarity: 'rare' }],
    ])
    const pairs: Pairs = { item: { '长剑_phb': { enHash: 'longsword_phb', enSource: 'PHB', via: 'name' } } }
    const templates = [{ name: '+1 武器', eng: '+1 Weapon', source: 'DMG' }, { name: '+2 武器', eng: '+2 Weapon', source: 'DMG' }]
    const r = pairGenerated('item', cn, en, pairs, { templates })
    expect(pairs.item['+1 长剑_dmg'].enHash).toBe('+1 longsword_dmg')
    expect(pairs.item['+2 长剑_dmg'].enHash).toBe('+2 longsword_dmg')
    expect(r).toMatchObject({ generated: 2, paired: 2, unmatched: 0, noMother: 0 })
  })

  it('版本：按作者展开顺序配（中文 ENG_name 写错也能配）；没有顺序又对不上英文名的不配', () => {
    const cn = list([
      ['龙裔_phb', { name: '龙裔', source: 'PHB' }],
      ['龙裔 (蓝)_phb', { name: '龙裔 (蓝)', source: 'PHB', _versionBase_hash: '龙裔_phb', ENG_name: 'Dragonborn (蓝)' }],
      ['龙裔 (黑)_phb', { name: '龙裔 (黑)', source: 'PHB', _versionBase_hash: '龙裔_phb', ENG_name: 'Dragonborn (黑)' }],
    ])
    const en = list([
      ['dragonborn_phb', { name: 'Dragonborn', source: 'PHB' }],
      ['dragonborn (black)_phb', { name: 'Dragonborn (Black)', source: 'PHB', _versionBase_hash: 'dragonborn_phb' }],
      ['dragonborn (blue)_phb', { name: 'Dragonborn (Blue)', source: 'PHB', _versionBase_hash: 'dragonborn_phb' }],
    ])
    const base: Pairs = { race: { '龙裔_phb': { enHash: 'dragonborn_phb', enSource: 'PHB', via: 'name' } } }
    const noOrder = structuredClone(base)
    expect(pairGenerated('race', cn, en, noOrder).paired).toBe(0)
    const versions = { cn: { race: { '龙裔_phb': ['龙裔 (黑)_phb', '龙裔 (蓝)_phb'] } }, en: { race: { dragonborn_phb: ['dragonborn (black)_phb', 'dragonborn (blue)_phb'] } } }
    const withOrder = structuredClone(base)
    pairGenerated('race', cn, en, withOrder, { versions })
    expect(withOrder.race['龙裔 (黑)_phb'].enHash).toBe('dragonborn (black)_phb')
    expect(withOrder.race['龙裔 (蓝)_phb'].enHash).toBe('dragonborn (blue)_phb')
  })

  it('亚种：母条目是合并后的无名亚种（编号同原始母条目）；组内按 ENG_name = _subraceName 配；原始配对有效的保留', () => {
    const cn = list([
      ['人类_phb', { name: '人类', source: 'PHB', _isSubRace: true, _baseName: '人类', _baseSource: 'PHB' }],
      ['人类 (凯尔顿)_psd', { name: '人类 (凯尔顿)', source: 'PSD', _isSubRace: true, _baseName: '人类', _baseSource: 'PHB', ENG_name: 'Keldon' }],
      ['人类 (阿芒凯)_psd', { name: '人类 (阿芒凯)', source: 'PSD', _isSubRace: true, _baseName: '人类', _baseSource: 'PHB', ENG_name: 'Amonkhet' }],
    ])
    const en = list([
      ['human_phb', { name: 'Human', source: 'PHB', _isSubRace: true, _baseName: 'Human', _baseSource: 'PHB' }],
      ['human (amonkhet)_psd', { name: 'Human (Amonkhet)', source: 'PSD', _isSubRace: true, _baseName: 'Human', _baseSource: 'PHB', _subraceName: 'Amonkhet' }],
      ['human (keldon)_psd', { name: 'Human (Keldon)', source: 'PSD', _isSubRace: true, _baseName: 'Human', _baseSource: 'PHB', _subraceName: 'Keldon' }],
    ])
    const pairs: Pairs = { race: { '人类_phb': { enHash: 'human_phb', enSource: 'PHB', via: 'name' }, '人类 (凯尔顿)_psd': { enHash: 'keldon_psd', enSource: 'PSD', via: 'name-any-array' } } }
    const r = pairGenerated('race', cn, en, pairs)
    expect(pairs.race['人类 (凯尔顿)_psd'].enHash).toBe('human (keldon)_psd')
    expect(pairs.race['人类 (阿芒凯)_psd'].enHash).toBe('human (amonkhet)_psd')
    expect(pairs.race['人类_phb'].enHash).toBe('human_phb')
    expect(r.kept).toBe(1)
  })
})
