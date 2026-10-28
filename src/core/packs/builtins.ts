import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import type { Catalog, CatalogPack, InstalledPack } from '../../schemas/pack'
import type { RuleDefinition } from '../../rules/registry'
import { downloadPack, installDownloaded } from './catalog'
import type { PackService } from './installer'

export interface AutoInstallState {
  done: boolean
  at?: number
}

export interface BuiltinInstallResult {
  installed: string[]
  skipped: string[]
  removed: string[]
  failed: Array<{ id: string; message: string }>
}

async function listMeta(db: TrpgDatabase, key: string): Promise<string[]> {
  const value = await db.getMeta<unknown>(key)
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : []
}

export async function getBuiltinRemoved(db: TrpgDatabase): Promise<string[]> {
  return listMeta(db, 'builtinRemoved')
}

export async function setBuiltinRemoved(db: TrpgDatabase, packId: string, removed: boolean): Promise<void> {
  const list = new Set(await listMeta(db, 'builtinRemoved'))
  if (removed) list.add(packId)
  else list.delete(packId)
  await db.setMeta('builtinRemoved', [...list])
}

export async function getUserRemoved(db: TrpgDatabase): Promise<string[]> {
  return listMeta(db, 'userRemoved')
}

export async function setUserRemoved(db: TrpgDatabase, packId: string, removed: boolean): Promise<void> {
  const list = new Set(await listMeta(db, 'userRemoved'))
  if (removed) list.add(packId)
  else list.delete(packId)
  await db.setMeta('userRemoved', [...list])
}

/** 启动时安装内置包：跳过玩家卸载过的 id；其余只升级、不降级。 */
export async function installBuiltinPacks(
  db: TrpgDatabase,
  packs: PackService,
  rule: RuleDefinition,
  load: (packId: string) => Promise<Uint8Array>,
): Promise<BuiltinInstallResult> {
  const removed = new Set(await getBuiltinRemoved(db))
  const ids = rule.builtinPacks ?? rule.corePackIds
  const result: BuiltinInstallResult = { installed: [], skipped: [], removed: [], failed: [] }
  for (const id of ids) {
    if (removed.has(id)) {
      result.removed.push(id)
      continue
    }
    try {
      const status = await packs.installBuiltin(await load(id))
      ;(status === 'skipped' ? result.skipped : result.installed).push(id)
    } catch (error) {
      result.failed.push({ id, message: error instanceof Error ? error.message : String(error) })
    }
  }
  return result
}

export interface RecommendedResult {
  status: 'done' | 'partial' | 'skipped'
  installed: string[]
  skippedUserRemoved: string[]
  skippedBuiltinRemoved: string[]
  failed: Array<{ id: string; message: string }>
}

/** L1 §3.3：首次使用规则时安装目录中的 recommended 包。失败时保留未完成状态。 */
export async function autoInstallRecommended(deps: {
  db: TrpgDatabase
  packs: PackService
  catalog: Catalog
  ruleId: string
  catalogUrl?: string
  fetchBytes?: (pack: CatalogPack) => Promise<Uint8Array>
}): Promise<RecommendedResult> {
  const { db, packs, catalog, ruleId } = deps
  const state = (await db.getMeta<Record<string, AutoInstallState>>('autoInstall'))?.[ruleId]
  const result: RecommendedResult = { status: 'skipped', installed: [], skippedUserRemoved: [], skippedBuiltinRemoved: [], failed: [] }
  if (state?.done) return result
  const userRemoved = new Set(await getUserRemoved(db))
  const builtinRemoved = new Set(await getBuiltinRemoved(db))
  const installed = new Set((await packs.list({ ruleId })).map((p) => p.id))
  const recommended = catalog.packs.filter((p) => p.ruleId === ruleId && p.recommended)
  for (const pack of recommended) {
    if (installed.has(pack.id)) continue
    if (userRemoved.has(pack.id)) {
      result.skippedUserRemoved.push(pack.id)
      continue
    }
    if (builtinRemoved.has(pack.id)) {
      result.skippedBuiltinRemoved.push(pack.id)
      continue
    }
    try {
      const url = deps.catalogUrl ?? 'https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json'
      const bytes = deps.fetchBytes ? await deps.fetchBytes(pack) : await downloadPack(pack, { catalogUrl: url })
      const record: InstalledPack = await installDownloaded(packs, bytes, pack)
      installed.add(record.id)
      result.installed.push(pack.id)
    } catch (error) {
      if (error instanceof TrpgError && error.code === 'E_CANCELLED') throw error
      result.failed.push({ id: pack.id, message: error instanceof Error ? error.message : String(error) })
    }
  }
  result.status = result.failed.length ? 'partial' : 'done'
  const all: Record<string, AutoInstallState> = { ...((await db.getMeta<Record<string, AutoInstallState>>('autoInstall')) ?? {}) }
  all[ruleId] = result.status === 'done' ? { done: true, at: Date.now() } : { done: false }
  await db.setMeta('autoInstall', all)
  return result
}
