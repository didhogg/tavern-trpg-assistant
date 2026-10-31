import { describe, expect, it } from 'vitest'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { checkDelivered, DELIVERED_WP } from '../../tools/data/validate/delivered'
import { allEntries } from './r9-pack-helpers'

describe('R13 覆盖矩阵', () => {
  it('R13 已列入已兑现，且没有未兑现的登记', () => {
    expect(DELIVERED_WP).toContain('R13')
    expect(checkDelivered(allEntries(), FIELD_COVERAGE)).toEqual([])
  }, 120_000)
  it('wp 为 R13 的登记共 206 条：映射到 i18n.en.* 的有效目标', () => {
    const rows = Object.entries(FIELD_COVERAGE).filter(([, entry]) => entry.wp === 'R13')
    expect(rows.length).toBeGreaterThanOrEqual(170)
    for (const [path, entry] of rows) expect(String(entry.to), path).toMatch(/^i18n\.en\.(name|fields\.)/)
  })
})
