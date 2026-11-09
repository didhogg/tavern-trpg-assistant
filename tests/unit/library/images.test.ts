import { describe, expect, it } from 'vitest'
import { imageCandidates, imageRootsOf, imageUrls, stripImageRoot } from '../../../src/library/images'

const roots = ['https://a.example/img/', 'https://b.example/img/']

describe('图片候选地址', () => {
  it('相对路径：每个图片根各拼一个，按先后顺序；空格与汉字编码', () => {
    expect(imageCandidates(roots, { type: 'internal', path: 'items/DMG/Bag of Holding.webp' })).toEqual([
      'https://a.example/img/items/DMG/Bag%20of%20Holding.webp', 'https://b.example/img/items/DMG/Bag%20of%20Holding.webp',
    ])
    expect(imageCandidates(roots, 'covers/PHB.webp')).toHaveLength(2)
  })
  it('外部网址只有它自己', () => {
    expect(imageCandidates(roots, { type: 'external', url: 'https://x.example/a.png' })).toEqual(['https://x.example/a.png'])
  })
  it('没有图片、路径为空、开头多余的斜杠', () => {
    expect(imageCandidates(roots, null)).toEqual([])
    expect(imageCandidates(roots, {})).toEqual([])
    expect(imageCandidates(['r/'], '/a.webp')).toEqual(['r/a.webp'])
  })
  it('数据源登记里的图片根：官方中英都有，且不止一个（有备用）', () => {
    for (const id of ['cn-official', 'en-official']) expect(imageRootsOf(id).length).toBeGreaterThan(1)
    expect(imageUrls('en-official', 'covers/PHB.webp')[0]).toMatch(/^https:\/\/.*covers\/PHB\.webp$/)
  })
  it('作者头像路径去掉图片根前缀', () => {
    expect(stripImageRoot('/img/bestiary/tokens/MM/X.webp')).toBe('bestiary/tokens/MM/X.webp')
    expect(stripImageRoot('img/a.webp')).toBe('a.webp')
  })
})
