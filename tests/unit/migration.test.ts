import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { TrpgDatabase, migrationHooks } from '../../src/core/db'
import { sha256Hex } from '../../src/core/hash'
import { PNG } from '../helpers/fixtures'
import { uuid } from '../../src/core/ids'

function legacySchema(db: Dexie): void {
  db.version(1).stores({
    packs: 'id, ruleId, kind, name',
    entries: '[packId+entryId], packId, [ruleId+type]',
    searchIndex: 'packId',
    assets: '[packId+path], packId',
    workspaces: 'ownerKey, ruleId',
    saves: 'id, [ownerKey+ruleId], ruleId, kind, deletedAt',
    meta: 'key',
  })
}

async function seedV1(name: string, image = PNG): Promise<void> {
  const db = new Dexie(name)
  legacySchema(db)
  await db.open()
  await db.table('packs').put({ id: 'old-pack', ruleId: 'dnd5e2014', kind: 'module', name: '旧包', version: '1.0.0', entryCount: 1, typeCounts: {}, dependsOn: [{ id: 'dnd5e2014-srd' }], source: 'import', byteSize: 1, sha256: 'h', installedAt: 1, schemaVersion: 1 })
  await db.table('entries').put({ packId: 'old-pack', entryId: 'old-entry', ruleId: 'dnd5e2014', type: 'item', name: '旧条目', keywords: [], unique: false, summary: '', data: {}, image: 'art/a.png' })
  await db.table('assets').put({ packId: 'old-pack', path: 'art/a.png', bytes: image })
  db.close()
}

afterEach(() => {
  delete migrationHooks.beforeMigrationWrite
})

describe('数据库第 1 版 → 第 2 版', () => {
  it('迁移清单字段、图片按哈希进入 blobs，并删除 assets 表', async () => {
    const name = `migrate-${uuid()}`
    await seedV1(name)
    const db = new TrpgDatabase(name)
    await db.open()
    expect(db.verno).toBe(2)
    const pack = await db.packs.get('old-pack')
    expect(pack).toMatchObject({ category: 'adventure', relationships: { requires: [{ id: 'dnd5e2014-srd' }] } })
    expect(pack?.blobHashes).toEqual([sha256Hex(PNG)])
    expect((await db.blobs.get(sha256Hex(PNG)))?.bytes).toEqual(PNG)
    expect((await db.entries.get(['old-pack', 'old-entry']))?.image).toEqual({ $asset: sha256Hex(PNG) })
    expect(db.tables.map((t) => t.name)).not.toContain('assets')
    expect(db.tables.map((t) => t.name)).toContain('packTrash')
    db.close()
    await db.delete()
  })

  it('迁移失败时保持第 1 版数据不变', async () => {
    const name = `migrate-fail-${uuid()}`
    await seedV1(name)
    migrationHooks.beforeMigrationWrite = () => {
      throw new Error('迁移中途失败')
    }
    const db = new TrpgDatabase(name)
    await expect(db.open()).rejects.toThrow('迁移中途失败')
    db.close()
    const legacy = new Dexie(name)
    legacySchema(legacy)
    await legacy.open()
    expect(legacy.verno).toBe(1)
    expect(await legacy.table('assets').count()).toBe(1)
    expect((await legacy.table('packs').get('old-pack')).kind).toBe('module')
    legacy.close()
    await Dexie.delete(name)
  })
})
