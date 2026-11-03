import { describe, expect, it } from 'vitest'
import { autoCropAvatar } from '../../src/ui/people/card/autoCrop'

function ratioOf(width: number, height: number): number {
  const crop = autoCropAvatar(width, height)
  return (crop.w * width) / (crop.h * height)
}

describe('U5 autoCropAvatar（4:5）', () => {
  it('正好 4:5 时整张使用', () => {
    expect(autoCropAvatar(800, 1000)).toEqual({ x: 0, y: 0, w: 1, h: 1 })
  })

  it('宽图高度取满、水平居中', () => {
    const crop = autoCropAvatar(1200, 800)
    expect(crop.y).toBe(0)
    expect(crop.h).toBe(1)
    expect(crop.x + crop.w / 2).toBeCloseTo(0.5, 10)
    expect(ratioOf(1200, 800)).toBeCloseTo(4 / 5, 10)
  })

  it('窄长图宽度取满，垂直取溢出高度的 20%', () => {
    const crop = autoCropAvatar(800, 1600)
    expect(crop.x).toBe(0)
    expect(crop.w).toBe(1)
    expect(crop.y).toBeCloseTo((1 - 0.625) * 0.2, 10)
    expect(ratioOf(800, 1600)).toBeCloseTo(4 / 5, 10)
  })

  it('极端细长图仍保持 4:5 且在原图内', () => {
    const crop = autoCropAvatar(100, 10000)
    expect(crop.w).toBe(1)
    expect(crop.h).toBeCloseTo(0.0125, 10)
    expect(crop.x).toBeGreaterThanOrEqual(0)
    expect(crop.y).toBeGreaterThanOrEqual(0)
    expect(crop.x + crop.w).toBeLessThanOrEqual(1)
    expect(crop.y + crop.h).toBeLessThanOrEqual(1)
    expect(ratioOf(100, 10000)).toBeCloseTo(4 / 5, 10)
  })

  it('极小图和非法尺寸不抛错', () => {
    const tiny = autoCropAvatar(1, 1)
    expect(tiny.x).toBeCloseTo(0.1, 10)
    expect(tiny).toMatchObject({ y: 0, w: 0.8, h: 1 })
    expect(autoCropAvatar(0, 0)).toEqual({ x: 0, y: 0, w: 1, h: 1 })
  })
})
