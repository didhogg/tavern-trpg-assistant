import type { TrpgDatabase } from '../db'
import { uuid as defaultUuid } from '../ids'
import type { RecognizedSaveFile } from '../packs/recognize'
import type { CampaignService, Owner } from '../saves/campaign'
import { settingsSchema, type SaveSlot } from '../../schemas/campaign'

export interface ImportItem {
  save: SaveSlot
  selectable: boolean
  /** 不可选时的原因，如"规则未安装"。 */
  reason?: string
}

/** 导入窗口的存档列表：所属规则未安装的存档不可选。 */
export function describeSaveFile(rec: RecognizedSaveFile, hasRule: (ruleId: string) => boolean): ImportItem[] {
  return rec.saves.map((save) => (hasRule(save.ruleId) ? { save, selectable: true } : { save, selectable: false, reason: '规则未安装' }))
}

/** 文件中附带的内容包（交给 PackService 逐个识别与安装，冲突时由界面询问）。 */
export function attachedPackFiles(rec: RecognizedSaveFile): Array<{ name: string; bytes: Uint8Array }> {
  return [...rec.attachedPacks].map(([name, bytes]) => ({ name, bytes }))
}

export interface ImportDeps {
  db: TrpgDatabase
  campaign: CampaignService
  now: () => number
  hasRule: (ruleId: string) => boolean
  uuid?: () => string
}

export interface ImportResult {
  imported: number
  skipped: number
}

function importedName(name: string, taken: Set<string>): string {
  if (!taken.has(name)) return name
  const first = `${name}（导入）`
  if (!taken.has(first)) return first
  for (let n = 2; ; n++) {
    const candidate = `${name}（导入 ${n}）`
    if (!taken.has(candidate)) return candidate
  }
}

/**
 * 导入存档。
 * - 单个存档文件：作为当前卡的新存档，重名加"（导入）"；
 * - 完整备份·合并：只添加尚不存在的存档与当前数据；
 * - 完整备份·覆盖：先记下各卡当前数据，用备份替换已安装规则的全部存档、当前数据与设置，再把记下的数据写成"恢复备份前"自动存档。
 */
export async function importSaves(deps: ImportDeps, rec: RecognizedSaveFile, opts: { owner: Owner; selectedIds: string[]; mode?: 'merge' | 'overwrite' }): Promise<ImportResult> {
  const { db, campaign } = deps
  const makeId = deps.uuid ?? defaultUuid
  const usable = rec.saves.filter((s) => deps.hasRule(s.ruleId))
  const selected = new Set(opts.selectedIds)
  let imported = 0

  return db.transaction('rw', [db.saves, db.workspaces, db.meta, db.packs], async () => {
    if (rec.type === 'save') {
      for (const save of usable.filter((s) => selected.has(s.id))) {
        const taken = await campaign.manualNames(opts.owner.ownerKey, save.ruleId)
        const now = deps.now()
        const { deletedAt: _d, autoReason: _a, branchedFrom: _b, ...rest } = save
        await db.saves.put({ ...rest, id: makeId(), ownerKey: opts.owner.ownerKey, ownerLabel: opts.owner.ownerLabel, kind: 'manual', name: importedName(save.name, taken), createdAt: now, updatedAt: now })
        imported++
      }
      return { imported, skipped: rec.saves.length - imported }
    }

    const overwrite = opts.mode === 'overwrite'
    const usableWorkspaces = rec.workspaces.filter((w) => deps.hasRule(w.ruleId))
    const before = overwrite ? (await db.workspaces.toArray()).filter((w) => deps.hasRule(w.ruleId)) : []
    if (overwrite) {
      for (const s of (await db.saves.toArray()).filter((x) => deps.hasRule(x.ruleId))) await db.saves.delete(s.id)
      for (const w of before) await db.workspaces.delete(w.ownerKey)
      if (rec.settings) await db.setMeta('settings', settingsSchema.parse(rec.settings))
    }
    const toImport = overwrite ? usable : usable.filter((s) => selected.has(s.id))
    for (const save of toImport) {
      if (!overwrite && (await db.saves.get(save.id))) continue
      await db.saves.put(save)
      imported++
    }
    for (const ws of usableWorkspaces) {
      if (overwrite || !(await db.workspaces.get(ws.ownerKey))) await db.workspaces.put(ws)
    }
    for (const ws of before) await campaign.writeAutoSave(ws, '恢复备份前')
    const pairs = new Set(toImport.filter((s) => s.kind === 'auto').map((s) => `${s.ownerKey}\u0000${s.ruleId}`))
    for (const pair of pairs) {
      const [ownerKey, ruleId] = pair.split('\u0000')
      await campaign.pruneAutoSaves(ownerKey, ruleId)
    }
    return { imported, skipped: rec.saves.length - imported }
  })
}
