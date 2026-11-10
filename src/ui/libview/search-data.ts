// 全库数据搜索的纯处理：命中行的显示名、按勾选的书过滤、按类别分组。搜索本身是后端 scoped.search（只交本战役看得见的）。
import type { ScopedSearchHit } from '../../library/scoped-search'
import { categoryLabel } from './registry'

/** 作者索引里一条原样：cn 中文名、n 名称。读不到显示「未知」。 */
export const hitName = (h: Pick<ScopedSearchHit, 'doc'>): string => String(h.doc.cn ?? h.doc.n ?? '未知')
export const hitSource = (h: Pick<ScopedSearchHit, 'doc'>): string | null => (typeof h.doc.s === 'string' ? h.doc.s : null)

/** 去掉被取消勾选的书 / 包里的命中（没有来源的命中，如规则速查文档，一直保留）。 */
export function withoutUnchecked<T extends Pick<ScopedSearchHit, 'doc'>>(hits: T[], unchecked: ReadonlySet<string>): T[] {
  return hits.filter((h) => { const s = hitSource(h); return s === null || !unchecked.has(s) })
}

/** 命中里出现过的类别（带条数）；没登记的类别归"其他"。 */
export function hitCategories(hits: Array<Pick<ScopedSearchHit, 'prop'>>): Array<{ key: string; label: string; n: number }> {
  const count = new Map<string, number>()
  for (const h of hits) { const key = categoryLabel(h.prop) ? h.prop : 'other'; count.set(key, (count.get(key) ?? 0) + 1) }
  return [...count].map(([key, n]) => ({ key, label: key === 'other' ? '其他' : (categoryLabel(key) as string), n })).sort((a, b) => b.n - a.n)
}
export const hitCategoryKey = (h: Pick<ScopedSearchHit, 'prop'>): string => (categoryLabel(h.prop) ? h.prop : 'other')
export const hitCategoryLabel = (h: Pick<ScopedSearchHit, 'prop'>): string => categoryLabel(h.prop) ?? '其他'
