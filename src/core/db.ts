import Dexie, { type Table } from 'dexie'
import type { SaveSlot, Workspace } from '../schemas/campaign'
import type { InstalledPack, StoredEntry } from '../schemas/pack'

export interface AssetRecord {
  packId: string
  path: string
  bytes: Uint8Array
}

export interface MetaRecord {
  key: string
  value: unknown
}

export const DEFAULT_DB_NAME = 'tavern-trpg-assistant'

export class TrpgDatabase extends Dexie {
  packs!: Table<InstalledPack, string>
  entries!: Table<StoredEntry, [string, string]>
  searchIndex!: Table<{ packId: string; data: unknown }, string>
  assets!: Table<AssetRecord, [string, string]>
  workspaces!: Table<Workspace, string>
  saves!: Table<SaveSlot, string>
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
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    return (await this.meta.get(key))?.value as T | undefined
  }

  async setMeta(key: string, value: unknown): Promise<void> {
    await this.meta.put({ key, value })
  }
}
