import { TrpgError } from '../errors'
import { hashValue } from '../hash'
import { migrateRecord } from '../migrate'
import { SAVE_NAME_MAX, type SaveSlot, type SaveSummary, type Workspace, type WorkspaceData } from '../../schemas/campaign'

export const AUTO_SAVE_KEEP = 3

export type SummaryContributor = (data: WorkspaceData) => Partial<SaveSummary>

/** 未保存判定用的哈希：覆盖游戏数据与启用的内容包 id（不含版本，内容包更新不算改动）。 */
export function snapshotHash(data: WorkspaceData, enabledPacks: Array<{ id: string }>): string {
  return hashValue({ d: data, p: enabledPacks.map((p) => p.id).sort() })
}

export function isDirty(ws: Pick<Workspace, 'data' | 'enabledPacks' | 'savedHash'>): boolean {
  return ws.savedHash !== snapshotHash(ws.data, ws.enabledPacks)
}

export function summarize(data: WorkspaceData, contributors: SummaryContributor[]): SaveSummary {
  return contributors.reduce<SaveSummary>((acc, c) => ({ ...acc, ...c(data) }), { partyNames: [], partyCount: 0 })
}

export function cleanName(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > SAVE_NAME_MAX) throw new TrpgError('E_BAD_NAME', `存档名需要 1–${SAVE_NAME_MAX} 个字`)
  return trimmed
}

/** 在已有名称中找出不重复的名称：base，base 2，base 3… 由 `suffix` 决定形式。 */
export function uniqueName(base: string, taken: Set<string>, suffix: (n: number) => string = (n) => ` ${n}`): string {
  if (!taken.has(base)) return base
  for (let n = 2; ; n++) {
    const candidate = `${base}${suffix(n)}`
    if (!taken.has(candidate)) return candidate
  }
}

export function readSave(raw: SaveSlot): SaveSlot {
  return migrateRecord('save', raw as unknown as Record<string, unknown>) as unknown as SaveSlot
}

export function readWorkspace(raw: Workspace): Workspace {
  return migrateRecord('workspace', raw as unknown as Record<string, unknown>) as unknown as Workspace
}

export function byRecent(a: SaveSlot, b: SaveSlot): number {
  return b.updatedAt - a.updatedAt || b.createdAt - a.createdAt || a.id.localeCompare(b.id)
}
