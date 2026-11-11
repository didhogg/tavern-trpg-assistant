import { afterEach, describe, expect, it, vi } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { ScopedLibrary } from '../../../src/library/scoped'
import type { LibraryService } from '../../../src/library/service'
import { defaultCampaignLibrary } from '../../../src/library/scopes'
import type { LibraryView } from '../../../src/library/revision'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

describe('ScopedLibrary.query 管理上下文（P5 M9）', () => {
  it('一次查询只读一次房规；不随条目数线性增长', async () => {
    db = new LibraryDatabase(`scoped-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const view = {
      id: 'v', legacy: false,
      officialState: async () => ({ status: 'installed', commit: 'c', sources: null, books: null, adventures: null }),
      brewState: async () => null, derivedGet: async () => undefined,
      visibleSources: async () => null, installedBooks: async () => null,
      commitOf: async () => 'c',
    } as unknown as LibraryView
    const rows = Array.from({ length: 30 }, (_, i) => ({ hash: `h${i}`, source: 'PHB', excluded: false, item: { name: `条目 ${i}` } }))
    const lib = {
      currentView: async () => view,
      query: async () => rows,
      parsed: async () => ({ items: [], hashes: [], sources: [] }),
      storedItem: async () => null,
      frameOf: async () => ({ call: async (fn: string) => fn === 'editionOf' ? {} : [] }),
      officialInstalled: async () => true,
      brewInstalled: async () => [],
      brewCorpora: async () => ({}),
    } as unknown as LibraryService
    const scoped = new ScopedLibrary(lib, db)
    const spy = vi.spyOn(scoped.manage, 'houseRules')
    const c = defaultCampaignLibrary('dnd5e2014', 'cn')
    const out = await scoped.query(c, 'spell', { view })
    expect(out).toHaveLength(30)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('按包查询（P5 停点 B）', () => {
  it('基础物品经作者解析后归到目标包；依赖/非本包 raw 条目不混入', async () => {
    db = new LibraryDatabase(`scoped-pack-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const view = {
      id: 'vp', legacy: false,
      officialState: async () => ({ status: 'installed', commit: 'c', sources: null, books: null, adventures: null }),
      brewState: async () => ({ packs: [] }), derivedGet: async () => undefined,
      visibleSources: async () => null, installedBooks: async () => null, commitOf: async () => 'c',
    } as unknown as LibraryView
    const lib = {
      currentView: async () => view,
      query: async (sourceId: string) => sourceId === 'cn-brew' ? [
        { hash: 'raw-bow', source: 'A', excluded: false, item: { name: '全局合并后的长弓' } },
        { hash: 'dep-spell', source: 'A', excluded: false, item: { name: '依赖包法术' } },
      ] : [],
      parsed: async () => ({ items: [], hashes: [], sources: [] }), storedItem: async () => null,
      frameOf: async () => ({ call: async (fn: string) => fn === 'brewDocIndex' ? [{ docIdLocal: 'p1', sources: ['A'], props: { baseitem: ['raw-bow'] } }] : fn === 'editionOf' ? {} : [] }),
      officialInstalled: async () => true,
      brewInstalled: async () => [{ head: { docIdLocal: 'p1' }, meta: { sources: [{ json: 'A' }] } }],
      brewCorpora: async () => ({}),
      packOwnedItems: async (_setId: string, _docId: string, _prop: string, hashes: string[], raw: string[]) => new Map(hashes.filter((h) => raw.includes(h)).map((h) => [h, { name: '目标包自己的长弓', source: 'A' }])),
    } as unknown as LibraryService
    const scoped = new ScopedLibrary(lib, db)
    const out = await scoped.query(defaultCampaignLibrary('dnd5e2014', 'cn'), 'item', { mode: 'browse', packDocIdLocal: 'p1', view })
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ source: 'A', item: { name: '目标包自己的长弓' } })
  })
})

describe('按包查询的同编号身份', () => {
  it('同来源两个包、同编号不同内容：各包用自己隔离解析的那条，不按来源猜', async () => {
    db = new LibraryDatabase(`scoped-pack-two-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const view = {
      id: 'v2', legacy: false,
      officialState: async () => ({ status: 'installed', commit: 'c', sources: null, books: null, adventures: null }),
      brewState: async () => ({ packs: [] }), derivedGet: async () => undefined,
      visibleSources: async () => null, installedBooks: async () => null, commitOf: async () => 'c',
    } as unknown as LibraryView
    const lib = {
      currentView: async () => view,
      query: async (sourceId: string) => sourceId === 'cn-brew' ? [{ hash: 'same', source: 'A', excluded: false, item: { name: '全局合并' } }] : [],
      parsed: async () => ({ items: [], hashes: [], sources: [] }), storedItem: async () => null,
      frameOf: async () => ({ call: async (fn: string) => fn === 'brewDocIndex' ? [
        { docIdLocal: 'p1', sources: ['A'], props: { item: ['same'] } },
        { docIdLocal: 'p2', sources: ['A'], props: { item: ['same'] } },
      ] : fn === 'editionOf' ? {} : [] }),
      officialInstalled: async () => true,
      brewInstalled: async () => [{ head: { docIdLocal: 'p1' }, meta: { sources: [{ json: 'A' }] } }, { head: { docIdLocal: 'p2' }, meta: { sources: [{ json: 'A' }] } }],
      brewCorpora: async () => ({}),
      packOwnedItems: async (_setId: string, docId: string, _prop: string) => new Map([['same', { name: docId === 'p1' ? '包一' : '包二', source: 'A' }]]),
    } as unknown as LibraryService
    const scoped = new ScopedLibrary(lib, db)
    const c = defaultCampaignLibrary('dnd5e2014', 'cn')
    expect((await scoped.query(c, 'item', { mode: 'browse', packDocIdLocal: 'p1', view }))[0].item).toMatchObject({ name: '包一' })
    expect((await scoped.query(c, 'item', { mode: 'browse', packDocIdLocal: 'p2', view }))[0].item).toMatchObject({ name: '包二' })
  })
})
