import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import type { PackService } from '../packs/installer'
import { writeZip } from '../packs/zip'
import { loadSettings } from '../backup'
import { FORMAT_VERSION } from '../../schemas/common'
import type { SaveSlot } from '../../schemas/campaign'

export type ExportScope = { type: 'save'; saveId: string } | { type: 'backup' }

export interface ExportDeps {
  db: TrpgDatabase
  packs: PackService
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

/** 可附带的内容包：被所含存档引用、已安装、且不是内置包。 */
async function attachablePacks(deps: ExportDeps, saves: SaveSlot[]) {
  const ids = new Set(saves.flatMap((s) => s.packs.map((p) => p.id)))
  const installed = await deps.packs.list()
  return installed.filter((p) => ids.has(p.id) && p.source !== 'builtin')
}

/** 导出前的体积估算（界面显示"约 180KB"与"+N 个内容包，约 xMB"）。 */
export async function estimateExport(deps: ExportDeps, scope: ExportScope): Promise<{ saveBytes: number; packs: Array<{ id: string; name: string; byteSize: number }> }> {
  const saves = await collectSaves(deps.db, scope)
  const packs = await attachablePacks(deps, saves)
  return { saveBytes: saves.reduce((n, s) => n + JSON.stringify(s).length, 0), packs: packs.map((p) => ({ id: p.id, name: p.name, byteSize: p.byteSize })) }
}

/** 生成 `.trpgsave`：单个存档，或完整备份（含自动存档与各卡当前数据，不含最近删除）。 */
export async function exportSaves(deps: ExportDeps, scope: ExportScope, opts: { includePacks: boolean }): Promise<{ bytes: Uint8Array; filename: string }> {
  const saves = await collectSaves(deps.db, scope)
  const files: Record<string, Uint8Array | string> = {}
  for (const save of saves) files[`saves/${save.id}.json`] = JSON.stringify(save)
  if (scope.type === 'backup') {
    for (const ws of await deps.db.workspaces.toArray()) files[`workspaces/${encodeURIComponent(ws.ownerKey)}.json`] = JSON.stringify(ws)
    files['settings.json'] = JSON.stringify(await loadSettings(deps.db))
  }
  const installed = await deps.packs.list()
  files['packs.json'] = JSON.stringify(installed.map((p) => ({ id: p.id, version: p.version, name: p.name })))
  if (opts.includePacks) {
    for (const pack of await attachablePacks(deps, saves)) files[`packs/${pack.id}@${pack.version}.trpgpack`] = await deps.packs.exportPack(pack.id)
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
