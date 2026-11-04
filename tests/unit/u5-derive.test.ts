import { describe, expect, it } from 'vitest'
import type { ClassData, RaceData } from '../../src/rules/dnd5e2014/data/entries/character'
import type { DeriveContext, DerivePerson } from '../../src/rules/dnd5e2014/derive'
import { abilityModifier, derivePerson, emptyTables, proficiencyFor } from '../../src/rules/dnd5e2014/derive'
import { loadTablesFromSrd } from './helpers-sense'
const srdTables = loadTablesFromSrd()

type Block = DerivePerson['block']

function block(extra: Record<string, unknown> = {}): Block {
  return {
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    ac: [{ value: 10 }],
    hp: { average: 0 },
    speed: { walk: 30 },
    ...extra,
  } as unknown as Block
}

function person(extra: Record<string, unknown> = {}, personExtra: Record<string, unknown> = {}): DerivePerson {
  return {
    block: block(extra),
    hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } },
    hitDiceUsed: {},
    slotsUsed: {},
    ...personExtra,
  } as DerivePerson
}

const wizard = {
  hitDie: 6,
  spellcasting: { ability: 'int', progression: 'full', slotsByLevel: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, slots: i === 0 ? [2, 0, 0, 0, 0, 0, 0, 0, 0] : i === 1 ? [3, 0, 0, 0, 0, 0, 0, 0, 0] : i === 2 ? [4, 2, 0, 0, 0, 0, 0, 0, 0] : [4, 3, 2, 1, 0, 0, 0, 0, 0] })) },
} as unknown as ClassData
const cleric = { ...wizard, hitDie: 8, spellcasting: { ...wizard.spellcasting!, progression: 'full' } } as unknown as ClassData
const fighter = { hitDie: 10 } as unknown as ClassData
const rogue = { hitDie: 8 } as unknown as ClassData

describe('U5 R1.1 属性与熟练', () => {
  it('属性调整值全表：1–20 级按 PHB p7 向下取整', () => {
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((score) => Math.floor((score - 10) / 2))
    expect(expected.map((_, index) => abilityModifier(index + 1))).toEqual(expected)
    expect(abilityModifier(null)).toBeNull()
  })

  it('熟练加值读库里的表（此处用表夹具）：按总等级、按 CR；没有表就读不到', () => {
    const tables = { ...emptyTables(), profByLevel: [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], profByCr: { '0': 2, '0.25': 2, '5': 3 } } // 夹具
    const at = (level: number) => proficiencyFor(person(), { classes: [{ entry: wizard, level }], equipmentEffects: [], tables }).value
    expect([1, 5, 9, 13, 17].map(at)).toEqual([2, 3, 4, 5, 6])
    expect(proficiencyFor(person({ cr: 0.25 }), { classes: [], equipmentEffects: [], tables }).value).toBe(2)
    expect(proficiencyFor(person(), { classes: [{ entry: wizard, level: 3 }], equipmentEffects: [] }).value).toBeNull()
  })

  it('盖尔样例：法师 3 级、体质 12、无种族加成 → 生命上限 17，熟练 +2', () => {
    const gale = person({ abilities: { str: 8, dex: 14, con: 12, int: 18, wis: 12, cha: 10 } })
    const d = derivePerson(gale, { classes: [{ id: 'class.wizard.phb', entry: wizard, level: 3 }], equipmentEffects: [], tables: srdTables })
    expect(d.proficiency.value).toBe(2)
    expect(d.hp.value).toBe(17)
    expect(d.abilities.int.modifier).toBe(4)
    expect(d.abilities.int.value).toBe(18)
  })

  it('种族与亚种族加值相加；亚种族 replace 时只用亚种族；自选暂不计入', () => {
    const race = { abilityBonus: { fixed: { dex: 2 }, choose: { count: 2, amount: 1, from: ['str', 'wis'] } }, speed: { walk: 30 } } as unknown as RaceData
    const sub = { abilityBonus: { fixed: { wis: 1 } } } as unknown as RaceData
    const d = derivePerson(person(), { race, subrace: sub, classes: [], equipmentEffects: [], tables: srdTables })
    expect(d.abilities.dex.value).toBe(12)
    expect(d.abilities.wis.value).toBe(11)
    const variant = { abilityBonus: { fixed: { int: 1 }, replace: true } } as unknown as RaceData
    const v = derivePerson(person(), { race, subrace: variant, classes: [], equipmentEffects: [], tables: srdTables })
    expect(v.abilities.dex.value).toBe(10)
    expect(v.abilities.int.value).toBe(11)
  })

  it('覆盖优先、上限 20 与 abilitySet；缺属性返回 null 不当作 0', () => {
    const covered = person({ abilities: { str: 19, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, abilityOther: { str: 5 }, overrides: { abilities: { dex: 18 } } })
    const d = derivePerson(covered, { classes: [], equipmentEffects: [{ kind: 'abilitySet', ability: 'str', value: 20 }] })
    expect(d.abilities.str.value).toBe(20)
    expect(d.abilities.str.capped).toBe(true)
    expect(d.abilities.dex.value).toBe(18)
    const missing = derivePerson(person({ abilities: {} }), { classes: [], equipmentEffects: [], tables: srdTables })
    expect(missing.abilities.str.value).toBeNull()
    expect(missing.abilities.str.modifier).toBeNull()
  })

  it('兼职总等级取熟练加值：战士 3 / 游荡者 2 → 总 5 级 +3', () => {
    const d = derivePerson(person(), { classes: [{ entry: fighter, level: 3 }, { entry: rogue, level: 2 }], equipmentEffects: [], tables: srdTables })
    expect(d.level).toBe(5)
    expect(d.proficiency.value).toBe(3)
  })
})

describe('U5 R1.1 豁免、技能、先攻与被动', () => {
  const base = person({
    abilities: { str: 10, dex: 14, con: 12, int: 18, wis: 12, cha: 10 },
    proficiencies: {
      saves: [{ ability: 'int', sources: [] }],
      skills: [
        { skill: 'insight', level: 'expertise', sources: [] },
        { skill: 'perception', level: 'proficient', sources: [] },
        { skill: 'athletics', level: 'half', sources: [] },
      ],
    },
    adjust: { initiative: 1, passive: { perception: 2 } },
  })
  const ctx: DeriveContext = { classes: [{ entry: wizard, level: 3 }], equipmentEffects: [], tables: srdTables }
  const d = derivePerson(base, ctx)

  it('豁免 = 属性调整 + 熟练（PHB p179）', () => {
    expect(d.saves.int).toMatchObject({ value: 6, proficient: true })
    expect(d.saves.dex.value).toBe(2)
  })

  it('技能熟练：专精 / 熟练 / 半熟练 / 无（PHB p174）', () => {
    expect(d.skills.insight.value).toBe(5)
    expect(d.skills.perception.value).toBe(3)
    expect(d.skills.athletics.value).toBe(1)
    expect(d.skills.acrobatics.value).toBe(2)
  })

  it('先攻与被动；覆盖优先（PHB p177、p175）', () => {
    expect(d.initiative.value).toBe(3)
    expect(d.passives.perception.value).toBe(15)
    const overridden = derivePerson({ ...base, block: { ...base.block, overrides: { initiative: 9, passive: { investigation: 20 } } } }, ctx)
    expect(overridden.initiative.value).toBe(9)
    expect(overridden.passives.investigation.value).toBe(20)
  })
})

describe('U5 R1.1 模板怪物写死值', () => {
  const goblin = person({
    cr: 0.25,
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    saves: { dex: 4 },
    skills: { stealth: 6 },
    ac: [{ value: 15, from: '皮甲、盾牌' }],
    hp: { average: 7, formula: '2d6+0' },
    speed: { walk: 30 },
  })
  const d = derivePerson(goblin, { classes: [], equipmentEffects: [], tables: srdTables })
  it('豁免 / 技能 / AC / 生命值都读作覆盖值', () => {
    expect(d.saves.dex).toMatchObject({ value: 4, override: true })
    expect(d.skills.stealth).toMatchObject({ value: 6, override: true })
    expect(d.ac).toMatchObject({ value: 15, from: '皮甲、盾牌' })
    expect(d.hp.value).toBe(7)
    expect(d.hp.dice).toEqual([{ sides: 6, total: 2, used: 0 }])
  })
})

describe('U5 R1.1 速度与法术位', () => {
  it('步行优先读 block，缺省读种族；其他方式只读 block；调整与覆盖生效（PHB p181–182）', () => {
    const race = { speed: { walk: 25 } } as unknown as RaceData
    const noWalk = person({ speed: { fly: 60 } })
    const d = derivePerson(noWalk, { race, classes: [], equipmentEffects: [], tables: srdTables })
    expect(d.speed.walk).toBe(25)
    expect(d.speed.others.fly).toBe(60)
    const adjusted = derivePerson(person({ speed: { walk: 30 }, adjust: { speed: { walk: 10 } } }), { classes: [], equipmentEffects: [], tables: srdTables })
    expect(adjusted.speed.walk).toBe(40)
  })

  it('单职业直接读 slotsByLevel；多职业查兼职表；契约位单列（PHB p113–115）', () => {
    const one = derivePerson(person(), { classes: [{ entry: wizard, level: 3 }], equipmentEffects: [], tables: srdTables })
    expect(one.spellSlots?.rows.map((r) => [r.level, r.max])).toEqual([[1, 4], [2, 2]])
    const multi = derivePerson(person(), { classes: [{ entry: wizard, level: 3 }, { entry: cleric, level: 2 }], equipmentEffects: [], tables: { ...srdTables, fullCasterSlots: [[2], [3], [4, 2], [4, 3], [4, 3, 2]].map((r) => [...r, ...Array(9 - r.length).fill(0)]) /* 夹具：兼职施法表的前 5 行 */ } })
    expect(multi.spellSlots?.rows.map((r) => r.max)).toEqual([4, 3, 2])
    const pact = { ...wizard, spellcasting: { ...wizard.spellcasting!, progression: 'pact', slotsByLevel: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, pact: { count: i === 0 ? 1 : i === 1 ? 2 : 2, level: i < 2 ? 1 : 2 } })) } } as unknown as ClassData
    const lock = derivePerson(person(), { classes: [{ entry: pact, level: 3 }], equipmentEffects: [], tables: srdTables })
    expect(lock.spellSlots?.rows[0]).toMatchObject({ key: 'pact', max: 2, level: 2 })
  })

  it('没有职业数据时法术位为 null，不显示空行', () => {
    expect(derivePerson(person(), { classes: [], equipmentEffects: [], tables: srdTables }).spellSlots).toBeNull()
  })
})
