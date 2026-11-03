import { describe, expect, it } from 'vitest'
import { applyMods } from '../../tools/data/extract/mods'

describe('D1.2b _mod 补全', () => {
  it('appendIfNotExistsArr 只追加不存在的深相等项', () => {
    const out = applyMods({ list: [1, { a: 1 }] }, { list: { mode: 'appendIfNotExistsArr', items: [1, { a: 1 }, { a: 2 }] } })
    expect(out.list).toEqual([1, { a: 1 }, { a: 2 }])
  })
  it('addSkills 按 CR 熟练加值计算，且不降低已有值', () => {
    const out = applyMods({ cr: 5, str: 16, dex: 10, skill: { athletics: '+8' } }, { _: { mode: 'addSkills', skills: { athletics: 1, acrobatics: 2 } } })
    expect(out.skill).toEqual({ athletics: '+8', acrobatics: '+6' })
  })
  it('addSpells 合并法术类别与 will 列表', () => {
    const out = applyMods({ spellcasting: [{ spells: { 0: { spells: ['a'] } }, will: ['x'] }] }, { _: { mode: 'addSpells', spells: { 0: { spells: ['b'] } }, will: ['y'] } })
    const sc = out.spellcasting as Array<Record<string, unknown>>
    expect(sc[0]).toEqual({ spells: { 0: { spells: ['a', 'b'] } }, will: ['x', 'y'] })
  })
  it('replaceSpells 替换并排序', () => {
    const out = applyMods({ spellcasting: [{ spells: { 1: { spells: ['a', 'b'] } } }] }, { _: { mode: 'replaceSpells', spells: { 1: [{ replace: 'a', with: ['c', 'd'] }] } } })
    const sc = out.spellcasting as Array<{ spells: Record<string, { spells: string[] }> }>
    expect(sc[0].spells[1].spells).toEqual(['b', 'c', 'd'])
  })
  it('removeSpells 删除指定法术', () => {
    const out = applyMods({ spellcasting: [{ spells: { 1: { spells: ['a', 'b'] } }, will: ['x', 'y'] }] }, { _: { mode: 'removeSpells', spells: { 1: ['a'] }, will: ['x'] } })
    const sc = out.spellcasting as Array<Record<string, unknown>>
    expect(sc[0]).toEqual({ spells: { 1: { spells: ['b'] } }, will: ['y'] })
  })
})
