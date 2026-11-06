import { TrpgError } from './errors'
import { SCHEMA_VERSIONS, type RecordKind } from '../schemas/common'

export type Migration = (record: Record<string, unknown>) => Record<string, unknown>
/** 键为"从哪个版本升级"，值把记录升到下一版。 */
export type MigrationTable = Record<RecordKind, Record<number, Migration>>

/** 结构变更的迁移登记；键是「从哪个版本升级」。 */
export const MIGRATIONS: MigrationTable = {
  workspace: {},
  save: {},
}

/**
 * 2026-11-07 起（D2-P2 B2-9 旧格式退役）：战役与存档数据重新从第 4 版开始。
 * 之前的版本带着旧扩展包、旧条目、旧人物数据，驾驶员定为不迁移，读到就明确拒绝。
 */
export const FIRST_SUPPORTED_VERSION = 4

export interface MigrateOptions {
  current?: number
  migrations?: Record<number, Migration>
}

const NEWER_MESSAGE = '这个存档由更新版本的扩展创建，请先更新扩展'

/** 把记录逐级升级到当前版本；版本高于当前时拒绝，不做任何修改。 */
export function migrateRecord<T extends Record<string, unknown>>(kind: RecordKind, record: T, options: MigrateOptions = {}): T {
  const current = options.current ?? SCHEMA_VERSIONS[kind]
  const table = options.migrations ?? MIGRATIONS[kind]
  let version = Number(record.schemaVersion)
  if (!Number.isInteger(version) || version < 0) throw new TrpgError('E_BAD_VERSION', '文件内容损坏：缺少有效的版本号')
  if (version > current) throw new TrpgError('E_NEWER_DATA', NEWER_MESSAGE, { kind, version, current })
  if (!options.migrations && version < FIRST_SUPPORTED_VERSION) throw new TrpgError('E_OLD_DATA', '这是旧版扩展的存档（旧扩展包格式），新版不再读取', { kind, version })
  let out: Record<string, unknown> = record
  while (version < current) {
    const step = table[version]
    if (!step) throw new TrpgError('E_BAD_VERSION', `无法升级版本 ${version} 的数据`, { kind, version })
    out = { ...step(out), schemaVersion: version + 1 }
    version += 1
  }
  return out as T
}
