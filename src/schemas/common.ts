import { z } from 'zod'

export const SCHEMA_VERSIONS = { workspace: 1, save: 1, pack: 2 } as const
export type RecordKind = keyof typeof SCHEMA_VERSIONS

/** 文件格式版本：.trpgpack / .trpgsave 共用，变更时递增。 */
export const FORMAT_VERSION = 2
/** 读得懂的旧格式版本（formatVersion 1 的包在识别时转换）。 */
export const LEGACY_FORMAT_VERSION = 1
/** 本版本能读的条目数据版本（D1 dataVersion）。 */
export const SUPPORTED_DATA_VERSION = 1

export const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, '必须是小写字母、数字与短横线').max(64)
/** 条目与内容项 id：允许点号分段，如 spell.fireball.phb。 */
export const entryIdSchema = z.string().regex(/^[a-z0-9][a-z0-9.-]*$/, '必须是小写字母、数字、点与短横线').max(200)
export const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/, '必须是 x.y.z 形式的版本号')
export const timestampSchema = z.number().int().nonnegative()
