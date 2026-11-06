import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { parsedKey } from '../../../src/library/install'
import { LibraryService } from '../../../src/library/service'
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
  engHashes: ['ea_xphb', null, 'ec_xphb'],
}

let db: LibraryDatabase
beforeEach(async () => {
  db = new LibraryDatabase(`test-service-${Math.random()}`)
  await db.derived.put({ key: parsedKey('cn-official', 'spell'), fingerprint: 'x', value: spells, savedAt: 0 })
  await db.derived.put({ key: 'audit:cn-official', fingerprint: 'x', value: { parse: { props: { spell: { count: 3, noHash: 0 } } } }, savedAt: 0 })
})
afterEach(async () => { await db.delete() })

describe('LibraryService.query', () => {
  it('屏蔽表为空：全部返回；按来源取只留这本书（不分大小写）', async () => {
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({ excludedFlags: () => ({ hashes: [], excluded: null }) }) })
    expect((await svc.query('cn-official', 'spell')).map((r) => r.hash)).toEqual(spells.hashes)
    expect((await svc.query('cn-official', 'spell', { source: 'xphb' })).map((r) => r.hash)).toEqual(['a_xphb', 'c_xphb'])
  })

  it('有屏蔽：默认去掉；includeExcluded 时带标记一并返回', async () => {
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({ excludedFlags: () => ({ hashes: spells.hashes, excluded: [true, false, true] }) }) })
    expect((await svc.query('cn-official', 'spell')).map((r) => r.hash)).toEqual(['b_phb'])
    expect((await svc.query('cn-official', 'spell', { includeExcluded: true })).map((r) => [r.hash, r.excluded])).toEqual([['a_xphb', true], ['b_phb', false], ['c_xphb', true]])
  })

  it('作者现场的先后顺序和库里不同：按编号对齐', async () => {
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({ excludedFlags: () => ({ hashes: ['c_xphb', 'a_xphb', 'b_phb'], excluded: [true, false, false] }) }) })
    expect((await svc.query('cn-official', 'spell', { includeExcluded: true })).map((r) => [r.hash, r.excluded])).toEqual([['a_xphb', false], ['b_phb', false], ['c_xphb', true]])
  })

  it('作者现场展开的编号和库里存的对不上：报错，不猜', async () => {
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({ excludedFlags: () => ({ hashes: ['a_xphb', 'b_phb'], excluded: [false, false] }) }) })
    await expect(svc.query('cn-official', 'spell')).rejects.toThrow('对不上')
  })

  it('同一套程序只开一个小窗', async () => {
    let opened = 0
    const svc = new LibraryService({ db, openFrame: async () => { opened++; return fakeFrame({ excludedFlags: () => ({ hashes: [], excluded: null }) }) } })
    await Promise.all([svc.query('cn-official', 'spell'), svc.query('cn-official', 'spell')])
    expect(opened).toBe(1)
  })
})

describe('LibraryService.detail', () => {
  it('英文没装：返回 not-installed，不去开英文小窗', async () => {
    const opened: string[] = []
    const svc = new LibraryService({ db, openFrame: async (codeSet) => { opened.push(codeSet); return fakeFrame({ detail: () => ({ item: {}, hash: 'a_xphb', source: 'XPHB', excluded: false, fluff: null, fluffError: null, engHash: 'ea_xphb' }) }) } })
    const d = await svc.detail('cn-official', 'spell', 'a_xphb', 'XPHB')
    expect(d?.english).toEqual({ status: 'not-installed', hash: 'ea_xphb' })
    expect(opened).toEqual(['cn'])
  })

  it('英文已装：用英文编号到英文小窗取', async () => {
    await db.sets.put({ id: 'en-official', status: 'installed' })
    const asked: unknown[] = []
    const svc = new LibraryService({
      db,
      openFrame: async (codeSet) => fakeFrame({
        detail: (prop, hash, source) => {
          asked.push([codeSet, prop, hash, source])
          return codeSet === 'cn'
            ? { item: { name: '甲' }, hash, source: 'XPHB', excluded: false, fluff: null, fluffError: null, engHash: 'ea_xphb' }
            : { item: { name: 'A' }, hash, source: 'XPHB', excluded: false, fluff: { f: 1 }, fluffError: null, engHash: null }
        },
      }),
    })
    const d = await svc.detail('cn-official', 'spell', 'a_xphb', 'XPHB')
    expect(d?.english).toEqual({ status: 'found', hash: 'ea_xphb', item: { name: 'A' }, fluff: { f: 1 } })
    expect(asked).toEqual([['cn', 'spell', 'a_xphb', 'XPHB'], ['en', 'spell', 'ea_xphb', 'XPHB']])
  })
})

describe('LibraryService.englishCoverage', () => {
  it('按英文解析结果的编号数配上的；算不出英文编号的单独计数；清单存进体检', async () => {
    await db.derived.put({ key: parsedKey('en-official', 'spell'), fingerprint: 'x', value: { items: [{}, {}], hashes: ['ea_xphb', 'zz_xphb'], sources: [], engHashes: null }, savedAt: 0 })
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({}) })
    const c = await svc.englishCoverage('cn-official')
    expect(c.props.spell).toEqual({ total: 3, paired: 1, noEngHash: 1, unpaired: 2 })
    expect(c.unpaired).toEqual([{ prop: 'spell', hash: 'b_phb', engHash: null }, { prop: 'spell', hash: 'c_xphb', engHash: 'ec_xphb' }])
    expect((await db.derived.get('audit:english:cn-official'))?.value).toEqual(c)
  })
})
