import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { uninstallOfficial } from '../../../src/library/uninstall'
import { getSource } from '../../../src/library/sources'
import { LibraryRevisionStore } from '../../../src/library/revision'
import type { TaskState } from '../../../src/library/tasks'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

const task = (set: string, status: TaskState['status']): TaskState => ({ id: 't', kind: 'official', set, item: null, status, progress: { stage: 'download', done: 0, total: 1 }, error: null, result: null })

async function seed(): Promise<void> {
  for (const source of ['cn-official', 'en-official']) {
    await db.files.put({ source, path: 'data/a.json', commit: 'c', text: '{}', gitSha: 's', size: 100, savedAt: 0 })
    await db.files.put({ source, path: 'data/b.json', commit: 'c', text: '{}', gitSha: 's', size: 50, savedAt: 0 })
    await db.sets.put({ id: source, status: 'installed' })
    for (const key of [`parsed:${source}:spell`, `parsed:${source}:corpus:book:PHB`, `pre:${source}:fluff:spell`, `audit:${source}`, `audit:layers34:${source}`, `sources:${source}`, `docs:${source}`, `doc:${source}:bookref-quick`]) {
      await db.derived.put({ key, fingerprint: 'x', value: {}, savedAt: 0 })
    }
  }
  for (const key of ['english:cn-official', 'audit:english:cn-official', 'kc:abc', 'filelist:cn-official@c', 'directory:v2:cn-official@c', 'parsed:cn-brew:spell', 'audit:cn-brew']) {
    await db.derived.put({ key, fingerprint: 'x', value: {}, savedAt: 0 })
  }
  await db.kv.put({ scope: 'cn', key: 'brew-storage', value: [] })
  await db.manage.put({ kind: 'choice', key: 'global|x', value: 'base', updatedAt: 0 })
}

describe('整套官方资料删除', () => {
  it('删这一套的文件、解析结果、索引、报告、安装记录；中英配对与换算缓存一并作废；另一套和自制、管理记录、书目缓存不动', async () => {
    db = new LibraryDatabase(`test-uninstall-${Math.random()}`)
    await seed()
    let reset = ''
    const revisions = new LibraryRevisionStore(db)
    const before = await revisions.published()
    const r = await uninstallOfficial({ db, revisions, tasks: { list: () => [] }, afterDelete: (id) => { reset = id } }, 'cn-official')
    expect(r).toMatchObject({ set: 'cn-official', files: 0, bytes: 0, retainedFiles: 2, retainedBytes: 150, brewKept: true })
    expect(reset).toBe('cn-official')
    // 逻辑移除：已发布版本不再列出这一套；旧版本仍可读（物理回收不在这一步）
    expect(await db.files.where('source').equals('cn-official').count()).toBe(2)
    expect(await db.sets.get('cn-official')).toBeUndefined()
    expect((await before.fileGet(getSource('cn-official'), 'data/a.json'))?.text).toBe('{}')
    expect(await before.derivedGet('parsed:cn-official:spell')).toBeDefined()
    const keys = new Set(await db.derived.toCollection().primaryKeys())
    for (const kept of ['parsed:cn-official:spell', 'parsed:cn-official:corpus:book:PHB', 'pre:cn-official:fluff:spell', 'audit:cn-official', 'audit:layers34:cn-official', 'sources:cn-official', 'docs:cn-official', 'doc:cn-official:bookref-quick', 'english:cn-official', 'audit:english:cn-official', 'kc:abc']) expect(keys.has(kept), kept).toBe(true)
    for (const kept of ['parsed:en-official:spell', 'audit:en-official', 'filelist:cn-official@c', 'directory:v2:cn-official@c', 'parsed:cn-brew:spell', 'audit:cn-brew']) expect(keys.has(kept), kept).toBe(true)
    expect(await db.files.where('source').equals('en-official').count()).toBe(2)
    expect(await db.sets.get('en-official')).toBeTruthy()
    expect(await db.kv.count()).toBe(1)
    expect(await db.manage.count()).toBe(1)
  })

  it('正在下载 / 换算时拒绝，什么都不删；自制源不能当官方整套删', async () => {
    db = new LibraryDatabase(`test-uninstall2-${Math.random()}`)
    await seed()
    await expect(uninstallOfficial({ db, revisions: new LibraryRevisionStore(db), tasks: { list: () => [task('cn-official', 'running')] }, afterDelete: () => {} }, 'cn-official')).rejects.toThrow(/正在下载/)
    expect(await db.files.where('source').equals('cn-official').count()).toBe(2)
    await expect(uninstallOfficial({ db, revisions: new LibraryRevisionStore(db), tasks: { list: () => [] }, afterDelete: () => {} }, 'cn-brew')).rejects.toThrow(/不是官方数据集/)
    // 别的套在下载不影响这一套
    await uninstallOfficial({ db, revisions: new LibraryRevisionStore(db), tasks: { list: () => [task('en-official', 'running'), task('cn-official', 'done')] }, afterDelete: () => {} }, 'cn-official')
    expect(await db.sets.get('cn-official')).toBeUndefined()
  })

  it('中英两套一次删：同一份检查，全部目标一起发布移除', async () => {
    db = new LibraryDatabase(`test-uninstall4-${Math.random()}`)
    await seed()
    const r = await uninstallOfficial({ db, revisions: new LibraryRevisionStore(db), tasks: { list: () => [] }, afterDelete: () => {} }, ['cn-official', 'en-official'])
    expect(r).toMatchObject({ sets: ['cn-official', 'en-official'], files: 0, bytes: 0, retainedFiles: 4, retainedBytes: 300 })
    expect(await db.files.where('source').equals('cn-official').count()).toBe(2)
    expect(await db.files.where('source').equals('en-official').count()).toBe(2)
    expect(await db.sets.get('cn-official')).toBeUndefined()
    expect(await db.sets.get('en-official')).toBeUndefined()
  })

  it('没装的也能删（什么都没有，不报错）', async () => {
    db = new LibraryDatabase(`test-uninstall3-${Math.random()}`)
    expect(await uninstallOfficial({ db, revisions: new LibraryRevisionStore(db), tasks: { list: () => [] }, afterDelete: () => {} }, 'en-official')).toMatchObject({ files: 0, bytes: 0, brewKept: false })
  })
})
