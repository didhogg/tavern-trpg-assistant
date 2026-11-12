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

describe('书目范围分组（§11.3）', () => {
  const r = (over: Record<string, unknown>) => ({ kind: 'book', set: 'cn-official', source: 'PHB', id: 'PHB', name: 'PHB', count: 1, downloaded: true, view: { visible: true }, ...over }) as never
  it('书架分组照搬（含自制内容）；自己导入的包另成「我的库」；包的全部来源一起；只列开着的', async () => {
    const { searchScopeGroups } = await import('../../src/ui/libview/search-data')
    const groups = [
      { group: 'core', name: '核心', books: [r({}), r({ source: 'DMG', id: 'DMG', name: 'DMG', view: { visible: false } })], adventures: [] },
      { group: 'homebrew', name: '自制内容', books: [r({ set: 'cn-brew', source: 'A', id: null, name: '甲包', pack: { docIdLocal: 'a', filename: null, stableId: null, sources: ['A', 'A2'] } }), r({ set: 'cn-brew', source: 'M', id: null, name: '我导入的', pack: { docIdLocal: 'm', filename: null, stableId: null, sources: ['M'] } })], adventures: [] },
      { group: 'supplement', name: '官方出版物', books: [], adventures: [r({ kind: 'adventure', source: 'LMoP', id: 'LMoP', name: '矿坑', downloaded: false, count: 9 })] },
    ] as never
    const out = searchScopeGroups(groups, new Set(['m']), (x: { view: { visible: boolean } }) => x.view.visible)
    expect(out.map((g) => [g.name, g.rows.map((x) => [x.name, x.sources])])).toEqual([
      ['核心', [['PHB', ['PHB']]]],
      ['自制内容', [['甲包', ['A', 'A2']]]],
      ['官方出版物', [['矿坑', ['LMoP']]]],
      ['我的库', [['我导入的', ['M']]]],
    ])
  })
})
