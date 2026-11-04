import { describe, expect, it } from 'vitest'
import { buildFormula, judgeContest, judgeDc, judgePassive, parseCustom, rowKey } from '../../src/ui/shell/tray/rollModel'
import type { RollRow } from '../../src/rules/dnd5e2014/derive'

const row = (o: Partial<RollRow>): RollRow => ({ label: '调整值', source: '属性', auto: true, ...o })
describe('U5R 骰盘模型', () => {
  it('自定义加值校验：常数与骰式；非法不收', () => {
    expect(parseCustom('+2')).toEqual({ ok: true, text: '+2' })
    expect(parseCustom('−1')).toEqual({ ok: true, text: '-1' })
    expect(parseCustom('1d4')).toEqual({ ok: true, text: '+1d4' })
    expect(parseCustom(' 2D6 ')).toEqual({ ok: true, text: '+2d6' })
    expect(parseCustom('神导术').ok).toBe(false)
    expect(parseCustom('1d1').ok).toBe(false)
    expect(parseCustom('').ok).toBe(false)
  })
  it('骰式：常数合并、骰式保留顺序、被忽略的行不进；没有加值就只有 1d20', () => {
    const a = [row({ amount: 2 }), row({ label: '熟练', amount: 2, source: '背景' }), row({ label: '祝福术', dice: '1d4', source: '祝福术' })]
    expect(buildFormula(a, [], new Set()).expression).toBe('1d20+1d4+4')
    expect(buildFormula(a, [{ id: 'c1', label: '协助', text: '-1' }], new Set([rowKey(a[2]!)])).expression).toBe('1d20+3')
    expect(buildFormula([], [], new Set()).expression).toBe('1d20')
    expect(buildFormula([row({ amount: -1 })], [], new Set()).expression).toBe('1d20-1')
  })
  it('判定：DC ≥ 通过；天然 20 / 1 不自动成败；对抗平局维持原样；被动对 DC', () => {
    expect(judgeDc(15, 15).kind).toBe('pass'); expect(judgeDc(14, 15).kind).toBe('fail')
    expect(judgeContest(12, 12)).toMatchObject({ kind: 'tie' }); expect(judgeContest(13, 12).kind).toBe('win'); expect(judgeContest(11, 12).kind).toBe('lose')
    expect(judgePassive(13, 13).kind).toBe('pass'); expect(judgePassive(12, 13).text).toContain('未通过')
  })
})
