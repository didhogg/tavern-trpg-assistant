// 空间回收（P5-5 §12 B3）：卸载后真正腾出空间，当前版本读到的东西不变。
import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryOperations } from '../../../src/library/operations'
import { reclaimLibrary } from '../../../src/library/reclaim'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { getSource } from '../../../src/library/sources'
import { uninstallOfficial } from '../../../src/library/uninstall'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })
const directory = { peek: async () => null } as never

async function seed(): Promise<void> {
  for (const source of ['cn-official', 'en-official']) {
    await db.files.put({ source, path: 'data/a.json', commit: 'c', text: '{"x":1}', gitSha: 's', size: 100, savedAt: 0 })
    await db.files.put({ source, path: 'data/b.json', commit: 'c', text: '{}', gitSha: 's', size: 50, savedAt: 0 })
    await db.sets.put({ id: source, status: 'installed' })
    for (const key of [`parsed:${source}:spell`, `parsed:${source}:corpus:book:PHB`, `pre:${source}:fluff:spell`, `audit:${source}`]) await db.derived.put({ key, fingerprint: 'x', value: { big: 'x'.repeat(200) }, savedAt: 0 })
  }
  for (const key of ['filelist:cn-official@c', 'directory:v2:cn-official@c', 'parsed:cn-brew:spell', 'kc:abc']) await db.derived.put({ key, fingerprint: 'x', value: {}, savedAt: 0 })
  await db.kv.put({ scope: 'cn', key: 'HOMEBREW_2_STORAGE', value: [{ head: { docIdLocal: 'a' } }] })
}

describe('空间回收', () => {
  it('整套卸掉后：这一套的文件和解析结果被清掉、报出释放字节；另一套、自制、全局缓存不动', async () => {
    db = new LibraryDatabase(`test-reclaim-${Math.random()}`)
    await seed()
    const revisions = new LibraryRevisionStore(db)
    const operations = new LibraryOperations({ db, revisions })
    await uninstallOfficial({ db, revisions, operations, tasks: { list: () => [] }, afterDelete: () => {} }, 'cn-official')
    const r = await reclaimLibrary({ db, revisions, operations, directory })
    expect(r.legacyFiles).toBe(2)
    expect(r.bytes).toBeGreaterThanOrEqual(150 + 4 * 200)
    expect(await db.files.where('source').equals('cn-official').count()).toBe(0)
    expect(await db.files.where('source').equals('en-official').count()).toBe(2)
    const keys = new Set(await db.derived.toCollection().primaryKeys())
    for (const gone of ['parsed:cn-official:spell', 'parsed:cn-official:corpus:book:PHB', 'pre:cn-official:fluff:spell', 'audit:cn-official']) expect(keys.has(gone), gone).toBe(false)
    for (const kept of ['parsed:en-official:spell', 'filelist:cn-official@c', 'directory:v2:cn-official@c', 'parsed:cn-brew:spell', 'kc:abc']) expect(keys.has(kept), kept).toBe(true)
    expect(await (await revisions.published()).kvGet('cn', 'HOMEBREW_2_STORAGE')).toEqual([{ head: { docIdLocal: 'a' } }])
    // 另一套照常可读
    expect((await (await revisions.published()).fileGet(getSource('en-official'), 'data/a.json'))?.text).toBe('{"x":1}')
  })

  it('自制存储的旧副本：被新版本盖住的清掉，当前读到的值不变', async () => {
    db = new LibraryDatabase(`test-reclaim-kv-${Math.random()}`)
    await seed()
    const revisions = new LibraryRevisionStore(db)
    const operations = new LibraryOperations({ db, revisions })
    for (const v of [['b'], ['c']]) {
      const h = await operations.begin({ kind: 'brew', set: 'cn-brew', codeSet: 'cn' })
      await h.target.kvSet('cn', 'HOMEBREW_2_STORAGE', v.map((id) => ({ head: { docIdLocal: id } })))
      await operations.publish(h, {})
    }
    expect(await db.kv.count()).toBe(3)
    const r = await reclaimLibrary({ db, revisions, operations, directory })
    expect(r.kv).toBe(2)
    expect(await db.kv.count()).toBe(1)
    expect(await (await revisions.published()).kvGet('cn', 'HOMEBREW_2_STORAGE')).toEqual([{ head: { docIdLocal: 'c' } }])
  })

  it('作废的准备版本：它写的解析结果、文件、存储都清掉；没人指向的文件内容清掉', async () => {
    db = new LibraryDatabase(`test-reclaim-aborted-${Math.random()}`)
    await seed()
    const revisions = new LibraryRevisionStore(db)
    const operations = new LibraryOperations({ db, revisions })
    const h = await operations.begin({ kind: 'update', set: 'cn-official', codeSet: 'cn' })
    await h.target.derivedPut('parsed:cn-official:spell', 'y', { half: true })
    await h.target.filePut(getSource('cn-official'), 'data/a.json', { commit: 'd', text: '{"x":2}', gitSha: 'new', size: 70 })
    await h.target.kvSet('cn', 'HOMEBREW_2_STORAGE', [])
    await operations.abort(h, new Error('断网'))
    const r = await reclaimLibrary({ db, revisions, operations, directory })
    expect(r.fileContents).toBe(1)
    expect(await db.fileVersions.count()).toBe(0)
    expect(await db.fileContents.count()).toBe(0)
    expect((await (await revisions.published()).derivedGet('parsed:cn-official:spell'))?.value).toEqual({ big: 'x'.repeat(200) })
    expect(await (await revisions.published()).kvGet('cn', 'HOMEBREW_2_STORAGE')).toEqual([{ head: { docIdLocal: 'a' } }])
    // 修改锁已释放：之后还能开新的修改
    const next = await operations.begin({ kind: 'x', set: 'cn-official', codeSet: 'cn' })
    await operations.abort(next, new Error('done'))
  })

  it('反复下载（每次发布一整套解析结果）：发布时通知后端；回收后只剩当前版本那一份，读到的是最新的（2026-11-12）', async () => {
    db = new LibraryDatabase(`test-reclaim-parsed-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    const published: string[] = []
    const operations = new LibraryOperations({ db, revisions, onPublished: (id) => published.push(id) })
    for (const n of [1, 2, 3]) {
      const h = await operations.begin({ kind: 'official', set: 'cn-official', codeSet: 'cn' })
      await h.target.derivedPut('parsed:cn-official:monster', `f${n}`, { big: 'x'.repeat(1000), n })
      await operations.publish(h, {})
    }
    expect(published).toHaveLength(3)
    const copies = async (): Promise<number> => (await db.derived.toCollection().primaryKeys()).filter((k) => k.endsWith(':parsed:cn-official:monster')).length
    expect(await copies()).toBe(3)
    const r = await reclaimLibrary({ db, revisions, operations, directory })
    expect(r.derived).toBe(2)
    expect(await copies()).toBe(1)
    expect(((await (await revisions.published()).derivedGet('parsed:cn-official:monster'))?.value as { n: number }).n).toBe(3)
  })

  it('结算内核换算缓存：不是当前官方数据版本的行、没记版本的老格式行清掉，当前版本的留着', async () => {
    db = new LibraryDatabase(`test-reclaim-kc-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    const operations = new LibraryOperations({ db, revisions })
    const put = (key: string, official?: string) => db.derived.put({ key, fingerprint: key, value: { z: new Uint8Array(10), ...(official ? { scope: { rule: 'dnd5e2014', base: 'b', official } } : {}) }, savedAt: 0 })
    await put('kc:old', 'v1'); await put('kc:now', 'v2'); await put('kc:legacy')
    const r = await reclaimLibrary({ db, revisions, operations, directory, kernelOfficial: async () => 'v2' })
    expect(r.kernelCache).toBe(2)
    expect(await db.derived.toCollection().primaryKeys()).toEqual(['kc:now'])
  })
})
