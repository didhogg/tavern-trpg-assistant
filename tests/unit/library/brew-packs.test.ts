import { afterEach, describe, expect, it } from 'vitest'
import { utf8ToBytes } from '@noble/hashes/utils.js'
import { BrewPacks, brewShelfInfo, markInstalled } from '../../../src/library/brew-packs'
import { BookDirectory } from '../../../src/library/directory'
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { gitBlobSha, type FetchLike } from '../../../src/library/fetcher'
import type { LibraryService } from '../../../src/library/service'
import type { AuthorFrame } from '../../../src/library/runtime/host'
import { fileListUrl, getSource } from '../../../src/library/sources'

const installed = [
  { head: { docIdLocal: 'a1', filename: 'Repo; 术士.json', url: 'https://homebrew.example/class/x.json', timeAdded: 5 }, meta: { sources: [{ json: 'Sorc', full: '重振术士', abbreviation: 'SR', authors: ['甲', '乙'], version: '1.2', dateReleased: '2024-01-02' }], dependencies: { class: ['PHB'] } } },
  { head: { docIdLocal: 'b2', filename: 'mine.json', url: null, timeAdded: 9 }, meta: { sources: [{ json: 'MyStuff' }] } },
  { head: { docIdLocal: 'c3', filename: null, url: null, isEditable: true, timeAdded: 1 }, meta: { sources: [{ json: 'MyBrew', full: '我的资料' }] } },
]
const docs = [
  { docIdLocal: 'a1', filename: 'x', timeAdded: 5, order: 0, isEditable: false, sources: ['Sorc'], props: { class: ['x_sorc'], subclass: ['y_sorc', 'z_sorc', null] } },
  { docIdLocal: 'b2', filename: 'mine.json', timeAdded: 9, order: 1, isEditable: false, sources: ['MyStuff'], props: { spell: [] } },
]
const lib = { currentView: async () => ({ id: 'v', kvGet: async () => null }), officialInstalled: async () => true, brewInstalled: async () => installed, frameOf: async () => ({ call: async () => docs }) } as unknown as LibraryService

describe('BrewPacks：已装自制包清单', () => {
  it('来历三种：仓库下载（有网址）、本地导入（无网址）、自己写的（可编辑）', async () => {
    const list = await new BrewPacks(lib).list('cn-brew')
    expect(list.map((p) => [p.docIdLocal, p.origin])).toEqual([['a1', 'download'], ['b2', 'import'], ['c3', 'editable']])
  })
  it('来源、作者、版本、日期、依赖原样；每类条数不数空编号', async () => {
    const [a] = await new BrewPacks(lib).list('cn-brew')
    expect(a.sourceInfo[0]).toEqual({ json: 'Sorc', full: '重振术士', abbreviation: 'SR', authors: ['甲', '乙'], version: '1.2', dateReleased: '2024-01-02' })
    expect(a.props).toEqual({ class: 1, subclass: 2 })
    expect(a.entryCount).toBe(3)
    expect(a.dependencies).toEqual({ class: ['PHB'] })
  })
  it('没有条目的包不报错（条数 0）；官方源不能当自制用', async () => {
    const list = await new BrewPacks(lib).list('cn-brew')
    expect(list[1].entryCount).toBe(0)
    await expect(new BrewPacks(lib).list('cn-official')).rejects.toThrow(/不是自制源/)
  })
  it('书架行的书目字段：作者、日期来自包的来源信息；缺信息不编', async () => {
    expect(brewShelfInfo('Sorc', { json: 'Sorc', full: null, abbreviation: null, authors: ['甲', '乙'], version: null, dateReleased: '2024-01-02' })).toMatchObject({ group: 'homebrew', author: '甲, 乙', published: '2024-01-02' })
    expect(brewShelfInfo('X', undefined)).toMatchObject({ author: null, published: null })
  })
  it('下载页：目录项按网址对上已装的包', async () => {
    const packs = await new BrewPacks(lib).list('cn-brew')
    const out = markInstalled([{ urlDownload: 'https://homebrew.example/class/x.json' }, { urlDownload: 'https://other/y.json' }, {}], packs)
    expect(out.map((o) => o.installed?.docIdLocal ?? null)).toEqual(['a1', null, null])
  })
})

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

describe('一键更新：强制重取（B-14）', () => {
  it('文件清单：重取并覆盖缓存；取失败时原缓存不动、错误抛出', async () => {
    db = new LibraryDatabase(`test-refresh-${Math.random()}`)
    const source = getSource('cn-official')
    const bytes = utf8ToBytes('x')
    let tree = [{ path: 'data/a.json', type: 'blob', sha: gitBlobSha(bytes), size: 1 }]
    let fail = false
    const f = (async (url: string) => {
      if (url !== fileListUrl(source) || fail) return { ok: false, status: 500, arrayBuffer: async () => new ArrayBuffer(0), json: async () => null }
      return { ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(0), json: async () => ({ truncated: false, tree }) }
    }) as FetchLike
    const files = new FileProvider({ db, fetchImpl: f })
    expect(Object.keys(await files.fileList(source))).toEqual(['data/a.json'])
    tree = [...tree, { path: 'data/b.json', type: 'blob', sha: gitBlobSha(bytes), size: 1 }]
    expect(Object.keys(await files.fileList(source))).toEqual(['data/a.json']) // 命中缓存：不变
    expect(Object.keys(await files.refreshFileList(source)).sort()).toEqual(['data/a.json', 'data/b.json'])
    expect(Object.keys(await files.fileList(source))).toHaveLength(2)
    fail = true
    await expect(files.refreshFileList(source)).rejects.toThrow(/HTTP 500/)
    expect(Object.keys(await files.fileList(source))).toHaveLength(2) // 失败不动旧的
  })

  it('书目：命中缓存不重取；refresh 重取并覆盖；取失败保留旧的', async () => {
    db = new LibraryDatabase(`test-dir-${Math.random()}`)
    let books = [{ id: 'PHB', source: 'PHB' }]
    let broken = false
    const frame = {
      codeSet: 'cn', failures: [], close: () => {},
      call: async (fn: string) => {
        if (fn === 'loaders') return [{ props: ['bookData'], page: 'book.html', kind: 'corpus', index: 'books.json' }, { props: ['adventureData'], page: 'adventure.html', kind: 'corpus', index: 'adventures.json' }]
        if (fn === 'directory') return { groups: [], sources: {}, corpora: [{ prop: 'book', items: books, files: [], error: broken ? 'HTTP 500' : null }, { prop: 'adventure', items: [], files: [], error: null }] }
        throw new Error(fn)
      },
    } as unknown as AuthorFrame
    const dir = new BookDirectory({ db, localFrame: async () => frame, networkFrame: async () => frame })
    expect((await dir.get('cn')).books).toHaveLength(1)
    books = [...books, { id: 'XPHB', source: 'XPHB' }]
    expect((await dir.get('cn')).books).toHaveLength(1)
    expect((await dir.refresh('cn')).books).toHaveLength(2)
    expect((await dir.get('cn')).books).toHaveLength(2)
    broken = true
    books = []
    const kept = await dir.refresh('cn')
    expect(kept.books).toHaveLength(2)
    expect(kept.errors.books).toBeNull()
  })
})
