import { describe, expect, it } from 'vitest'
import { emptyPerson } from '../../src/ui/people/fromEntry'
import { dirtyFields, draftPatchOf, livePatchOf, pushUndo, UNDO_MAX, type UndoAction } from '../../src/ui/people/card/draft'

describe('U5 草稿与撤销', () => {
  const base = emptyPerson({ name: '盖尔', categoryId: 'party', now: 1 })
  it('未保存 N = 改过的顶层字段数；同一字段改多次只算一个，属性块算一个', () => {
    const draft = structuredClone(base)
    draft.name = '盖尔 2'
    draft.name = '盖尔 3'
    draft.block.alignment = 'N'
    draft.block.speed = { walk: 25 }
    draft.hp.current = 3
    expect(dirtyFields(draft, base)).toEqual(['name', 'block'])
  })
  it('保留头像与属性块字段的保存补丁', () => {
    const draft = structuredClone(base)
    draft.nameEn = 'Gale'
    draft.avatarSource = { asset: { $asset: 'a'.repeat(64) }, crop: { x: 0, y: 0, w: 1, h: 1 } }
    expect(draftPatchOf(draft, ['nameEn', 'avatarSource'])).toMatchObject({ nameEn: 'Gale', avatarSource: draft.avatarSource })
  })
  it('当场状态补丁包含全部登记字段', () => {
    const person = { ...base, inspiration: true, exhaustion: 2, hitDiceUsed: { 6: 1 }, slotsUsed: { 1: 2 }, resourcesUsed: { x: 1 } }
    expect(livePatchOf(person)).toMatchObject({ inspiration: true, exhaustion: 2, hitDiceUsed: { 6: 1 }, slotsUsed: { 1: 2 }, resourcesUsed: { x: 1 } })
  })
  it('撤销栈最多 50 步，保留最近的', () => {
    let stack: UndoAction[] = []
    for (let i = 0; i < 60; i++) stack = pushUndo(stack, { kind: 'draft', before: { ...base, name: `b${i}` }, after: { ...base, name: `a${i}` } })
    expect(stack).toHaveLength(UNDO_MAX)
    expect(stack[0].after.name).toBe('a10')
    expect(stack.at(-1)?.after.name).toBe('a59')
  })
})
