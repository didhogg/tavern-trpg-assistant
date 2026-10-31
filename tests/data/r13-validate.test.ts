import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/schemas/pack'
import { isBlocks } from '../../tools/data/i18n/cjk'
import { validateI18n } from '../../tools/data/i18n/validate'

const base = (fields: Record<string, unknown>, name = 'Fireball'): Entry => ({
  id: 'spell.test.phb', type: 'spell', name: '测试', keywords: [], unique: false, summary: '',
  data: { text: [{ p: '中文段落' }], traits: [{ name: '两栖' }], ref: { table: 'table.x', label: '标签' } },
  i18n: { en: { name, fields } },
} as unknown as Entry)

describe('R13 校验器', () => {
  it('合法的英文版通过', () => {
    expect(validateI18n([base({ text: [{ p: 'English paragraph' }], 'traits.0.name': 'Amphibious' })])).toEqual([])
  })
  it.each([
    ['英文里有汉字', base({ 'traits.0.name': '两栖 Amphibious' })],
    ['英文里有未转换的 {@', base({ text: [{ p: 'Cast {@spell fireball}' }] })],
    ['路径在中文里不存在', base({ 'traits.5.name': 'Ghost' })],
    ['类型与中文不一致', base({ text: 'plain string' })],
    ['英文名含汉字', base({}, '火球 Fireball')],
  ])('拒绝：%s', (_label, entry) => {
    expect(validateI18n([entry]).length).toBeGreaterThan(0)
  })
  it('{ label, table: "id" } 这样的字段不会被当成文字块', () => {
    expect(isBlocks([{ label: '侍僧', table: 'table.acolyte.phb' }])).toBe(false)
    expect(isBlocks([{ p: 'x' }, { list: ['a'] }])).toBe(true)
  })
})
