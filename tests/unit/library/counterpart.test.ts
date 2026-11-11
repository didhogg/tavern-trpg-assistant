import { describe, expect, it } from 'vitest'
import { Counterparts } from '../../../src/library/counterpart'
import type { EnglishPairs, LibraryService } from '../../../src/library/service'

const pairs: EnglishPairs = {
  source: 'cn-official', pair: 'en-official', located: 0, unmatched: [], via: {},
  pairs: {
    spell: { a_phb: { enHash: 'fireball_phb', enSource: 'PHB', via: 'name' } },
    subclass: {
      cn_tce: { enHash: 'alch_tce', enSource: 'TCE', via: 'name' },
      cn_efa: { enHash: 'alch_tce', enSource: 'TCE', via: 'name' },
      solo_x: { enHash: 'solo_en', enSource: 'X', via: 'name' },
    },
  },
}
const stored = new Set(['en-official|spell|fireball_phb', 'en-official|subclass|alch_tce', 'en-official|subclass|solo_en', 'cn-official|spell|a_phb', 'cn-official|subclass|cn_tce', 'cn-official|subclass|cn_efa', 'cn-official|subclass|solo_x'])
const lib = {
  englishPairs: async (id: string) => { if (id !== 'cn-official') throw new Error('x'); return pairs },
  storedItem: async (set: string, prop: string, hash: string) => (stored.has(`${set}|${prop}|${hash}`) ? { item: {}, source: null } : null),
  officialInstalled: async () => true,
} as unknown as LibraryService

const ref = (set: string, prop: string, hash: string) => ({ set, prop, hash })

describe('中英对应', () => {
  const c = new Counterparts(lib)
  it('中文 → 英文：找到，并说明有没有别的条目也指向它', async () => {
    expect(await c.counterpart(ref('cn-official', 'spell', 'a_phb'))).toEqual({ status: 'found', refs: [ref('en-official', 'spell', 'fireball_phb')], reason: null, sharedBy: 0 })
    expect((await c.counterpart(ref('cn-official', 'subclass', 'cn_tce'))).sharedBy).toBe(1)
  })
  it('英文 → 中文：唯一就是 found，多个中文条目指向它就是 ambiguous 并列出候选', async () => {
    expect(await c.counterpart(ref('en-official', 'spell', 'fireball_phb'))).toMatchObject({ status: 'found', refs: [ref('cn-official', 'spell', 'a_phb')] })
    const r = await c.counterpart(ref('en-official', 'subclass', 'alch_tce'))
    expect(r.status).toBe('ambiguous')
    expect(r.refs.map((x) => x.hash).sort()).toEqual(['cn_efa', 'cn_tce'])
  })
  it('没有对应都给原因', async () => {
    expect(await c.counterpart(ref('cn-official', 'spell', 'zzz'))).toMatchObject({ status: 'none', reason: 'not-paired' })
    expect(await c.counterpart(ref('en-official', 'spell', 'zzz'))).toMatchObject({ status: 'none', reason: 'no-counterpart' })
    expect(await c.counterpart(ref('nope', 'spell', 'a'))).toMatchObject({ status: 'none', reason: 'not-official' })
    expect(await c.counterpart(ref('cn-brew', 'spell', 'a'))).toMatchObject({ status: 'none', reason: 'pack-unpaired' })
  })
  it('配对表里有、但对面没装这一条：说没找到，不交假地址', async () => {
    const bare = new Counterparts({ ...lib, storedItem: async () => null } as unknown as LibraryService)
    expect(await bare.counterpart(ref('cn-official', 'spell', 'a_phb'))).toMatchObject({ status: 'none', reason: 'not-found' })
  })
  it('自制条目：交给配对的包去找，原样带回原因', async () => {
    const r1 = { set: 'en-brew', prop: 'spell', hash: 'x' }
    const stub = (refs: typeof r1[], reason: 'structure-differs' | null) => new Counterparts(lib, { entry: async () => ({ refs, reason }) })
    expect(await stub([r1], null).counterpart(ref('cn-brew', 'spell', 'a'))).toEqual({ status: 'found', refs: [r1], reason: null, sharedBy: 0 })
    expect((await stub([r1, { ...r1, hash: 'y' }], null).counterpart(ref('cn-brew', 'spell', 'a'))).status).toBe('ambiguous')
    expect(await stub([], 'structure-differs').counterpart(ref('en-brew', 'spell', 'a'))).toMatchObject({ status: 'none', reason: 'structure-differs' })
  })
  it('自制条目：另一种语言的官方资料没装 → 直接说没装，不去开那边的作者小窗（P5 T6）', async () => {
    let asked = 0
    const c = new Counterparts({ ...lib, officialInstalled: async (codeSet: string) => codeSet !== 'en' } as unknown as LibraryService, { entry: async () => { asked++; return { refs: [], reason: null } } })
    expect(await c.counterpart(ref('cn-brew', 'item', 'a'))).toMatchObject({ status: 'none', reason: 'not-installed' })
    expect(asked).toBe(0)
  })
  it('书 / 冒险正文：另一种语言装了同一书号才可切换；没装 / 没下载 / 自制没有各给原因（P5 T6）', async () => {
    const view = (books: string[] | null, installed = true) => ({ officialState: async () => (installed ? { status: 'installed' } : null), installedBooks: async () => books, installedAdventures: async () => [], derivedGet: async () => null })
    const mk = (over: Record<string, unknown>) => new Counterparts({ ...lib, ...over } as unknown as LibraryService)
    expect(await mk({ currentView: async () => view(['PHB']) }).corpus({ set: 'cn-official', prop: 'book', id: 'PHB' })).toEqual({ target: { set: 'en-official', prop: 'book', id: 'PHB' }, reason: null })
    expect((await mk({ officialInstalled: async () => false }).corpus({ set: 'cn-official', prop: 'book', id: 'PHB' })).reason).toBe('not-installed')
    expect((await mk({ currentView: async () => view(['MM']) }).corpus({ set: 'cn-official', prop: 'book', id: 'PHB' })).reason).toBe('not-found')
    const brew = mk({ brewCorpora: async () => ({ book: [{ id: 'MyBook', name: 'x', source: 'X', hash: 'h' }] }) })
    expect((await brew.corpus({ set: 'cn-brew', prop: 'book', id: 'MyBook' })).target).toEqual({ set: 'en-brew', prop: 'book', id: 'MyBook' })
    expect((await brew.corpus({ set: 'cn-brew', prop: 'book', id: 'Other' })).reason).toBe('no-counterpart')
  })
})
