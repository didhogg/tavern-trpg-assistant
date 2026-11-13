// P5-1 B-37 / B-38 / B-41：卸载官方后自制不再读、来源计数不被正文记录拖垮、没有条目的类别不再每次开小窗。
import { OfficialMissingError } from '../../../src/library/official-missing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BrewPacks } from '../../../src/library/brew-packs'
import { ensurePrecomputed } from '../../../src/library/cache'
import { LibraryDatabase } from '../../../src/library/db'
import { countSources, parsedKey } from '../../../src/library/install'
import type { LibraryService } from '../../../src/library/service'
import { getSource } from '../../../src/library/sources'

let db: LibraryDatabase
beforeEach(() => { db = new LibraryDatabase(`test-fix-${Math.random()}`) })
afterEach(async () => { await db.delete() })

describe('countSources（B-38）', () => {
  it('书 / 冒险正文记录、没有来源列表的记录、没有值的记录都跳过，不报错', () => {
    const prefix = 'parsed:cn-brew:'
    const recs = [
      { key: `${prefix}spell`, value: { sources: ['AA', 'AA', 'bb'] } },
      { key: `${prefix}corpus:book:x`, value: { id: 'x', data: [] } },
      { key: `${prefix}item`, value: undefined },
      { key: `${prefix}monster`, value: { items: [] } },
    ]
    expect(countSources(recs, prefix)).toEqual({ AA: 2, bb: 1 })
    expect(countSources(recs, prefix, { lower: true })).toEqual({ aa: 2, bb: 1 })
  })
})

describe('ensurePrecomputed（B-41）', () => {
  const opts = (onOpen: () => void) => ({ source: getSource('cn-brew'), db, prop: 'spell', excluded: true, openFrame: async () => { onOpen(); throw new Error('不该开小窗') } })

  it('这一类在这一套里没有条目：不开小窗', async () => {
    let opened = 0
    await ensurePrecomputed(opts(() => { opened++ }) as never)
    expect(opened).toBe(0)
  })

  it('有条目、缓存缺：照常开小窗去算', async () => {
    await db.derived.put({ key: parsedKey('cn-brew', 'spell'), fingerprint: 'x', value: { items: [{ name: 'a' }], hashes: ['a'], sources: ['AA'] }, savedAt: 1 })
    let opened = 0
    await expect(ensurePrecomputed(opts(() => { opened++ }) as never)).rejects.toThrow('不该开小窗')
    expect(opened).toBe(1)
  })
})

describe('BrewPacks.list（B-37）', () => {
  it('官方资料没装：从作者存储原文列出包，不启动作者程序（M5）', async () => {
    const lib = { currentView: async () => ({ id: 'v', kvGet: async () => [{ head: { docIdLocal: 'a', filename: 'a.json' }, body: { _meta: { sources: [{ json: 'A' }] } } }] }), brewInstalled: async () => [], frameOf: async () => { throw new OfficialMissingError('cn') } } as unknown as LibraryService
    expect(await new BrewPacks(lib).list('cn-brew')).toMatchObject([{ docIdLocal: 'a', sources: ['A'] }])
  })
})
