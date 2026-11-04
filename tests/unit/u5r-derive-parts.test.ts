import { describe, expect, it } from 'vitest'
import { derivePerson } from '../../src/rules/dnd5e2014/derive'
import { sumParts, type DeriveContext, type DerivePerson } from '../../src/rules/dnd5e2014/derive/types'
import { ABILITY_KEYS } from '../../src/rules/dnd5e2014/data/enums'
import { loadTablesFromSrd } from './helpers-sense'
const srdTables = loadTablesFromSrd()

const wizard = { hitDie: 6 } as never
function person(over: Record<string, unknown> = {}, block: Record<string, unknown> = {}): DerivePerson {
  return {
    hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } },
    block: { abilities: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 }, proficiencies: { saves: [{ ability: 'int' }], skills: [{ skill: 'arcana', level: 'proficient' }] }, ...block },
    ...over,
  } as unknown as DerivePerson
}
const ctx = (level = 3): DeriveContext => ({ classes: [{ id: 'class.wizard', entry: wizard, level }], equipmentEffects: [], tables: srdTables })

describe('U5R 派生 parts', () => {
  it('每个派生数字：parts 之和 = value（无覆盖时）', () => {
    const d = derivePerson(person(), ctx())
    for (const k of ABILITY_KEYS) expect(sumParts(d.abilities[k].parts)).toBe(d.abilities[k].value)
    for (const k of ABILITY_KEYS) expect(sumParts(d.saves[k].parts)).toBe(d.saves[k].value)
    expect(sumParts(d.skills.arcana.parts)).toBe(d.skills.arcana.value)
    expect(sumParts(d.initiative.parts)).toBe(d.initiative.value)
    expect(sumParts(d.passives.perception.parts)).toBe(d.passives.perception.value)
    expect(sumParts(d.proficiency.parts)).toBe(d.proficiency.value)
    expect(sumParts(d.ac.parts)).toBe(d.ac.value)
    expect(sumParts(d.hp.parts)).toBe(d.hp.value)
  })
  it('覆盖时：其余行标 overridden，override 行 = value', () => {
    const d = derivePerson(person({}, { overrides: { ac: 17, abilities: { dex: 18 }, hpMax: 30 } }), ctx())
    expect(d.abilities.dex.value).toBe(18)
    expect(d.abilities.dex.parts.filter((p) => p.kind !== 'override').every((p) => p.overridden)).toBe(true)
    expect(sumParts(d.abilities.dex.parts)).toBe(18)
    expect(d.ac.parts).toEqual([{ label: '覆盖', amount: 17, kind: 'override' }])
    expect(sumParts(d.hp.parts)).toBe(30)
  })
  it('其他修正出现在 parts 里并计入', () => {
    const d = derivePerson(person({}, { adjust: { ac: 2, initiative: 1 } }), ctx())
    expect(d.ac.parts.some((p) => p.label === '其他' && p.amount === 2)).toBe(true)
    expect(sumParts(d.ac.parts)).toBe(d.ac.value)
    expect(sumParts(d.initiative.parts)).toBe(d.initiative.value)
  })
  it('hpRolls 取记录值；hpAdj 计入；hitDiceOverride 覆盖骰数', () => {
    const avg = derivePerson(person(), ctx(3)).hp.value!
    const rolled = derivePerson(person({ hpRolls: { '2': 6, '3': 6 } }), ctx(3))
    expect(rolled.hp.value).toBe(avg + 2 * (6 - 4))
    const adj = derivePerson(person({ hpAdj: [{ label: '强健', perLevel: 2, source: '专长' }, { label: '其他', flat: 3 }] }), ctx(3))
    expect(adj.hp.value).toBe(avg + 6 + 3)
    expect(sumParts(adj.hp.parts)).toBe(adj.hp.value)
    const dice = derivePerson(person({ hitDiceOverride: { '6': 5 } }), ctx(3)).hp.dice
    expect(dice).toEqual([{ sides: 6, total: 5, used: 0 }])
  })
  it('速度来源明细', () => {
    const d = derivePerson(person({}, { speed: { walk: 30 }, adjust: { speed: { walk: 10 } } }), ctx())
    expect(d.speed.walk).toBe(40)
    expect(d.speed.parts.walk).toEqual([{ label: '设定', amount: 30, kind: 'base' }, { label: '其他', amount: 10, kind: 'add' }])
  })
})
