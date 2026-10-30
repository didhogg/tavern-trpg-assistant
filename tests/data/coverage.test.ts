import { describe, expect, it } from 'vitest'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { checkFieldCoverage } from '../../tools/data/validate/coverage'

describe('R0 字段覆盖矩阵', () => {
  it('核心来源没有未登记字段，且登记自检通过', async () => {
    const summary = await checkFieldCoverage()
    expect(summary.paths).toBeGreaterThan(5000)
    expect(summary.unregistered).toEqual([])
    expect(summary.mapped + summary.text + summary.dropped + summary.lost).toBe(summary.paths)
    expect(summary.imageHits).toBeGreaterThan(300)
    expect(summary.droppedByKind['image']).toBeGreaterThan(300)
  })

  it('移掉一个登记后能被报出来', async () => {
    const key = 'spell.level'
    const saved = FIELD_COVERAGE[key]
    delete FIELD_COVERAGE[key]
    try {
      const summary = await checkFieldCoverage()
      expect(summary.unregistered).toContain(key)
    } finally {
      if (saved) FIELD_COVERAGE[key] = saved
    }
  })
})
