import { z } from 'zod'
import { idSchema, semverSchema, timestampSchema } from './common'
import { packListItemSchema } from './pack'
import { peopleDataSchema } from './people'

export const instanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  label: z.string().optional(),
  sourceRef: z.object({ packId: idSchema, version: semverSchema, entryId: z.string() }).optional(),
  data: z.record(z.string(), z.unknown()).default({}),
})
export type Instance = z.infer<typeof instanceSchema>

/** 其他单元各自拥有的键原样保留；本单元负责 `instances`，U6 补 `people`、`tags`、`party`。 */
export const workspaceDataSchema = z.looseObject({ instances: z.array(instanceSchema).default([]), ...peopleDataSchema.shape })
export type WorkspaceData = z.infer<typeof workspaceDataSchema>

export const enabledPackSchema = z.object({ id: idSchema, version: semverSchema })
export type EnabledPack = z.infer<typeof enabledPackSchema>

export const workspaceSchema = z.object({
  ownerKey: z.string().min(1),
  ownerLabel: z.string(),
  ruleId: idSchema,
  currentSaveId: z.string().nullable(),
  enabledPacks: z.array(enabledPackSchema),
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
  packs: z.array(packListItemSchema),
  snapshot: workspaceDataSchema,
  hash: z.string(),
  schemaVersion: z.number().int(),
})
export type SaveSlot = z.infer<typeof saveSlotSchema>

export const settingsSchema = z.object({
  reminderDays: z.number().int().positive().default(7),
  reminderSaves: z.number().int().positive().default(10),
  catalogUrl: z.string().default('https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json'),
  /** 当前数据源：legacy＝旧数据仓库（上面的 catalogUrl）；upstream＝5etools 上游源清单（见 core/source/pointer）。默认旧库，读不到清单时自动退回旧库。 */
  dataSource: z.enum(['legacy', 'upstream']).default('legacy'),
  /** 源清单 manifest.json 的地址与备用地址；留空表示未配置。 */
  sourceManifestUrl: z.string().default(''),
  sourceManifestFallbackUrl: z.string().default(''),
  /** 启用扩展包（含导入冒险）时，对官方条目的修改默认应用还是不应用（L1 §2.5）。 */
  variantDefault: z.enum(['apply', 'skip']).default('apply'),
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
