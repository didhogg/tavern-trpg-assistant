import { describe, expect, it } from 'vitest'
import { collectRefs, entryFacts } from '../../src/ui/library/facts'

const get = (facts: ReturnType<typeof entryFacts>, label: string) => facts.find((f) => f.label === label)
const text = (f: ReturnType<typeof get>) => (f?.parts ?? []).map((p) => (typeof p === 'string' ? p : `<${p.ref}>`)).join('')

describe('条目的结构化展示', () => {
  it('职业：生命骰、主要属性、熟练项、特性按等级排列、职业表', () => {
    const facts = entryFacts({ type: 'class', data: {
      hitDie: 12, primaryAbility: ['str'], saves: ['str', 'con'],
      proficiencies: { armor: ['light', 'shield'], weapons: ['简易'], tools: [], skills: { choose: 2, from: ['athletics', 'animal handling'] } },
      startingEquipment: ['(a) 一把{{ref:item.greataxe.phb|巨斧}}'], subclassTitle: '原初道途', subclassLevel: 3,
      table: { cols: ['狂暴次数'], rows: [{ level: 1, values: ['2'] }] },
      advancement: [{ kind: 'itemGrant', level: 2, items: ['feature.b'] }, { kind: 'itemGrant', level: 1, items: ['feature.a', 'feature.c'] }],
    } })
    expect(text(get(facts, '生命骰'))).toBe('d12')
    expect(text(get(facts, '主要属性'))).toBe('力量')
    expect(text(get(facts, '护甲熟练'))).toBe('轻甲、盾牌')
    expect(text(get(facts, '技能熟练'))).toContain('运动、驯兽')
    expect(text(get(facts, '子职业'))).toBe('原初道途（3 级选择）')
    expect(get(facts, '职业表')?.table?.rows).toEqual([['1', '2']])
    expect(text(get(facts, '特性'))).toBe('\n1 级：<feature.a>、<feature.c>\n2 级：<feature.b>')
    expect(collectRefs(facts)).toEqual(['feature.a', 'feature.c', 'feature.b'])
  })

  it('怪物：护甲、生命值、速度、六维、动作分段', () => {
    const facts = entryFacts({ type: 'monster', data: {
      size: ['L'], creatureType: { type: 'aberration' }, alignment: 'L E', ac: [{ value: 17 }], hp: { average: 135, formula: '18d10 + 36' },
      speed: { swim: 40, walk: 10 }, abilities: { str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 }, saves: { con: 6 }, cr: 10, passive: 20, senses: ['黑暗视觉 120 尺'],
      actions: [{ name: '触须', text: [{ p: '近战攻击' }] }], traits: [], legendary: { actions: [], count: 0 },
    } })
    expect(text(get(facts, '类型'))).toBe('大型 · 异怪 · 守序邪恶')
    expect(text(get(facts, '生命值'))).toBe('135（18d10 + 36）')
    expect(text(get(facts, '速度'))).toBe('游泳 40 尺，步行 10 尺')
    expect(text(get(facts, '属性'))).toContain('力量 21')
    expect(text(get(facts, '豁免'))).toBe('体质 +6')
    expect(get(facts, '动作')?.sections?.[0].name).toBe('触须')
    expect(get(facts, '特性')).toBeUndefined()
  })

  it('法术、物品、随机表、种族', () => {
    const spell = entryFacts({ type: 'spell', data: { level: 0, school: 'conjuration', castTime: [{ n: 1, unit: 'action' }], range: { type: 'point', amount: 60, unit: 'feet' }, components: { v: true, s: true }, duration: [{ type: 'instant' }], classes: ['class.wizard.phb'] } })
    expect(text(get(spell, '环阶'))).toBe('戏法 · 咒法')
    expect(text(get(spell, '施法时间'))).toBe('1 动作')
    expect(text(get(spell, '施法距离'))).toBe('60 尺')
    expect(text(get(spell, '法术成分'))).toBe('V、S')
    expect(text(get(spell, '持续时间'))).toBe('即时')
    expect(text(get(entryFacts({ type: 'item', data: { value: 200, weight: 2, rarity: 'none', category: 'gear' } }), '价格'))).toBe('2 gp')
    const table = entryFacts({ type: 'table', data: { dice: 'd8', cols: ['特点'], rows: [{ min: 1, max: 2, cells: ['甲'] }, { min: 3, max: 3, cells: ['乙'] }] } })
    expect(table[0].table?.rows).toEqual([['1–2', '甲'], ['3', '乙']])
    const race = entryFacts({ type: 'race', data: { abilityBonus: { fixed: { str: 2, cha: 1 } }, size: ['M'], speed: { walk: 30 }, darkvision: 60, languages: ['通用语'], traits: ['feature.x'] } })
    expect(text(get(race, '属性加值'))).toBe('力量 +2 魅力 +1')
  })

  it('没有结构化数据的类型：返回空', () => {
    expect(entryFacts({ type: 'rule', data: {} })).toEqual([])
  })
})
