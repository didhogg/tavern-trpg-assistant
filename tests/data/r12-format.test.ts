import { describe, expect, it } from 'vitest'
import { bookDataSchema } from '../../src/rules/dnd5e2014/data/entries/book'
import { textBlockSchema } from '../../src/schemas/text'

const base = {
  src: { book: 'PHB', page: 1 },
  credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0', machine: false, missing: [], srd: false },
  text: [],
  book: 'PHB',
  order: 0,
  anchor: 'phb-000',
  outline: [{ anchor: 'phb-000', level: 0, kind: 'section', title: '测试书' }],
}

describe('R12 结构', () => {
  it('book 正例与标题锚点', () => {
    expect(bookDataSchema.safeParse(base).success).toBe(true)
    expect(textBlockSchema.safeParse({ h: '标题', body: [], anchor: 'phb-001' }).success).toBe(true)
    expect(textBlockSchema.safeParse({ h: '标题', body: [] }).success).toBe(true)
  })

  it('book 反例：缺目录、锚点错、层级越界、多余字段', () => {
    expect(bookDataSchema.safeParse({ ...base, outline: [] }).success).toBe(false)
    expect(bookDataSchema.safeParse({ ...base, anchor: 'phb-00g' }).success).toBe(false)
    expect(bookDataSchema.safeParse({ ...base, outline: [{ anchor: 'phb-000', level: 6, kind: 'section', title: '测试书' }] }).success).toBe(false)
    expect(bookDataSchema.safeParse({ ...base, extra: true }).success).toBe(false)
  })

  it('outline 的 parent 必须指向已存在锚点，子项层级 = 上级 + 1', () => {
    const outline = base.outline as Array<{ anchor: string; parent?: string; level: number }>
    const anchors = new Set(outline.map((item) => item.anchor))
    for (const item of outline) if (item.parent) expect(anchors.has(item.parent), item.parent).toBe(true)
    for (const item of outline) if (item.parent) {
      const parent = outline.find((x) => x.anchor === item.parent)!
      expect(item.level).toBe(parent.level + 1)
    }
  })
})
