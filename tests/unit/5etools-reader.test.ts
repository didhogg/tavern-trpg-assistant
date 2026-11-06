import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/schemas/pack'
import { classView, itemView, monsterView, parseTags, spellView } from '../../src/core/source/5etools/reader'

function entry(type: string, data: Record<string, unknown>, name = type, id = `${type}-${name}`): Entry {
  return { id, type, name, nameEn: String(data.ENG_name ?? name), keywords: [], unique: false, summary: '', data }
}

describe('5etools 只读读取层', () => {
  it('读出行内标记：伤害骰、DC、命中、攻击', () => {
    const tags = parseTags('{@atk mw} {@hit 7}，命中时 {@damage 2d6 + 3} 点伤害，{@dc 15} 敏捷豁免。')
    expect(tags.atk).toEqual(['mw'])
    expect(tags.hit).toEqual([7])
    expect(tags.rolls[0]).toEqual({ dice: '2d6+3', display: '2d6 + 3' })
    expect(tags.dc).toEqual([15])
    expect(tags.unknown).toEqual([])
  })

  it('法术：环阶/学派/时间/距离/成分/持续/豁免/职业表', () => {
    const spell = entry('spell', {
      name: '火球术',
      ENG_name: 'Fireball',
      source: 'PHB',
      level: 3,
      school: 'V',
      time: [{ number: 1, unit: 'action' }],
      range: { type: 'point', distance: { type: 'feet', amount: 150 } },
      components: { v: true, s: true, m: '一小球蝙蝠粪及硫磺' },
      duration: [{ type: 'instant' }],
      entries: ['目标受到 {@damage 8d6} 点火焰伤害。'],
      savingThrow: ['dexterity'],
      damageInflict: ['fire'],
    }, '火球术')
    const view = spellView(spell, { PHB: { 火球术: { class: [{ name: '法师', source: 'PHB' }] } } })
    expect(view.level).toBe(3)
    expect(view.school).toBe('evocation')
    expect(view.schoolLabel).toBe('塑能')
    expect(view.castTime).toEqual([{ n: 1, unit: 'action' }])
    expect(view.range).toMatchObject({ type: 'point', distance: { type: 'feet', amount: 150 } })
    expect(view.components).toMatchObject({ v: true, s: true, m: '一小球蝙蝠粪及硫磺' })
    expect(view.saves).toEqual(['dexterity'])
    expect(view.damageTypes).toEqual(['火焰'])
    expect(view.rolls[0]?.dice).toBe('8d6')
    expect(view.classes).toMatchObject({ count: 1, names: ['法师'], source: 'PHB' })
  })

  it('怪物：动作/攻击/伤害/DC/变体', () => {
    const monster = entry('monster', {
      ENG_name: 'Arcanaloth',
      source: 'MM',
      ac: [{ ac: 17 }],
      hp: { average: 104, formula: '16d8 + 32' },
      size: ['M'],
      type: { type: 'fiend' },
      str: 17, dex: 12, con: 14, int: 20, wis: 16, cha: 17,
      action: [{ name: '爪击', entries: ['{@atk mw} {@hit 7}，命中时 {@damage 2d4 + 3} 点挥砍伤害，{@dc 14} 体质豁免。'] }],
      variant: [{ type: 'variant', name: '召唤', _version: { name: '奥法罗斯魔（召唤师）' } }],
    }, '奥法罗斯魔')
    const view = monsterView(monster)
    expect(view.ac).toEqual([17])
    expect(view.actionCount).toBe(1)
    expect(view.actionsWithAttack).toBe(1)
    expect(view.actionsWithDamage).toBe(1)
    expect(view.actionsWithDc).toBe(1)
    expect(view.variants[0]?.versionName).toBe('奥法罗斯魔（召唤师）')
  })

  it('物品：奇物、同调布尔值、加成', () => {
    const wondrous = itemView(entry('item', { ENG_name: 'Amulet', wondrous: true, rarity: 'rare', reqAttune: true }, '护符'))
    expect(wondrous.category).toBe('wondrous')
    expect(wondrous.reqAttune).toBe(true)
    const rod = itemView(entry('item', { ENG_name: 'Rod', type: 'RD|DMG', rarity: 'uncommon', reqAttune: '由魔契师', bonusSpellAttack: '+1', bonusSpellSaveDc: '+1' }, '权杖'))
    expect(rod.reqAttune).toBe('由魔契师')
    expect(rod.bonuses).toEqual({ bonusSpellAttack: '+1', bonusSpellSaveDc: '+1' })
  })

  it('职业：特性引用按等级归位，子职业特性也归位', () => {
    const cls = entry('class', {
      name: '战士',
      ENG_name: 'Fighter',
      source: 'PHB',
      hd: { faces: 10 },
      proficiency: ['str', 'con'],
      classFeatures: ['动作如潮|战士||2', { classFeature: '武术范型|战士||3', gainSubclassFeature: true }],
      subclassTitle: '武术范型',
    }, '战士')
    const features = [
      entry('feature', { name: '动作如潮', className: '战士', classSource: 'PHB', level: 2 }, '动作如潮', 'f1'),
      entry('feature', { name: '武术范型', className: '战士', classSource: 'PHB', level: 3 }, '武术范型', 'f2'),
      entry('feature', { name: '卓越战技', className: '战士', classSource: 'PHB', subclassShortName: '战斗大师', subclassSource: 'PHB', level: 3 }, '卓越战技', 'f3'),
    ]
    const subclasses = [entry('subclass', { name: '战斗大师', className: '战士', classSource: 'PHB', subclassFeatures: ['卓越战技|战士||战斗大师||3'] }, '战斗大师')]
    const view = classView(cls, features, subclasses)
    expect(view.classRefs).toBe(2)
    expect(view.classFeaturesResolved).toBe(2)
    expect(view.classFeaturesMissing).toBe(0)
    expect(view.subclassLevel).toBe(3)
    expect(view.byLevel).toEqual({ 2: ['动作如潮'], 3: ['武术范型'] })
    expect(view.subclasses[0]).toMatchObject({ name: '战斗大师', refs: 1, resolved: 1, missing: 0 })
  })
})

import { backgroundView, featView, levelUpView, optionalFeatureView, raceView, tableView, rollTable } from '../../src/core/source/5etools/reader'
import { buildPackViews } from '../../src/core/source/5etools/pack'

describe('5etools 角色构建读取', () => {
  it('种族/亚种：属性、速度、黑暗视觉、语言、特性、母种族', () => {
    const race = entry('race', {
      ENG_name: 'Dwarf',
      source: 'PHB',
      size: ['M'],
      speed: { walk: 25 },
      ability: [{ con: 2 }],
      darkvision: 60,
      languageProficiencies: [{ common: true, dwarvish: true }],
      entries: [{ name: '黑暗视觉', ENG_name: 'Darkvision', type: 'entries', entries: ['...'] }],
    }, '矮人')
    const view = raceView(race)
    expect(view.size).toEqual(['M'])
    expect(view.speed).toEqual({ walk: 25 })
    expect(view.darkvision).toBe(60)
    expect(view.traits[0]?.name).toBe('黑暗视觉')
    expect(view.isSubrace).toBe(false)
    const sub = raceView(entry('subrace', { name: '丘陵矮人', ENG_name: 'Hill Dwarf', source: 'PHB', raceName: '矮人', raceSource: 'PHB' }, '丘陵矮人'))
    expect(sub.isSubrace).toBe(true)
    expect(sub.parentRace).toBe('矮人')
  })

  it('背景：熟练、装备、专长、特性', () => {
    const view = backgroundView(entry('background', {
      name: '士兵', ENG_name: 'Soldier', source: 'PHB',
      skillProficiencies: [{ athletics: true, intimidation: true }],
      toolProficiencies: [{ 'gaming set': true }],
      startingEquipment: [{ a: ['制服|PHB'], b: [{ value: 1000 }] }],
      feats: [{ '某种专长|PHB': true }],
      entries: [{ name: '军衔', ENG_name: 'Military Rank', type: 'entries', entries: ['...'] }],
    }, '士兵'))
    expect(view.skillProficiencies).toEqual([{ athletics: true, intimidation: true }])
    expect(view.traits[0]?.name).toBe('军衔')
    expect(view.feats).toBeTruthy()
  })

  it('专长：前置、属性、技能、感官', () => {
    const view = featView(entry('feat', {
      name: '观察力', ENG_name: 'Observant', source: 'PHB', category: 'G',
      prerequisite: [{ ability: [{ wis: 13 }] }],
      ability: [{ choose: { from: ['int', 'wis'], amount: 1 } }],
      skillProficiencies: [{ perception: true }],
      senses: [{ blindsight: 10 }],
      entries: ['...'],
    }, '观察力'))
    expect(view.category).toBe('G')
    expect(view.prerequisite).toBeTruthy()
    expect(view.senses).toEqual([{ blindsight: 10 }])
  })

  it('可选特性：类型、前置、变体标记', () => {
    const view = optionalFeatureView(entry('optionalfeature', {
      name: '苦痛魔爆', ENG_name: 'Agonizing Blast', source: 'PHB', featureType: ['EI'],
      prerequisite: [{ spell: ['魔能爆#c'] }], isClassFeatureVariant: true, consumes: { name: '契约魔法' },
    }, '苦痛魔爆'))
    expect(view.featureType).toEqual(['EI'])
    expect(view.isClassFeatureVariant).toBe(true)
  })

  it('升级：1–20 特性、属性提升、法术位、戏法', () => {
    const cls = entry('class', {
      name: '法师', ENG_name: 'Wizard', source: 'PHB',
      hd: { faces: 6 }, proficiency: ['int', 'wis'],
      classFeatures: [
        '施法|法师||1',
        '属性值提升|法师||4',
        { classFeature: '奥术传承|法师||2', gainSubclassFeature: true },
      ],
      classTableGroups: [
        { colLabels: ['{@filter 已知戏法|spells|level=0|class=法师}'], rows: Array.from({ length: 20 }, () => [3]) },
        { title: '每环法术位', colLabels: ['1环'], rowsSpellProgression: Array.from({ length: 20 }, (_, i) => [i === 0 ? 2 : 3]) },
      ],
    }, '法师')
    const features = [
      entry('feature', { name: '施法', className: '法师', classSource: 'PHB', level: 1 }, '施法', 'f1'),
      entry('feature', { name: '奥术传承', className: '法师', classSource: 'PHB', level: 2 }, '奥术传承', 'f2'),
      entry('feature', { name: '属性值提升', className: '法师', classSource: 'PHB', level: 4 }, '属性值提升', 'f3'),
    ]
    const view = levelUpView(cls, features, [])
    expect(view.levels.length).toBe(20)
    expect(view.levels[0]?.features).toEqual(['施法'])
    expect(view.levels[1]?.subclass).toBe(true)
    expect(view.levels[3]?.asi).toBe(true)
    expect(view.slotsReadable).toBe(true)
    expect(view.levels[0]?.slots).toEqual([2])
    expect(view.cantrips?.[0]).toBe(3)
  })
})


describe('5etools 随机表读取', () => {
  it('读表头/行/骰子，并按第一列范围取行', () => {
    const table = tableView({ type: 'table', caption: '测试表', colLabels: ['d6', '结果'], rows: [['1-2', '甲'], ['3-6', '乙']] })
    expect(table?.dice).toBe('1d6')
    expect(table?.rows.length).toBe(2)
    expect(rollTable(table!, 2)).toEqual(['1-2', '甲'])
    expect(rollTable(table!, 5)).toEqual(['3-6', '乙'])
    expect(rollTable(table!, 7)).toBeNull()
  })
})


describe('5etools 包级后端视图', () => {
  it('按类型分组，职业同时产出等级视图', () => {
    const cls = entry('class', { name: '战士', ENG_name: 'Fighter', source: 'PHB', hd: { faces: 10 }, classFeatures: ['回气|战士||1'] }, '战士')
    const feature = entry('feature', { name: '回气', className: '战士', classSource: 'PHB', level: 1 }, '回气')
    const views = buildPackViews([cls, feature, entry('race', { name: '矮人', source: 'PHB' }, '矮人')])
    expect(views.counts).toEqual({ class: 1, feature: 1, race: 1 })
    expect(views.classes).toHaveLength(1)
    expect(views.levels).toHaveLength(1)
    expect(views.races).toHaveLength(1)
  })
})
