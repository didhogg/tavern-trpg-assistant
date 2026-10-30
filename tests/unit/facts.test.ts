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

  it('护甲等级附带条件、武器射程、法术的伤害/状态字段', () => {
    const monster = entryFacts({ type: 'monster', data: { ac: [{ value: 12 }, { value: 15, condition: '法师护甲时', braces: true }, { value: 10, condition: '类人形态下' }, { value: 11, from: '天生护甲', condition: '熊形态下' }] } })
    expect(text(get(monster, '护甲等级'))).toBe('12、15（法师护甲时）、10 类人形态下、11（天生护甲） 熊形态下')
    const item = entryFacts({ type: 'item', data: { category: 'weapon', weapon: { category: 'martial', damage: [], properties: [], range: { normal: 150, long: 600 } } } })
    expect(text(get(item, '射程'))).toBe('150/600 尺')
    const spell = entryFacts({ type: 'spell', data: { level: 1, school: 'evocation', damageInflict: ['psychic'], conditionInflict: ['blinded'], damageResist: ['necrotic'] } })
    expect(text(get(spell, '造成伤害'))).toBe('心灵')
    expect(text(get(spell, '施加状态'))).toBe('目盲')
    expect(text(get(spell, '赋予伤害抗性'))).toBe('死灵')
  })

  it('没有结构化数据的类型：返回空', () => {
    expect(entryFacts({ type: 'rule', data: {} })).toEqual([])
  })

  it('英文代码显示为中文（伤害类型、状态、语言、武器属性、稀有度、护甲类别）', () => {
    const monster = entryFacts({ type: 'monster', data: { resist: ['cold', 'slashing'], immune: ['poison'], vulnerable: ['fire'], conditionImmune: ['charmed', 'exhaustion'], languages: ['深潜语'] } })
    expect(text(get(monster, '伤害抗性'))).toBe('寒冷、挥砍')
    expect(text(get(monster, '伤害免疫'))).toBe('毒素')
    expect(text(get(monster, '伤害易伤'))).toBe('火焰')
    expect(text(get(monster, '状态免疫'))).toBe('魅惑、力竭')
    const weapon = entryFacts({ type: 'item', data: { category: 'weapon', rarity: 'very rare', weapon: { category: 'martial', damage: [{ dice: '1d8', type: '挥砍' }], properties: ['V', 'F', 'AF|DMG'], versatile: '1d10' } } })
    expect(text(get(weapon, '类别'))).toBe('武器')
    expect(text(get(weapon, '稀有度'))).toBe('极珍稀')
    expect(text(get(weapon, '武器类别'))).toBe('军用')
    expect(text(get(weapon, '武器属性'))).toBe('两用、灵巧、弹药（火器）')
    expect(text(get(weapon, '伤害'))).toBe('1d8 挥砍（两用 1d10）')
    const armor = entryFacts({ type: 'item', data: { category: 'armor', armor: { ac: 14, category: 'medium', stealthDisadvantage: true } } })
    expect(text(get(armor, '护甲类别'))).toBe('中甲')
    expect(text(get(armor, '隐匿'))).toBe('劣势')
    const race = entryFacts({ type: 'subrace', data: { languages: ['common', 'undercommon', 'aquan'], proficiencies: ['any'] } })
    expect(text(get(race, '语言'))).toBe('通用语、地底通用语、水族语')
    expect(text(get(race, '熟练项'))).toBe('任选一项技能')
    const bg = entryFacts({ type: 'background', data: { proficiencies: { languages: ['anyStandard'], skills: ['insight', 'sleight of hand'], tools: ["thieves' tools", 'anyGamingSet'] } } })
    expect(text(get(bg, '技能熟练'))).toBe('洞悉、巧手')
    expect(text(get(bg, '工具熟练'))).toBe('盗贼工具、任选一种游戏套组')
    expect(text(get(bg, '语言'))).toBe('任选一种标准语言')
  })

  it('不认识的代码原样显示，不丢信息；来源书名显示中文', async () => {
    const { tr, WEAPON_PROPERTY } = await import('../../src/ui/library/zh')
    expect(tr(WEAPON_PROPERTY, 'ZZ')).toBe('ZZ')
    const { sourceLine } = await import('../../src/ui/library/typeLabels')
    expect(sourceLine({ src: { book: 'PHB', page: 105 }, credit: { by: '共库机翻', license: 'CC-BY-NC-SA-4.0' } })).toBe('出自《玩家手册》第 105 页 · 中文：共库机翻（CC-BY-NC-SA-4.0）')
  })
})
