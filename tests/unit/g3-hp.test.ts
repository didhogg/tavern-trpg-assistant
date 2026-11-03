import { describe, expect, it } from 'vitest'
import { HP_NOT_GIVEN, normalizeHp } from '../../tools/data/convert/hp'

describe('怪物生命值整理（G3 §12.6）', () => {
  it('有固定值时原样保留', () => {
    expect(normalizeHp(7, '2d6', '')).toEqual({ average: 7, formula: '2d6' })
  })
  it('纯数字放在 special 里时补固定值、保留 special', () => {
    expect(normalizeHp(0, '', '58')).toEqual({ average: 58, special: '58' })
    expect(normalizeHp(0, '', ' 10 ')).toEqual({ average: 10, special: ' 10 ' })
  })
  it('原书没给时写「原书未给出」', () => {
    expect(normalizeHp(0, '', '')).toEqual({ average: 0, special: HP_NOT_GIVEN })
  })
  it('文字 special 原样保留', () => {
    expect(normalizeHp(0, '', '40 + 高于4环每环10点')).toEqual({ average: 0, special: '40 + 高于4环每环10点' })
  })
})
