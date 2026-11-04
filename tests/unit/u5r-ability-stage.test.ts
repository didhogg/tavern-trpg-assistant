import { describe, expect, it } from 'vitest'
import { applyStage, buyCost, buySpent, buyStep, canBuyUp, clearManual, initStage, manualCounts, roll4d6, stageDirty } from '../../src/ui/people/card/abilityStage'
import type { MonsterData } from '../../src/rules/dnd5e2014/data/entries/spell-monster'

const blk = (o: object = {}): MonsterData => ({ speed: {}, senses: [], languages: [], ...o }) as unknown as MonsterData
describe('U5R 属性暂存', () => {
  it('没动就不脏；放入基础值后才脏；写入后 block 里有值', () => {
    const b = blk()
    const s = initStage(b)
    expect(stageDirty(b, s)).toBe(false)
    s.base.str = 15; s.other.dex = 2; s.override.con = 18; s.saves.int = true
    expect(stageDirty(b, s)).toBe(true)
    const n = applyStage(b, s)
    expect(n.abilities).toEqual({ str: 15 }); expect(n.abilityOther).toEqual({ dex: 2 }); expect(n.overrides?.abilities).toEqual({ con: 18 })
    expect(n.proficiencies?.saves).toEqual([{ ability: 'int', sources: [{ kind: 'manual' }] }])
    expect(b.abilities).toBeUndefined()
  })
  it('取消豁免勾选会去掉该行（含自动来源，之后进可恢复）；已有行保留来源', () => {
    const b = blk({ proficiencies: { saves: [{ ability: 'int', sources: [{ kind: 'auto', from: 'class:class.wizard.phb' }] }, { ability: 'wis', sources: [{ kind: 'auto', from: 'class:class.wizard.phb' }] }] } })
    const s = initStage(b); s.saves.int = false
    expect(applyStage(b, s).proficiencies?.saves).toEqual([{ ability: 'wis', sources: [{ kind: 'auto', from: 'class:class.wizard.phb' }] }])
  })
  it('[清除手动修正]：清其他和覆盖、基础不动；计数正确', () => {
    const b = blk({ abilities: { str: 14 }, abilityOther: { dex: 1, con: 2 }, overrides: { abilities: { int: 19 } } })
    const s = initStage(b)
    expect(manualCounts(s)).toEqual({ other: 2, override: 1 })
    const c = clearManual(s)
    expect(manualCounts(c)).toEqual({ other: 0, override: 0 })
    const n = applyStage(b, c)
    expect(n.abilities).toEqual({ str: 14 }); expect(n.abilityOther).toBeUndefined(); expect(n.overrides).toBeUndefined()
  })
  it('购点：成本表、27 点上限、范围 8–15', () => {
    expect([8, 9, 10, 11, 12, 13, 14, 15].map((n) => buyCost(n))).toEqual([0, 1, 2, 3, 4, 5, 7, 9])
    expect(buyCost(7)).toBeNull()
    const base = { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 }
    expect(buySpent(base)).toBe(27)
    expect(canBuyUp(base, 'int')).toBe(false)
    expect(buyStep(base, 'int', 1).int).toBe(8)
    expect(buyStep({ str: 8 }, 'str', -1).str).toBe(8)
    expect(buyStep({ str: 10 }, 'str', 1).str).toBe(11)
  })
  it('4d6 去最低：总分 = 余下三颗之和', () => {
    const seq = [0.0, 0.5, 0.999, 0.2] // 1, 4, 6, 2
    let i = 0
    const r = roll4d6(() => seq[i++]!)
    expect(r.dice).toEqual([1, 4, 6, 2]); expect(r.dropped).toBe(1); expect(r.total).toBe(12)
  })
})
