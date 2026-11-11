import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { publishBrew, type BrewContext } from '../../../src/library/service-brew'
import { getSource } from '../../../src/library/sources'
import type { BrewParseReport } from '../../../src/library/brew'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

const report = (errors: Array<{ prop: string; error: string }>): BrewParseReport => ({
  source: 'cn-brew', installed: [], parse: { props: {}, corpora: {}, notRun: [], errors, authorErrors: [] },
  alternatives: { targets: 0, errors: [] }, ms: 1,
})

describe('自制发布条件（P5 核验 5）', () => {
  it('整类解析失败：不发布缺内容的版本，父版本仍读得到', async () => {
    db = new LibraryDatabase(`brew-pub-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    await db.derived.put({ key: 'parsed:cn-brew:spell', fingerprint: 'old', value: { items: [{ name: '旧法术' }] }, savedAt: 1 })
    const operations = new LibraryOperations({ db, revisions })
    const source = getSource('cn-brew')
    const ctx = { db, revisions, operations, openFrame: async () => { throw new Error('不该开') }, frame: async () => { throw new Error('不该开') } } as unknown as BrewContext
    const handle = await operations.begin({ kind: 'brew-add', set: source.id, codeSet: 'cn' })
    await expect(publishBrew(ctx, source, handle, report([{ prop: 'spell', error: '作者解析失败' }]))).rejects.toThrow('没有发布')
    expect((await revisions.published()).id).toBe('rev-legacy')
    expect((await (await revisions.published()).derivedGet('parsed:cn-brew:spell'))?.fingerprint).toBe('old')
    await operations.abort(handle, new Error('清理'))
  })

  it('只有预计算失败：资料可以发布，结算标 partial', async () => {
    db = new LibraryDatabase(`brew-pub2-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const source = getSource('cn-brew')
    const ctx = { db, revisions, operations, openFrame: async () => { throw new Error('不该开') }, frame: async () => { throw new Error('不该开') } } as unknown as BrewContext
    const handle = await operations.begin({ kind: 'brew-add', set: source.id, codeSet: 'cn' })
    const r = report([])
    r.precomputeError = '换算失败'
    const view = await publishBrew(ctx, source, handle, r)
    expect(view.id).toBe(handle.target.id)
    expect((await db.ops.get(handle.record.id))?.status).toBe('partial')
  })
})
