import { describe, expect, it } from 'vitest'
import { derivePerson } from '../../src/rules/dnd5e2014/derive'

const hp = { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } }
describe('U5R 敌人法术位与法术 DC', () => {
  it('敌人读属性块 spellcasting[].spells[环阶].slots（魔法师形状：1 环 4、2 环 3、5 环 1）', () => {
    const person = { hp, slotsUsed: { '1': 1 }, block: { abilities: { str: 9, dex: 14, con: 11, int: 17, wis: 12, cha: 11 }, cr: 6, spellcasting: [{ ability: 'int', dc: 14, attack: 6, slots: {}, spells: { '0': { spells: ['x'] }, '1': { slots: 4, spells: ['a'] }, '2': { slots: 3, spells: ['b'] }, '5': { slots: 1, spells: ['c'] } } }] } } as never
    const d = derivePerson(person, { classes: [], equipmentEffects: [] })
    expect(d.spellSlots?.rows.map((r) => [r.level, r.max, r.used])).toEqual([[1, 4, 1], [2, 3, 0], [5, 1, 0]])
    expect(d.spellcasting).toMatchObject({ ability: 'int', dc: 14, attack: 6 })
  })
  it('没有任何法术位的人为 null', () => {
    const d = derivePerson({ hp, block: { cr: 1 } } as never, { classes: [], equipmentEffects: [] })
    expect(d.spellSlots).toBeNull(); expect(d.spellcasting).toBeNull()
  })
})
