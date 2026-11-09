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
}
const named = (r: Omit<CatalogRow, 'name' | 'abv' | 'edition' | 'membership' | 'view' | 'alternatives'>): CatalogRow =>
  ({ ...r, name: r.source, abv: r.source, edition: null, membership: { scopes: [], basis: 'none' } as never, view: { visible: true, reason: 'scope' }, alternatives: 0 })

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

function fakeFrame(opts: { fail?: boolean } = {}) {
  const closed: string[] = []
  const calls: string[] = []
  const frame = {
    failures: opts.fail ? ['所有下载地址都取不到'] : [] as string[],
    close: () => { closed.push('x') },
    call: async (fn: string) => {
      calls.push(fn)
      if (opts.fail) throw new Error('文件不存在：data/books.json')
      if (fn === 'loaders') return [{ kind: 'corpus', index: 'books.json', props: ['book', 'bookData'], page: 'book' }, { kind: 'corpus', index: 'adventures.json', props: ['adventure', 'adventureData'], page: 'adventure' }, { kind: 'site', props: ['spell'], page: 'spells' }]
      return { groups: GROUPS, sources: {}, corpora: [{ prop: 'book', items: REC.books }, { prop: 'adventure', items: REC.adventures }] }
    },
  }
  return { frame: frame as never, closed, calls }
}

describe('BookDirectory', () => {
  it('没装：开联网一次性小窗读完就关；结果存缓存，第二次不再开小窗', async () => {
    const db = new LibraryDatabase(`dir-${Math.random()}`)
    try {
      const net = fakeFrame()
      let opened = 0
      const dir = new BookDirectory({ db, localFrame: async () => { throw new Error('不该用本地小窗') }, networkFrame: async () => { opened++; return net.frame } })
      const a = await dir.get('cn')
      expect(a.books).toHaveLength(3)
      expect(a.adventures).toHaveLength(1)
      expect(net.closed).toHaveLength(1)
      await dir.get('cn')
      expect(opened).toBe(1)
    } finally { db.close(); await db.delete() }
  })

  it('已装好：用本地小窗，不联网、不关它', async () => {
    const db = new LibraryDatabase(`dir-${Math.random()}`)
    try {
      await db.sets.put({ id: 'cn-official', commit: 'x', status: 'installed', plan: { files: 0, bytes: 0 }, updatedAt: 1 } as never)
      const local = fakeFrame()
      const dir = new BookDirectory({ db, localFrame: async () => local.frame, networkFrame: async () => { throw new Error('不该联网') } })
      expect((await dir.get('cn')).books).toHaveLength(3)
      expect(local.closed).toHaveLength(0)
    } finally { db.close(); await db.delete() }
  })

  it('联网取不到：抛出写明原因的错误，小窗照样关，不写缓存', async () => {
    const db = new LibraryDatabase(`dir-${Math.random()}`)
    try {
      const net = fakeFrame({ fail: true })
      const dir = new BookDirectory({ db, localFrame: async () => net.frame, networkFrame: async () => net.frame })
      await expect(dir.get('cn')).rejects.toThrow(/官方书目（cn）取不到.*文件不存在.*所有下载地址都取不到/)
      expect(net.closed).toHaveLength(1)
      expect(await db.derived.toArray()).toEqual([])
    } finally { db.close(); await db.delete() }
  })
})
