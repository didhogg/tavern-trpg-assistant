import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { removeOfficialParts, removeParts, uninstallOfficial } from '../../../src/library/uninstall'
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
  it('官方单书牵连自制包：同一准备版本里删包并在一次发布写入 brews', async () => {
    db = new LibraryDatabase(`test-uninstall-book-brew-${Math.random()}`)
    await seed()
    const revisions = new LibraryRevisionStore(db)
    const directory = { get: async () => ({ codeSet: 'cn', commit: 'c', groups: [], sources: { PHB: {}, MM: {} }, books: [{ id: 'PHB', source: 'PHB' }, { id: 'MM', source: 'MM' }], adventures: [], adventureFiles: {}, adventureProp: 'adventure', owners: {}, indexSources: {}, sourceFiles: { maps: {}, classFiles: [] }, errors: { books: null, adventures: null } }) } as never
    let removed: string[] = []
    await removeOfficialParts({
      db, revisions, tasks: { list: () => [] }, directory, brewSetOf: () => 'cn-brew',
      removeBrews: async (_view, setId, ids) => { removed = [setId, ...ids]; return { packs: [{ docIdLocal: ids[0], stableId: null, checksum: null }] } },
      afterDelete: () => undefined,
    }, { setId: 'cn-official', bookIds: ['PHB'], bookSources: ['PHB'], removeBrews: ['p1'] })
    expect(removed).toEqual(['cn-brew', 'p1'])
    expect((await (await revisions.published()).brewState('cn-brew'))?.packs).toEqual([{ docIdLocal: 'p1', stableId: null, checksum: null }])
  })

})

describe('官方单本书删除', () => {
  it('只给来源、没有书号（书架上 Generic 这类行）：只移除这个来源，这一套照常是已装，书都还在', async () => {
    db = new LibraryDatabase(`test-uninstall-source-only-${Math.random()}`)
    await seed()
    const revisions = new LibraryRevisionStore(db)
    const directory = { get: async () => ({ codeSet: 'cn', commit: 'c', groups: [], sources: { PHB: {}, MM: {} }, books: [{ id: 'PHB', source: 'PHB' }, { id: 'MM', source: 'MM' }], adventures: [], adventureFiles: {}, adventureProp: 'adventure', owners: {}, indexSources: {}, sourceFiles: { maps: {}, classFiles: [] }, errors: { books: null, adventures: null } }) } as never
    await db.derived.put({ key: 'parsed:cn-official:spell', fingerprint: 'x', value: { items: [{}, {}], hashes: ['a', 'b'], sources: ['PHB', 'Generic'] }, savedAt: 0 })
    await removeParts({ db, revisions, tasks: { list: () => [] }, directory, afterDelete: () => undefined }, { official: [{ setId: 'cn-official', bookSources: ['Generic'] }], brews: [] })
    const st = await (await revisions.published()).officialState('cn-official')
    expect(st?.status).toBe('installed')
    expect(st?.books).toEqual(['PHB', 'MM'])
    expect(st?.sources?.map((x) => x.toLowerCase())).not.toContain('generic')
  })
  it('全装时删一本：只有来源、没有书号的来源（如 Generic）仍算已装，不会被一起藏掉（P5 T6 后1）', async () => {
    db = new LibraryDatabase(`test-uninstall-generic-${Math.random()}`)
    await seed()
    await db.derived.put({ key: 'parsed:cn-official:spell', fingerprint: 'x', value: { items: [{}, {}, {}], hashes: ['a', 'b', 'c'], sources: ['PHB', 'MM', 'Generic'] }, savedAt: 0 })
    const revisions = new LibraryRevisionStore(db)
    const directory = {
      get: async () => ({
        codeSet: 'cn', commit: 'c', groups: [], sources: { PHB: {}, MM: {} }, books: [{ id: 'PHB', source: 'PHB' }, { id: 'MM', source: 'MM' }], adventures: [],
        adventureFiles: {}, adventureProp: 'adventure', owners: {}, indexSources: {}, sourceFiles: { maps: {}, classFiles: [] }, errors: { books: null, adventures: null },
      }),
    } as never
    await removeOfficialParts({ db, revisions, tasks: { list: () => [] }, directory, afterDelete: () => undefined }, { setId: 'cn-official', bookIds: ['PHB'], bookSources: ['PHB'] })
    const sources = (await (await revisions.published()).officialState('cn-official'))?.sources ?? []
    expect([...sources].sort()).toEqual(['Generic', 'MM'])
  })
  it('只移除选中书和来源，保留其他书、共享文件与旧版本', async () => {
    db = new LibraryDatabase(`test-uninstall-book-${Math.random()}`)
    await seed()
    const revisions = new LibraryRevisionStore(db)
    const directory = {
      get: async () => ({
        codeSet: 'cn', commit: 'c', groups: [], sources: { PHB: {}, MM: {} }, books: [{ id: 'PHB', source: 'PHB' }, { id: 'MM', source: 'MM' }], adventures: [],
        adventureFiles: {}, adventureProp: 'adventure', owners: {}, indexSources: { 'data/bestiary/index.json': ['PHB', 'MM'] },
        sourceFiles: { maps: {}, classFiles: [] }, errors: { books: null, adventures: null },
      }),
    } as never
    let reset = ''
    const r = await removeOfficialParts({ db, revisions, tasks: { list: () => [] }, directory, afterDelete: (_id, previous) => { reset = previous } }, { setId: 'cn-official', bookIds: ['PHB'], bookSources: ['PHB'] })
    expect(r).toMatchObject({ retainedFiles: 2, retainedBytes: 150 })
    expect(reset).toBeTruthy()
    const view = await revisions.published()
    expect((await view.officialState('cn-official'))?.books).toEqual(['MM'])
    expect((await view.officialState('cn-official'))?.sources).toEqual(['MM'])
    expect(await db.files.where('source').equals('cn-official').count()).toBe(2)
    expect(await db.fileContents.where('source').equals('cn-official').count()).toBe(0)
  })
  it('官方单书牵连自制包：同一准备版本里删包并在一次发布写入 brews', async () => {
    db = new LibraryDatabase(`test-uninstall-book-brew-${Math.random()}`)
    await seed()
    const revisions = new LibraryRevisionStore(db)
    const directory = { get: async () => ({ codeSet: 'cn', commit: 'c', groups: [], sources: { PHB: {}, MM: {} }, books: [{ id: 'PHB', source: 'PHB' }, { id: 'MM', source: 'MM' }], adventures: [], adventureFiles: {}, adventureProp: 'adventure', owners: {}, indexSources: {}, sourceFiles: { maps: {}, classFiles: [] }, errors: { books: null, adventures: null } }) } as never
    let removed: string[] = []
    await removeOfficialParts({
      db, revisions, tasks: { list: () => [] }, directory, brewSetOf: () => 'cn-brew',
      removeBrews: async (_view, setId, ids) => { removed = [setId, ...ids]; return { packs: [{ docIdLocal: ids[0], stableId: null, checksum: null }] } },
      afterDelete: () => undefined,
    }, { setId: 'cn-official', bookIds: ['PHB'], bookSources: ['PHB'], removeBrews: ['p1'] })
    expect(removed).toEqual(['cn-brew', 'p1'])
    expect((await (await revisions.published()).brewState('cn-brew'))?.packs).toEqual([{ docIdLocal: 'p1', stableId: null, checksum: null }])
  })

})
