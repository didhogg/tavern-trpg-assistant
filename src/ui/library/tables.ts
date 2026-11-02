import type { TrpgDatabase } from '../../core/db'

type Obj = Record<string, unknown>
export interface RelatedTable { id: string; name: string; data: Obj }
let cache: { key: string; rows: RelatedTable[] } | undefined

/** 已装包里 parent.id / parent.appliesTo 指向 target 的表；按已装包签名缓存。 */
export async function tablesOf(db: TrpgDatabase, ruleId: string, signature: string, targetId: string): Promise<RelatedTable[]> {
  if (!cache || cache.key !== signature) {
    const rows = await db.entries.where('[ruleId+type]').equals([ruleId, 'table']).toArray()
    cache = { key: signature, rows: rows.map((r) => ({ id: r.entryId, name: r.name, data: r.data as Obj })) }
  }
  return cache.rows.filter((t) => {
    const p = t.data.parent as { id?: string; appliesTo?: string[] } | undefined
    if (p?.id === targetId || (Array.isArray(p?.appliesTo) && p.appliesTo.includes(targetId))) return true
    // 参考表按行主人：没有 parent 的身高/体重、神系表，每一行的 refs 就是它的主人。
    return (Array.isArray(t.data.rows) ? t.data.rows : []).some((r) => typeof r === 'object' && r !== null && Array.isArray((r as { refs?: unknown }).refs) && ((r as { refs: unknown[] }).refs).includes(targetId))
  }).sort((a, b) => a.id.localeCompare(b.id, 'en'))
}
