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
