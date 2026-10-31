import { z } from 'zod'
import { FORMAT_VERSION, idSchema, semverSchema, timestampSchema } from './common'
import { assetRefSchema, textBlockSchema } from './text'

/** formatVersion 2 的库分组；旧格式的 kind 在读取时折算为这里。 */
export const packCategorySchema = z.enum(['rules', 'adventure', 'setting', 'toolkit'])
export type PackCategory = z.infer<typeof packCategorySchema>
/** 旧格式（formatVersion 1）的包类型，只在兼容读取时出现。 */
export const packKindSchema = z.enum(['data', 'module'])
export type PackKind = z.infer<typeof packKindSchema>
export const packSourceSchema = z.enum(['builtin', 'download', 'import', 'user'])
export type PackSource = z.infer<typeof packSourceSchema>

export const dependencySchema = z.object({
  id: idSchema,
  lineage: z.string().min(1).max(80).optional(),
  minVersion: semverSchema.optional(),
})
export type Dependency = z.infer<typeof dependencySchema>

export const relationshipsSchema = z.object({
  requires: z.array(dependencySchema).default([]),
  recommends: z.array(dependencySchema).default([]),
  conflicts: z.array(z.object({ id: idSchema, reason: z.string().max(300).default('') })).default([]),
})
export type Relationships = z.infer<typeof relationshipsSchema>

export const blobInfoSchema = z.object({ hash: z.string().regex(/^[a-f0-9]{64}$/), mime: z.string().min(1).max(40), size: z.number().int().nonnegative() })
export type BlobInfo = z.infer<typeof blobInfoSchema>

export const seriesSchema = z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(120), order: z.number().int().min(1) })

/** 文件内的内容包说明（formatVersion 2）。 */
export const packManifestSchema = z.looseObject({
  id: idSchema,
  ruleId: idSchema,
  category: packCategorySchema,
  name: z.string().min(1).max(80),
  nameEn: z.string().max(120).optional(),
  version: semverSchema,
  minAppVersion: semverSchema.optional(),
  license: z.string().max(200).default(''),
  attribution: z.string().max(4000).default(''),
  description: z.string().max(400).default(''),
  author: z.string().max(120).optional(),
  lineage: z.string().min(1).max(80).optional(),
  entryCount: z.number().int().nonnegative(),
  typeCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
  contributes: z.record(z.string(), z.number().int().nonnegative()).default({}),
  relationships: relationshipsSchema.default({ requires: [], recommends: [], conflicts: [] }),
  series: seriesSchema.optional(),
  blobs: z.array(blobInfoSchema).default([]),
  dataVersion: z.number().int().positive().default(1),
})
export type PackManifest = z.infer<typeof packManifestSchema>

/** 已安装的内容包记录（IndexedDB `packs` 表）。 */
export const packContentSchema = z.object({
  features: z.array(z.unknown()).default([]),
  adventure: z.record(z.string(), z.unknown()).default({}),
  fallback: z.array(z.unknown()).default([]),
})
export type PackContent = z.infer<typeof packContentSchema>

export const installedPackSchema = packManifestSchema.extend({
  source: packSourceSchema,
  byteSize: z.number().int().nonnegative(),
  sha256: z.string(),
  installedAt: timestampSchema,
  schemaVersion: z.number().int(),
  blobHashes: z.array(z.string()).default([]),
  content: packContentSchema.default({ features: [], adventure: {}, fallback: [] }),
})
export type InstalledPack = z.infer<typeof installedPackSchema>

/** 功能贡献的通用外形；具体数据由规则包解释（L1 §2.2.1）。 */
export interface PackFeature {
  id: string
  kind: string
  name: string
  description?: string
  defaultEnabled?: boolean
  stateVersion?: number
  data: Record<string, unknown>
}

/** 条目的英文版：`fields` 是「data 内字段路径 → 英文文字（字符串或整段文字块）」的平铺表。 */
export const entryI18nSchema = z.object({
  en: z.object({
    name: z.string().min(1).max(240),
    summary: z.string().optional(),
    fields: z.record(z.string(), z.union([z.string(), z.array(textBlockSchema)])).default({}),
  }),
})

export const entrySchema = z.looseObject({
  id: z.string().min(1).max(160),
  type: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  nameEn: z.string().max(240).optional(),
  keywords: z.array(z.string()).default([]),
  unique: z.boolean().default(false),
  summary: z.string().default(''),
  data: z.record(z.string(), z.unknown()).default({}),
  image: z.union([z.string(), assetRefSchema]).optional(),
  i18n: entryI18nSchema.optional(),
})
export type Entry = z.infer<typeof entrySchema>

/** 存入 `entries` 表的条目：带所属内容包与规则。 */
export interface StoredEntry {
  packId: string
  entryId: string
  ruleId: string
  type: string
  name: string
  nameEn?: string
  keywords: string[]
  unique: boolean
  summary: string
  data: Record<string, unknown>
  image?: string | { $asset: string }
  override?: unknown
}

export const packFileManifestSchema = z.object({
  format: z.literal('trpg-pack'),
  formatVersion: z.number().int().positive(),
  pack: z.record(z.string(), z.unknown()),
})
export const saveFileManifestSchema = z.object({
  format: z.enum(['trpg-save', 'trpg-backup']),
  formatVersion: z.number().int().positive(),
  appVersion: z.string(),
  exportedAt: z.string(),
  ruleIds: z.array(z.string()),
})
export type SaveFileManifest = z.infer<typeof saveFileManifestSchema>

export const packListItemSchema = z.object({ id: idSchema, version: semverSchema, name: z.string() })
export type PackListItem = z.infer<typeof packListItemSchema>

export const catalogSchema = z.object({
  formatVersion: z.number().int(),
  rules: z
    .array(
      z.object({
        id: idSchema,
        name: z.string(),
        nameShort: z.string(),
        status: z.enum(['installable', 'coming']),
        description: z.string().default(''),
      }),
    )
    .default([]),
  packs: z
    .array(
      z.object({
        id: idSchema,
        ruleId: idSchema,
        category: packCategorySchema,
        name: z.string(),
        nameEn: z.string().optional(),
        version: semverSchema,
        license: z.string().default(''),
        description: z.string().default(''),
        typeCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
        contributes: z.record(z.string(), z.number().int().nonnegative()).default({}),
        relationships: relationshipsSchema.default({ requires: [], recommends: [], conflicts: [] }),
        lineage: z.string().optional(),
        series: seriesSchema.optional(),
        byteSize: z.number().int().nonnegative(),
        sha256: z.string(),
        url: z.string(),
        updatedAt: z.string().optional(),
        recommended: z.boolean().default(false),
        group: z.string().optional(),
      }),
    )
    .default([]),
})
export type Catalog = z.infer<typeof catalogSchema>
export type CatalogPack = Catalog['packs'][number]

export { FORMAT_VERSION }
