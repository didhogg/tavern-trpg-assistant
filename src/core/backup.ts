import type { TrpgDatabase } from './db'
import { backupStateSchema, settingsSchema, type BackupState, type Settings } from '../schemas/campaign'

const DAY = 86_400_000

export interface ReminderStatus {
  kind: 'never' | 'ok' | 'due'
  daysSince: number | null
  savesSince: number
  /** 抽屉中显示的文字。 */
  text: string
}

export function reminderStatus(state: BackupState, settings: Settings, now: number): ReminderStatus {
  if (state.lastExportAt === null) {
    return { kind: 'never', daysSince: null, savesSince: state.savesSinceExport, text: '还没有导出过备份' }
  }
  const daysSince = Math.max(0, Math.floor((now - state.lastExportAt) / DAY))
  const due = daysSince >= settings.reminderDays || state.savesSinceExport >= settings.reminderSaves
  const when = daysSince === 0 ? '今天' : `${daysSince} 天前`
  const text = due ? `建议导出备份 · 上次完整备份：${when}，之后保存 ${state.savesSinceExport} 次` : `上次完整备份：${when} · 之后保存 ${state.savesSinceExport} 次`
  return { kind: due ? 'due' : 'ok', daysSince, savesSince: state.savesSinceExport, text }
}

export async function loadBackupState(db: TrpgDatabase): Promise<BackupState> {
  return backupStateSchema.parse((await db.getMeta('backup')) ?? {})
}

export async function loadSettings(db: TrpgDatabase): Promise<Settings> {
  return settingsSchema.parse((await db.getMeta('settings')) ?? {})
}

/** 完整备份文件交付成功后调用：记录时间并清零保存计数。 */
export async function markBackupExported(db: TrpgDatabase, now: number): Promise<void> {
  const state = await loadBackupState(db)
  await db.setMeta('backup', { ...state, lastExportAt: now, savesSinceExport: 0 })
}

/** 首次启动时向系统申请"持久存储"，只申请一次；结果记入备份状态。 */
export async function requestPersistence(db: TrpgDatabase, storage: { persist?: () => Promise<boolean> } | undefined = globalThis.navigator?.storage): Promise<BackupState> {
  const state = await loadBackupState(db)
  if (state.persistRequested) return state
  const granted = storage?.persist ? await storage.persist() : false
  const next = { ...state, persistRequested: true, persistGranted: granted }
  await db.setMeta('backup', next)
  return next
}
