import { describe, expect, it } from 'vitest'
import { evalFormula, evaluateFormula, parseFormula } from '../../src/rules/dnd5e2014/data/formula'
import { effectSchema } from '../../src/rules/dnd5e2014/data/effects'
import { ABILITY_KEYS, CONDITIONS, DAMAGE_TYPES, SKILLS, TOOLS } from '../../src/rules/dnd5e2014/data/enums'

function ok(input: string, ctx = {}): number {
  const parsed = parseFormula(input)
  if (!parsed.ok) throw new Error(parsed.error.message)
  return evalFormula(parsed.ast, ctx)
}

describe('P1 公式解析器', () => {
  it('四则运算、括号、正负号与函数', () => {
    expect(ok('2 + 3 * 4')).toBe(14)
    expect(ok('(2 + 3) * 4')).toBe(20)
    expect(ok('10 / 4')).toBe(2.5)
    expect(ok('-3 + +5')).toBe(2)
    expect(ok('floor(7 / 2)')).toBe(3)
    expect(ok('ceil(7 / 2)')).toBe(4)
    expect(ok('min(3, 7, 5)')).toBe(3)
    expect(ok('max(3, 7, 5)')).toBe(7)
  })

  it('每种变量', () => {
    const ctx = {
      level: 9,
      prof: 4,
      cr: 5,
      classLevels: { 'class.wizard.phb': 9, paladin: 5 },
      abilityMods: { cha: 3, int: 4 },
      scales: { 'sneak-attack': 3 },
    }
    expect(ok('level + prof + cr', ctx)).toBe(18)
    expect(ok('class.class.wizard.phb.level', ctx)).toBe(9)
    expect(ok('class.paladin.level', ctx)).toBe(5)
    expect(ok('int.mod + cha.mod', ctx)).toBe(7)
    expect(ok('scale.sneak-attack', ctx)).toBe(3)
  })

  it('非法语法返回位置；缺变量与除零抛错', () => {
    expect(parseFormula('1 +')).toMatchObject({ ok: false, error: { position: 3 } })
    expect(parseFormula('foo(1)')).toMatchObject({ ok: false })
    expect(parseFormula('(1 + 2')).toMatchObject({ ok: false })
    expect(() => evaluateFormula('1 / 0')).toThrow('除以零')
    expect(() => evaluateFormula('unknown + 1')).toThrow('未知变量')
    expect(() => evaluateFormula('str.mod')).toThrow('没有值')
  })
})

describe('P1 效果模型', () => {
  const valid = [
    { kind: 'abilityBonus', ability: 'str', amount: 2 },
    { kind: 'abilitySet', ability: 'str', value: 19 },
    { kind: 'skill', skill: 'stealth', level: 'expertise' },
    { kind: 'save', ability: 'dex', level: 'advantage' },
    { kind: 'proficiency', category: 'armor', value: 'heavy' },
    { kind: 'ac', mode: 'bonus', amount: 1 },
    { kind: 'hpMax', perLevel: 2 },
    { kind: 'speed', mode: 'fly', amount: 30 },
    { kind: 'sense', sense: 'darkvision', range: 60 },
    { kind: 'resistance', damage: ['fire'] },
    { kind: 'conditionImmunity', conditions: ['poisoned'] },
    { kind: 'initiative', bonus: 5 },
    { kind: 'passive', skill: 'perception', bonus: 5 },
    { kind: 'attackBonus', amount: 1, scope: 'weapon' },
    { kind: 'advantage', on: 'attack' },
    { kind: 'extraAttack', count: 2 },
    { kind: 'spellGrant', spells: ['spell.fireball.phb'], mode: 'innate', uses: { max: 1, recharge: 'long' } },
    { kind: 'carry', multiplier: 2 },
    { kind: 'size', value: 'L' },
    { kind: 'note', text: '无法结构化的效果' },
  ]

  it('每种效果至少一个合法用例', () => {
    for (const value of valid) expect(effectSchema.safeParse(value).success, JSON.stringify(value)).toBe(true)
  })

  it('非法效果被拒绝', () => {
    expect(effectSchema.safeParse({ kind: 'abilityBonus', ability: 'luck', amount: 1 }).success).toBe(false)
    expect(effectSchema.safeParse({ kind: 'skill', skill: 'stealth', level: 'super' }).success).toBe(false)
    expect(effectSchema.safeParse({ kind: 'resistance', damage: ['holy'] }).success).toBe(false)
    expect(effectSchema.safeParse({ kind: 'spellGrant', spells: [], mode: 'innate' }).success).toBe(false)
  })
})

describe('P1 枚举表', () => {
  it('属性、18 技能、伤害、状态、工具都有稳定编号', () => {
    expect(ABILITY_KEYS).toHaveLength(6)
    expect(Object.keys(SKILLS)).toHaveLength(18)
    for (const v of Object.values(SKILLS)) expect(ABILITY_KEYS).toContain(v.ability)
    expect(DAMAGE_TYPES).toHaveLength(13)
    expect(CONDITIONS).toHaveLength(15)
    expect(TOOLS.length).toBeGreaterThan(20)
    expect(new Set(DAMAGE_TYPES).size).toBe(DAMAGE_TYPES.length)
    expect(new Set(CONDITIONS).size).toBe(CONDITIONS.length)
  })
})
