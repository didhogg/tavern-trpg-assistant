import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { baseFingerprint, manageFingerprint } from '../../../src/library/cache'
import { getSource } from '../../../src/library/sources'

let db: LibraryDatabase
beforeEach(() => { db = new LibraryDatabase(`test-cache-${Math.random()}`) })
afterEach(async () => { await db.delete() })

describe('预计算缓存的依赖指纹', () => {
  it('自制包校验值变了，资料基线就变', async () => {
    const source = getSource('cn-official')
    const before = await baseFingerprint(source, db)
    await db.derived.put({ key: 'audit:cn-brew', fingerprint: 'brew', value: { installed: [{ docIdLocal: 'a', checksum: '1' }] }, savedAt: 0 })
    const after = await baseFingerprint(source, db)
    expect(after).not.toBe(before)
    await db.derived.put({ key: 'audit:cn-brew', fingerprint: 'brew', value: { installed: [{ docIdLocal: 'a', checksum: '2' }] }, savedAt: 0 })
    expect(await baseFingerprint(source, db)).not.toBe(after)
  })

  it('范围 / 房规 / 版本选择等管理记录变了，摘要就变', async () => {
    const before = await manageFingerprint(db)
    await db.manage.put({ kind: 'choice', key: 'global\u0000spell\u0000a', value: 'alt', updatedAt: 1 })
    const after = await manageFingerprint(db)
    expect(after).not.toBe(before)
    await db.manage.put({ kind: 'choice', key: 'global\u0000spell\u0000a', value: 'base', updatedAt: 2 })
    expect(await manageFingerprint(db)).not.toBe(after)
  })
})

describe('缓存补算绑定请求版本', () => {
  it('缺口补算写到请求持有的版本，不写旧 derived', async () => {
    const { ensurePrecomputed } = await import('../../../src/library/cache')
    const { LibraryRevisionStore } = await import('../../../src/library/revision')
    const { LibraryOperations } = await import('../../../src/library/operations')
    const { parsedKey } = await import('../../../src/library/install')
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const ops = new LibraryOperations({ db, revisions })
    const h = await ops.begin({ kind: 'cache', set: 'cn-official', codeSet: 'cn' })
    await h.target.derivedPut(parsedKey('cn-official', 'spell'), 'c', { items: [{ name: '火球' }], hashes: ['fire_phb'], sources: ['PHB'] })
    const frame = {
      codeSet: 'cn', frame: null, ready: null, failures: [], close: () => undefined,
      call: async (fn: string) => fn === 'excludeList' ? [] : fn === 'excludedFlags' ? { excluded: null, hashes: ['fire_phb'] } : undefined,
    }
    await ensurePrecomputed({ source: getSource('cn-official'), db, view: h.target, prop: 'spell', excluded: true, openFrame: async () => frame as never })
    expect(await h.target.derivedGet('pre:cn-official:excluded:spell')).toBeTruthy()
    expect(await db.derived.get('pre:cn-official:excluded:spell')).toBeUndefined()
    await ops.abort(h, new Error('清理'))
  })
})
