import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parseBrew } from '../../../src/library/brew'
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { parsedKey } from '../../../src/library/install'
import { libraryHandlers } from '../../../src/library/runtime/handlers'
import type { AuthorFrame } from '../../../src/library/runtime/host'
import { LibraryService } from '../../../src/library/service'
import { getSource } from '../../../src/library/sources'

// 假小窗：只回答用到的指令；作者函数本身在 e2e（tests/e2e/library/b2-7-brew.mjs）里用真程序测
function fakeFrame(answers: Record<string, (...args: unknown[]) => unknown>, onClose?: () => void): AuthorFrame {
  return {
    codeSet: 'cn',
    frame: null as unknown as HTMLIFrameElement,
    ready: null as unknown as AuthorFrame['ready'],
    failures: [],
    call: (async (fn: string, ...args: unknown[]) => {
      const a = answers[fn]
      if (!a) throw new Error(`假小窗没有 ${fn}`)
      return a(...args)
    }) as AuthorFrame['call'],
    close: () => onClose?.(),
  }
}

let db: LibraryDatabase
beforeEach(() => { db = new LibraryDatabase(`test-brew-${Math.random()}`) })
afterEach(async () => { await db.delete() })

describe('作者同步存储（localStorage）存进库', () => {
  it('写进去的下次开小窗时能整份取回；和异步存储分开', async () => {
    const h = libraryHandlers({ codeSet: 'cn', db, files: new FileProvider({ db }), allowNetwork: () => false })
    await h.localSet('HOMEBREW_2_STORAGE_METAS', '[{"docIdLocal":"x"}]')
    await h.localSet('search', '{"isShowLegacy":true}')
    await h.kvSet('HOMEBREW_2_STORAGE', [{ head: {} }])
    await h.localRemove('search')
    expect(await h.localSnapshot()).toEqual({ HOMEBREW_2_STORAGE_METAS: '[{"docIdLocal":"x"}]' })
    expect(await h.kvGet('HOMEBREW_2_STORAGE')).toEqual([{ head: {} }])
    const en = libraryHandlers({ codeSet: 'en', db, files: new FileProvider({ db }), allowNetwork: () => false })
    expect(await en.localSnapshot()).toEqual({})
  })
})

describe('parseBrew', () => {
  it('先清旧结果；只存有内容的类别；作者报错原样记下；小窗用完关掉', async () => {
    const source = getSource('cn-brew')
    await db.derived.put({ key: parsedKey('cn-brew', 'feat'), fingerprint: 'brew', value: {}, savedAt: 0 })
    let closed = false
    const report = await parseBrew({
      source,
      db,
      openFrame: async () => fakeFrame({
        brewInstalled: () => [{ head: { docIdLocal: 'a', filename: 'x.json' }, meta: {} }],
        loaders: () => [{ props: ['spell', 'spellFluff'], page: 'spells.html', kind: 'site' }, { props: ['raw_class', 'class'], page: 'classes.html', kind: 'site' }, { props: ['book', 'bookData'], page: 'book.html', kind: 'corpus', index: 'books.json' }],
        frameErrors: () => ['Error: 无法加载 8 个条目的引用！'],
        brewDocIndex: () => [{ docIdLocal: 'a', filename: 'x.json', timeAdded: 1, order: 1, isEditable: false, sources: ['X'], props: { spell: ['s_x'] } }],
        parseBrewProp: (prop) => {
          if (prop === 'class') throw new Error('作者加载器报错')
          return prop === 'spell' ? { items: [{}], hashes: ['s_x'], sources: ['X'] } : { items: [], hashes: [], sources: [] }
        },
      }, () => { closed = true }),
      openFrameIn: async () => { throw new Error('没有同编号，不该开隔离小窗') },
    })
    expect(report.alternatives).toEqual({ targets: 0, errors: [] })
    expect(report.parse.props).toEqual({ spell: { count: 1, noHash: 0 } })
    expect(report.parse.errors).toEqual([{ prop: 'class', error: '作者加载器报错' }])
    expect(report.parse.notRun.map((n) => n.props)).toEqual([['book', 'bookData']])
    expect(report.parse.authorErrors).toEqual(['Error: 无法加载 8 个条目的引用！'])
    // 自制里没有的类别：查询返回空，不报错；解析出错的类别照样报错
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({ excludedFlags: () => ({ hashes: [], excluded: null }) }) })
    expect(await svc.query('cn-brew', 'feat')).toEqual([])
    await expect(svc.query('cn-brew', 'class')).rejects.toThrow('没有这一类的解析结果')
    expect(report.installed).toEqual([{ docIdLocal: 'a', filename: 'x.json' }])
    expect(await db.derived.get(parsedKey('cn-brew', 'feat'))).toBeUndefined()
    expect(await db.derived.get(parsedKey('cn-brew', 'spell'))).toBeDefined()
    expect((await db.derived.get('audit:cn-brew'))?.value).toEqual(report)
    expect(closed).toBe(true)
  })
})

describe('LibraryService 自制', () => {
  it('更新没有换掉任何包：不重解析', async () => {
    let opened = 0
    const svc = new LibraryService({ db, openFrame: async () => { opened++; return fakeFrame({ brewPull: () => ({ value: [], errors: [] }) }) } })
    expect(await svc.brewPull('cn-brew')).toEqual({ value: [], errors: [], parse: null })
    expect(opened).toBe(1)
  })

  it('不是自制源：报错', async () => {
    const svc = new LibraryService({ db, openFrame: async () => fakeFrame({}) })
    await expect(svc.brewInstalled('cn-official')).rejects.toThrow('不是自制源')
  })
})
