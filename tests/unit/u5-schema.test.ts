import { describe, expect, it } from 'vitest'
import { personSchema } from '../../src/schemas/people'
import { emptyPerson } from '../../src/ui/people/fromEntry'

describe('U5 数据字段（全部可选，不升 schemaVersion）', () => {
  it('旧人物没有新字段也能读；新字段缺省即未设置', () => {
    const old = emptyPerson({ name: '旧人物', categoryId: 'npc', now: 1 })
    const parsed = personSchema.parse(old)
    expect(parsed.inspiration).toBeUndefined()
    expect(parsed.exhaustion).toBeUndefined()
    expect(parsed.hitDiceUsed).toBeUndefined()
    expect(parsed.slotsUsed).toBeUndefined()
    expect(parsed.resourcesUsed).toBeUndefined()
    expect(parsed.avatarSource).toBeUndefined()
  })
  it('当场状态与头像原图/4:5 截取框可以保存', () => {
    const person = personSchema.parse({
      ...emptyPerson({ name: '盖尔', categoryId: 'party', now: 1 }),
      inspiration: true, exhaustion: 2, hitDiceUsed: { 6: 1 }, slotsUsed: { 1: 2, pact: 1 }, resourcesUsed: { 'feature.x': 1 },
      avatarSource: { asset: { $asset: 'a'.repeat(64) }, crop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 } },
    })
    expect(person.inspiration).toBe(true)
    expect(person.avatarSource?.crop.w).toBe(0.8)
  })
  it('力竭超出 0–6、截取框越界会被拒绝', () => {
    const base = emptyPerson({ name: '盖尔', categoryId: 'party', now: 1 })
    expect(personSchema.safeParse({ ...base, exhaustion: 7 }).success).toBe(false)
    expect(personSchema.safeParse({ ...base, avatarSource: { asset: { $asset: 'x' }, crop: { x: 1, y: 0, w: 1, h: 1 } } }).success).toBe(false)
  })
})
