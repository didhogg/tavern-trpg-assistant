import { describe, expect, it } from 'vitest'
import { splitInline, tagLabel } from '../../src/ui/libview/inline-text'

describe('splitInline', () => {
  it('拆开文字与标签', () => {
    expect(splitInline('受到 {@damage 8d6} 点{@b 火焰}伤害')).toEqual([
      { kind: 'text', text: '受到 ' }, { kind: 'tag', tag: 'damage', content: '8d6' },
      { kind: 'text', text: ' 点' }, { kind: 'tag', tag: 'b', content: '火焰' }, { kind: 'text', text: '伤害' },
    ])
  })
  it('标签套标签：括号配平', () => {
    expect(splitInline('{@b 加粗{@i 斜体}}x')).toEqual([{ kind: 'tag', tag: 'b', content: '加粗{@i 斜体}' }, { kind: 'text', text: 'x' }])
  })
  it('没配平的括号当普通文字', () => {
    expect(splitInline('a {@b 没关')).toEqual([{ kind: 'text', text: 'a {@b 没关' }])
  })
  it('没有内容的标签', () => {
    expect(splitInline('{@hr}')).toEqual([{ kind: 'tag', tag: 'hr', content: '' }])
  })
})

describe('tagLabel', () => {
  it('取第一段；有自定义文字取最后一段', () => {
    expect(tagLabel('火球术')).toBe('火球术')
    expect(tagLabel('火球术|PHB')).toBe('火球术')
    expect(tagLabel('火球术|PHB|那个火球')).toBe('那个火球')
  })
})
