import { describe, expect, it } from 'vitest'
import { entryDataSchemaFor } from '../../src/rules/dnd5e2014/data/entries'
import { monsterArtSchema } from '../../src/rules/dnd5e2014/data/entries/art'

const credit = { by: '不全书', license: 'GPL-3.0', structured: { by: '本项目', license: 'CC-BY-NC-SA-4.0' } }

describe('D1.2b 字段：怪物 art、具名 NPC', () => {
  it('art：portrait 与 token 至少一个；token-match 必带 score，smartcrop 不带', () => {
    const portrait = { url: 'https://example.test/a.webp', focus: { x: 0.5, y: 0.3, size: 0.4 }, method: 'smartcrop' as const }
    expect(monsterArtSchema.safeParse({ portrait }).success).toBe(true)
    expect(monsterArtSchema.safeParse({ token: { url: 'https://example.test/t.webp' } }).success).toBe(true)
    expect(monsterArtSchema.safeParse({}).success).toBe(false)
    expect(monsterArtSchema.safeParse({ portrait: { ...portrait, method: 'token-match' } }).success).toBe(false)
    expect(monsterArtSchema.safeParse({ portrait: { ...portrait, method: 'token-match', score: 0.87 } }).success).toBe(true)
    expect(monsterArtSchema.safeParse({ portrait: { ...portrait, score: 0.87 } }).success).toBe(false)
    expect(monsterArtSchema.safeParse({ portrait: { ...portrait, focus: { x: 1.2, y: 0.3, size: 0.4 } } }).success).toBe(false)
    // 本地上传的图片（图片仓库）与 http 地址都可以；data:、javascript: 之类不行
    expect(monsterArtSchema.safeParse({ portrait: { ...portrait, url: { $asset: 'abc123' } } }).success).toBe(true)
    expect(monsterArtSchema.safeParse({ token: { url: { $asset: 'abc123' } } }).success).toBe(true)
    expect(monsterArtSchema.safeParse({ token: { url: 'http://192.168.1.5/t.png' } }).success).toBe(true)
    expect(monsterArtSchema.safeParse({ token: { url: 'data:image/png;base64,AAAA' } }).success).toBe(false)
    expect(monsterArtSchema.safeParse({ token: { url: 'javascript:alert(1)' } }).success).toBe(false)
  })

  it('npc 是已登记的条目类型，必须有属性块引用、冒险来源、出处与置信度', () => {
    const schema = entryDataSchemaFor('npc')
    expect(schema).toBeDefined()
    const ok = { src: { book: 'LMoP', page: 12 }, credit, statblock: 'monster.knight.mm', adventure: 'LMoP', at: { chapter: '第一章' }, confidence: 'high' }
    expect(schema!.safeParse(ok).success).toBe(true)
    expect(schema!.safeParse({ ...ok, statblock: undefined }).success).toBe(false)
    expect(schema!.safeParse({ ...ok, confidence: 'low' }).success).toBe(false)
  })
})
