import { TrpgError } from './errors'
import { SCHEMA_VERSIONS, type RecordKind } from '../schemas/common'

export type Migration = (record: Record<string, unknown>) => Record<string, unknown>
/** 键为"从哪个版本升级"，值把记录升到下一版。 */
export type MigrationTable = Record<RecordKind, Record<number, Migration>>

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)

/** 5→6：旧存档里的人物还是整份条目全文。原样保留到 legacyState，标旧格式；不丢、不猜。 */
function kernelV6(record: Record<string, unknown>, holderKey: 'data' | 'snapshot'): Record<string, unknown> {
  const holder = isObject(record[holderKey]) ? record[holderKey] as Record<string, unknown> : null
  const kernel = holder && isObject(holder.kernel) ? holder.kernel as Record<string, unknown> : null
  if (!holder || !kernel) return record
  const actors = Array.isArray(kernel.actors) ? kernel.actors : []
  let legacy = kernel.legacy === true
  const nextActors = actors.map((actor) => {
    if (!isObject(actor)) return actor
    const state = actor.state
    if (!isObject(state)) return actor
    const full = Array.isArray(state.items) || Array.isArray(state.effects) || Array.isArray(state.actor)
    if (!full) return actor
    legacy = true
    return { ...actor, state: {}, legacy: true, legacyState: state }
  })
  return { ...record, [holderKey]: { ...holder, kernel: { ...kernel, actors: nextActors, legacy } } }
}

/** 6→7（T3）：人物种子记进存档；旧存档没有种子，按建卡旧规则用名字。 */
function kernelV7(record: Record<string, unknown>, holderKey: 'data' | 'snapshot'): Record<string, unknown> {
  const holder = isObject(record[holderKey]) ? record[holderKey] as Record<string, unknown> : null
  const kernel = holder && isObject(holder.kernel) ? holder.kernel as Record<string, unknown> : null
  if (!holder || !kernel || !Array.isArray(kernel.actors)) return record
  const actors = kernel.actors.map((actor) => isObject(actor) ? { ...actor, seed: typeof actor.seed === 'string' && actor.seed ? actor.seed : String(actor.name ?? actor.id ?? '') } : actor)
  return { ...record, [holderKey]: { ...holder, kernel: { ...kernel, actors } } }
}

/** 7→8（T4）：状态差别里的物品 ID 改成作者引用键；旧存档用 refs.itemId 对照。 */
function kernelV8(record: Record<string, unknown>, holderKey: 'data' | 'snapshot'): Record<string, unknown> {
  const holder = isObject(record[holderKey]) ? record[holderKey] as Record<string, unknown> : null
  const kernel = holder && isObject(holder.kernel) ? holder.kernel as Record<string, unknown> : null
  if (!holder || !kernel || !Array.isArray(kernel.actors)) return record
  const actors = kernel.actors.map((actor) => {
    if (!isObject(actor) || !isObject(actor.state) || !Array.isArray(actor.refs)) return actor
    const map = new Map<string, string>()
    for (const ref of actor.refs) {
      if (!isObject(ref) || typeof ref.itemId !== 'string') continue
      if (typeof ref.kind === 'string' && typeof ref.hash === 'string') map.set(ref.itemId, `ref:${ref.kind}|${ref.hash}`)
    }
    if (!map.size) return actor
    const state = actor.state as Record<string, unknown>
    const items = isObject(state.items) ? state.items : {}
    const nextItems: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(items)) nextItems[map.get(key) ?? key] = value
    const removed = Array.isArray(state.itemRemoved) ? state.itemRemoved.map((key) => typeof key === 'string' ? (map.get(key) ?? key) : key) : state.itemRemoved
    return { ...actor, state: { ...state, items: nextItems, itemRemoved: removed } }
  })
  return { ...record, [holderKey]: { ...holder, kernel: { ...kernel, actors } } }
}

/** 结构变更的迁移登记；键是「从哪个版本升级」。 */
export const MIGRATIONS: MigrationTable = {
  // 第 5 版（P3-3）：workspace / save 增加可选的 kernel 段（规则、选书、引用、选择、状态、修订、撤销）。
  // 第 6 版（P3-3b）：人物改为引用/选择/状态差别；旧格式整份内容保留到 legacyState，标 legacy。
  // 第 9 版（P5 反馈 2026-11-12）：加可选的战役编号 campaignId。单条记录算不出属于哪棵存档树，
  // 这一步不改内容；编号在第一次读到时按存档树根补上（CampaignService.campaignIdOf），和旧的 campaignLibrary:<树根> 键一致，原有选书设置不丢。
  workspace: { 4: (record) => record, 5: (record) => kernelV6(record, 'data'), 6: (record) => kernelV7(record, 'data'), 7: (record) => kernelV8(record, 'data'), 8: (record) => record },
  save: { 4: (record) => record, 5: (record) => kernelV6(record, 'snapshot'), 6: (record) => kernelV7(record, 'snapshot'), 7: (record) => kernelV8(record, 'snapshot'), 8: (record) => record },
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
