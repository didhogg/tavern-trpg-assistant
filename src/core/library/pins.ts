import type { TrpgDatabase } from '../db'
import type { WorkspaceData } from '../../schemas/campaign'
import type { Entry, StoredEntry } from '../../schemas/pack'
import { entryKey, libraryOf, withLibrary } from './types'

/** 库里存的条目 → 条目（去掉所属包与规则）。 */
export function toEntry(stored: StoredEntry): Entry {
  const { entryId, packId: _p, ruleId: _r, override: _o, ...rest } = stored
  return { ...rest, id: entryId }
}

/** 固定一个库中条目的原版（已固定则不变；条目或所在包找不到时返回 null）。 */
export async function pinEntry(db: TrpgDatabase, data: WorkspaceData, packId: string, entryId: string, now: number): Promise<WorkspaceData | null> {
  const key = entryKey(packId, entryId)
  const lib = libraryOf(data)
  if (lib.pins[key]) return data
  const [stored, pack] = await Promise.all([db.entries.get([packId, entryId]), db.packs.get(packId)])
  if (!stored || !pack) return null
  return withLibrary(data, { pins: { ...lib.pins, [key]: { version: pack.version, entry: toEntry(stored), pinnedAt: now } } })
}

export interface OutdatedPin {
  key: string
  pinnedVersion: string
  libraryVersion: string
}

/** 已固定的条目中，库里的包已是不同版本的（人物与资料单元据此提供差异界面）。 */
export async function outdatedPins(db: TrpgDatabase, data: WorkspaceData): Promise<OutdatedPin[]> {
  const out: OutdatedPin[] = []
  for (const [key, pin] of Object.entries(libraryOf(data).pins)) {
    const packId = key.slice(0, key.indexOf('/'))
    const pack = await db.packs.get(packId)
    if (pack && pack.version !== pin.version) out.push({ key, pinnedVersion: pin.version, libraryVersion: pack.version })
  }
  return out
}

/** 重新固定：用库里当前的条目替换固定副本（调用方先写自动存档）。 */
export async function repin(db: TrpgDatabase, data: WorkspaceData, key: string, now: number): Promise<WorkspaceData | null> {
  const slash = key.indexOf('/')
  const lib = libraryOf(data)
  const { [key]: _old, ...rest } = lib.pins
  return pinEntry(db, withLibrary(data, { pins: rest }), key.slice(0, slash), key.slice(slash + 1), now)
}

/** 保存时清理：没有被任何引用、变体或副本指向的固定条目。refKeys 是整个当前数据里被引用到的 `packId/entryId`。 */
export function prunePins(data: WorkspaceData, refKeys: Set<string>): WorkspaceData {
  const lib = libraryOf(data)
  const keep: typeof lib.pins = {}
  for (const [key, pin] of Object.entries(lib.pins)) if (refKeys.has(key) || lib.variants[key]) keep[key] = pin
  return Object.keys(keep).length === Object.keys(lib.pins).length ? data : withLibrary(data, { pins: keep })
}

/** 当前数据里被引用到的库条目：`$ref: pack` 与副本的 sourceRef。 */
export function collectPackRefKeys(data: WorkspaceData): Set<string> {
  const keys = new Set<string>()
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(walk)
    else if (value && typeof value === 'object') {
      const o = value as Record<string, unknown>
      if (o.$ref === 'pack' && typeof o.packId === 'string' && typeof o.entryId === 'string') keys.add(entryKey(o.packId, o.entryId))
      for (const [k, v] of Object.entries(o)) if (k !== 'pins') walk(v)
    }
  }
  walk(data)
  for (const inst of data.instances) if (inst.sourceRef) keys.add(entryKey(inst.sourceRef.packId, inst.sourceRef.entryId))
  return keys
}
