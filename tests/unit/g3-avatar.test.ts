import { describe, expect, it } from 'vitest'
import { cropStyle } from '../../src/ui/kit/crop'
import { CREATURE_ICONS } from '../../src/ui/kit/creatureIcons'

describe('G3 头像', () => {
  it('裁切焦点', () => {
    const c = cropStyle({ x: 0.5, y: 0.5, size: 1 }, 1000, 1000, 96); expect(c.width).toBe(96); expect(Math.abs(c.left)).toBe(0); expect(Math.abs(c.top)).toBe(0)
    expect(cropStyle({ x: 0, y: 0, size: 0.5 }, 1000, 1000, 96).left).toBeLessThanOrEqual(0)
    expect(cropStyle({ x: 0.5, y: 0.5, size: 0.5 }, 1000, 1000, 96).width).toBe(192)
  })
  it('15 个图标齐全', () => { expect(Object.keys(CREATURE_ICONS)).toHaveLength(15) })
})
