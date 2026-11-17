import { describe, expect, it } from 'vitest'
import { checkBuildExtras, type ExtraWithCandidates } from '../../src/rules/kernel/build-options'

const ref = (hash: string, prop = 'feat') => ({ set: 'cn-official', prop, hash })
const group = (id: string, count: number, hashes: string[]): ExtraWithCandidates => ({
  id, title: id, kind: 'feat', count, candidates: hashes.map(hash => ({ ref: ref(hash), name: hash, source: 'XPHB' })),
})

describe('建卡额外选择复核', () => {
  it('每组有自己的候选，不能拿两项起源专长替代战斗风格', () => {
    const groups = [group('起源', 1, ['a', 'b']), group('战斗风格', 1, ['c'])]
    expect(checkBuildExtras(groups, [ref('a'), ref('c'), ref('human', 'race')])).toBeNull()
    expect(checkBuildExtras(groups, [ref('a')])).toContain('战斗风格')
    expect(checkBuildExtras(groups, [ref('a'), ref('b')])).toContain('不属于')
    expect(checkBuildExtras(groups, [ref('a'), ref('a')])).toContain('不属于')
  })

  it('候选有交集时，允许把已选条目分配到另一组以满足两个选择', () => {
    const groups = [group('不限类别', 1, ['a', 'b']), group('限定类别', 1, ['a'])]
    expect(checkBuildExtras(groups, [ref('a'), ref('b')])).toBeNull()
    expect(checkBuildExtras(groups, [ref('b'), ref('a')])).toBeNull()
    expect(checkBuildExtras([group('没有启用资料', 1, [])], [])).toContain('没有启用资料')
  })
})
