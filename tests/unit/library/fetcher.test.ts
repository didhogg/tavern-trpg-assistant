import { describe, expect, it } from 'vitest'
import { utf8ToBytes } from '@noble/hashes/utils.js'
import { fetchFileList, fetchVerified, gitBlobSha, type FetchLike } from '../../../src/library/fetcher'

// 参照值由 `git hash-object --stdin` 算出
describe('gitBlobSha', () => {
  it('与 Git 的算法一致', () => {
    expect(gitBlobSha(utf8ToBytes('hello\n'))).toBe('ce013625030ba8dba906f756967f9e9ca394464a')
    expect(gitBlobSha(new Uint8Array())).toBe('e69de29bb2d1d6434b8b29ae775ad8c2e48c5391')
  })
})

function fakeFetch(routes: Record<string, string | number>): FetchLike & { calls: string[] } {
  const calls: string[] = []
  const impl = (async (url: string) => {
    calls.push(url)
    const r = routes[url]
    if (r === undefined) throw new Error('网络不通')
    if (typeof r === 'number') return { ok: false, status: r, arrayBuffer: async () => new ArrayBuffer(0), json: async () => null }
    const bytes = utf8ToBytes(r)
    return { ok: true, status: 200, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, json: async () => JSON.parse(r) }
  }) as FetchLike & { calls: string[] }
  impl.calls = calls
  return impl
}

describe('fetchVerified', () => {
  const expected = { sha: 'daa5053ecf5f9a37b2de733d0751cc1ab53ac010', size: 7 }

  it('第一个地址失败、第二个指纹不符时，换到第三个', async () => {
    const f = fakeFetch({ 'https://b/x.json': '{"a":2}', 'https://c/x.json': '{"a":1}' })
    const out = await fetchVerified(['https://a/', 'https://b/', 'https://c/'], 'x.json', expected, f)
    expect(out.url).toBe('https://c/x.json')
    expect(out.gitSha).toBe(expected.sha)
    expect(out.skipped.map((s) => s.url)).toEqual(['https://a/x.json', 'https://b/x.json'])
  })

  it('全部失败时报错并列出每个地址的原因', async () => {
    const f = fakeFetch({ 'https://a/x.json': 404 })
    await expect(fetchVerified(['https://a/', 'https://b/'], 'x.json', expected, f)).rejects.toThrow(/HTTP 404.*网络不通/)
  })
})

describe('fetchFileList', () => {
  it('只收文件，不收目录；被截断时报错', async () => {
    const tree = { truncated: false, tree: [{ path: 'data', type: 'tree', sha: '1' }, { path: 'data/a.json', type: 'blob', sha: '2', size: 3 }] }
    const list = await fetchFileList('https://api/t', fakeFetch({ 'https://api/t': JSON.stringify(tree) }))
    expect(list).toEqual({ 'data/a.json': { sha: '2', size: 3 } })
    await expect(fetchFileList('https://api/t', fakeFetch({ 'https://api/t': JSON.stringify({ truncated: true, tree: [] }) }))).rejects.toThrow(/截断/)
  })
})
