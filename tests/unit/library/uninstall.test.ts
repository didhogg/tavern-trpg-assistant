import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { uninstallOfficial } from '../../../src/library/uninstall'
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
    const r = await uninstallOfficial({ db, tasks: { list: () => [] }, afterDelete: (id) => { reset = id } }, 'cn-official')
    expect(r).toMatchObject({ set: 'cn-official', files: 2, bytes: 150, brewKept: true })
    expect(reset).toBe('cn-official')
    expect(await db.files.where('source').equals('cn-official').count()).toBe(0)
    expect(await db.sets.get('cn-official')).toBeUndefined()
    const keys = new Set(await db.derived.toCollection().primaryKeys())
    for (const gone of ['parsed:cn-official:spell', 'parsed:cn-official:corpus:book:PHB', 'pre:cn-official:fluff:spell', 'audit:cn-official', 'audit:layers34:cn-official', 'sources:cn-official', 'docs:cn-official', 'doc:cn-official:bookref-quick', 'english:cn-official', 'audit:english:cn-official', 'kc:abc']) expect(keys.has(gone), gone).toBe(false)
    for (const kept of ['parsed:en-official:spell', 'audit:en-official', 'filelist:cn-official@c', 'directory:v2:cn-official@c', 'parsed:cn-brew:spell', 'audit:cn-brew']) expect(keys.has(kept), kept).toBe(true)
    expect(await db.files.where('source').equals('en-official').count()).toBe(2)
    expect(await db.sets.get('en-official')).toBeTruthy()
    expect(await db.kv.count()).toBe(1)
    expect(await db.manage.count()).toBe(1)
  })

  it('正在下载 / 换算时拒绝，什么都不删；自制源不能当官方整套删', async () => {
    db = new LibraryDatabase(`test-uninstall2-${Math.random()}`)
    await seed()
    await expect(uninstallOfficial({ db, tasks: { list: () => [task('cn-official', 'running')] }, afterDelete: () => {} }, 'cn-official')).rejects.toThrow(/正在下载/)
    expect(await db.files.where('source').equals('cn-official').count()).toBe(2)
    await expect(uninstallOfficial({ db, tasks: { list: () => [] }, afterDelete: () => {} }, 'cn-brew')).rejects.toThrow(/不是官方数据集/)
    // 别的套在下载不影响这一套
    await uninstallOfficial({ db, tasks: { list: () => [task('en-official', 'running'), task('cn-official', 'done')] }, afterDelete: () => {} }, 'cn-official')
    expect(await db.sets.get('cn-official')).toBeUndefined()
  })

  it('没装的也能删（什么都没有，不报错）', async () => {
    db = new LibraryDatabase(`test-uninstall3-${Math.random()}`)
    expect(await uninstallOfficial({ db, tasks: { list: () => [] }, afterDelete: () => {} }, 'en-official')).toMatchObject({ files: 0, bytes: 0, brewKept: false })
  })
})
