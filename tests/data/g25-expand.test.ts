import { describe, expect, it } from 'vitest'
import { baseWeapons, classSpellIds, expandSpellPool, expandToken } from './consumer/expand'
import { lib } from './consumer/load'
import { ShapeError } from './consumer/util'

/** G2.5 第 0 站：新记号的展开器（执行 agent 不得改读取器，所以这里一次定全；用真实库验证）。 */
describe('G2.5 新记号能展开', () => {
  const l = lib()
  it('近战武器：简易/军用近战 ＋ 远程 ＝ 全部，飞镖是远程、手斧是近战', () => {
    const simple = expandToken(l, 'weapon:simple').values
    const martial = expandToken(l, 'weapon:martial').values
    const sm = expandToken(l, 'weapon:simple-melee').values
    const mm = expandToken(l, 'weapon:martial-melee').values
    expect(sm.length).toBeGreaterThan(5)
    expect(mm.length).toBeGreaterThan(10)
    expect(sm.every((id) => simple.includes(id))).toBe(true)
    expect(mm.every((id) => martial.includes(id))).toBe(true)
    expect(sm).toContain('item.handaxe.phb')
    expect(sm).not.toContain('item.dart.phb')
    expect(sm).not.toContain('item.light-crossbow.phb')
    expect(mm).toContain('item.longsword.phb')
    expect(mm).not.toContain('item.longbow.phb')
    expect(baseWeapons(l).length).toBe(sm.length + mm.length + baseWeapons(l).filter((r) => !sm.includes(r.id) && !mm.includes(r.id)).length)
  })
  it('法器：奥术、德鲁伊、圣徽各自非空且互不相交', () => {
    const a = expandToken(l, 'focus:arcane').values
    const d = expandToken(l, 'focus:druidic').values
    const h = expandToken(l, 'focus:holy').values
    for (const x of [a, d, h]) expect(x.length).toBeGreaterThan(0)
    expect(a).toContain('item.crystal.phb')
    expect(d).toContain('item.sprig-of-mistletoe.phb')
    expect(h).toContain('item.amulet.phb')
    expect(new Set([...a, ...d, ...h]).size).toBe(a.length + d.length + h.length)
    expect(() => expandToken(l, 'focus:divine')).toThrow(ShapeError)
  })
  it('固定代码、语言', () => {
    expect(expandToken(l, 'code:vehicles-land').values).toEqual(['code:vehicles-land'])
    expect(expandToken(l, 'code:vehicles-water').values).toEqual(['code:vehicles-water'])
    expect(() => expandToken(l, 'code:vehicles-air')).toThrow(ShapeError)
    expect(expandToken(l, 'lang:other').ambiguous).toContain('被禁止')
    // 3b-7 已给原初语条目加 dialectCodes，方言解析到原初语条目，不再 noEntry
    expect(expandToken(l, 'lang:aquan').noEntry).toBeUndefined()
    expect(expandToken(l, 'lang:aquan').values).toEqual(['lang:aquan'])
  })
  it('法术池：职业、环阶、学派、仪式、攻击各条件起作用；@选择 要给结果才展开', () => {
    expect(classSpellIds(l, 'wizard').size).toBeGreaterThan(100)
    const w0 = expandSpellPool(l, 'class=wizard,level=0', 'spell:class=wizard,level=0').values
    expect(w0).toContain('spell.fire-bolt.phb')
    expect(w0).not.toContain('spell.sacred-flame.phb')
    const rit = expandSpellPool(l, 'class=wizard,level=1,ritual=true', 'x').values
    expect(rit).toContain('spell.detect-magic.phb')
    expect(rit).not.toContain('spell.magic-missile.phb')
    const school = expandSpellPool(l, 'class=wizard,level=1,school=abjuration|divination', 'x').values
    expect(school).toContain('spell.shield.phb')
    expect(school).toContain('spell.detect-magic.phb')
    expect(school).not.toContain('spell.magic-missile.phb')
    // attack=true：只要需要攻击检定的法术（attack 字段第 1 站从 5etools 导入，并已与 5e API 核对）
    const atk = expandSpellPool(l, 'class=any,level=0,attack=true', 'x').values
    expect(atk).toContain('spell.fire-bolt.phb')
    expect(atk).toContain('spell.vicious-mockery.phb'.replace('vicious-mockery', 'shocking-grasp'))
    expect(atk).not.toContain('spell.light.phb')
    expect(expandSpellPool(l, 'class=@pick,level=1', 'x').ambiguous).toContain('@pick'.slice(1))
    expect(expandSpellPool(l, 'class=@pick,level=1', 'x', { pick: 'cleric' }).values).toContain('spell.bless.phb')
    for (const bad of ['level=1', 'class=wizard', 'class=wizard,level=1,school=magic', 'class=wizard,level=1,foo=1', 'class=wizard,level=1,ritual=false', 'class=nobody,level=1']) expect(() => expandSpellPool(l, bad, `spell:${bad}`), bad).toThrow(ShapeError)
    expect(() => expandToken(l, 'spell:class=wizard,level=1,level=2')).toThrow(ShapeError)
  })
})
