import { TrpgError } from './errors'
import { SCHEMA_VERSIONS, type RecordKind } from '../schemas/common'

export type Migration = (record: Record<string, unknown>) => Record<string, unknown>
/** 键为"从哪个版本升级"，值把记录升到下一版。 */
export type MigrationTable = Record<RecordKind, Record<number, Migration>>

/** U6：只补 people / tags / party 三个键；旧数据其余键原样保留。 */
function addPeopleFields(data: unknown): unknown {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data
  const rec = data as Record<string, unknown>
  return {
    ...rec,
    people: Array.isArray(rec.people) ? rec.people : [],
    tags: Array.isArray(rec.tags) ? rec.tags : [],
    party: rec.party && typeof rec.party === 'object' && !Array.isArray(rec.party) ? rec.party : { name: '' },
  }
}

const CATEGORY_PREFIX: Array<[RegExp, string]> = [[/^(condition|状态)/, 'condition'], [/^(status)/, 'status'], [/^(disease|疾病)/, 'disease'], [/^(spell|法术)/, 'spell']]

/** 旧 {name, ref?, note?, duration?: 文字} → 结构化人物效果（U5R §12.4）；已是新结构的原样保留。 */
export function migratePersonEffect(old: unknown, index: number): unknown {
  if (!old || typeof old !== 'object' || Array.isArray(old)) return old
  const e = old as Record<string, unknown>
  if (typeof e.id === 'string' && typeof e.category === 'string') return e
  const ref = typeof e.ref === 'string' ? e.ref : undefined
  const category = ref ? (CATEGORY_PREFIX.find(([re]) => re.test(ref))?.[1] ?? 'other') : 'other'
  const oldDuration = typeof e.duration === 'string' && e.duration ? e.duration : undefined
  const note = [typeof e.note === 'string' ? e.note : '', oldDuration ? `时长：${oldDuration}` : ''].filter(Boolean).join('；')
  const out: Record<string, unknown> = { id: `fx-migrated-${index + 1}`, category, name: e.name, concentration: false, addedAt: 0 }
  if (ref) out.ref = ref
  if (note) out.note = note.slice(0, 400)
  return out
}

/** 只改 people[].effects；其余键原样保留。 */
function structureEffects(data: unknown): unknown {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data
  const rec = data as Record<string, unknown>
  if (!Array.isArray(rec.people)) return data
  return {
    ...rec,
    people: rec.people.map((p) => {
      if (!p || typeof p !== 'object' || Array.isArray(p)) return p
      const person = p as Record<string, unknown>
      return Array.isArray(person.effects) ? { ...person, effects: person.effects.map(migratePersonEffect) } : p
    }),
  }
}

/** 结构变更的迁移登记；键是「从哪个版本升级」。 */
export const MIGRATIONS: MigrationTable = {
  workspace: { 1: (record) => ({ ...record, data: addPeopleFields(record.data) }), 2: (record) => ({ ...record, data: structureEffects(record.data) }) },
  save: { 1: (record) => ({ ...record, snapshot: addPeopleFields(record.snapshot) }), 2: (record) => ({ ...record, snapshot: structureEffects(record.snapshot) }) },
  pack: {},
}

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
  let out: Record<string, unknown> = record
  while (version < current) {
    const step = table[version]
    if (!step) throw new TrpgError('E_BAD_VERSION', `无法升级版本 ${version} 的数据`, { kind, version })
    out = { ...step(out), schemaVersion: version + 1 }
    version += 1
  }
  return out as T
}
