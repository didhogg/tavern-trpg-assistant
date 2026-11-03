import type { TrpgDatabase } from '../../core/db'
import type { Fact } from './facts'

type Obj = Record<string, unknown>
let cache: { key: string; map: Map<string, string[]> } | undefined

/** 已装包里 variantOf 指向 target 的怪物；按已装包组合缓存。 */
export async function variantsOf(db: TrpgDatabase, ruleId: string, signature: string, targetId: string): Promise<string[]> {
  if (!cache || cache.key !== signature) {
    const map = new Map<string, string[]>()
    const rows = await db.entries.where('[ruleId+type]').equals([ruleId, 'monster']).toArray()
    for (const e of rows) {
      const d = e.data as Obj
      if (typeof d.variantOf !== 'string') continue
      map.set(d.variantOf, [...(map.get(d.variantOf) ?? []), e.entryId])
    }
    cache = { key: signature, map }
  }
  return cache.map.get(targetId) ?? []
}

export function variantsFact(ids: string[]): Fact | undefined {
  if (!ids.length) return undefined
  return { label: '变体', parts: ids.flatMap((id, i) => [i ? '、' : '', { ref: id }]) }
}
