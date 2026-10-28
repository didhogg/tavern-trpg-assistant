import type { TrpgDatabase } from '../db'
import { isQuotaError, QUOTA_MESSAGE, TrpgError } from '../errors'
import { compareVersions } from '../semver'
import { SCHEMA_VERSIONS } from '../../schemas/common'
import type { SaveSlot } from '../../schemas/campaign'
import type { Entry, InstalledPack, PackKind, PackSource, StoredEntry } from '../../schemas/pack'
import type { RuleRegistry } from '../../rules/registry'
import { buildPackFile } from './file'
import { recognizeFile, type Recognized, type RecognizedPack } from './recognize'

export interface PackServiceDeps {
  rules: RuleRegistry
  now: () => number
  appVersion: string
  /** 安装、覆盖、删除后通知（搜索索引、界面刷新等订阅）。 */
  onChange?: (change: { type: 'installed' | 'uninstalled'; packId: string }) => void
}

export type InstallPlan =
  | { action: 'install' }
  | { action: 'overwrite'; relation: 'newer' | 'same' | 'older'; installed: InstalledPack; blocked?: 'builtin-downgrade' }
  | { action: 'name-conflict'; existing: InstalledPack; canReplace: boolean }

/** overwrite：同 id 覆盖；keep-both / replace：不同 id 同名时的两种处理。 */
export type Resolution = 'overwrite' | 'keep-both' | 'replace'

function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** 数据包与模组扩展共用的安装、覆盖、删除、导出流程；`kind` 只影响界面文字。 */
export class PackService {
  constructor(
    private readonly db: TrpgDatabase,
    private readonly deps: PackServiceDeps,
  ) {}

  recognize(bytes: Uint8Array): Recognized {
    return recognizeFile(bytes, { appVersion: this.deps.appVersion, hasRule: (id) => this.deps.rules.has(id) })
  }

  async list(filter: { ruleId?: string; kind?: PackKind } = {}): Promise<InstalledPack[]> {
    const all = await this.db.packs.toArray()
    return all
      .filter((p) => (!filter.ruleId || p.ruleId === filter.ruleId) && (!filter.kind || p.kind === filter.kind))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  }

  async plan(rec: RecognizedPack): Promise<InstallPlan> {
    const installed = await this.db.packs.get(rec.manifest.id)
    if (installed) {
      const cmp = compareVersions(rec.manifest.version, installed.version)
      const relation = cmp > 0 ? 'newer' : cmp === 0 ? 'same' : 'older'
      const blocked = relation === 'older' && installed.source === 'builtin' ? 'builtin-downgrade' : undefined
      return { action: 'overwrite', relation, installed, ...(blocked ? { blocked } : {}) }
    }
    const peers = await this.db.packs.where('ruleId').equals(rec.manifest.ruleId).toArray()
    const existing = peers.find((p) => p.kind === rec.manifest.kind && sameName(p.name, rec.manifest.name))
    if (existing) return { action: 'name-conflict', existing, canReplace: existing.source !== 'builtin' }
    return { action: 'install' }
  }

  async install(rec: RecognizedPack, opts: { source: PackSource; resolution?: Resolution }): Promise<InstalledPack> {
    const plan = await this.plan(rec)
    let name = rec.manifest.name
    let removeFirst: string | undefined
    if (plan.action === 'overwrite') {
      if (plan.blocked) throw new TrpgError('E_BUILTIN_DOWNGRADE', '内置数据包不能降级')
      // 下载与更新是玩家已明确选择的操作，同 id 直接覆盖
      const resolution = opts.resolution ?? (opts.source === 'download' ? 'overwrite' : undefined)
      if (resolution !== 'overwrite') throw new TrpgError('E_CONFLICT_UNRESOLVED', '已安装同一个内容包，需要先选择是否覆盖')
    } else if (plan.action === 'name-conflict') {
      if (opts.resolution === 'keep-both') name = await this.uniqueName(rec.manifest.ruleId, rec.manifest.kind, name)
      else if (opts.resolution === 'replace') {
        if (!plan.canReplace) throw new TrpgError('E_BUILTIN_PROTECTED', '内置内容包不能被替换')
        removeFirst = plan.existing.id
      } else throw new TrpgError('E_CONFLICT_UNRESOLVED', '已有同名内容包，需要先选择处理方式')
    }
    const record: InstalledPack = {
      ...rec.manifest,
      name,
      source: opts.source,
      byteSize: rec.byteSize,
      sha256: rec.sha256,
      installedAt: this.deps.now(),
      schemaVersion: SCHEMA_VERSIONS.pack,
    }
    const stored: StoredEntry[] = rec.entries.map(({ id, ...rest }) => ({ ...rest, entryId: id, packId: record.id, ruleId: record.ruleId }))
    try {
      await this.db.transaction('rw', [this.db.packs, this.db.entries, this.db.assets, this.db.searchIndex, this.db.workspaces], async () => {
        if (removeFirst) await this.removeRows(removeFirst)
        await this.removeRows(record.id)
        await this.db.packs.put(record)
        await this.db.entries.bulkPut(stored)
        await this.db.assets.bulkPut([...rec.assets].map(([path, bytes]) => ({ packId: record.id, path, bytes })))
        await this.db.workspaces.toCollection().modify((ws) => {
          for (const p of ws.enabledPacks) if (p.id === record.id) p.version = record.version
        })
      })
    } catch (error) {
      if (isQuotaError(error)) throw new TrpgError('E_QUOTA', QUOTA_MESSAGE)
      throw error
    }
    if (removeFirst) this.deps.onChange?.({ type: 'uninstalled', packId: removeFirst })
    this.deps.onChange?.({ type: 'installed', packId: record.id })
    return record
  }

  /** 内置包：未安装或内置版本更高时安装，否则跳过；从不降级。 */
  async installBuiltin(bytes: Uint8Array): Promise<'installed' | 'upgraded' | 'skipped'> {
    const rec = this.recognize(bytes)
    if (rec.type !== 'pack') throw new TrpgError('E_BAD_CONTENT', '文件内容损坏：内置文件不是内容包')
    const installed = await this.db.packs.get(rec.manifest.id)
    if (installed && compareVersions(rec.manifest.version, installed.version) <= 0) return 'skipped'
    await this.install(rec, { source: 'builtin', resolution: installed ? 'overwrite' : undefined })
    return installed ? 'upgraded' : 'installed'
  }

  async uninstall(packId: string): Promise<void> {
    const pack = await this.db.packs.get(packId)
    if (!pack) throw new TrpgError('E_NOT_FOUND', '没有找到这个内容包')
    if (pack.source === 'builtin') throw new TrpgError('E_BUILTIN_PROTECTED', '内置内容包不能删除')
    await this.db.transaction('rw', [this.db.packs, this.db.entries, this.db.assets, this.db.searchIndex], () => this.removeRows(packId))
    this.deps.onChange?.({ type: 'uninstalled', packId })
  }

  /** 引用了这个内容包的存档（不含最近删除）。 */
  async referencingSaves(packId: string): Promise<SaveSlot[]> {
    const saves = await this.db.saves.toArray()
    return saves.filter((s) => s.deletedAt === undefined && s.packs.some((p) => p.id === packId))
  }

  async exportPack(packId: string): Promise<Uint8Array> {
    const pack = await this.db.packs.get(packId)
    if (!pack) throw new TrpgError('E_NOT_FOUND', '没有找到这个内容包')
    const stored = await this.db.entries.where('packId').equals(packId).toArray()
    const entries: Entry[] = stored.map(({ entryId, packId: _p, ruleId: _r, ...rest }) => ({ ...rest, id: entryId }))
    const assets = new Map((await this.db.assets.where('packId').equals(packId).toArray()).map((a) => [a.path, a.bytes] as const))
    const { source: _s, byteSize: _b, sha256: _h, installedAt: _i, schemaVersion: _v, entryCount: _c, typeCounts: _t, ...manifest } = pack
    return buildPackFile({ manifest, entries, assets })
  }

  private async removeRows(packId: string): Promise<void> {
    await this.db.entries.where('packId').equals(packId).delete()
    await this.db.assets.where('packId').equals(packId).delete()
    await this.db.searchIndex.delete(packId)
    await this.db.packs.delete(packId)
  }

  private async uniqueName(ruleId: string, kind: PackKind, base: string): Promise<string> {
    const peers = await this.db.packs.where('ruleId').equals(ruleId).toArray()
    for (let n = 2; ; n++) {
      const candidate = `${base}（${n}）`
      if (!peers.some((p) => p.kind === kind && sameName(p.name, candidate))) return candidate
    }
  }
}
