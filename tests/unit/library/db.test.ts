import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { uuid } from '../../../src/core/ids'

describe('【库】数据库第 3 版', () => {
  it('旧缓存升版本时清掉；文件、解析结果、管理记录保留', async () => {
    const name = `lib-migrate-${uuid()}`
    const old = new Dexie(name)
    old.version(2).stores({ files: '[source+path], source', kv: '[scope+key], scope', sets: 'id', derived: 'key', manage: '[kind+key], kind' })
    await old.open()
    await old.table('derived').put({ key: 'pre:cn-official:fluff:spell', fingerprint: 'x', value: {}, savedAt: 0 })
    await old.table('derived').put({ key: 'parsed:cn-official:spell', fingerprint: 'x', value: { items: [] }, savedAt: 0 })
    await old.table('manage').put({ kind: 'scope', key: 's1', value: { name: 'S1' }, updatedAt: 0 })
    old.close()

    const db = new LibraryDatabase(name)
    await db.open()
    expect(db.verno).toBe(4)
    expect(await db.derived.get('pre:cn-official:fluff:spell')).toBeUndefined()
    expect(await db.derived.get('parsed:cn-official:spell')).toBeDefined()
    expect(await db.manage.get(['scope', 's1'])).toBeDefined()
    db.close()
    await db.delete()
  })
})
