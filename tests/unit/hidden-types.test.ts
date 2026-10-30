import { describe, expect, it } from 'vitest'
import { HIDDEN_ENTRY_TYPES, isHiddenType } from '../../src/core/library/hiddenTypes'

describe('隐藏条目类型', () => {
  it('lore 是隐藏类型，普通类型不是', () => {
    expect(HIDDEN_ENTRY_TYPES).toContain('lore')
    expect(isHiddenType('lore')).toBe(true)
    expect(isHiddenType('spell')).toBe(false)
  })
})
