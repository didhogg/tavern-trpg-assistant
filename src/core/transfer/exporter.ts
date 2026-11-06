import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import { collectAssetHashes } from '../files/assets'
import { writeZip } from '../files/zip'
import { loadSettings } from '../backup'
import { FORMAT_VERSION } from '../../schemas/common'
import type { SaveSlot, Workspace } from '../../schemas/campaign'

export type ExportScope = { type: 'save'; saveId: string } | { type: 'backup' }

export interface ExportDeps {
  db: TrpgDatabase
  now: () => number
  appVersion: string
}

function dateStamp(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|\s]+/g, '_').replace(/^_+|_+$/g, '') || '存档'
}

async function collectSaves(db: TrpgDatabase, scope: ExportScope): Promise<SaveSlot[]> {
  if (scope.type === 'save') {
    const save = await db.saves.get(scope.saveId)
    if (!save || save.deletedAt !== undefined) throw new TrpgError('E_NOT_FOUND', '没有找到这个存档')
    return [save]
  }
  return (await db.saves.toArray()).filter((s) => s.deletedAt === undefined)
}

/** 导出前的体积估算（界面显示"约 180KB"）。 */
export async function estimateExport(deps: ExportDeps, scope: ExportScope): Promise<{ saveBytes: number }> {
  const saves = await collectSaves(deps.db, scope)
  return { saveBytes: saves.reduce((n, s) => n + JSON.stringify(s).length, 0) }
}

/** 生成 `.trpgsave`：单个存档，或完整备份（含自动存档与各卡当前数据，不含最近删除）。 */
export async function exportSaves(deps: ExportDeps, scope: ExportScope): Promise<{ bytes: Uint8Array; filename: string }> {
  const saves = await collectSaves(deps.db, scope)
  const files: Record<string, Uint8Array | string> = {}
  for (const save of saves) files[`saves/${save.id}.json`] = JSON.stringify(save)
  let workspaces: Workspace[] = []
  if (scope.type === 'backup') {
    workspaces = await deps.db.workspaces.toArray()
    for (const ws of workspaces) files[`workspaces/${encodeURIComponent(ws.ownerKey)}.json`] = JSON.stringify(ws)
    files['settings.json'] = JSON.stringify(await loadSettings(deps.db))
  }
  const hashes = collectAssetHashes([saves, workspaces])
  for (const hash of [...hashes].sort()) {
    const blob = await deps.db.blobs.get(hash)
    if (blob) files[`blobs/${hash}`] = blob.bytes
  }
  files['trpg-manifest.json'] = JSON.stringify({
    format: scope.type === 'backup' ? 'trpg-backup' : 'trpg-save',
    formatVersion: FORMAT_VERSION,
    appVersion: deps.appVersion,
    exportedAt: new Date(deps.now()).toISOString(),
    ruleIds: [...new Set(saves.map((s) => s.ruleId))],
  })
  const stamp = dateStamp(deps.now())
  const filename = scope.type === 'backup' ? `TRPG备份_${stamp}.trpgsave` : `${safeFileName(saves[0].name)}_${stamp}.trpgsave`
  return { bytes: writeZip(files), filename }
}
