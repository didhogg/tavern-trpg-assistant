import { describe, expect, it } from 'vitest'
import { itemBlock, modOf, monsterBlock, recipeBlock, signed } from '../../src/ui/libview/statblock'

describe('怪物数值块', () => {
  const m = { ac: [{ ac: 15, from: ['皮甲', '盾牌'] }], hp: { average: 7, formula: '2d6' }, speed: { walk: 30, fly: { number: 60, condition: '（悬浮）' } }, str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8, skill: { stealth: '+6' }, save: { dex: '+4' }, senses: ['黑暗视觉 60 尺'], passive: 9, languages: ['通用语'], action: [{ name: '弯刀', entries: ['…'] }] }
  it('一行一项，数字与登记过的代号', () => {
    const b = monsterBlock(m)
    expect(b.lines.find((l) => l.label === '防御')?.value).toBe('15（皮甲，盾牌）')
    expect(b.lines.find((l) => l.label === '生命')?.value).toBe('7（2d6）')
    expect(b.lines.find((l) => l.label === '速度')?.value).toBe('步行 30 尺，飞行 60 尺 （悬浮）')
    expect(b.lines.find((l) => l.label === '技能')?.value).toBe('隐匿 +6')
    expect(b.lines.find((l) => l.label === '感官')?.value).toBe('黑暗视觉 60 尺，被动察觉 9')
    expect(b.abilities.map((a) => `${a.label}${a.score}${a.mod}`)).toEqual(['力量8−1', '敏捷14+2', '体质10+0', '智力10+0', '感知8−1', '魅力8−1'])
    expect(b.sections.map((s) => s.title)).toEqual(['动作'])
  })
  it('缺字段：那一行不出现，不报错', () => {
    expect(monsterBlock({ name: 'x' }).lines).toEqual([])
    expect(monsterBlock(null).abilities).toEqual([])
  })
  it('调整值', () => { expect(signed(modOf(8))).toBe('−1'); expect(signed(modOf(15))).toBe('+2') })
})

describe('物品摘要行', () => {
  it('长剑：类型 / 价值 / 重量 / 伤害', () => {
    const b = itemBlock({ _entryType: '武器', _entrySubType: '军用武器, 近战武器', rarity: 'none', value: 1500, weight: 3, dmg1: '1d8', dmgType: 'S', dmg2: '1d10', _attunementCategory: '无需同调' })
    expect(b.lines).toEqual([{ label: '类型', value: '军用武器, 近战武器' }, { label: '价值', value: '15 gp' }, { label: '重量', value: '3 磅' }, { label: '伤害', value: '1d8 挥砍（双手 1d10）' }])
  })
  it('魔法物品：稀有度与同调', () => {
    expect(itemBlock({ rarity: 'very rare', _attunementCategory: '需要同调' }).lines).toEqual([{ label: '稀有度', value: '极珍稀' }, { label: '同调', value: '需要同调' }])
  })
})

describe('食谱', () => {
  it('类型 / 份量 + 食材 / 做法 / 备注', () => {
    const b = recipeBlock({ dishTypes: ['主菜'], makes: '6 人份', _fullIngredients: [{ entry: '5 汤匙黄油' }], instructions: ['混合', '烤'], noteCook: ['可以换配料'] })
    expect(b.lines).toEqual([{ label: '类型', value: '主菜' }, { label: '份量', value: '6 人份' }])
    expect(b.sections.map((s) => s.title)).toEqual(['食材', '做法', '备注'])
  })
})
