import { describe, expect, it } from 'vitest'
import { hitCategories, hitName, withoutUnchecked } from '../../src/ui/libview/search-data'

const hit = (prop: string, s: string | null, cn?: string, n?: string) => ({ prop, doc: { ...(s ? { s } : {}), ...(cn ? { cn } : {}), ...(n ? { n } : {}) } }) as never

describe('全库搜索的纯处理', () => {
  it('名字：中文名优先，读不到显示未知', () => {
    expect(hitName(hit('spell', 'PHB', '火球术', 'Fireball'))).toBe('火球术')
    expect(hitName(hit('spell', 'PHB', undefined, 'Fireball'))).toBe('Fireball')
    expect(hitName(hit('spell', 'PHB'))).toBe('未知')
  })
  it('取消勾选的书：命中被屏蔽；没有来源的命中（规则速查）保留', () => {
    const hits = [hit('spell', 'PHB'), hit('spell', 'XPHB'), hit('document', null)]
    expect(withoutUnchecked(hits, new Set(['PHB'])).length).toBe(2)
    expect(withoutUnchecked(hits, new Set()).length).toBe(3)
  })
  it('类别药丸：登记的用中文名，没登记的归其他，按条数排', () => {
    const cats = hitCategories([{ prop: 'spell' }, { prop: 'spell' }, { prop: 'zzz' }])
    expect(cats).toEqual([{ key: 'spell', label: '法术', n: 2 }, { key: 'other', label: '其他', n: 1 }])
  })
})
