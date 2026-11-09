import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DocumentStore, documentsOfFile } from '../../../src/library/documents'
import { EntryLinks, parseDocumentHash, type CorpusIndex } from '../../../src/library/entry-links'
import { LibraryDatabase } from '../../../src/library/db'
import type { LibraryService } from '../../../src/library/service'
import { routeHit, scopedSearch, type SearchDeps } from '../../../src/library/scoped-search'
import { commitOf, getSource } from '../../../src/library/sources'

const quickFile = JSON.stringify({
  reference: { 'bookref-quick': { name: 'Quick Reference', id: 'bookref-quick', contents: [{ name: '第一章' }] } },
  data: { 'bookref-quick': [{ type: 'section', name: '第一章', entries: ['x'] }] },
})
// 城主屏文件里也带了速查（作者的真实情况）：同编号只取第一份
const dmFile = JSON.stringify({
  reference: { 'bookref-quick': { name: '重复的速查', id: 'bookref-quick', contents: [] }, 'bookref-dmscreen': { name: 'DM Reference', id: 'bookref-dmscreen', contents: [] } },
  data: { 'bookref-quick': [], 'bookref-dmscreen': [{ type: 'section', name: '城主', entries: [] }] },
})

const corpus: CorpusIndex = new Map([['book', new Map([['phb', { id: 'PHB', source: 'PHB' }]])], ['adventure', new Map([['lmop', { id: 'LMoP', source: 'LMoP' }]])]])
const hit = (prop: string | null, u: string, s = 'PHB') => ({ prop: prop as string, doc: { u, s } })

describe('routeHit：按命中种类分流', () => {
  it('普通条目走条目', () => {
    expect(routeHit(hit('spell', 'fireball_phb'), corpus, ['bookref-quick'])).toEqual({ target: { kind: 'entry' }, hash: 'fireball_phb' })
  })
  it('书与冒险走全文，带本的编号与来源（编号不分大小写对）', () => {
    expect(routeHit(hit('book', 'phb'), corpus, [])?.target).toEqual({ kind: 'corpus', prop: 'book', id: 'PHB', source: 'PHB' })
    expect(routeHit(hit('adventure', 'LMoP', 'LMoP'), corpus, [])?.target).toMatchObject({ kind: 'corpus', id: 'LMoP' })
  })
  it('书目里找不到的书 / 冒险（例如自制里的）不交给界面', () => {
    expect(routeHit(hit('book', 'homebrew-book'), corpus, [])).toBeNull()
  })
  it('文档按文档编号认，拆出章节序号与小节名；类别为空也能认', () => {
    const r = routeHit(hit(null, 'bookref-quick,4,%e8%b7%b3%e8%b7%83'), corpus, ['bookref-quick'])
    expect(r?.target).toEqual({ kind: 'document', id: 'bookref-quick', chapter: 4, header: '跳跃' })
  })
  it('既不是文档也没有类别的命中（作者的页面类）不交给界面', () => {
    expect(routeHit(hit(null, 'pages-something'), corpus, ['bookref-quick'])).toBeNull()
  })
  it('文档编号只认整段（bookref-quickly 不是 bookref-quick）', () => {
    expect(parseDocumentHash('bookref-quickly,1,x', ['bookref-quick'])).toBeNull()
  })
})

let db: LibraryDatabase
const official = getSource('cn-official')
async function seedFile(path: string, text: string, commit = commitOf(official)): Promise<void> {
  await db.files.put({ source: official.id, path, commit, text, gitSha: 'x', size: text.length, savedAt: 0 })
}
beforeEach(async () => { db = new LibraryDatabase(`test-docs-${Math.random()}`) })
afterEach(async () => { await db.delete() })

describe('DocumentStore：文档类数据原样读下载好的文件', () => {
  it('文件格式不对不报错，只是没有文档', () => {
    expect(documentsOfFile('x.json', 'not json')).toEqual([])
    expect(documentsOfFile('x.json', '{"reference":{"a":{"name":"A"}},"data":{}}')).toEqual([])
  })

  it('按文件名规则找（不手抄名单）；-index 目录文件不算；同编号取文件名排在前的那份', async () => {
    await seedFile('data/generated/bookref-quick.json', quickFile)
    await seedFile('data/generated/bookref-dmscreen.json', dmFile)
    await seedFile('data/generated/bookref-dmscreen-index.json', '{"reference":{"bad":{"name":"不该出现"}},"data":{"bad":[]}}')
    await seedFile('data/spells/spells-phb.json', '{}')
    const heads = await new DocumentStore(db).list(official)
    expect(heads.map((h) => h.id).sort()).toEqual(['bookref-dmscreen', 'bookref-quick'])
    // bookref-dmscreen.json 排在 bookref-quick.json 前面，所以重复的速查取它那份
    expect(heads.find((h) => h.id === 'bookref-quick')?.file).toBe('data/generated/bookref-dmscreen.json')
  })

  it('旧安装（没存过文档、文件已下载）第一次读就现建；全文原样', async () => {
    await seedFile('data/generated/bookref-quick.json', quickFile)
    const store = new DocumentStore(db)
    const body = await store.get(official, 'bookref-quick')
    expect(body.head.name).toBe('Quick Reference')
    expect(body.data).toEqual([{ type: 'section', name: '第一章', entries: ['x'] }])
    expect(await db.derived.get(`docs:${official.id}`)).toBeTruthy()
  })

  it('别的版本的文件不算（提交号对不上）', async () => {
    await seedFile('data/generated/bookref-quick.json', quickFile, 'oldcommit')
    expect(await new DocumentStore(db).list(official)).toEqual([])
  })

  it('没有这份文档就说明是哪份', async () => {
    await expect(new DocumentStore(db).get(official, 'nope')).rejects.toThrow(/nope/)
  })

  it('clear 之后缓存清空', async () => {
    await seedFile('data/generated/bookref-quick.json', quickFile)
    const store = new DocumentStore(db)
    await store.list(official)
    await store.clear(official)
    expect(await db.derived.get(`docs:${official.id}`)).toBeUndefined()
  })
})

// 假的库服务：只回答 locate / 搜索路由要用的这几件事
function fakeLib(stored: Record<string, { item: unknown; source: string | null }>, search: Array<{ prop: string; doc: Record<string, unknown>; score: number }>): LibraryService {
  const frame = {
    call: async (fn: string) => (fn === 'loaders'
      ? [{ props: ['book', 'bookData'], page: 'book.html', kind: 'corpus', index: 'books.json' }, { props: ['adventure', 'adventureData'], page: 'adventure.html', kind: 'corpus', index: 'adventures.json' }]
      : fn === 'corpusList' ? [{ id: 'PHB', source: 'PHB', hash: 'phb' }] : []),
  }
  return {
    frameOf: async () => frame,
    storedItem: async (set: string, prop: string, hash: string) => stored[`${set}|${prop}|${hash}`] ?? null,
    search: async () => search,
  } as unknown as LibraryService
}

describe('EntryLinks.locate：按（类别、编号）找所在包', () => {
  it('官方优先；官方没有再找自制；书 / 文档走各自的路', async () => {
    await seedFile('data/generated/bookref-quick.json', quickFile)
    const lib = fakeLib({ 'cn-brew|spell|mine_x': { item: {}, source: 'MyBrew' }, 'cn-official|spell|a_phb': { item: {}, source: 'PHB' } }, [])
    const links = new EntryLinks(lib, new DocumentStore(db))
    expect(await links.locate('cn', 'spell', 'a_phb')).toMatchObject({ kind: 'entry', set: 'cn-official', source: 'PHB' })
    expect(await links.locate('cn', 'spell', 'mine_x')).toMatchObject({ kind: 'entry', set: 'cn-brew', source: 'MyBrew' })
    expect(await links.locate('cn', 'spell', 'nope')).toBeNull()
    expect(await links.locate('cn', 'book', 'PHB')).toMatchObject({ kind: 'corpus', set: 'cn-official', id: 'PHB' })
    expect(await links.locate('cn', 'document', 'bookref-quick,4,x')).toMatchObject({ kind: 'document', set: 'cn-official', id: 'bookref-quick' })
  })
})

describe('scopedSearch：命中的包不再靠猜（B-01）', () => {
  it('书的命中指向官方包（不是自制包）；文档带 target；点不开的页面类被丢掉', async () => {
    await seedFile('data/generated/bookref-quick.json', quickFile)
    const lib = fakeLib({ 'cn-official|spell|fireball_phb': { item: {}, source: 'PHB' } }, [
      { score: 3, prop: 'spell', doc: { u: 'fireball_phb', s: 'PHB' } },
      { score: 2, prop: 'book', doc: { u: 'phb', s: 'PHB' } },
      { score: 1, prop: null as unknown as string, doc: { u: 'bookref-quick,4,%e8%b7%b3%e8%b7%83', s: 'PHB' } },
      { score: 1, prop: null as unknown as string, doc: { u: 'some-tool-page', s: 'PHB' } },
    ])
    const deps: SearchDeps = {
      lib, links: new EntryLinks(lib, new DocumentStore(db)), sets: [official, getSource('cn-brew')],
      installed: async (s) => s.kind === 'official', assignments: async () => new Map(), houseUnits: async () => new Set(),
      viewFor: async () => ({ visible: true, reason: 'scope', membership: { assignment: null, basis: 'author' } as never }),
    }
    const out = await scopedSearch(deps, { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} }, '玩家')
    expect(out.map((r) => [r.ref.set, r.ref.prop, r.target.kind])).toEqual([['cn-official', 'spell', 'entry'], ['cn-official', 'book', 'corpus'], ['cn-official', 'document', 'document']])
    expect(out[2].target).toMatchObject({ id: 'bookref-quick', chapter: 4, header: '跳跃' })
  })
})

describe('EntryLinks.resolveTag：标签 → 条目（B-04）', () => {
  function libWithTag(meta: unknown, stored: Record<string, { item: unknown; source: string | null }> = {}): LibraryService {
    const base = fakeLib(stored, [])
    const frame = { call: async (fn: string) => (fn === 'tagMeta' ? meta : fn === 'loaders' ? [] : []) }
    return { ...base, frameOf: async () => frame } as unknown as LibraryService
  }

  it('作者给的每个类别候选都试，找到就交；找不到 located 为 null', async () => {
    // 职业页对应职业与子职业两个类别：编号是子职业的写法，所以第二个候选才找到
    const lib = libWithTag({ tag: '@subclass', name: '炼金师', displayText: '炼金师', source: 'TCE', page: 'classes.html', hash: 'a_tce,state:sub_b_tce=b1', props: ['class', 'subclass'] }, { 'cn-official|subclass|a_tce,state:sub_b_tce=b1': { item: {}, source: 'TCE' } })
    const links = new EntryLinks(lib, new DocumentStore(db))
    expect((await links.resolveTag('cn', '@subclass', 'x'))?.located).toMatchObject({ prop: 'subclass', set: 'cn-official' })
    const none = await new EntryLinks(libWithTag({ tag: '@spell', name: 'x', displayText: 'x', source: 'PHB', page: 'spells.html', hash: 'x_phb', props: ['spell'] }), new DocumentStore(db)).resolveTag('cn', '@spell', 'x|PHB')
    expect(none).toMatchObject({ name: 'x', located: null })
  })

  it('速查标签的编号是文档编号：不用类别，按文档认', async () => {
    await seedFile('data/generated/bookref-quick.json', quickFile)
    const lib = libWithTag({ tag: '@quickref', name: '跳跃', displayText: '跳跃', source: 'PHB', page: 'quickreference.html', hash: 'bookref-quick,4,%e8%b7%b3%e8%b7%83', props: ['reference', 'referenceData'] })
    const r = await new EntryLinks(lib, new DocumentStore(db)).resolveTag('cn', '@quickref', '跳跃|PHB|4')
    expect(r?.located).toMatchObject({ kind: 'document', id: 'bookref-quick' })
  })

  it('作者不认识的标签（骰子标签等）返回 null', async () => {
    expect(await new EntryLinks(libWithTag(null), new DocumentStore(db)).resolveTag('cn', '@dice', '1d6')).toBeNull()
  })
})
