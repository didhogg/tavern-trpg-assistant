// B-28 官方数据拉取更新：check 只比较不改东西；apply 只启动准备任务，不提前切全局提交号；作者程序版本号变了不让更新。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { OfficialUpdates, programVersionOf } from '../../../src/library/official-update'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { CODE_SETS, commitOf, getSource, setCommitOverride } from '../../../src/library/sources'
import type { FetchLike } from '../../../src/library/fetcher'

const SRC = getSource('cn-official')
const OLD = CODE_SETS.cn.commit
const NEW = 'f'.repeat(40)
const PLUGIN = programVersionOf(CODE_SETS.cn.version)
let db: LibraryDatabase
let revisions: LibraryRevisionStore
beforeEach(async () => {
  db = new LibraryDatabase(`test-upd-${Math.random()}`)
  revisions = new LibraryRevisionStore(db)
  await revisions.ensureLegacy()
})
afterEach(async () => { setCommitOverride('cn', null); await db.delete() })

const res = (body: unknown, ok = true): ReturnType<FetchLike> => Promise.resolve({ ok, status: ok ? 200 : 500, arrayBuffer: async () => new ArrayBuffer(0), json: async () => body })

function upstream(opts: { latest?: string; version?: string | null; tree?: Record<string, { sha: string; size: number }> }): FetchLike {
  const tree = opts.tree ?? {}
  return (url) => {
    if (url.includes('/commits/HEAD')) return res({ sha: opts.latest ?? NEW })
    if (url.endsWith('package.json')) return opts.version === null ? res({}, false) : res({ version: opts.version ?? PLUGIN })
    if (url.includes('/git/trees/')) return res({ tree: Object.entries(tree).map(([path, v]) => ({ path, type: 'blob', ...v })) })
    return res({}, false)
  }
}

const file = (path: string, gitSha: string, commit = OLD) => ({ source: 'cn-official', path, commit, text: '{}', gitSha, size: 10, savedAt: 1 })
async function seedLocal() {
  await db.sets.put({ id: 'cn-official', commit: OLD, status: 'installed' })
  await db.files.bulkPut([file('data/spells.json', 'aaa'), file('data/items.json', 'bbb'), file('data/old.json', 'ccc')])
}
const make = (fetchImpl: FetchLike, started: Array<{ id: string; plan?: unknown }> = []) =>
  new OfficialUpdates({ db, revisions, files: new FileProvider({ db, fetchImpl }), fetchImpl, startOfficial: (id, opts) => { started.push({ id, plan: opts?.plan }); return 'task-1' } })

describe('OfficialUpdates.check', () => {
  it('上游最新提交就是现在的：已是最新', async () => {
    await seedLocal()
    const r = await make(upstream({ latest: OLD })).check('cn-official')
    expect(r).toMatchObject({ status: 'up-to-date', current: OLD, latest: OLD })
  })

  it('有新提交、作者程序版本一致：可更新，数出要重下 / 新增 / 删掉多少；不改任何已装的东西', async () => {
    await seedLocal()
    const tree = { 'data/spells.json': { sha: 'aaa', size: 10 }, 'data/items.json': { sha: 'bbb2', size: 30 }, 'data/races.json': { sha: 'ddd', size: 5 }, 'search/index.json': { sha: 'eee', size: 7 } }
    const r = await make(upstream({ tree })).check('cn-official')
    expect(r).toMatchObject({ status: 'available', latest: NEW, programVersion: { plugin: PLUGIN, upstream: PLUGIN }, changed: { changed: 1, added: 2, bytes: 42 } })
    expect((await db.files.toArray()).every((f) => f.commit === OLD)).toBe(true)
    expect(commitOf(SRC)).toBe(OLD)
  })

  it('上游作者程序版本号变了：不让更新，提示要升级插件（取不到版本号也一样）', async () => {
    expect(await make(upstream({ version: '99.0.0' })).check('cn-official')).toMatchObject({ status: 'needs-plugin-upgrade', programVersion: { plugin: PLUGIN, upstream: '99.0.0' } })
    expect(await make(upstream({ version: null })).check('cn-official')).toMatchObject({ status: 'needs-plugin-upgrade', programVersion: { upstream: null } })
  })

  it('取上游失败：抛错带原因，不假装已是最新', async () => {
    await expect(make(() => res({}, false)).check('cn-official')).rejects.toThrow('取上游最新提交失败')
  })
})

describe('OfficialUpdates.apply', () => {
  it('启动准备任务，不提前改全局提交号 / 已装文件', async () => {
    await seedLocal()
    const started: Array<{ id: string; plan?: unknown }> = []
    const tree = { 'data/spells.json': { sha: 'aaa', size: 10 }, 'data/items.json': { sha: 'bbb2', size: 30 } }
    const r = await make(upstream({ tree }), started).apply('cn-official')
    expect(r.task).toBe('task-1')
    expect(started.map((x) => x.id)).toEqual(['cn-official'])
    expect(started[0].plan).toBeTruthy()
    expect(commitOf(SRC)).toBe(OLD)
    const by = Object.fromEntries((await db.files.toArray()).map((f) => [f.path, f.commit]))
    expect(by).toEqual({ 'data/spells.json': OLD, 'data/items.json': OLD, 'data/old.json': OLD })
  })

  it('已是最新 / 要升级插件：不动任何东西并说明原因', async () => {
    await seedLocal()
    const started: Array<{ id: string; plan?: unknown }> = []
    await expect(make(upstream({ latest: OLD }), started).apply('cn-official')).rejects.toThrow('已经是最新的')
    await expect(make(upstream({ version: '3.0.0' }), started).apply('cn-official')).rejects.toThrow('要先升级插件')
    expect(started).toEqual([])
    expect(commitOf(SRC)).toBe(OLD)
  })
})
