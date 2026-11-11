// 下载大小预估：只用作者离线设计的现成规则（plan.ts）；已装好的不算；没缓存且不联网 = 还在计算；联网失败写原因。
import { describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { DownloadEstimator } from '../../../src/library/download-estimate'
import type { DirectoryRecord } from '../../../src/library/directory'
import { parsedKey } from '../../../src/library/install'
import { LibraryRevisionStore } from '../../../src/library/revision'

// 文件清单：预载（data 根下、各子目录里不叫 adventure 的 json、search 根下）+ 冒险（data/adventure）+ 不算的（js、图片）
const LIST = {
  'data/books.json': { sha: 'a', size: 100 },
  'data/spells/spells-phb.json': { sha: 'b', size: 250 },
  'search/index.json': { sha: 'c', size: 40 },
  'data/adventure/adventure-lmop.json': { sha: 'd', size: 363 },
  'data/adventure/adventure-cos.json': { sha: 'e', size: 999 },
  'js/utils.js': { sha: 'f', size: 7 },
}
const REC = { adventureFiles: { LMoP: 'data/adventure/adventure-lmop.json', CoS: 'data/adventure/adventure-cos.json' }, adventureProp: 'adventure', owners: {}, indexSources: {}, errors: { books: null, adventures: null } } as unknown as DirectoryRecord

function world(opts: { cached?: string[]; fail?: boolean } = {}) {
  const calls: string[] = []
  const cached = new Set(opts.cached ?? [])
  const files = {
    cachedFileList: async (s: { id: string }) => (cached.has(s.id) ? LIST : null),
    fileList: async (s: { id: string }) => { calls.push(s.id); if (opts.fail) throw new Error('网络断了'); cached.add(s.id); return LIST },
  }
  const directory = { get: async () => REC, peek: async () => (cached.size ? REC : null) }
  return { calls, make: (db: LibraryDatabase) => new DownloadEstimator({ db, files: files as never, directory: directory as never, revisions: new LibraryRevisionStore(db) }) }
}
const withDb = async (run: (db: LibraryDatabase) => Promise<void>) => {
  const db = new LibraryDatabase(`est-${Math.random()}`)
  try { await run(db) } finally { db.close(); await db.delete() }
}

describe('DownloadEstimator', () => {
  it('资料 = 每套预载字节数之和（冒险和 js 不计）；冒险按所选相加；已下载的不再算', () => withDb(async (db) => {
    const w = world()
    const e = w.make(db)
    const r = await e.estimate({ sets: ['cn-official', 'en-official'], adventures: [{ set: 'cn-official', id: 'LMoP' }] })
    expect(r.data.sets.map((x) => x.bytes)).toEqual([390, 390])
    expect(r.data.bytes).toBe(780)
    expect(r.adventures).toMatchObject({ bytes: 363, items: [{ id: 'LMoP', downloaded: false, bytes: 363 }] })
    expect(r.totalBytes).toBe(1143)
    expect(r.computing).toBe(false)
    expect(r.errors).toEqual([])
    // 冒险正文下载过 → 不再算
    await db.derived.put({ key: parsedKey('cn-official', 'adventure', 'LMoP'), fingerprint: 'x', value: {}, savedAt: 1 })
    expect((await e.estimate({ sets: ['cn-official'], adventures: [{ set: 'cn-official', id: 'LMoP' }] })).adventures.bytes).toBe(0)
  }))

  it('已装好的数据集不算；不选冒险就是 0', () => withDb(async (db) => {
    await db.sets.put({ id: 'cn-official', commit: 'x', status: 'installed', plan: { files: 0, bytes: 0 }, updatedAt: 1 } as never)
    const r = await world().make(db).estimate({ sets: ['cn-official', 'en-official'] })
    expect(r.data.sets).toMatchObject([{ setId: 'cn-official', installed: true, bytes: 0 }, { setId: 'en-official', installed: false, bytes: 390 }])
    expect(r.adventures).toEqual({ bytes: 0, items: [] })
    expect(r.totalBytes).toBe(390)
  }))

  it('不联网：只看缓存，没有的是 null 且标"还在计算"，不发起任何联网；缓存有了就能算出来', () => withDb(async (db) => {
    const w = world({ cached: ['cn-official'] })
    const e = w.make(db)
    const r = await e.estimate({ sets: ['cn-official', 'en-official'] }, { network: false })
    expect(r.data.sets.map((x) => x.bytes)).toEqual([390, null])
    expect(r).toMatchObject({ totalBytes: null, computing: true })
    expect(w.calls).toEqual([])
    const full = await e.estimate({ sets: ['cn-official', 'en-official'] }) // 联网取英文清单一次
    expect(w.calls).toEqual(['en-official'])
    expect(full).toMatchObject({ totalBytes: 780, computing: false })
  }))

  it('联网取清单失败：不抛错，写明原因，大小为 null（不是"还在计算"）', () => withDb(async (db) => {
    const r = await world({ fail: true }).make(db).estimate({ sets: ['cn-official'] })
    expect(r.totalBytes).toBeNull()
    expect(r.computing).toBe(false)
    expect(r.errors[0]).toMatch(/文件清单（cn-official）取不到：网络断了/)
  }))
})
