import { batchLabel } from './ids'
import type { Instance, WorkspaceData } from '../schemas/campaign'
import type { StoredEntry } from '../schemas/pack'

export interface MaterializeResult {
  data: WorkspaceData
  instances: Instance[]
  /** false 表示返回的是已存在的唯一条目副本。 */
  created: boolean
}

/**
 * 把内容包条目复制为当前数据中的副本（U2 §3.18）。
 * 唯一条目只有一份；普通条目每次新建，count > 1 时在批内按 A、B、C… 编号。
 */
export function materializeInstances(data: WorkspaceData, entry: StoredEntry, version: string, count: number, makeId: () => string): MaterializeResult {
  if (entry.unique) {
    const existing = data.instances.find((i) => i.sourceRef?.packId === entry.packId && i.sourceRef.entryId === entry.entryId)
    if (existing) return { data, instances: [existing], created: false }
    count = 1
  }
  const instances: Instance[] = Array.from({ length: Math.max(1, count) }, (_, index) => ({
    id: makeId(),
    type: entry.type,
    name: entry.name,
    ...(count > 1 ? { label: batchLabel(index) } : {}),
    sourceRef: { packId: entry.packId, version, entryId: entry.entryId },
    data: structuredClone(entry.data),
  }))
  return { data: { ...data, instances: [...data.instances, ...instances] }, instances, created: true }
}
