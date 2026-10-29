import type { WorkspaceData } from '../../schemas/campaign'
import type { Entry, PackFeature } from '../../schemas/pack'

/** 固定引用：存档用到的库中条目原版的冻结副本（L1 §3.2）。 */
export interface PinRecord {
  version: string
  entry: Entry
  pinnedAt: number
}

/** 已启用扩展包的功能定义（冻结副本）。 */
export interface FeatureRecord {
  def: PackFeature
  packId: string
  version: string
  enabled: boolean
  pinnedAt: number
}

export type VariantMode = 'replace' | 'patch' | 'hide'

export type VariantSource =
  | { type: 'pack'; packId: string; lineage: string; version: string }
  | { type: 'house' }

export interface Variant {
  /** `pack:<lineage>/<条目 id>` 或 `house`。 */
  key: string
  source: VariantSource
  sourceName: string
  mode: VariantMode
  /** replace：完整条目；patch：合并补丁；hide：空。 */
  payload: unknown
  note: string
  baseVersion?: string
}

export interface VariantSlot {
  candidates: Variant[]
  /** 当前使用的版本：`original` 或某个修改版的 key。 */
  active: string
  /** 玩家是否亲自选过这个条目的版本。 */
  manual: boolean
  /** 之前使用过的版本（最近的在最后，最多 10 个）。 */
  history: string[]
}

export interface LibraryKeys {
  pins: Record<string, PinRecord>
  features: Record<string, FeatureRecord>
  featureState: Record<string, unknown>
  variants: Record<string, VariantSlot>
}

export const HISTORY_MAX = 10
export const ORIGINAL = 'original'
export const HOUSE = 'house'

export const entryKey = (packId: string, entryId: string): string => `${packId}/${entryId}`
export const featureKey = (pack: { id: string; lineage?: string }, featureId: string): string => `${pack.lineage ?? pack.id}/${featureId}`

/** 读取当前数据中由本单元拥有的键（缺省为空）。 */
export function libraryOf(data: WorkspaceData): LibraryKeys {
  const d = data as Record<string, unknown>
  return {
    pins: (d.pins as LibraryKeys['pins']) ?? {},
    features: (d.features as LibraryKeys['features']) ?? {},
    featureState: (d.featureState as LibraryKeys['featureState']) ?? {},
    variants: (d.variants as LibraryKeys['variants']) ?? {},
  }
}

export function withLibrary(data: WorkspaceData, patch: Partial<LibraryKeys>): WorkspaceData {
  return { ...data, ...patch }
}
