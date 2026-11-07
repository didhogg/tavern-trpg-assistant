import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { TrpgError } from '../../src/core/errors'
import { uuid } from '../../src/core/ids'
import { migrateRecord } from '../../src/core/migrate'
import { PNG } from '../helpers/fixtures'

/** 旧格式时代（第 2 版）的用户数据库：旧扩展包四张表 + 战役、存档、图片、设置。 */
async function seedV2(name: string): Promise<void> {
  const db = new Dexie(name)
  db.version(2).stores({
    packs: 'id, ruleId, category, name',
    entries: '[packId+entryId], packId, [ruleId+type]',
    searchIndex: 'packId',
    blobs: 'hash',
    workspaces: 'ownerKey, ruleId',
    saves: 'id, [ownerKey+ruleId], ruleId, kind, deletedAt',
    packTrash: 'id',
    meta: 'key',
  })
  await db.open()
  await db.table('packs').put({ id: 'dnd5e2014-srd', ruleId: 'dnd5e2014', category: 'rules', name: 'SRD' })
  await db.table('entries').put({ packId: 'dnd5e2014-srd', entryId: 'e1', ruleId: 'dnd5e2014', type: 'spell', name: '火球术' })
  await db.table('blobs').put({ hash: 'h', bytes: PNG, mime: 'image/png', size: PNG.length, createdAt: 1 })
  await db.table('workspaces').put({ ownerKey: 'char:a', ruleId: 'dnd5e2014', enabledPacks: [{ id: 'dnd5e2014-srd' }], data: { people: [] } })
  await db.table('saves').put({ id: 's1', ownerKey: 'char:a', ruleId: 'dnd5e2014', kind: 'manual', packs: [] })
  await db.table('meta').put({ key: 'settings', value: { reminderDays: 3 } })
  db.close()
}

describe('用户数据库第 3 版：旧格式退役（B2-9）', () => {
  it('删掉旧扩展包四张表；旧战役、存档、图片清空；设置保留', async () => {
    const name = `migrate-${uuid()}`
    await seedV2(name)
    const db = new TrpgDatabase(name)
    await db.open()
    expect(db.verno).toBe(3)
    expect(db.tables.map((t) => t.name).sort()).toEqual(['blobs', 'meta', 'saves', 'workspaces'])
    expect(await db.workspaces.count()).toBe(0)
    expect(await db.saves.count()).toBe(0)
    expect(await db.blobs.count()).toBe(0)
    expect(await db.getMeta('settings')).toEqual({ reminderDays: 3 })
    db.close()
    await db.delete()
  })

  it('新装用户直接是第 3 版、四张表', async () => {
    const db = new TrpgDatabase(`fresh-${uuid()}`)
    await db.open()
    expect(db.verno).toBe(3)
    expect(db.tables.map((t) => t.name).sort()).toEqual(['blobs', 'meta', 'saves', 'workspaces'])
    db.close()
    await db.delete()
  })
})

describe('旧版本的战役与存档记录', () => {
  it('第 4 版以前（旧格式时代）的记录明确拒绝，不迁移', () => {
    for (const kind of ['save', 'workspace'] as const) {
      try {
        migrateRecord(kind, { schemaVersion: 3 })
        throw new Error('应当拒绝')
      } catch (e) {
        expect(e).toBeInstanceOf(TrpgError)
        expect((e as TrpgError).code).toBe('E_OLD_DATA')
      }
    }
    expect(migrateRecord('save', { schemaVersion: 4, x: 1 })).toEqual({ schemaVersion: 5, x: 1 })
  })
})
