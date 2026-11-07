import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import { collectAssetHashes } from '../files/assets'
import { writeZip } from '../files/zip'
import { loadSettings } from '../backup'
import { FORMAT_VERSION } from '../../schemas/common'
import type { SaveSlot, Workspace } from '../../schemas/campaign'

export type ExportScope = { type: 'save'; saveId: string } | { type: 'backup' }

/** 完整备份里【库】那一半：自制、范围、房规链接。由 P3-1 的实现提供，core 只搬文件。 */
export interface BackupLibraryAdapter {
  exportFiles(): Promise<Record<string, string>>
  importFiles(files: Record<string, string>): Promise<{ brews: number; scopes: number; houseRules: number; errors: string[] }>
}

export interface ExportDeps {
  db: TrpgDatabase
  now: () => number
  appVersion: string
  /** 完整备份时带自制/范围/房规；单个存档不需要。 */
  library?: BackupLibraryAdapter
}

function dateStamp(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|\s]+/g, '_').replace(/^_+|_+$/g, '') || '存档'
}

type KernelLike = {
  rule: string
  dataVersion?: { official?: string; brews?: Record<string, string> }
  actors?: Array<{ refs?: Array<{ set: string; prop: string; hash: string }> }>
  overrides?: Array<{ target: { set: string; prop: string; hash: string }; house: { set: string; prop: string; hash: string } }>
}

function collectKernelDependencies(saves: SaveSlot[], workspaces: Workspace[]): Array<{ set: string; prop: string; hash: string; rule?: string }> {
  const out = new Map<string, { set: string; prop: string; hash: string; rule?: string }>()
  const add = (ref: { set: string; prop: string; hash: string }, rule: string): void => {
    const key = `${ref.set}|${ref.prop}|${ref.hash}`
    if (!out.has(key)) out.set(key, { ...ref, rule })
  }
  const read = (kernel: unknown): void => {
    if (!kernel || typeof kernel !== 'object') return
    const k = kernel as KernelLike
    for (const actor of k.actors ?? []) for (const ref of actor.refs ?? []) add(ref, k.rule)
    for (const over of k.overrides ?? []) { add(over.target, k.rule); add(over.house, k.rule) }
  }
  for (const save of saves) read((save.snapshot as { kernel?: unknown }).kernel)
  for (const ws of workspaces) read((ws.data as { kernel?: unknown }).kernel)
  return [...out.values()].sort((a, b) => `${a.set}|${a.prop}|${a.hash}`.localeCompare(`${b.set}|${b.prop}|${b.hash}`))
}

function collectKernelVersions(saves: SaveSlot[]): Array<{ saveId: string; rule: string; official: string; brews: Record<string, string> }> {
  return saves.flatMap((save) => {
    const kernel = (save.snapshot as { kernel?: unknown }).kernel as KernelLike | undefined
    if (!kernel) return []
    return [{ saveId: save.id, rule: kernel.rule, official: kernel.dataVersion?.official ?? '', brews: kernel.dataVersion?.brews ?? {} }]
  })
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
export async function estimateExport(deps: ExportDeps, scope: ExportScope): Promise<{ saveBytes: number; libraryBytes: number; totalBytes: number }> {
  const saves = await collectSaves(deps.db, scope)
  const saveBytes = saves.reduce((n, s) => n + JSON.stringify(s).length, 0)
  let libraryBytes = 0
  if (scope.type === 'backup' && deps.library) {
    const files = await deps.library.exportFiles()
    libraryBytes = Object.values(files).reduce((n, text) => n + text.length, 0)
  }
  return { saveBytes, libraryBytes, totalBytes: saveBytes + libraryBytes }
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
    if (deps.library) {
      const libraryFiles = await deps.library.exportFiles()
      for (const [name, text] of Object.entries(libraryFiles)) files[`library/${name}`] = text
    }
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
    dependencies: collectKernelDependencies(saves, workspaces),
    kernelVersions: collectKernelVersions(saves),
  })
  const stamp = dateStamp(deps.now())
  const filename = scope.type === 'backup' ? `TRPG备份_${stamp}.trpgsave` : `${safeFileName(saves[0].name)}_${stamp}.trpgsave`
  return { bytes: writeZip(files), filename }
}
