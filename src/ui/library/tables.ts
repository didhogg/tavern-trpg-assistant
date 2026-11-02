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
    return p?.id === targetId || (Array.isArray(p?.appliesTo) && p.appliesTo.includes(targetId))
  }).sort((a, b) => a.id.localeCompare(b.id, 'en'))
}
