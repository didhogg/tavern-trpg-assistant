import Dexie, { type Table } from 'dexie'
import type { SaveSlot, Workspace } from '../schemas/campaign'

export interface BlobRecord {
  hash: string
  bytes: Uint8Array
  mime: string
  size: number
  createdAt: number
}

export interface MetaRecord {
  key: string
  value: unknown
}

export const DEFAULT_DB_NAME = 'tavern-trpg-assistant'

/**
 * 用户数据库：战役当前数据、存档、图片、设置。条目数据不在这里，在独立的【库】数据库（src/library/db.ts）。
 * 第 3 版（D2-P2 B2-9 旧格式退役，2026-11-07）：删掉旧扩展包的四张表；旧战役、存档、图片是旧格式时代的测试数据，
 * 驾驶员定为不迁移，一并清空（设置与备份提醒状态保留）。
 */
export class TrpgDatabase extends Dexie {
  blobs!: Table<BlobRecord, string>
  workspaces!: Table<Workspace, string>
  saves!: Table<SaveSlot, string>
  meta!: Table<MetaRecord, string>

  constructor(name: string = DEFAULT_DB_NAME) {
    super(name)
    // 第 1、2 版只留表结构声明，让老用户的数据库能按顺序升上来
    this.version(1).stores({
      packs: 'id, ruleId, kind, name',
      entries: '[packId+entryId], packId, [ruleId+type]',
      searchIndex: 'packId',
      assets: '[packId+path], packId',
      workspaces: 'ownerKey, ruleId',
      saves: 'id, [ownerKey+ruleId], ruleId, kind, deletedAt',
      meta: 'key',
    })
    this.version(2).stores({
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
    this.version(3)
      .stores({ packs: null, entries: null, searchIndex: null, packTrash: null })
      .upgrade(async (tx) => {
        await tx.table('workspaces').clear()
        await tx.table('saves').clear()
        await tx.table('blobs').clear()
      })
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    return (await this.meta.get(key))?.value as T | undefined
  }

  async setMeta(key: string, value: unknown): Promise<void> {
    await this.meta.put({ key, value })
  }
}
