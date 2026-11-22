// 已发布版本的行记在内存里查（revision-rows.ts，真机性能 2026-11-22）：查找不再沿父链逐层读库；结果和逐层读库完全一致。
import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { getSource } from '../../../src/library/sources'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

const setup = async () => {
  db = new LibraryDatabase(`rows-${Math.random()}`)
  const revisions = new LibraryRevisionStore(db)
  await revisions.ensureLegacy()
  const operations = new LibraryOperations({ db, revisions })
  return { revisions, operations }
}

/** 数 fileVersions / kv 两张表上的单条读取次数。 */
const countGets = () => {
  const counts = { fileVersions: 0, kv: 0 }
  for (const name of ['fileVersions', 'kv'] as const) {
    const table = db[name] as unknown as { get: (...a: unknown[]) => unknown }
    const orig = table.get.bind(table)
    table.get = (...a: unknown[]) => { counts[name]++; return orig(...a) }
  }
  return counts
}

describe('版本行内存索引', () => {
  it('长父链：同一文件 / 键第二次起不再逐层读库，结果与逐层读一致', async () => {
    const { revisions, operations } = await setup()
    const source = getSource('cn-official')
    const first = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await first.target.filePut(source, 'data/a.json', { commit: 'c1', text: 'A1', gitSha: 'a1', size: 2 })
    await first.target.kvSet('cn', 'K', 'v1')
    await operations.publish(first, {})
    for (let i = 0; i < 30; i++) {
      const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
      await h.target.filePut(source, `data/other-${i}.json`, { commit: 'c', text: String(i), gitSha: `o${i}`, size: 1 })
      await operations.publish(h, {})
    }
    const view = await revisions.published()
    expect((await view.fileGet(source, 'data/a.json'))?.text).toBe('A1')
    expect(await view.kvGet('cn', 'K')).toBe('v1')
    const counts = countGets()
    for (let i = 0; i < 5; i++) {
      expect((await view.fileGet(source, 'data/a.json'))?.text).toBe('A1')
      expect(await view.kvGet('cn', 'K')).toBe('v1')
    }
    // 31 层父链：逐层读的话每次要 30 多次；现在一次都不读库
    expect(counts.fileVersions).toBe(0)
    expect(counts.kv).toBe(0)
    // 对照：计数器确实接上了
    await db.fileVersions.get(['x', 'y', 'z'])
    await db.kv.get(['cn', 'K'])
    expect(counts).toEqual({ fileVersions: 1, kv: 1 })
  })

  it('读过整表之后才发布的版本、准备中的版本都读到最新内容', async () => {
    const { revisions, operations } = await setup()
    const source = getSource('cn-official')
    const v1 = await revisions.published()
    expect(await v1.fileGet(source, 'data/b.json')).toBeNull() // 触发整表读入
    expect(await v1.kvGet('cn', 'K')).toBeNull()

    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await h.target.filePut(source, 'data/b.json', { commit: 'c2', text: 'B2', gitSha: 'b2', size: 2 })
    await h.target.kvSet('cn', 'K', 'v2')
    expect((await h.target.fileGet(source, 'data/b.json'))?.text).toBe('B2')
    expect(await h.target.kvGet('cn', 'K')).toBe('v2')
    await h.target.fileRemove(source, 'data/b.json', 'c3')
    expect(await h.target.fileGet(source, 'data/b.json')).toBeNull()
    await h.target.filePut(source, 'data/b.json', { commit: 'c4', text: 'B4', gitSha: 'b4', size: 2 })

    const v2 = await operations.publish(h, {})
    expect((await v2.fileGet(source, 'data/b.json'))?.text).toBe('B4')
    expect(await v2.kvGet('cn', 'K')).toBe('v2')
    expect(await v2.filePaths(source)).toContain('data/b.json')
    // 旧版本仍读旧值
    expect(await v1.fileGet(source, 'data/b.json')).toBeNull()
  })

  it('旧库基础作用域（旧写法会改）不进内存：改了马上读到', async () => {
    const { revisions } = await setup()
    const legacy = await revisions.published()
    await db.kv.put({ scope: 'cn', key: 'K', value: 'old' })
    expect(await legacy.kvGet('cn', 'K')).toBe('old')
    await legacy.kvSet('cn', 'K', 'new')
    expect(await legacy.kvGet('cn', 'K')).toBe('new')
    await legacy.localSet('cn', 'L', 'x')
    expect(await legacy.localSnapshot('cn')).toEqual({ L: 'x' })
  })
})
