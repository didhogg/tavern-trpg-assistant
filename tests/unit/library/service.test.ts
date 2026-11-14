import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { parsedKey } from '../../../src/library/install'
import { LibraryService } from '../../../src/library/service'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { LibraryOperations } from '../../../src/library/operations'
import { baseFingerprint, manageFingerprint } from '../../../src/library/cache'
import { getSource } from '../../../src/library/sources'
import type { AuthorFrame } from '../../../src/library/runtime/host'

// 假小窗：只回答这几条指令，用来测插件这边自己做的事（按来源分组、屏蔽标记、编号核对、英文配对计数）。
// 作者函数本身的行为在 e2e（tests/e2e/library/b2-4-5.mjs）里用真程序测。
function fakeFrame(answers: Record<string, (...args: unknown[]) => unknown>, calls: string[] = []): AuthorFrame {
  return {
    codeSet: 'cn',
    frame: null as unknown as HTMLIFrameElement,
    ready: null as unknown as AuthorFrame['ready'],
    failures: [],
    call: (async (fn: string, ...args: unknown[]) => {
      calls.push(fn)
      const a = answers[fn]
      if (!a) throw new Error(`假小窗没有 ${fn}`)
      return a(...args)
    }) as AuthorFrame['call'],
    close: () => {},
  }
}

const spells = {
  items: [{ n: 'a' }, { n: 'b' }, { n: 'c' }],
  hashes: ['a_xphb', 'b_phb', 'c_xphb'],
  sources: ['XPHB', 'PHB', 'XPHB'],
}

let db: LibraryDatabase
let revisions: LibraryRevisionStore
async function seedSpellCache({ excluded = null as Record<string, boolean> | null, fluff = {} as Record<string, unknown> } = {}): Promise<void> {
  const source = getSource('cn-official')
  const base = await baseFingerprint(source, db)
  const manage = await manageFingerprint(db)
  await db.derived.put({ key: 'pre:cn-official:excluded:spell', fingerprint: `${base}|seed|${manage}`, value: { excluded, base, exclude: 'seed', manage }, savedAt: 0 })
  await db.derived.put({ key: 'pre:cn-official:fluff:spell', fingerprint: base, value: fluff, savedAt: 0 })
}

beforeEach(async () => {
  db = new LibraryDatabase(`test-service-${Math.random()}`)
  // 官方资料装好了（开作者小窗那道门要查，C1）
  await db.sets.put({ id: 'cn-official', commit: 'c', status: 'installed' } as never)
  revisions = new LibraryRevisionStore(db)
  await revisions.ensureLegacy()
  await db.derived.put({ key: parsedKey('cn-official', 'spell'), fingerprint: 'x', value: spells, savedAt: 0 })
  await db.derived.put({ key: 'audit:cn-official', fingerprint: 'x', value: { parse: { props: { spell: { count: 3, noHash: 0 } } } }, savedAt: 0 })
})
afterEach(async () => { await db.delete() })

describe('LibraryService.query', () => {
  it('公共 frameOf 默认绑定当前已发布版本，不再传 legacy 缓存键', async () => {
    let seen: string | undefined
    const svc = new LibraryService({ db, revisions, openFrame: async (_cs, ctx) => { seen = ctx?.view?.id; return fakeFrame({}) } })
    const view = await revisions.published()
    await svc.frameOf('cn')
    expect(seen).toBe(view.id)
  })

  it('缓存命中：只读库，不开小窗；按来源取只留这本书（不分大小写）', async () => {
    await seedSpellCache()
    let opened = 0
    const svc = new LibraryService({ db, revisions, openFrame: async () => { opened++; return fakeFrame({}) } })
    expect((await svc.query('cn-official', 'spell')).map((r) => r.hash)).toEqual(spells.hashes)
    expect((await svc.query('cn-official', 'spell', { source: 'xphb' })).map((r) => r.hash)).toEqual(['a_xphb', 'c_xphb'])
    expect(opened).toBe(0)
  })

  it('当前版本已装来源之外的条目读不到；旧版本仍可读', async () => {
    await seedSpellCache()
    const old = await revisions.published()
    const ops = new (await import('../../../src/library/operations')).LibraryOperations({ db, revisions })
    const h = await ops.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    const state = { commit: old.revision.official?.['cn-official']?.commit ?? '', status: 'installed' as const, sources: ['PHB'], books: ['PHB'], adventures: [] }
    await ops.setTargetOfficial(h, { 'cn-official': state })
    const current = await ops.publish(h, { official: { 'cn-official': state } })
    const svc = new LibraryService({ db, revisions, openFrame: async () => { throw new Error('不该开小窗') } })
    expect((await svc.query('cn-official', 'spell', { view: current })).map((r) => r.hash)).toEqual(['b_phb'])
    expect(await svc.detail('cn-official', 'spell', 'a_xphb', undefined, current)).toBeNull()
    expect((await svc.query('cn-official', 'spell', { view: old })).map((r) => r.hash)).toEqual(spells.hashes)
  })

  it('缓存里的屏蔽标记：默认去掉；includeExcluded 时带标记一并返回', async () => {
    await seedSpellCache({ excluded: { a_xphb: true, b_phb: false, c_xphb: true } })
    const svc = new LibraryService({ db, revisions, openFrame: async () => fakeFrame({}) })
    expect((await svc.query('cn-official', 'spell')).map((r) => r.hash)).toEqual(['b_phb'])
    expect((await svc.query('cn-official', 'spell', { includeExcluded: true })).map((r) => [r.hash, r.excluded])).toEqual([['a_xphb', true], ['b_phb', false], ['c_xphb', true]])
  })

  it('缓存按编号取，不按作者现场的先后顺序', async () => {
    await seedSpellCache({ excluded: { c_xphb: true, a_xphb: false, b_phb: false } })
    const svc = new LibraryService({ db, revisions, openFrame: async () => fakeFrame({}) })
    expect((await svc.query('cn-official', 'spell', { includeExcluded: true })).map((r) => [r.hash, r.excluded])).toEqual([['a_xphb', false], ['b_phb', false], ['c_xphb', true]])
  })

  it('缓存里的编号和库里存的对不上：报错，不猜', async () => {
    await seedSpellCache({ excluded: { a_xphb: false, b_phb: false } })
    const svc = new LibraryService({ db, revisions, openFrame: async () => fakeFrame({}) })
    await expect(svc.query('cn-official', 'spell')).rejects.toThrow('对不上')
  })

  it('缓存缺了：按作者屏蔽表现算一次并存库，下一次只读库', async () => {
    let opened = 0
    const svc = new LibraryService({ db, revisions, openFrame: async () => { opened++; return fakeFrame({
      excludeList: () => [],
      excludedFlags: () => ({ hashes: spells.hashes, excluded: [true, false, true] }),
    }) } })
    expect((await svc.query('cn-official', 'spell')).map((r) => r.hash)).toEqual(['b_phb'])
    expect(opened).toBe(1)
    expect((await db.derived.get('pre:cn-official:excluded:spell'))?.value).toMatchObject({ excluded: { a_xphb: true, b_phb: false, c_xphb: true } })
    expect((await svc.query('cn-official', 'spell', { includeExcluded: true })).map((r) => r.hash)).toEqual(spells.hashes)
    expect(opened).toBe(1)
  })

  it('补算缓存时作者现场编号和库里存的对不上：报错，不猜', async () => {
    const svc = new LibraryService({ db, revisions, openFrame: async () => fakeFrame({
      excludeList: () => [],
      excludedFlags: () => ({ hashes: ['a_xphb', 'b_phb'], excluded: [false, false] }),
    }) })
    await expect(svc.query('cn-official', 'spell')).rejects.toThrow('对不上')
  })
})

const cnLocators = () => [
  { prop: 'spell', hash: 'a_xphb', file: 'data/spells/spells-xphb.json', locator: {} },
  { prop: 'spell', hash: 'c_xphb', file: 'data/spells/spells-xphb.json', locator: {} },
]
const enMatches = () => [
  { prop: 'spell', hash: 'a_xphb', enHash: 'ea_xphb', enSource: 'XPHB', via: 'name' },
  { prop: 'spell', hash: 'c_xphb', enHash: null, enSource: null, via: null },
]

async function installBoth() {
  await db.sets.put({ id: 'cn-official', status: 'installed' })
  await db.sets.put({ id: 'en-official', status: 'installed' })
  await db.derived.put({ key: parsedKey('en-official', 'spell'), fingerprint: 'x', value: { items: [{}, {}], hashes: ['ea_xphb', 'zz_xphb'], sources: [] }, savedAt: 0 })
}

describe('LibraryService.detail', () => {
  it('英文没装：返回 not-installed，不开任何小窗', async () => {
    await seedSpellCache({ fluff: { a_xphb: { fluff: { from: 'cache' }, fluffError: null, engSiteHash: null } } })
    const opened: string[] = []
    const svc = new LibraryService({ db, revisions, openFrame: async (codeSet) => { opened.push(codeSet); return fakeFrame({}) } })
    const d = await svc.detail('cn-official', 'spell', 'a_xphb', 'XPHB')
    expect(d?.english).toEqual({ status: 'not-installed' })
    expect(opened).toEqual([])
  })

  it('配上的：用作者配对表找到英文编号，英文对象读库；没配上的：not-paired', async () => {
    await installBoth()
    await seedSpellCache({ fluff: { a_xphb: { fluff: { from: 'cn' }, fluffError: null, engSiteHash: null } } })
    const enSource = getSource('en-official')
    await db.derived.put({ key: 'pre:en-official:fluff:spell', fingerprint: await baseFingerprint(enSource, db), value: { ea_xphb: { fluff: { from: 'en' }, fluffError: null, engSiteHash: null } }, savedAt: 0 })
    const asked: unknown[] = []
    const svc = new LibraryService({
      db,
      revisions,
      openFrame: async () => fakeFrame({
        detail: (prop, hash) => { asked.push([prop, hash]); return null },
        englishLocators: cnLocators,
        englishMatch: enMatches,
      }),
    })
    const a = await svc.detail('cn-official', 'spell', 'a_xphb', 'XPHB')
    expect(a?.english).toEqual({ status: 'found', hash: 'ea_xphb', via: 'name', item: {}, fluff: { from: 'en' } })
    expect(asked).toEqual([])
    expect((await svc.detail('cn-official', 'spell', 'c_xphb', 'XPHB'))?.english).toEqual({ status: 'not-paired' })
  })
})

describe('LibraryService.detail 只读预计算缓存', () => {
  it('详情交库里存的原件和预计算配图描述，不碰作者缓存的同编号自制', async () => {
    await seedSpellCache({ fluff: { a_xphb: { fluff: { from: 'cache' }, fluffError: null, engSiteHash: 'ea_xphb' } } })
    const calls: string[] = []
    const svc = new LibraryService({ db, revisions, openFrame: async () => fakeFrame({}, calls) })
    const d = await svc.detail('cn-official', 'spell', 'a_xphb', 'XPHB')
    expect(d?.item).toEqual(spells.items[0])
    expect(d?.fluff).toEqual({ from: 'cache' })
    expect(d?.engSiteHash).toBe('ea_xphb')
    expect(calls).toEqual([])
  })
})

describe('LibraryService.englishPairs', () => {
  it('同一个上游提交补装英文书时，重建上一库版本留下的配对表', async () => {
    await installBoth()
    const ops = new LibraryOperations({ db, revisions })
    const publish = async (books: string[]) => {
      const h = await ops.begin({ kind: 'test', set: 'en-official', codeSet: 'en' })
      const state = { commit: 'same', status: 'installed' as const, sources: books, books, adventures: [] }
      await ops.setTargetOfficial(h, { 'en-official': state })
      return ops.publish(h, { official: { 'en-official': state } })
    }
    const svc = new LibraryService({ db, revisions, openFrame: async (_cs, ctx) => {
      const books = await ctx?.view?.installedBooks('en-official')
      return fakeFrame({
        englishLocators: cnLocators,
        englishMatch: () => books?.includes('XPHB') ? enMatches() : [],
      })
    } })
    const old = await publish(['PHB'])
    expect((await svc.englishPairs('cn-official', old)).pairs.spell).toBeUndefined()
    const current = await publish(['PHB', 'XPHB'])
    expect((await svc.englishPairs('cn-official', current)).pairs.spell?.a_xphb?.enHash).toBe('ea_xphb')
    expect((await svc.englishPairs('cn-official', old)).pairs.spell).toBeUndefined()
  })

  it('配对表按两边版本存进库；版本不变时直接用，不再开小窗', async () => {
    await installBoth()
    let opened = 0
    const open = async () => { opened++; return fakeFrame({ englishLocators: cnLocators, englishMatch: enMatches }) }
    const first = await new LibraryService({ db, revisions, openFrame: open }).englishPairs('cn-official')
    expect(first.pairs).toEqual({ spell: { a_xphb: { enHash: 'ea_xphb', enSource: 'XPHB', via: 'name' } } })
    expect(first.unmatched).toEqual([{ prop: 'spell', hash: 'c_xphb' }])
    expect(opened).toBe(2)
    await new LibraryService({ db, revisions, openFrame: open }).englishPairs('cn-official')
    expect(opened).toBe(2)
  })
})

describe('LibraryService.englishCoverage', () => {
  it('每条中文按原因分：配上、不在作者索引、索引里有但英文没找到；清单存进体检', async () => {
    await installBoth()
    const svc = new LibraryService({ db, revisions, openFrame: async () => fakeFrame({ englishLocators: cnLocators, englishMatch: enMatches }) })
    const c = await svc.englishCoverage('cn-official')
    expect(c.props.spell).toEqual({ total: 3, paired: 1, nameMismatch: 0, 'not-in-index': 1, 'no-english-record': 1 })
    expect(c.unpaired).toEqual([{ prop: 'spell', hash: 'b_phb', reason: 'not-in-index' }, { prop: 'spell', hash: 'c_xphb', reason: 'no-english-record' }])
    expect((await db.derived.get('audit:english:cn-official'))?.value).toEqual(c)
  })

  it('自动核对：配上的两条里，中文 ENG_name 和英文 name 不同就列出来（不改配对）', async () => {
    await installBoth()
    await db.derived.put({ key: parsedKey('cn-official', 'spell'), fingerprint: 'x', value: { ...spells, items: [{ ENG_name: 'Fireball' }, {}, {}] }, savedAt: 0 })
    await db.derived.put({ key: parsedKey('en-official', 'spell'), fingerprint: 'x', value: { items: [{ name: 'Delayed Blast Fireball' }], hashes: ['ea_xphb'], sources: [] }, savedAt: 0 })
    const svc = new LibraryService({ db, revisions, openFrame: async () => fakeFrame({ englishLocators: cnLocators, englishMatch: enMatches }) })
    const c = await svc.englishCoverage('cn-official')
    expect(c.props.spell.nameMismatch).toBe(1)
    expect(c.nameMismatch).toEqual([{ prop: 'spell', hash: 'a_xphb', enHash: 'ea_xphb', via: 'name', engName: 'Fireball', enName: 'Delayed Blast Fireball' }])
  })
})
