import { describe, expect, it } from 'vitest'
import { loadBefore } from './r15-snapshot'

describe('R15 阶段 0 快照', () => {
  it('快照有 8,853 个条目，且是 R14 推送时的内容', () => {
    const before = loadBefore()
    expect(Object.keys(before)).toHaveLength(8853)
    expect(before['feature.monk-ki.phb'].name).toBe('气')
    expect(before['spell.fireball.phb'].summary.startsWith('火球术｜')).toBe(true)
  })
})
