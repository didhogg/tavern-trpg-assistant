import { afterEach, describe, expect, it, vi } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { ScopedLibrary } from '../../../src/library/scoped'
import type { LibraryService } from '../../../src/library/service'
import { defaultCampaignLibrary } from '../../../src/library/scopes'
import type { LibraryView } from '../../../src/library/revision'
import { creaturesOfGroup } from '../../../src/library/legendary-creatures'
import type { BrewPack } from '../../../src/library/brew-packs'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

describe('传奇组的反向关联', () => {
  it('保留作者的来源与包身份，返回共享同一组的所有生物', async () => {
    const ref = { set: 'cn-official', prop: 'legendaryGroup', hash: 'group_mm' }
    const creature = (name: string, source: string, groupSource: string) => ({
      hash: name, source, excluded: false, item: { name, legendaryGroup: { name: 'Group', source: groupSource } },
    })
    const pack = (id: string): BrewPack => ({
      docIdLocal: id, filename: id, origin: 'import', url: null, isEditable: false, timeAdded: 0,
      sources: ['MM'], sourceInfo: [], dependencies: null, includes: null, requires: [],
      hashes: { monster: [id], legendaryGroup: [ref.hash] }, props: {}, entryCount: 2,
    })
    const packs = new Map([['cn-brew', new Map(['a', 'b'].map((id) => [id, pack(id)]))]])
    const lib = {
      storedItem: async () => ({ item: {}, source: 'MM' }),
      query: async (set: string) => set === 'cn-official'
        ? [creature('one', 'MM', 'MM'), creature('two', 'VGM', 'MM'), creature('other-edition', 'XMM', 'XMM')]
        : [creature('a', 'MM', 'MM'), creature('b', 'MM', 'MM')],
      frameOf: async () => ({ call: async (_: string, _prop: string, records: Array<{ source: string }>) => records.map((r) => `group_${r.source.toLowerCase()}`) }),
    } as unknown as LibraryService
    const view = { officialState: async () => ({ status: 'installed', sources: ['MM'] }) } as unknown as LibraryView
    const official = await creaturesOfGroup(lib, view, { ref }, packs, new Map())
    expect(official.map(({ name, selection }) => ({ name, selection }))).toEqual([
      { name: 'one', selection: { original: true } }, { name: 'two', selection: { original: true } },
    ])
    const imported = await creaturesOfGroup(lib, view, { ref, docIdLocal: 'b' }, packs, new Map())
    expect(imported.map(({ name, selection }) => ({ name, selection }))).toEqual([{ name: 'b', selection: { docIdLocal: 'b' } }])
  })
})

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
      packOwnedItems: async () => ({ item: [{ hash: 'raw-bow', source: 'A', excluded: false, item: { name: '目标包自己的长弓' } }] }),
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
    const target = { set: 'cn-official', prop: 'item', hash: 'same' }
    const alternates = ['p1', 'p2'].map((docIdLocal) => ({ kind: 'collision', altId: 'shared-alt', docIdLocal, item: { name: '备选-' + docIdLocal } }))
    const view = {
      id: 'v2', legacy: false,
      officialState: async () => ({ status: 'installed', commit: 'c', sources: null, books: null, adventures: null }),
      brewState: async () => ({ packs: [] }),
      derivedGet: async (key: string) => key === 'alts:cn-brew' ? { value: { targets: { 'cn-official|item|same': { target, base: 'official', alts: alternates } } } } : undefined,
      visibleSources: async () => null, installedBooks: async () => null, commitOf: async () => 'c',
    } as unknown as LibraryView
    const lib = {
      currentView: async () => view,
      query: async () => [],
      parsed: async () => ({ items: [], hashes: [], sources: [] }), storedItem: async () => null,
      frameOf: async () => ({ call: async (fn: string) => fn === 'brewDocIndex' ? [
        { docIdLocal: 'p1', sources: ['A'], props: { item: ['same'] } },
        { docIdLocal: 'p2', sources: ['A'], props: { item: ['same'] } },
      ] : fn === 'editionOf' ? {} : [] }),
      officialInstalled: async () => true,
      brewInstalled: async () => [{ head: { docIdLocal: 'p1' }, meta: { sources: [{ json: 'A' }] } }, { head: { docIdLocal: 'p2' }, meta: { sources: [{ json: 'A' }] } }],
      brewCorpora: async () => ({}),
      packOwnedItems: async (_setId: string, pack: { docIdLocal: string }) => ({ item: [{ hash: 'same', source: 'A', excluded: false, item: { name: pack.docIdLocal === 'p1' ? '包一' : '包二' } }] }),
      detail: async () => ({ hash: 'same', source: 'A', item: { name: '官方' }, fluff: { from: 'official' } }),
      packDetail: async (_setId: string, pack: { docIdLocal: string }) => ({
        hash: 'same', source: 'A', item: { name: pack.docIdLocal === 'p1' ? '包一' : '包二' }, fluff: { from: pack.docIdLocal },
      }),
    } as unknown as LibraryService
    const scoped = new ScopedLibrary(lib, db)
    const c = defaultCampaignLibrary('dnd5e2014', 'cn')
    const first = await scoped.query(c, 'item', { mode: 'browse', packDocIdLocal: 'p1', expand: true, view })
    const second = await scoped.query(c, 'item', { mode: 'browse', packDocIdLocal: 'p2', expand: true, view })
    expect(first).toMatchObject([{ ref: target, item: { name: '包一' }, variant: { altId: 'shared-alt', docIdLocal: 'p1' } }])
    expect(second).toMatchObject([{ ref: target, item: { name: '包二' }, variant: { altId: 'shared-alt', docIdLocal: 'p2' } }])
    expect(await scoped.detail(c, target, { browse: true })).toMatchObject({ item: { name: '官方' }, fluff: { from: 'official' } })
    expect(await scoped.detail(c, target, { browse: true, selection: { docIdLocal: 'p1' } })).toMatchObject({ item: { name: '包一' }, fluff: { from: 'p1' } })
    expect(await scoped.detail(c, { ...target, set: 'cn-brew' }, { browse: true, selection: { docIdLocal: 'p2' } })).toMatchObject({ ref: target, item: { name: '包二' }, fluff: { from: 'p2' } })
    expect(await scoped.detail(c, target, { browse: true, selection: { docIdLocal: 'missing' } })).toBeNull()
  })
})
