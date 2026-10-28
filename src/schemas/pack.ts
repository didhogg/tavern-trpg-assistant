import { z } from 'zod'
import { FORMAT_VERSION, idSchema, semverSchema, timestampSchema } from './common'

export const packKindSchema = z.enum(['data', 'module'])
export const packSourceSchema = z.enum(['builtin', 'download', 'import'])
export type PackKind = z.infer<typeof packKindSchema>
export type PackSource = z.infer<typeof packSourceSchema>

const dependencySchema = z.object({ id: idSchema, minVersion: semverSchema.optional() })

/** 文件内的内容包说明（数据包与模组扩展同构，仅 kind 不同）。 */
export const packManifestSchema = z.object({
  id: idSchema,
  ruleId: idSchema,
  kind: packKindSchema,
  name: z.string().min(1).max(80),
  nameEn: z.string().max(120).optional(),
  version: semverSchema,
  minAppVersion: semverSchema.optional(),
  license: z.string().max(200).default(''),
  attribution: z.string().max(4000).default(''),
  description: z.string().max(400).default(''),
  entryCount: z.number().int().nonnegative(),
  typeCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
  dependsOn: z.array(dependencySchema).default([]),
})
export type PackManifest = z.infer<typeof packManifestSchema>

/** 已安装的内容包记录（IndexedDB `packs` 表）。 */
export const installedPackSchema = packManifestSchema.extend({
  source: packSourceSchema,
  byteSize: z.number().int().nonnegative(),
  sha256: z.string(),
  installedAt: timestampSchema,
  schemaVersion: z.number().int(),
})
export type InstalledPack = z.infer<typeof installedPackSchema>

export const entrySchema = z.object({
  id: z.string().min(1).max(160),
  type: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  nameEn: z.string().max(240).optional(),
  keywords: z.array(z.string()).default([]),
  unique: z.boolean().default(false),
  summary: z.string().default(''),
  data: z.record(z.string(), z.unknown()).default({}),
  image: z.string().optional(),
})
export type Entry = z.infer<typeof entrySchema>

/** 存入 `entries` 表的条目：带所属内容包与规则。 */
export interface StoredEntry extends Omit<Entry, 'id'> {
  packId: string
  entryId: string
  ruleId: string
}

export const packFileManifestSchema = z.object({
  format: z.literal('trpg-pack'),
  formatVersion: z.number().int().max(FORMAT_VERSION),
  pack: packManifestSchema,
})

export const saveFileManifestSchema = z.object({
  format: z.enum(['trpg-save', 'trpg-backup']),
  formatVersion: z.number().int().max(FORMAT_VERSION),
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
      packManifestSchema.pick({ id: true, ruleId: true, kind: true, name: true, nameEn: true, version: true, license: true, description: true, typeCounts: true, dependsOn: true }).extend({
        byteSize: z.number().int().nonnegative(),
        sha256: z.string(),
        url: z.string(),
        updatedAt: z.string().optional(),
      }),
    )
    .default([]),
})
export type Catalog = z.infer<typeof catalogSchema>
export type CatalogPack = Catalog['packs'][number]
