import { z } from 'zod'
import { idSchema, timestampSchema } from './common'

/** 战役当前数据：各模块各自拥有自己的键，原样保留（人物等模块在 P5 起按新【库】重建后再加）。 */
export const workspaceDataSchema = z.looseObject({})
export type WorkspaceData = z.infer<typeof workspaceDataSchema>

export const workspaceSchema = z.object({
  ownerKey: z.string().min(1),
  ownerLabel: z.string(),
  ruleId: idSchema,
  currentSaveId: z.string().nullable(),
  data: workspaceDataSchema,
  savedHash: z.string(),
  schemaVersion: z.number().int(),
  updatedAt: timestampSchema,
})
export type Workspace = z.infer<typeof workspaceSchema>

export const saveSummarySchema = z.object({
  partyNames: z.array(z.string()).default([]),
  partyCount: z.number().int().nonnegative().default(0),
  location: z.string().optional(),
  round: z.number().int().optional(),
})
export type SaveSummary = z.infer<typeof saveSummarySchema>

export const autoReasonSchema = z.enum(['读档前', '新存档前', '切换规则前', '恢复备份前', '改动模组前'])
export type AutoReason = z.infer<typeof autoReasonSchema>

export const saveSlotSchema = z.object({
  id: z.string().min(1),
  ownerKey: z.string().min(1),
  ownerLabel: z.string(),
  ruleId: idSchema,
  name: z.string().min(1).max(80),
  note: z.string().max(400).default(''),
  kind: z.enum(['manual', 'auto']),
  autoReason: autoReasonSchema.optional(),
  branchedFrom: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
  summary: saveSummarySchema,
  snapshot: workspaceDataSchema,
  hash: z.string(),
  schemaVersion: z.number().int(),
})
export type SaveSlot = z.infer<typeof saveSlotSchema>

export const settingsSchema = z.object({
  /** 多少天没导出备份就提醒；0 = 不按天数提醒。 */
  reminderDays: z.number().int().nonnegative().default(7),
  /** 导出后保存多少次就提醒；0 = 不按保存次数提醒。 */
  reminderSaves: z.number().int().nonnegative().default(10),
  /** 读取存档前不自动备份当前存档（读取确认页的勾选，记住）；默认关 = 照常先存一份。 */
  skipAutoSaveOnLoad: z.boolean().default(false),
  /** 结算撤销最多保留多少条；0 或负数不合法。 */
  undoLimit: z.number().int().min(1).max(500).default(50),
})
export type Settings = z.infer<typeof settingsSchema>

export const backupStateSchema = z.object({
  lastExportAt: timestampSchema.nullable().default(null),
  savesSinceExport: z.number().int().nonnegative().default(0),
  persistRequested: z.boolean().default(false),
  persistGranted: z.boolean().default(false),
})
export type BackupState = z.infer<typeof backupStateSchema>

export const SAVE_NAME_MAX = 40
export const SAVE_NOTE_MAX = 200
