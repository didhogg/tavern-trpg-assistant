// B-28 官方数据拉取更新：check 只比较不改东西；apply 只把没变的文件改标新提交、再走原来的下载流程；作者程序版本号变了不让更新。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { hydrateCommits, OfficialUpdates, programVersionOf } from '../../../src/library/official-update'
import { CODE_SETS, commitOf, getSource, setCommitOverride } from '../../../src/library/sources'
import type { FetchLike } from '../../../src/library/fetcher'

const SRC = getSource('cn-official')
const OLD = CODE_SETS.cn.commit
const NEW = 'f'.repeat(40)
let db: LibraryDatabase
beforeEach(() => { db = new LibraryDatabase(`test-upd-${Math.random()}`) })
afterEach(async () => { setCommitOverride('cn', null); await db.delete() })

const res = (body: unknown, ok = true): ReturnType<FetchLike> => Promise.resolve({ ok, status: ok ? 200 : 500, arrayBuffer: async () => new ArrayBuffer(0), json: async () => body })

/** 假的上游：最新提交、作者程序版本、新提交的文件清单。 */
function upstream(opts: { latest?: string; version?: string | null; tree?: Record<string, { sha: string; size: number }> }): FetchLike {
  const tree = opts.tree ?? {}
  return (url) => {
    if (url.includes('/commits/HEAD')) return res({ sha: opts.latest ?? NEW })
    if (url.endsWith('package.json')) return opts.version === null ? res({}, false) : res({ version: opts.version ?? programVersionOf(CODE_SETS.cn.version) })
    if (url.includes('/git/trees/')) return res({ tree: Object.entries(tree).map(([path, v]) => ({ path, type: 'blob', ...v })) })
    return res({}, false)
  }
}

const file = (path: string, gitSha: string, commit = OLD) => ({ source: 'cn-official', path, commit, text: '{}', gitSha, size: 10, savedAt: 1 })
async function seedLocal() {
  await db.files.bulkPut([file('data/spells.json', 'aaa'), file('data/items.json', 'bbb'), file('data/old.json', 'ccc')])
}
const make = (fetchImpl: FetchLike, started: string[] = []) =>
  new OfficialUpdates({ db, files: new FileProvider({ db, fetchImpl }), fetchImpl, startOfficial: (id) => { started.push(id); return 'task-1' } })

describe('OfficialUpdates.check', () => {
  it('上游最新提交就是现在的：已是最新', async () => {
    const r = await make(upstream({ latest: OLD })).check('cn-official')
    expect(r).toMatchObject({ status: 'up-to-date', current: OLD, latest: OLD })
  })

  it('有新提交、作者程序版本一致：可更新，数出要重下 / 新增 / 删掉多少；不改任何已装的东西', async () => {
    await seedLocal()
    const tree = { 'data/spells.json': { sha: 'aaa', size: 10 }, 'data/items.json': { sha: 'bbb2', size: 30 }, 'data/races.json': { sha: 'ddd', size: 5 }, 'search/index.json': { sha: 'eee', size: 7 } }
    const r = await make(upstream({ tree })).check('cn-official')
    expect(r).toMatchObject({ status: 'available', latest: NEW, programVersion: { plugin: '2.39.0', upstream: '2.39.0' }, changed: { changed: 1, added: 2, removed: 1, bytes: 42 } })
    expect((await db.files.toArray()).every((f) => f.commit === OLD)).toBe(true)
    expect(commitOf(SRC)).toBe(OLD)
  })

  it('上游作者程序版本号变了：不让更新，提示要升级插件（取不到版本号也一样）', async () => {
    expect(await make(upstream({ version: '2.40.0' })).check('cn-official')).toMatchObject({ status: 'needs-plugin-upgrade', programVersion: { plugin: '2.39.0', upstream: '2.40.0' } })
    expect(await make(upstream({ version: null })).check('cn-official')).toMatchObject({ status: 'needs-plugin-upgrade', programVersion: { upstream: null } })
  })

  it('取上游失败：抛错带原因，不假装已是最新', async () => {
    await expect(make(() => res({}, false)).check('cn-official')).rejects.toThrow('取上游最新提交失败')
  })
})

describe('OfficialUpdates.apply', () => {
  it('没变的文件改标新提交（不重下），数据提交号切到新的，再启动下载任务', async () => {
    await seedLocal()
    const started: string[] = []
    const tree = { 'data/spells.json': { sha: 'aaa', size: 10 }, 'data/items.json': { sha: 'bbb2', size: 30 } }
    const r = await make(upstream({ tree }), started).apply('cn-official')
    expect(r.task).toBe('task-1')
    expect(started).toEqual(['cn-official'])
    expect(commitOf(SRC)).toBe(NEW)
    const by = Object.fromEntries((await db.files.toArray()).map((f) => [f.path, f.commit]))
    expect(by).toEqual({ 'data/spells.json': NEW, 'data/items.json': OLD, 'data/old.json': OLD }) // 只有没变的改标
  })

  it('已是最新 / 要升级插件：不动任何东西并说明原因', async () => {
    await seedLocal()
    const started: string[] = []
    await expect(make(upstream({ latest: OLD }), started).apply('cn-official')).rejects.toThrow('已经是最新的')
    await expect(make(upstream({ version: '3.0.0' }), started).apply('cn-official')).rejects.toThrow('要先升级插件')
    expect(started).toEqual([])
    expect(commitOf(SRC)).toBe(OLD)
  })
})

describe('hydrateCommits', () => {
  it('启动时按安装记录恢复数据提交号；没有记录 / 和登记表一样 = 不覆盖', async () => {
    await hydrateCommits(db)
    expect(commitOf(SRC)).toBe(OLD)
    await db.sets.put({ id: 'cn-official', commit: NEW, status: 'installed' })
    await hydrateCommits(db)
    expect(commitOf(SRC)).toBe(NEW)
    await db.sets.put({ id: 'cn-official', commit: OLD, status: 'installed' })
    await hydrateCommits(db)
    expect(commitOf(SRC)).toBe(OLD)
  })
})
