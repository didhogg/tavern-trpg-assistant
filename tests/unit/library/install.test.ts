import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { prepareOfficial } from '../../../src/library/install'
import { getSource } from '../../../src/library/sources'
import type { FileList } from '../../../src/library/fetcher'
import type { AuthorFrame } from '../../../src/library/runtime/host'
import type { LibraryView } from '../../../src/library/revision'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

const source = getSource('cn-official')
const LIST: FileList = {
  'data/books.json': { sha: 'a', size: 5 },
  'data/book/book-phb.json': { sha: 'b', size: 10 },
  'data/spells/spells-phb.json': { sha: 'c', size: 20 },
  'data/items.json': { sha: 'd', size: 30 },
  'search/index.json': { sha: 'e', size: 5 },
  'data/adventure/adventure-lmop.json': { sha: 'f', size: 10 },
}

function fakeFrame(opts: { parseError?: boolean } = {}): AuthorFrame {
  return {
    codeSet: 'cn', frame: null as unknown as HTMLIFrameElement, ready: null as unknown as AuthorFrame['ready'], failures: [],
    call: (async (fn: string, ...args: unknown[]) => {
      switch (fn) {
        case 'init': return undefined
        case 'loaders': return [
          { props: ['spell'], page: 'spells.html', kind: 'site' },
          { props: ['book', 'bookData'], page: 'book.html', kind: 'corpus', index: 'books.json' },
          { props: ['adventure', 'adventureData'], page: 'adventure.html', kind: 'corpus', index: 'adventures.json' },
        ]
        case 'parseProp': if (opts.parseError) throw new Error('作者解析失败'); return { items: [{ name: '火球术' }], hashes: ['fireball_phb'], sources: ['PHB'] }
        case 'corpusList': return args[0] === 'adventures.json' ? [{ id: 'LMoP', source: 'LMoP', hash: 'lmop' }] : [{ id: 'PHB', source: 'PHB', hash: 'phb' }]
        case 'parseCorpus': return { book: [{ id: 'PHB' }], bookData: [{ id: 'PHB' }], adventure: [{ id: 'LMoP' }], adventureData: [{ id: 'LMoP' }] }
        case 'searchIndexHashes': return { spell: ['fireball_phb'] }
        case 'excludeList': return []
        case 'fluffOfMany': return {}
        case 'excludedFlags': return { excluded: null, hashes: [] }
        case 'searchIndexDump': return { json: '[]' }
        case 'extractTables': return { tables: [], skipped: [] }
        case 'storageFlush': return []
        default: throw new Error(`假小窗没有 ${fn} ${String(args[0] ?? '')}`)
      }
    }) as AuthorFrame['call'],
    close: () => undefined,
  }
}

function fakeFiles(view: LibraryView) {
  return {
    fileList: async () => LIST,
    record: async (s: typeof source, path: string) => view.fileGet(s, path),
    cachedContent: async () => null,
    get: async (s: typeof source, path: string) => {
      const local = await view.fileGet(s, path)
      if (local) return local.text
      const text = JSON.stringify({ data: path })
      await view.filePut(s, path, { commit: await view.commitOf(s), text, gitSha: LIST[path]?.sha ?? 'x', size: LIST[path]?.size ?? text.length })
      return text
    },
    whenReady: async () => undefined,
  }
}

describe('prepareOfficial（P5 T3）', () => {
  it('已装冒险更新：计划里的冒险正文也会解析发布，不永远跳过', async () => {
    db = new LibraryDatabase(`install-adv-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const handle = await operations.begin({ kind: 'official', set: 'cn-official', codeSet: 'cn' })
    const base = { files: [] as string[], bytes: 0 }
    const files = ['data/adventure/adventure-lmop.json']
    const report = await prepareOfficial({
      source, db, revisions, operations, files: fakeFiles(handle.target) as never,
      openFrame: async () => fakeFrame(), view: handle.target,
      plan: { ...base, files, bytes: 10, shared: { files, bytes: 10 }, bySource: base, byBook: base, byClass: base, byAdventure: { files, bytes: 10 }, sourceIndexes: {}, missing: { sources: [], books: [] }, sources: [], books: [], adventures: ['LMoP'] },
      sources: [], books: [], adventures: ['LMoP'],
    })
    expect(report.publishable).toBe(true)
    expect(report.parse.corpora.adventure).toMatchObject({ count: 1, failed: [] })
    await operations.abort(handle, new Error('清理'))
  })

  it('取消停在文件边界：不发布、不开始镜像', async () => {
    db = new LibraryDatabase(`install-cancel-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const handle = await operations.begin({ kind: 'official', set: 'cn-official', codeSet: 'cn' })
    const base = { files: [] as string[], bytes: 0 }
    const controller = new AbortController()
    controller.abort()
    const report = await prepareOfficial({
      source, db, revisions, operations, files: fakeFiles(handle.target) as never, openFrame: async () => fakeFrame(), view: handle.target,
      plan: { ...base, files: ['data/spells/spells-phb.json'], shared: base, bySource: base, byBook: base, byClass: base, byAdventure: base, sourceIndexes: {}, missing: { sources: [], books: [] }, sources: [], books: [], adventures: [] },
      signal: controller.signal,
    })
    expect(report.cancelled).toBe(true)
    expect(report.mirror.checked).toBe(0)
    await operations.abort(handle, new Error('清理'))
  })

  it('计划里缺书：不能发布，也不登记为已装', async () => {
    db = new LibraryDatabase(`install-miss-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const handle = await operations.begin({ kind: 'official', set: 'cn-official', codeSet: 'cn' })
    const base = { files: [] as string[], bytes: 0 }
    const report = await prepareOfficial({
      source, db, revisions, operations, files: fakeFiles(handle.target) as never,
      openFrame: async () => fakeFrame(), view: handle.target,
      plan: { ...base, shared: base, bySource: base, byBook: base, byClass: base, byAdventure: base, sourceIndexes: {}, missing: { sources: [], books: ['NOPE'] }, sources: [], books: ['NOPE'], adventures: [] },
      sources: [], books: ['NOPE'], adventures: [],
    })
    expect(report.publishable).toBe(false)
    expect(report.reasons.join('；')).toContain('找不到')
    await operations.abort(handle, new Error('清理'))
  })

  it('在准备版本里下载 / 解析 / 检查；发布前旧版本不动，发布后新版本可读', async () => {
    db = new LibraryDatabase(`install-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const old = await revisions.published()
    const handle = await operations.begin({ kind: 'official', set: 'cn-official', codeSet: 'cn' })
    await operations.setTargetOfficial(handle, { 'cn-official': { commit: 'c1', status: 'missing', sources: null, books: null, adventures: null } })
    const report = await prepareOfficial({
      source, db, revisions, operations, files: fakeFiles(handle.target) as never,
      openFrame: async () => fakeFrame(), view: handle.target,
      sources: ['PHB'], books: ['PHB'], adventures: [],
    })
    expect(report.reasons).toEqual([])
    expect(report.publishable).toBe(true)
    expect(report.parse.props.spell).toEqual({ count: 1, noHash: 0 })
    expect(report.parse.corpora.book).toMatchObject({ count: 1, skipped: 0, failed: [] })
    expect(report.settlementReady).toBe(true)
    expect(await old.fileGet(source, 'data/spells/spells-phb.json')).toBeNull()
    const published = await operations.publish(handle, {
      official: { 'cn-official': { commit: 'c1', status: 'installed', sources: ['PHB'], books: ['PHB'], adventures: [] } },
      sourceIndexes: {}, result: report,
    })
    expect((await published.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('c1')
    expect((await published.fileGet(source, 'data/spells/spells-phb.json'))?.text).toBeTruthy()
    expect(await old.derivedGet('parsed:cn-official:spell')).toBeUndefined()
  })

  it('解析失败：不可发布，调用方作废准备版本，旧版本仍可用', async () => {
    db = new LibraryDatabase(`install-fail-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    await db.derived.put({ key: 'parsed:cn-official:spell', fingerprint: 'old', value: { items: [{ name: '旧' }] }, savedAt: 1 })
    const operations = new LibraryOperations({ db, revisions })
    const old = await revisions.published()
    const handle = await operations.begin({ kind: 'official', set: 'cn-official', codeSet: 'cn' })
    await operations.setTargetOfficial(handle, { 'cn-official': { commit: 'c1', status: 'missing', sources: null, books: null, adventures: null } })
    const report = await prepareOfficial({
      source, db, revisions, operations, files: fakeFiles(handle.target) as never,
      openFrame: async () => fakeFrame({ parseError: true }), view: handle.target,
      sources: ['PHB'], books: ['PHB'], adventures: [],
    })
    expect(report.publishable).toBe(false)
    expect(report.reasons.join('；')).toContain('解析')
    await operations.abort(handle, new Error(report.reasons.join('；')))
    expect((await revisions.published()).id).toBe(old.id)
    expect((await old.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('old')
  })
})
