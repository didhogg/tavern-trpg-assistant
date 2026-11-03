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

describe('G3 14 类事实不露字段键', () => {
  const cases: Array<[string, Record<string, unknown>, string[]]> = [
    ['deity', { title: '晨曦之主', pantheon: '费伦', alignment: ['L', 'G'], domains: ['Life', 'Light'], province: '黎明', symbol: '日出', category: '神祇' }, ['Life', 'Light']],
    ['language', { code: 'common', type: 'standard', script: '通用文字', typicalSpeakers: ['人类'], dialects: ['通用语'] }, ['standard']],
    ['reward', { rewardKind: 'blessing', rarity: 'rare', spellGrants: [{ spell: 'spell.bless.phb' }] }, ['blessing']],
    ['cult', { type: 'Demonic', goal: '召唤恶魔', typicalMembers: '邪教徒', signatureSpells: '召唤恶魔' }, ['Demonic']],
    ['hazard', { hazardKind: 'trap', rating: [{ tier: 1, threat: 'setback' }], initiative: 10 }, ['trap', 'setback']],
    ['object', { size: ['M'], ac: 15, hp: 20, speed: { walk: 30 }, str: 10, dex: 12, con: 10, int: 0, wis: 0, cha: 0 }, ['walk', 'str']],
    ['vehicle', { vehicleType: 'SHIP', size: ['L'], capCrew: 10, speed: { walk: 30 }, ac: 15, hp: 100, str: 16 }, ['SHIP', 'walk', 'str']],
    ['feat', { prerequisite: ['等级 4'], abilityIncrease: [{ ability: 'str', amount: 1 }], effects: [] }, ['str']],
    ['condition', { kind: 'condition', effects: [] }, ['condition']],
    ['disease', { kind: 'disease', effects: [] }, []],
    ['status', { kind: 'status', effects: [] }, []],
    ['monsterPart', { partKind: 'action', example: '爪击', effect: '造成伤害', attackBonus: '+5' }, ['action']],
    ['charoption', { optionType: ['战斗风格'] }, []],
    ['recipe', { diet: 'C', dishTypes: ['汤'], ingredients: [], equipment: [] }, ['C']],
    ['rule', { category: 'variant', abbreviation: '变体' }, ['variant']],
  ]
  for (const [type, data, bad] of cases) {
    it(type, () => {
      const facts = entryFacts({ type, data } as never)
      const all = factsToText(facts)
      expect(all.length).toBeGreaterThan(0)
      for (const key of bad) expect(all).not.toContain(key)
      const labels = facts.map((f) => f.label)
      expect(new Set(labels).size).toBe(labels.length)
    })
  }
})
