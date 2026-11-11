import { afterEach, describe, expect, it } from 'vitest'
import { utf8ToBytes } from '@noble/hashes/utils.js'
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { gitBlobSha, type FetchLike } from '../../../src/library/fetcher'
import { commitOf, fileListUrl, getSource, mirrorRoots } from '../../../src/library/sources'

const source = getSource('cn-official')
const text = '{"spell":[{"name":"火球术","source":"XPHB"}]}'
const path = 'data/spells/spells-xphb.json'

function cloud(): FetchLike & { calls: string[] } {
  const calls: string[] = []
  const bytes = utf8ToBytes(text)
  const tree = { truncated: false, tree: [{ path, type: 'blob', sha: gitBlobSha(bytes), size: bytes.length }] }
  const impl = (async (url: string) => {
    calls.push(url)
    if (url === fileListUrl(source)) return { ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(0), json: async () => tree }
    if (url === `${mirrorRoots(source)[0]}${path}`) return { ok: true, status: 200, arrayBuffer: async () => bytes.slice().buffer, json: async () => null }
    return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0), json: async () => null }
  }) as FetchLike & { calls: string[] }
  impl.calls = calls
  return impl
}

let db: LibraryDatabase
afterEach(async () => { await db.delete() })

describe('FileProvider', () => {
  it('不允许联网时，本地没有就返回 null，也不碰网络', async () => {
    db = new LibraryDatabase(`t-${Math.random()}`)
    const f = cloud()
    expect(await new FileProvider({ db, fetchImpl: f }).get(source, path, { allowNetwork: false })).toBeNull()
    expect(f.calls).toEqual([])
  })

  it('允许联网时取回、核对指纹、原样存进本地；第二次直接读本地', async () => {
    db = new LibraryDatabase(`t-${Math.random()}`)
    const f = cloud()
    const files = new FileProvider({ db, fetchImpl: f })
    expect(await files.get(source, path, { allowNetwork: true })).toBe(text)
    const rec = await db.files.get([source.id, path])
    expect(rec).toMatchObject({ text, commit: commitOf(source), gitSha: gitBlobSha(utf8ToBytes(text)) })
    const callsAfterFirst = f.calls.length
    expect(await new FileProvider({ db, fetchImpl: f }).get(source, path, { allowNetwork: false })).toBe(text)
    expect(f.calls.length).toBe(callsAfterFirst)
  })

  it('云端清单里没有的文件返回 null，不去下载', async () => {
    db = new LibraryDatabase(`t-${Math.random()}`)
    const f = cloud()
    expect(await new FileProvider({ db, fetchImpl: f }).get(source, 'data/nope.json', { allowNetwork: true })).toBeNull()
    expect(f.calls).toEqual([fileListUrl(source)])
  })
})

describe('版本化文件复用（P5 核验 1）', () => {
  it('目标版本哈希和父版本不同：必须重新下载，不能直接返回旧文件', async () => {
    const DB = new LibraryDatabase(`t-upd-${Math.random()}`)
    const revisions = new (await import('../../../src/library/revision')).LibraryRevisionStore(DB)
    await revisions.ensureLegacy()
    const operations = new (await import('../../../src/library/operations')).LibraryOperations({ db: DB, revisions })
    const path = 'data/spells/spells-phb.json'
    const oldText = '{"spell":[{"name":"old"}]}'
    await DB.files.put({ source: source.id, path, commit: 'c1', text: oldText, gitSha: 'old-sha', size: oldText.length, savedAt: 0 })
    const handle = await operations.begin({ kind: 'test', set: source.id, codeSet: 'cn' })
    await operations.setTargetOfficial(handle, { [source.id]: { commit: 'c2', status: 'missing', sources: null, books: null, adventures: null } })
    const newText = '{"spell":[{"name":"new"}]}'
    const bytes = utf8ToBytes(newText)
    const sha = gitBlobSha(bytes)
    let fileRequests = 0
    const impl = (async (url: string) => {
      if (url.includes('/git/trees/')) return { ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(0), json: async () => ({ truncated: false, tree: [{ path, type: 'blob', sha, size: bytes.length }] }) }
      if (url.endsWith(path)) { fileRequests++; return { ok: true, status: 200, arrayBuffer: async () => bytes.slice().buffer, json: async () => null } }
      return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0), json: async () => null }
    }) as FetchLike
    const provider = new FileProvider({ db: DB, fetchImpl: impl })
    expect(await provider.get(source, path, { allowNetwork: true, view: handle.target })).toBe(newText)
    expect(fileRequests).toBe(1)
    expect((await handle.target.fileGet(source, path))?.text).toBe(newText)
    await operations.abort(handle, new Error('清理'))
    DB.close()
    await DB.delete()
  })
})


describe('旧库文件枚举（P5 复核）', () => {
  it('复合主键 [source,path] 要返回真实路径，不返回 source', async () => {
    const DB = new LibraryDatabase(`t-paths-${Math.random()}`)
    const revisions = new (await import('../../../src/library/revision')).LibraryRevisionStore(DB)
    await revisions.ensureLegacy()
    await DB.files.bulkPut([
      { source: source.id, path: 'data/a.json', commit: 'c', text: '{}', gitSha: 'a', size: 2, savedAt: 0 },
      { source: source.id, path: 'data/b.json', commit: 'c', text: '{}', gitSha: 'b', size: 2, savedAt: 0 },
    ])
    expect(await (await revisions.published()).filePaths(source)).toEqual(['data/a.json', 'data/b.json'])
    DB.close(); await DB.delete()
  })
})
