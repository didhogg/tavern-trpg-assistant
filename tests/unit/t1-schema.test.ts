import { describe, expect, it } from 'vitest'
import { monsterDataSchema, monsterInventorySchema } from '../../src/rules/dnd5e2014/data/entries/spell-monster'
import { entryDataSchemaFor } from '../../src/rules/dnd5e2014/data/entries'
import { structuralRefs } from '../../src/rules/dnd5e2014/data/refs'
import { entryFacts } from '../../src/ui/library/facts'
import { evalFormula, parseFormula } from '../../src/rules/dnd5e2014/data/formula'
import { summaryOf } from '../../tools/data/summary/summary'

const base = {
  src: { book: 'PHB', page: 1 },
  credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0' },
  size: ['M'],
  creatureType: { type: 'humanoid', tags: [] },
  ac: [{ value: 10 }],
  hp: { average: 3 },
  speed: { walk: 30 },
  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
}

describe('任务一：人物与怪物共用结构', () => {
  it('旧怪物没有 cr 仍然合法；cr 仍可接受数字与巢穴对象', () => {
    expect(monsterDataSchema.safeParse(base).success).toBe(true)
    expect(monsterDataSchema.safeParse({ ...base, cr: 0.25 }).success).toBe(true)
    expect(monsterDataSchema.safeParse({ ...base, cr: { value: 5, lair: 6 } }).success).toBe(true)
  })

  it('人物可选字段可空，也可完整填写；背包项要求 ref 或 name', () => {
    const full = monsterDataSchema.safeParse({
      ...base,
      classes: [{ class: 'class.fighter.phb', subclass: 'subclass.champion.phb', level: 3 }],
      race: 'race.human.phb',
      subrace: 'subrace.high-elf.phb',
      background: 'background.soldier.phb',
      inventory: [{ ref: 'item.longsword.phb', qty: 2, equipped: true, attuned: true, container: 0, chargesUsed: 1 }, { name: '家传戒指' }],
    })
    expect(full.success).toBe(true)
    expect(monsterDataSchema.safeParse({ ...base, classes: [{ class: 'class.fighter.phb', level: 0 }] }).success).toBe(false)
    expect(monsterDataSchema.safeParse({ ...base, inventory: [{ qty: 1 }] }).success).toBe(false)
    expect(monsterDataSchema.safeParse({ ...base, inventory: [{ name: ' ', qty: 0 }] }).success).toBe(false)
    expect(monsterInventorySchema.parse({ name: '火把' }).qty).toBe(1)
  })

  it('structuralRefs 能取到 classes、race、subrace、background 与 inventory.ref', () => {
    const refs = structuralRefs({
      ...base,
      classes: [{ class: 'class.fighter.phb', subclass: 'subclass.champion.phb', level: 3 }],
      race: 'race.human.phb',
      subrace: 'subrace.high-elf.phb',
      background: 'background.soldier.phb',
      inventory: [{ ref: 'item.longsword.phb' }, { name: '家传戒指' }],
    })
    expect(refs).toEqual([
      { field: 'classes[].class', id: 'class.fighter.phb' },
      { field: 'classes[].subclass', id: 'subclass.champion.phb' },
      { field: 'race', id: 'race.human.phb' },
      { field: 'subrace', id: 'subrace.high-elf.phb' },
      { field: 'background', id: 'background.soldier.phb' },
      { field: 'inventory[].ref', id: 'item.longsword.phb' },
    ])
  })

  it('规则注册表能按类型取到 validator', () => {
    expect(entryDataSchemaFor('monster')).toBe(monsterDataSchema)
    expect(entryDataSchemaFor('nope')).toBeUndefined()
  })

  it('缺少 cr 时 facts 不显示挑战等级，摘要不留下空 CR 段', () => {
    const data = { ...base, hp: { average: 3 } }
    expect(entryFacts({ type: 'monster', data }).some((f) => f.label === '挑战等级')).toBe(false)
    const summary = summaryOf('monster', '测试怪', data, '')
    expect(summary).not.toContain('CR')
    expect(summary).not.toContain('｜｜')
    return undefined
  })

  it('公式不使用 cr 时，缺省 cr 不影响计算；用到 cr 时仍明确报缺少变量', () => {
    const ast = parseFormula('1 + 2')
    expect(ast.ok).toBe(true)
    if (ast.ok) expect(evalFormula(ast.ast, {})).toBe(3)
    const cr = parseFormula('cr')
    if (cr.ok) expect(() => evalFormula(cr.ast, {})).toThrow('变量「cr」没有值')
  })
})
