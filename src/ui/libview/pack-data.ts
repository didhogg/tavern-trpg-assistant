// 包 / 书弹窗要的数据：这个来源里每个登记类别的条目（scoped.query 按来源取）。只做"取"和"过滤 / 排序"，不算别的。
import type { Services } from '../../core/services'
import type { ScopedRow } from '../../library/scoped'
import type { EntryRef, CampaignLibrary } from '../../library/scopes'
import { registeredCategories } from './registry'

export interface PackRow {
  ref: EntryRef
  name: string
  prop: string
  source: string | null
  /** 本战役看得到吗（关着 / 停用的行灰显，仍能点开）。 */
  off: boolean
  /** 同编号拆行时才有：所在的包名。 */
  pack: string | null
}

export const nameOf = (item: unknown): string => (typeof item === 'object' && item && typeof (item as { name?: unknown }).name === 'string' ? (item as { name: string }).name : '未知')

/** 一次最多并行取几类（每类一次作者查询）。 */
const BATCH = 6

export async function loadPackRows(s: Services, c: CampaignLibrary, setId: string, source: string, onPart?: (rows: PackRow[]) => void): Promise<PackRow[]> {
  const counts = await s.backend.library.service.categories(setId)
  const props = registeredCategories(Object.entries(counts).filter(([, n]) => n > 0).map(([prop]) => ({ prop }))).map((x) => x.prop)
  const rows: PackRow[] = []
  for (let i = 0; i < props.length; i += BATCH) {
    const parts = await Promise.all(props.slice(i, i + BATCH).map(async (prop) => (await s.backend.library.scoped.query(c, prop, { source, expand: true })).map((r) => toRow(prop, r))))
    for (const part of parts) rows.push(...part)
    onPart?.([...rows])
  }
  return rows
}

function toRow(prop: string, r: ScopedRow): PackRow {
  return { ref: r.ref, name: nameOf(r.item), prop, source: r.source, off: r.reason === 'excluded' || r.reason === 'out-of-scope' || r.reason === 'unclassified', pack: r.variant?.pack ?? null }
}

/** 文字匹配（名称，不分大小写）。 */
export const matchName = (rows: PackRow[], q: string): PackRow[] => {
  const t = q.trim().toLowerCase()
  return t ? rows.filter((r) => r.name.toLowerCase().includes(t)) : rows
}
