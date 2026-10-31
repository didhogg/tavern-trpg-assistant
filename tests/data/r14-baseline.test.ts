import { describe, expect, it } from 'vitest'
import { loadBefore } from './r14-snapshot'

describe('R14 阶段 0 快照', () => {
  it('快照有 8,853 个条目，且是 R13 推送时的中文内容', () => {
    const before = loadBefore()
    expect(Object.keys(before)).toHaveLength(8853)
    expect(before['spell.fireball.phb'].name).toBe('火球术')
    expect(before['feature.monk-ki.phb'].name).toBe('Ki')
  })
})
