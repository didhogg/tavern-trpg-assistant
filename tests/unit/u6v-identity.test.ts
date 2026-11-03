import { describe, expect, it } from 'vitest'
import type { Person } from '../../src/schemas/people'
import { emptyBlock, emptyPerson } from '../../src/ui/people/fromEntry'
import { personIdentity } from '../../src/ui/people/identity'

const labels = { classes: { 'class.wizard.phb': '法师', 'class.fighter.phb': '战士', 'subclass.evocation': '塑能学派' }, races: { 'race.human.phb': '人类' } }
const person = (block: Record<string, unknown>, categoryId: Person['categoryId'] = 'party'): Person => ({ ...emptyPerson({ id: 'p', name: '盖尔', categoryId, now: 1 }), block: { ...emptyBlock(), ...block } })
const text = (p: Person, includeCategory = false): string => personIdentity(p, labels, includeCategory).map((s) => s.text).join(' ・ ')

describe('U6 美化：身份行（职业 等级 ・ 种族）', () => {
  it('单职业写「法师 3 级 ・ 人类」，职业与等级加粗、种族不加粗', () => {
    const p = person({ race: 'race.human.phb', classes: [{ class: 'class.wizard.phb', level: 3 }] })
    expect(text(p)).toBe('法师 3 级 ・ 人类')
    expect(personIdentity(p, labels).map((s) => s.strong)).toEqual([true, false])
  })
  it('多职业依次列出，子职业接在种族后面', () => {
    const p = person({ race: 'race.human.phb', classes: [{ class: 'class.fighter.phb', level: 3 }, { class: 'class.wizard.phb', level: 2, subclass: 'subclass.evocation' }] })
    expect(text(p)).toBe('战士 3 级 ・ 法师 2 级 ・ 人类 ・ 塑能学派')
  })
  it('没有职业的人（新建的空白人物、从模板加入的怪物）身份行是空的', () => {
    expect(personIdentity(person({}), labels)).toEqual([])
    expect(personIdentity({ ...person({ cr: 0.25 }), sourceRef: { packId: 'mm', version: '1.0.0', entryId: 'monster.goblin.mm' } }, { sourceNames: { 'monster.goblin.mm': '地精' } })).toEqual([])
  })
  it('「全部」里末尾补分类名；其它分类不补', () => {
    const p = person({ race: 'race.human.phb', classes: [{ class: 'class.wizard.phb', level: 3 }] })
    expect(text(p, true)).toBe('法师 3 级 ・ 人类 ・ 队伍')
    expect(text(person({}, 'enemy'), true)).toBe('敌人')
  })
})
