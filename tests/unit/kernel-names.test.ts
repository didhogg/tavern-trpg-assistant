// 加人取名规则（people.ts nextNames）：复制、从模板加入共用。
import { describe, expect, it } from 'vitest'
import { nextNames } from '../../src/rules/kernel/people'

describe('P6 加人取名规则', () => {
  it('没有同名：加 1 个用原名，加 3 个编号 1 / 2 / 3', () => {
    expect(nextNames('地精', 1, ['盖尔'])).toEqual(['地精'])
    expect(nextNames('地精', 3, ['盖尔'])).toEqual(['地精 1', '地精 2', '地精 3'])
  })
  it('已有同名原名：接着编 2', () => {
    expect(nextNames('盖尔', 1, ['盖尔'])).toEqual(['盖尔 2'])
    expect(nextNames('地精', 3, ['地精'])).toEqual(['地精 2', '地精 3', '地精 4'])
  })
  it('已有编号：接着最大号往后', () => {
    expect(nextNames('地精', 2, ['地精 1', '地精 2', '地精 3'])).toEqual(['地精 4', '地精 5'])
    expect(nextNames('地精', 1, ['地精 7'])).toEqual(['地精 8'])
  })
  it('名字里有正则符号也照常；别的名字不干扰', () => {
    expect(nextNames('A(1)', 1, ['A(1)'])).toEqual(['A(1) 2'])
    expect(nextNames('地精', 1, ['大地精', '地精头目 2'])).toEqual(['地精'])
  })
})
