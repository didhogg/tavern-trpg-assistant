// 全库数据搜索的纯处理：命中行的显示名、按勾选的书过滤、按类别分组。搜索本身是后端 scoped.search（只交本战役看得见的）。
import type { ScopedSearchHit } from '../../library/scoped-search'
import type { Services } from '../../core/services'
import type { CampaignLibrary } from '../../library/scopes'
import { SOURCES } from '../../library/sources'
import { authorName } from './pack-data'
import { categoryLabel, registeredCategories } from './registry'

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

/**
 * 没输入关键字时显示本战役看得见的全部条目（和包弹窗同一种取法：每类一次作者查询，分批并行，边取边给界面）。
 * 每条造成一个"命中"的样子（score 0），列表行就和搜索结果共用同一套显示。
 */
export async function loadAllHits(s: Services, c: CampaignLibrary, onPart: (hits: ScopedSearchHit[]) => void): Promise<ScopedSearchHit[]> {
  const sets = SOURCES.filter((x) => x.codeSet === c.codeSet).map((x) => x.id)
  const counts = new Map<string, number>()
  for (const id of sets) for (const [prop, n] of Object.entries(await s.backend.library.service.categories(id).catch(() => ({} as Record<string, number>)))) if (n > 0) counts.set(prop, (counts.get(prop) ?? 0) + n)
  const props = registeredCategories([...counts.keys()].map((prop) => ({ prop }))).map((x) => x.prop)
  const out: ScopedSearchHit[] = []
  for (let i = 0; i < props.length; i += 6) {
    const parts = await Promise.all(props.slice(i, i + 6).map(async (prop) => Promise.all((await s.backend.library.scoped.query(c, prop, { expand: true })).map(async (r): Promise<ScopedSearchHit> => ({ score: 0, prop, doc: { n: await authorName(s, c.codeSet, prop, r.item), s: r.source }, ref: r.ref, reason: r.reason, target: { kind: 'entry' }, variant: r.variant })))))
    for (const part of parts) out.push(...part)
    onPart([...out])
  }
  return out
}
