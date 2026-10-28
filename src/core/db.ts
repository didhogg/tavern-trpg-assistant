import Dexie, { type Table, type Transaction } from 'dexie'
import type { SaveSlot, Workspace } from '../schemas/campaign'
import type { InstalledPack, StoredEntry } from '../schemas/pack'
import { sha256Hex } from './hash'
import { stableLineage } from './packs/manifest'

export interface BlobRecord {
  hash: string
  bytes: Uint8Array
  mime: string
  size: number
  createdAt: number
}

/** 第 1 版的图片记录（只在迁移时读取）。 */
export interface AssetRecord {
  packId: string
  path: string
  bytes: Uint8Array
}

export interface PackTrashRecord {
  id: string
  name: string
  ruleId: string
  bytes: Uint8Array
  deletedAt: number
}

export interface MetaRecord {
  key: string
  value: unknown
}

export const DEFAULT_DB_NAME = 'tavern-trpg-assistant'

/** 测试用：迁移写入前触发，用来验证失败时第 1 版数据不变。 */
export const migrationHooks: { beforeMigrationWrite?: () => void } = {}

function sniff(bytes: Uint8Array): string {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 6 && String.fromCharCode(...bytes.slice(0, 4)) === 'GIF8') return 'image/gif'
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp'
  return 'application/octet-stream'
}

async function upgradeToV2(tx: Transaction): Promise<void> {
  const assets = (await tx.table('assets').toArray()) as AssetRecord[]
  const pathToHash = new Map<string, string>()
  const seen = new Set<string>()
  for (const asset of assets) {
    const hash = sha256Hex(asset.bytes)
    pathToHash.set(`${asset.packId}\u0000${asset.path}`, hash)
    if (seen.has(hash)) continue
    seen.add(hash)
    await tx.table('blobs').put({ hash, bytes: asset.bytes, mime: sniff(asset.bytes), size: asset.bytes.length, createdAt: Date.now() })
  }
  const packs = (await tx.table('packs').toArray()) as Array<Record<string, unknown>>
  for (const pack of packs) {
    const id = String(pack.id)
    const hashes = assets.filter((a) => a.packId === id).map((a) => pathToHash.get(`${a.packId}\u0000${a.path}`)!)
    const legacyKind = pack.kind
    const legacyDeps = Array.isArray(pack.dependsOn) ? pack.dependsOn : []
    const next: Record<string, unknown> = {
      ...pack,
      category: pack.category ?? (legacyKind === 'module' ? 'adventure' : 'rules'),
      lineage: pack.lineage ?? stableLineage(id),
      relationships: pack.relationships ?? { requires: legacyDeps, recommends: [], conflicts: [] },
      contributes: pack.contributes ?? {},
      blobs: pack.blobs ?? [],
      dataVersion: pack.dataVersion ?? 1,
      blobHashes: [...new Set(hashes)].sort(),
      content: pack.content ?? { features: [], adventure: {}, fallback: [] },
    }
    delete next.kind
    delete next.dependsOn
    await tx.table('packs').put(next)
  }
  const entries = (await tx.table('entries').toArray()) as Array<Record<string, unknown>>
  for (const entry of entries) {
    if (typeof entry.image !== 'string') continue
    const hash = pathToHash.get(`${String(entry.packId)}\u0000${entry.image}`)
    if (!hash) continue
    entry.image = { $asset: hash }
    await tx.table('entries').put(entry)
  }
  migrationHooks.beforeMigrationWrite?.()
}

export class TrpgDatabase extends Dexie {
  packs!: Table<InstalledPack, string>
  entries!: Table<StoredEntry, [string, string]>
  searchIndex!: Table<{ packId: string; data: unknown }, string>
  blobs!: Table<BlobRecord, string>
  workspaces!: Table<Workspace, string>
  saves!: Table<SaveSlot, string>
  packTrash!: Table<PackTrashRecord, string>
  meta!: Table<MetaRecord, string>

  constructor(name: string = DEFAULT_DB_NAME) {
    super(name)
    this.version(1).stores({
      packs: 'id, ruleId, kind, name',
      entries: '[packId+entryId], packId, [ruleId+type]',
      searchIndex: 'packId',
      assets: '[packId+path], packId',
      workspaces: 'ownerKey, ruleId',
      saves: 'id, [ownerKey+ruleId], ruleId, kind, deletedAt',
      meta: 'key',
    })
    this.version(2)
      .stores({
        packs: 'id, ruleId, category, name',
        entries: '[packId+entryId], packId, [ruleId+type]',
        searchIndex: 'packId',
        assets: null,
        blobs: 'hash',
        workspaces: 'ownerKey, ruleId',
        saves: 'id, [ownerKey+ruleId], ruleId, kind, deletedAt',
        packTrash: 'id',
        meta: 'key',
      })
      .upgrade(upgradeToV2)
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    return (await this.meta.get(key))?.value as T | undefined
  }

  async setMeta(key: string, value: unknown): Promise<void> {
    await this.meta.put({ key, value })
  }
}
