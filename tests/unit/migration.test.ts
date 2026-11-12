import Dexie from 'dexie'
import { SCHEMA_VERSIONS } from '../../src/schemas/common'
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
    expect(migrateRecord('save', { schemaVersion: 4, x: 1 })).toEqual({ schemaVersion: SCHEMA_VERSIONS.save, x: 1 })
  })

  it('第 5→8 版：旧人物的整份内容原样保留，标旧格式，不丢不猜', () => {
    const state = { actor: { system: { attributes: { hp: { value: 7 } } } }, items: [{ _id: 'i1', name: 'Cleric' }], effects: [] }
    const raw = {
      schemaVersion: 5,
      snapshot: {
        kernel: {
          rule: 'dnd5e2014', kernelVersion: 1,
          library: { rule: 'dnd5e2014', codeSet: 'en', scopes: [], include: [], exclude: [], choices: {} },
          actors: [{ id: 'a1', name: '旧角色', refs: [], choices: {}, state, adjustments: {}, dice: [] }],
        },
      },
    }
    const out = migrateRecord('save', raw)
    expect(out.schemaVersion).toBe(SCHEMA_VERSIONS.save)
    const kernel = (out.snapshot as Record<string, unknown>).kernel as Record<string, unknown>
    const actor = (kernel.actors as Array<Record<string, unknown>>)[0]
    expect(kernel.legacy).toBe(true)
    expect(actor.legacy).toBe(true)
    expect(actor.legacyState).toEqual(state)
    expect(actor.state).toEqual({})
    expect(actor.seed).toBe('旧角色')
  })

  it('第 7→8 版：状态物品键从物品 ID 迁到作者引用键', () => {
    const raw = {
      schemaVersion: 7,
      snapshot: { kernel: {
        rule: 'dnd5e2014', kernelVersion: 1, library: { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} },
        actors: [{ id: 'a1', name: '甲', seed: '甲', refs: [{ kind: 'item', set: 'cn-official', prop: 'item', hash: 'h', itemId: 'kernel1' }], choices: {},
          state: { actor: {}, items: { kernel1: { system: { quantity: 2 } } }, effects: {}, itemAdded: [], itemRemoved: ['kernel1'], effectAdded: [], effectRemoved: [] } }],
      } },
    }
    const out = migrateRecord('save', raw)
    const snapshot = out.snapshot as Record<string, unknown>
    const kernel = snapshot.kernel as Record<string, unknown>
    const actor = (kernel.actors as Array<Record<string, unknown>>)[0]
    const state = actor.state as Record<string, unknown>
    expect(state.items).toEqual({ 'ref:item|h': { system: { quantity: 2 } } })
    expect(state.itemRemoved).toEqual(['ref:item|h'])
  })
})
