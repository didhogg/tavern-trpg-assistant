import { describe, expect, it } from 'vitest'
import { validateCoverageEntry } from '../../tools/data/config/fieldCoverage/validate'
import type { CoverageEntry } from '../../tools/data/config/fieldCoverage/types'
import { recordCountsByPath } from '../../tools/data/report/pathRecords'

const base: CoverageEntry = { how: 'lost', why: '转换器没有读取这个字段，输出里没有对应内容', affected: 2 }

describe('lost 状态', () => {
  it('合法 lost 通过；缺 affected、0、带 to、理由过短各自失败', () => {
    expect(() => validateCoverageEntry('monster.example', base)).not.toThrow()
    expect(() => validateCoverageEntry('monster.example', { ...base, affected: undefined })).toThrow(/affected/)
    expect(() => validateCoverageEntry('monster.example', { ...base, affected: 0 })).not.toThrow()
    expect(() => validateCoverageEntry('monster.example', { ...base, affected: -1 })).toThrow(/affected/)
    expect(() => validateCoverageEntry('monster.example', { ...base, to: 'data.text' })).toThrow(/不得带/)
    expect(() => validateCoverageEntry('monster.example', { ...base, why: '太短' })).toThrow(/12/)
  })

  it('recordCountsByPath 同一记录只算一次', () => {
    const records = [
      { type: 'monster', file: 'a', key: 'monster', source: 'MM', scope: 'core', sourceKind: 'source', value: { skill: { perception: '+3', stealth: '+2' }, speed: { walk: 30 } } },
      { type: 'monster', file: 'b', key: 'monster', source: 'MM', scope: 'core', sourceKind: 'source', value: { skill: { perception: '+4' } } },
    ] as never
    const counts = recordCountsByPath(records)
    expect(counts.get('monster.skill')).toBe(2)
    expect(counts.get('monster.skill.perception')).toBe(2)
    expect(counts.get('monster.speed')).toBe(1)
  })
})
