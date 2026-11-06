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

const detailOf = (hash: string) => ({ item: { hash }, hash, source: 'XPHB', excluded: false, fluff: null, fluffError: null, engSiteHash: null })

// 作者做法配对的假答案：a、c 在作者索引里，a 找到英文 ea_xphb（按名字），c 找不到；b 不在索引里
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
  it('英文没装：返回 not-installed，不开配对用的小窗', async () => {
    const opened: string[] = []
    const svc = new LibraryService({ db, openFrame: async (codeSet) => { opened.push(codeSet); return fakeFrame({ detail: (_p, hash) => detailOf(hash as string) }) } })
    const d = await svc.detail('cn-official', 'spell', 'a_xphb', 'XPHB')
    expect(d?.english).toEqual({ status: 'not-installed' })
    expect(opened).toEqual(['cn'])
  })

  it('配上的：用作者做法找到的英文编号去英文小窗取；没配上的：not-paired', async () => {
    await installBoth()
    const asked: unknown[] = []
    const svc = new LibraryService({
      db,
      openFrame: async (codeSet) => fakeFrame({
        detail: (prop, hash) => { asked.push([codeSet, prop, hash]); return detailOf(hash as string) },
        englishLocators: cnLocators,
        englishMatch: enMatches,
      }),
    })
    const a = await svc.detail('cn-official', 'spell', 'a_xphb', 'XPHB')
    expect(a?.english).toEqual({ status: 'found', hash: 'ea_xphb', via: 'name', item: { hash: 'ea_xphb' }, fluff: null })
    expect(asked).toContainEqual(['en', 'spell', 'ea_xphb'])
    expect((await svc.detail('cn-official', 'spell', 'c_xphb', 'XPHB'))?.english).toEqual({ status: 'not-paired' })
  })
})

describe('LibraryService.englishPairs', () => {
  it('配对表按两边版本存进库；版本不变时直接用，不再开小窗', async () => {
    await installBoth()
    let opened = 0
    const open = async () => { opened++; return fakeFrame({ englishLocators: cnLocators, englishMatch: enMatches }) }
    const first = await new LibraryService({ db, openFrame: open }).englishPairs('cn-official')
    expect(first.pairs).toEqual({ spell: { a_xphb: { enHash: 'ea_xphb', enSource: 'XPHB', via: 'name' } } })
    expect(first.unmatched).toEqual([{ prop: 'spell', hash: 'c_xphb' }])
    expect(opened).toBe(2)
    await new LibraryService({ db, openFrame: open }).englishPairs('cn-official')
    expect(opened).toBe(2)
  })
})

describe('LibraryService.englishCoverage', () => {
  it('每条中文按原因分：配上、不在作者索引、索引里有但英文没找到；清单存进体检', async () => {
    await installBoth()
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({ englishLocators: cnLocators, englishMatch: enMatches }) })
    const c = await svc.englishCoverage('cn-official')
    expect(c.props.spell).toEqual({ total: 3, paired: 1, nameMismatch: 0, 'not-in-index': 1, 'no-english-record': 1 })
    expect(c.unpaired).toEqual([{ prop: 'spell', hash: 'b_phb', reason: 'not-in-index' }, { prop: 'spell', hash: 'c_xphb', reason: 'no-english-record' }])
    expect((await db.derived.get('audit:english:cn-official'))?.value).toEqual(c)
  })

  it('自动核对：配上的两条里，中文 ENG_name 和英文 name 不同就列出来（不改配对）', async () => {
    await installBoth()
    await db.derived.put({ key: parsedKey('cn-official', 'spell'), fingerprint: 'x', value: { ...spells, items: [{ ENG_name: 'Fireball' }, {}, {}] }, savedAt: 0 })
    await db.derived.put({ key: parsedKey('en-official', 'spell'), fingerprint: 'x', value: { items: [{ name: 'Delayed Blast Fireball' }], hashes: ['ea_xphb'], sources: [] }, savedAt: 0 })
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({ englishLocators: cnLocators, englishMatch: enMatches }) })
    const c = await svc.englishCoverage('cn-official')
    expect(c.props.spell.nameMismatch).toBe(1)
    expect(c.nameMismatch).toEqual([{ prop: 'spell', hash: 'a_xphb', enHash: 'ea_xphb', via: 'name', engName: 'Fireball', enName: 'Delayed Blast Fireball' }])
  })
})
