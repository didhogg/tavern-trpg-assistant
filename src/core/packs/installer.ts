import type { TrpgDatabase } from '../db'
import { isQuotaError, QUOTA_MESSAGE, TrpgError } from '../errors'
import { compareVersions } from '../semver'
import { SCHEMA_VERSIONS } from '../../schemas/common'
import type { SaveSlot } from '../../schemas/campaign'
import type { Dependency, Entry, InstalledPack, PackCategory, PackSource, StoredEntry } from '../../schemas/pack'
import type { RuleRegistry } from '../../rules/registry'
import { featureSupport } from '../../rules/dnd5e2014/data/features'
import { buildPackFile } from './file'
import { recognizeFile, type Recognized, type RecognizedPack } from './recognize'

export interface PackServiceDeps {
  rules: RuleRegistry
  now: () => number
  appVersion: string
  /** 安装、覆盖、删除后通知（搜索索引、界面刷新等订阅）。 */
  onChange?: (change: { type: 'installed' | 'uninstalled'; packId: string }) => void
}

export interface InstallPlan {
  action: 'install' | 'overwrite' | 'name-conflict'
  relation?: 'newer' | 'same' | 'older'
  installed?: InstalledPack
  existing?: InstalledPack
  canReplace?: boolean
  blocked?: 'builtin-downgrade' | 'lineage-mismatch'
  lineage?: { installed?: string; incoming?: string }
  /** 同 id、同版本，但文件内容不同（L1 §3.5）。 */
  contentChanged?: boolean
  missingRequires: Dependency[]
  missingRecommends: Dependency[]
  conflicts: Array<{ id: string; reason: string; installedVersion: string }>
  unsupportedFeatures: Array<{ kind: string; count: number }>
}

/** overwrite：同 id 覆盖；keep-both / replace：不同 id 同名时的两种处理。 */
export type Resolution = 'overwrite' | 'keep-both' | 'replace'

function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function missingDependencies(deps: Dependency[], installed: Map<string, InstalledPack>): Dependency[] {
  return deps.filter((dep) => {
    const have = installed.get(dep.id)
    if (!have) return true
    return dep.minVersion ? compareVersions(have.version, dep.minVersion) < 0 : false
  })
}

/** 数据包与冒险扩展现共用安装、覆盖、删除、导出流程；category 只影响库分组。 */
export class PackService {
  constructor(
    private readonly db: TrpgDatabase,
    private readonly deps: PackServiceDeps,
  ) {}

  recognize(bytes: Uint8Array): Recognized {
    return recognizeFile(bytes, { appVersion: this.deps.appVersion, hasRule: (id) => this.deps.rules.has(id) })
  }

  async list(filter: { ruleId?: string; category?: PackCategory } = {}): Promise<InstalledPack[]> {
    const all = await this.db.packs.toArray()
    return all
      .filter((p) => (!filter.ruleId || p.ruleId === filter.ruleId) && (!filter.category || p.category === filter.category))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  }

  async plan(rec: RecognizedPack): Promise<InstallPlan> {
    const installed = await this.db.packs.get(rec.manifest.id)
    const all = new Map((await this.db.packs.toArray()).map((p) => [p.id, p]))
    const base: InstallPlan = {
      action: 'install',
      missingRequires: missingDependencies(rec.manifest.relationships.requires, all),
      missingRecommends: missingDependencies(rec.manifest.relationships.recommends, all),
      conflicts: rec.manifest.relationships.conflicts
        .filter((c) => all.has(c.id))
        .map((c) => ({ id: c.id, reason: c.reason, installedVersion: all.get(c.id)!.version })),
      unsupportedFeatures: countUnsupported(rec),
    }
    if (installed) {
      const cmp = compareVersions(rec.manifest.version, installed.version)
      const relation = cmp > 0 ? 'newer' : cmp === 0 ? 'same' : 'older'
      const lineageDiffers = !!installed.lineage && !!rec.manifest.lineage && installed.lineage !== rec.manifest.lineage
      const blocked = lineageDiffers ? 'lineage-mismatch' : relation === 'older' && installed.source === 'builtin' ? 'builtin-downgrade' : undefined
      return {
        ...base,
        action: 'overwrite',
        relation,
        installed,
        lineage: { installed: installed.lineage, incoming: rec.manifest.lineage },
        contentChanged: relation === 'same' && installed.sha256 !== rec.sha256,
        ...(blocked ? { blocked } : {}),
      }
    }
    const peers = await this.db.packs.where('ruleId').equals(rec.manifest.ruleId).toArray()
    const existing = peers.find((p) => p.category === rec.manifest.category && sameName(p.name, rec.manifest.name))
    if (existing) return { ...base, action: 'name-conflict', existing, canReplace: existing.source !== 'builtin' }
    return base
  }

  async install(rec: RecognizedPack, opts: { source: PackSource; resolution?: Resolution }): Promise<InstalledPack> {
    const plan = await this.plan(rec)
    if (plan.blocked === 'lineage-mismatch') {
      throw new TrpgError('E_LINEAGE', `已安装的「${plan.installed?.name ?? rec.manifest.id}」与这个文件编号相同但来源不同。先卸载已安装的，或请作者更换编号。`, { packId: rec.manifest.id })
    }
    if (plan.missingRequires.length) {
      throw new TrpgError('E_DEP_MISSING', `缺少它需要的扩展包：${plan.missingRequires.map((d) => d.id).join('、')}`, { missing: plan.missingRequires })
    }
    let name = rec.manifest.name
    let removeFirst: string | undefined
    if (plan.action === 'overwrite') {
      if (plan.blocked) throw new TrpgError('E_BUILTIN_DOWNGRADE', '内置数据包不能降级')
      const resolution = opts.resolution ?? (opts.source === 'download' ? 'overwrite' : undefined)
      if (resolution !== 'overwrite') throw new TrpgError('E_CONFLICT_UNRESOLVED', '已安装同一个内容包，需要先选择是否覆盖')
    } else if (plan.action === 'name-conflict') {
      if (opts.resolution === 'keep-both') name = await this.uniqueName(rec.manifest.ruleId, rec.manifest.category, name)
      else if (opts.resolution === 'replace') {
        if (!plan.canReplace || !plan.existing) throw new TrpgError('E_BUILTIN_PROTECTED', '内置内容包不能被替换')
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
      blobHashes: [...rec.blobs.keys()].sort(),
      content: { features: rec.features, adventure: rec.adventure, fallback: rec.fallback },
    }
    const stored: StoredEntry[] = rec.entries.map(({ id, ...rest }) => ({ ...rest, entryId: id, packId: record.id, ruleId: record.ruleId }))
    try {
      await this.db.transaction('rw', [this.db.packs, this.db.entries, this.db.blobs, this.db.searchIndex], async () => {
        if (removeFirst) await this.removeRows(removeFirst)
        await this.removeRows(record.id)
        await this.db.packs.put(record)
        await this.db.entries.bulkPut(stored)
        const createdAt = this.deps.now()
        await this.db.blobs.bulkPut([...rec.blobs.values()].map((blob) => ({ hash: blob.hash, bytes: blob.bytes, mime: blob.mime, size: blob.size, createdAt })))
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
    await this.db.transaction('rw', [this.db.packs, this.db.entries, this.db.blobs, this.db.searchIndex], async () => {
      await this.removeRows(packId)
      const still = new Set((await this.db.packs.toArray()).flatMap((p) => p.blobHashes))
      for (const hash of pack.blobHashes) if (!still.has(hash)) await this.db.blobs.delete(hash)
    })
    this.deps.onChange?.({ type: 'uninstalled', packId })
  }

  /** 只删除包记录、条目与索引（图片留给统一的清理，因为存档可能还在用）；内置包也可以删，由调用方决定。 */
  async remove(packId: string): Promise<InstalledPack> {
    const pack = await this.db.packs.get(packId)
    if (!pack) throw new TrpgError('E_NOT_FOUND', '没有找到这个内容包')
    await this.db.transaction('rw', [this.db.packs, this.db.entries, this.db.searchIndex], () => this.removeRows(packId))
    this.deps.onChange?.({ type: 'uninstalled', packId })
    return pack
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
    const blobs = new Map<string, { bytes: Uint8Array; mime: string }>()
    for (const hash of pack.blobHashes) {
      const blob = await this.db.blobs.get(hash)
      if (blob) blobs.set(hash, { bytes: blob.bytes, mime: blob.mime })
    }
    const {
      source: _s,
      byteSize: _b,
      sha256: _h,
      installedAt: _i,
      schemaVersion: _v,
      blobHashes: _bh,
      content,
      ...manifest
    } = pack
    return buildPackFile({
      manifest,
      entries,
      blobs,
      features: content?.features as never,
      adventure: content?.adventure,
      fallback: content?.fallback as never,
    })
  }

  private async removeRows(packId: string): Promise<void> {
    await this.db.entries.where('packId').equals(packId).delete()
    await this.db.searchIndex.delete(packId)
    await this.db.packs.delete(packId)
  }

  private async uniqueName(ruleId: string, category: PackCategory, base: string): Promise<string> {
    const peers = await this.db.packs.where('ruleId').equals(ruleId).toArray()
    for (let n = 2; ; n++) {
      const candidate = `${base}（${n}）`
      if (!peers.some((p) => p.category === category && sameName(p.name, candidate))) return candidate
    }
  }
}

function countUnsupported(rec: RecognizedPack): Array<{ kind: string; count: number }> {
  const counts = new Map<string, number>()
  for (const feature of rec.features) {
    if (featureSupport(feature.kind) === 'supported') continue
    counts.set(feature.kind, (counts.get(feature.kind) ?? 0) + 1)
  }
  return [...counts].map(([kind, count]) => ({ kind, count }))
}
