// 书架：作者书目字段原样摆进行里；按作者分组表排序；书目取不到时的错误；缓存。
import { describe, expect, it } from 'vitest'
import { BookDirectory, type DirectoryRecord } from '../../../src/library/directory'
import { attachShelf, directoryRows, groupShelf } from '../../../src/library/shelf'
import type { CatalogRow } from '../../../src/library/scoped'
import { LibraryDatabase } from '../../../src/library/db'

const GROUPS = [{ group: 'core', displayName: '核心' }, { group: 'supplement', displayName: '官方出版物' }, { group: 'homebrew', displayName: '自制内容' }, { group: 'other', displayName: '杂项' }]
const REC: DirectoryRecord = {
  codeSet: 'cn', commit: 'c1', groups: GROUPS, sources: {},
  books: [
    { id: 'XGE', name: '姜', source: 'XGE', group: 'supplement', published: '2017-11-21' },
    { id: 'PHB', name: '玩家手册', source: 'PHB', group: 'core', published: '2014-08-19', cover: { type: 'internal', path: 'covers/PHB.webp' } },
    { id: 'ZZ', name: '未知组', source: 'ZZ', group: 'not-in-table' },
  ],
  adventures: [{ id: 'LMoP', name: '失落矿坑', source: 'LMoP', group: 'supplement', published: '2014-07-15', level: { start: 1, end: 5 }, storyline: '新手包' }],
  adventureFiles: { LMoP: 'data/adventure/adventure-lmop.json' }, adventureProp: 'adventure', errors: { books: null, adventures: null },
  owners: {}, indexSources: {}, sourceFiles: { maps: {}, classFiles: [] },
}
const named = (r: Omit<CatalogRow, 'name' | 'abv' | 'edition' | 'membership' | 'view' | 'inScope' | 'alternatives'>): CatalogRow =>
  ({ ...r, name: r.source, abv: r.source, edition: null, membership: { scopes: [], basis: 'none' } as never, view: { visible: true, reason: 'scope' }, inScope: true, alternatives: 0 })

describe('书架', () => {
  it('没装的数据集：每本书、每个冒险一行，带作者字段；封面只带作者原对象（链接信息）', () => {
    const rows = directoryRows('cn-official', REC)
    expect(rows).toHaveLength(4)
    const phb = rows.find((r) => r.source === 'PHB')
    expect(phb).toMatchObject({ kind: 'book', downloaded: false, count: 0, shelf: { group: 'core', groupName: '核心', published: '2014-08-19', cover: { path: 'covers/PHB.webp' } } })
    expect(rows.find((r) => r.kind === 'adventure')).toMatchObject({ id: 'LMoP', shelf: { level: { start: 1, end: 5 }, storyline: '新手包' } })
  })

  it('按作者分组表的顺序排，组内按出版日期；空组不出；不在表里的组归杂项；自制包归自制内容', () => {
    const rows = [...directoryRows('cn-official', REC), { kind: 'book' as const, set: 'cn-brew', source: 'MyBrew', id: null, count: 3, downloaded: true, alternatives: 0 }].map(named)
    const groups = groupShelf(rows, GROUPS)
    expect(groups.map((g) => g.group)).toEqual(['core', 'supplement', 'homebrew', 'other'])
    expect(groups[1].books.map((r) => r.source)).toEqual(['XGE'])
    expect(groups[1].adventures.map((r) => r.id)).toEqual(['LMoP'])
    expect(groups[2].books.map((r) => r.source)).toEqual(['MyBrew'])
    expect(groups[3].books.map((r) => r.source)).toEqual(['ZZ'])
  })

  it('数据集已装：已有的行按来源 / 编号补上作者字段，对不上的为 null', () => {
    expect(attachShelf({ kind: 'book', source: 'PHB', id: null }, REC)?.group).toBe('core')
    expect(attachShelf({ kind: 'adventure', source: 'LMoP', id: 'LMoP' }, REC)?.storyline).toBe('新手包')
    expect(attachShelf({ kind: 'book', source: 'NOPE', id: null }, REC)).toBeNull()
  })
})

function fakeFrame(opts: { booksError?: string; adventuresError?: string; failAll?: boolean } = {}) {
  const closed: string[] = []
  const frame = {
    failures: opts.failAll ? ['所有下载地址都取不到'] : [] as string[],
    close: () => { closed.push('x') },
    call: async (fn: string) => {
      if (fn === 'loaders') return [{ kind: 'corpus', index: 'books.json', props: ['book', 'bookData'], page: 'book' }, { kind: 'corpus', index: 'adventures.json', props: ['adventure', 'adventureData'], page: 'adventure' }, { kind: 'site', props: ['spell'], page: 'spells' }]
      if (opts.failAll) throw new Error('文件不存在：data/generated/gendata-tag-redirects.json')
      return { groups: GROUPS, sources: {}, corpora: [
        { prop: 'book', items: opts.booksError ? [] : REC.books, files: [], error: opts.booksError ?? null },
        { prop: 'adventure', items: opts.adventuresError ? [] : REC.adventures, files: opts.adventuresError ? [] : ['data/adventure/adventure-lmop.json'], error: opts.adventuresError ?? null },
      ] }
    },
  }
  return { frame: frame as never, closed }
}

const withDb = async (run: (db: LibraryDatabase) => Promise<void>) => {
  const db = new LibraryDatabase(`dir-${Math.random()}`)
  try { await run(db) } finally { db.close(); await db.delete() }
}

describe('BookDirectory', () => {
  it('没装：开联网一次性小窗读完就关；带冒险文件路径；结果存缓存，第二次不再开小窗；peek 只看缓存', () => withDb(async (db) => {
    const net = fakeFrame()
    let opened = 0
    const dir = new BookDirectory({ db, localFrame: async () => { throw new Error('不该用本地小窗') }, networkFrame: async () => { opened++; return net.frame } })
    expect(await dir.peek('cn')).toBeNull()
    const a = await dir.get('cn')
    expect(a.books).toHaveLength(3)
    expect(a.adventureFiles).toEqual({ LMoP: 'data/adventure/adventure-lmop.json' })
    expect(a.adventureProp).toBe('adventure')
    expect(a.errors).toEqual({ books: null, adventures: null })
    expect(net.closed).toHaveLength(1)
    await dir.get('cn')
    expect(opened).toBe(1)
    expect((await dir.peek('cn'))?.books).toHaveLength(3)
  }))

  it('已装好：用本地小窗，不联网；用完关掉专用窗口', () => withDb(async (db) => {
    await db.sets.put({ id: 'cn-official', commit: 'x', status: 'installed', plan: { files: 0, bytes: 0 }, updatedAt: 1 } as never)
    const local = fakeFrame()
    const dir = new BookDirectory({ db, localFrame: async () => local.frame, networkFrame: async () => { throw new Error('不该联网') } })
    expect((await dir.get('cn')).books).toHaveLength(3)
    expect(local.closed).toHaveLength(1)
  }))

  it('冒险目录取不到：书目照常交回，只记冒险的错误；不写缓存（重试会重新联网）', () => withDb(async (db) => {
    const net = fakeFrame({ adventuresError: '文件不存在：data/adventures.json' })
    const dir = new BookDirectory({ db, localFrame: async () => net.frame, networkFrame: async () => net.frame })
    const r = await dir.get('cn')
    expect(r.books).toHaveLength(3)
    expect(r.adventures).toEqual([])
    expect(r.errors.books).toBeNull()
    expect(r.errors.adventures).toMatch(/官方冒险目录（cn）取不到.*adventures\.json/)
    expect(await db.derived.toArray()).toEqual([])
  }))

  it('书目取不到：只记书目的错误（向导据此挡[下一步]）；冒险目录照常', () => withDb(async (db) => {
    const net = fakeFrame({ booksError: '文件不存在：data/books.json' })
    const dir = new BookDirectory({ db, localFrame: async () => net.frame, networkFrame: async () => net.frame })
    const r = await dir.get('cn')
    expect(r.books).toEqual([])
    expect(r.errors.books).toMatch(/官方书目（cn）取不到.*books\.json/)
    expect(r.adventures).toHaveLength(1)
    expect(r.errors.adventures).toBeNull()
  }))

  it('小窗整个起不来 / 联网全失败：两个目录都记错误，写明原因，小窗照样关，不抛错', () => withDb(async (db) => {
    const net = fakeFrame({ failAll: true })
    const dir = new BookDirectory({ db, localFrame: async () => net.frame, networkFrame: async () => net.frame })
    const r = await dir.get('cn')
    expect(r.errors.books).toMatch(/官方书目（cn）取不到.*文件不存在.*所有下载地址都取不到/)
    expect(r.errors.adventures).toMatch(/官方冒险目录（cn）取不到/)
    expect(net.closed).toHaveLength(1)
    expect(await db.derived.toArray()).toEqual([])
    const down = new BookDirectory({ db, localFrame: async () => net.frame, networkFrame: async () => { throw new Error('开不了小窗') } })
    expect((await down.get('en')).errors.books).toMatch(/官方书目（en）取不到：开不了小窗/)
  }))
})
