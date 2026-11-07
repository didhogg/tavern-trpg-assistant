import { z } from 'zod'

export const SCHEMA_VERSIONS = { workspace: 5, save: 5 } as const
export type RecordKind = keyof typeof SCHEMA_VERSIONS

/** 存档文件 .trpgsave 的格式版本，变更时递增。3 起（B2-9）不再带旧扩展包；4 起带结算内核依赖清单。 */
export const FORMAT_VERSION = 4

export const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, '必须是小写字母、数字与短横线').max(64)
export const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/, '必须是 x.y.z 形式的版本号')
export const timestampSchema = z.number().int().nonnegative()
