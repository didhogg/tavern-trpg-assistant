import { describe, expect, it } from 'vitest'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { KNOWN_EMPTY } from '../../tools/data/config/knownEmpty'
import { DELIVERED_WP, TYPES_WITHOUT_CORE_DATA } from '../../tools/data/validate/delivered'

const R11 = new Set(['language', 'language-script', 'skill', 'sense', 'item-property', 'item-type', 'item-type-additional-entries', 'deity', 'reward', 'boon', 'cult', 'trap', 'hazard', 'object', 'vehicle', 'makebrew-creature-action', 'makebrew-creature-trait', 'monster-feature', 'recipe', 'charoption'])

describe('R11 矩阵与兑现', () => {
  it('R11 来源类型没有 lost 行，DELIVERED_WP 含 R11', () => {
    const lost = Object.entries(FIELD_COVERAGE).filter(([path, entry]) => R11.has(path.split('.', 1)[0]) && entry.how === 'lost')
    expect(lost.map(([path]) => path)).toEqual([])
    expect(DELIVERED_WP).toContain('R11')
  })

  it('KNOWN_EMPTY 的 R11 条目都有真实原因；recipe/charoption 是唯一的无核心数据豁免', () => {
    const r11 = Object.entries(KNOWN_EMPTY).filter(([path]) => R11.has(path.split('.', 1)[0]))
    for (const [path, why] of r11) expect(why.trim().length, path).toBeGreaterThan(8)
    expect([...TYPES_WITHOUT_CORE_DATA]).toEqual(['recipe', 'charoption'])
  })
})
