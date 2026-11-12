import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { getSource } from '../../../src/library/sources'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

const setup = async () => {
  db = new LibraryDatabase(`rev-${Math.random()}`)
  const revisions = new LibraryRevisionStore(db)
  await revisions.ensureLegacy()
  const operations = new LibraryOperations({ db, revisions })
  return { revisions, operations }
}

describe('版本化库（P5 T1）', () => {
  it('准备版本只写变化；发布前旧版本完全不变，发布后新读取拿到新版本', async () => {
    const { revisions, operations } = await setup()
    const source = getSource('cn-official')
    await db.derived.put({ key: 'parsed:cn-official:spell', fingerprint: 'old', value: { items: ['old'] }, savedAt: 1 })
    await db.kv.put({ scope: 'cn', key: 'HOMEBREW_2_STORAGE', value: ['old'] })
    const old = await revisions.published()
    expect((await old.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('old')
    expect(await old.kvGet('cn', 'HOMEBREW_2_STORAGE')).toEqual(['old'])

    const handle = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await handle.target.derivedPut('parsed:cn-official:spell', 'new', { items: ['new'] })
    await handle.target.filePut(source, 'data/spells/spells-phb.json', { commit: 'c1', text: '{"spell":[]}', gitSha: 'sha1', size: 11 })
    await handle.target.kvSet('cn', 'HOMEBREW_2_STORAGE', ['new'])
    // 发布前：旧版本读到的仍是旧值；准备版本优先读自己的层
    expect((await old.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('old')
    expect(await old.kvGet('cn', 'HOMEBREW_2_STORAGE')).toEqual(['old'])
    expect(await old.fileGet(source, 'data/spells/spells-phb.json')).toBeNull()
    expect((await handle.target.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('new')
    expect(await handle.target.kvGet('cn', 'HOMEBREW_2_STORAGE')).toEqual(['new'])

    const published = await operations.publish(handle, {})
    expect(published.id).toBe(handle.target.id)
    expect((await revisions.published()).id).toBe(handle.target.id)
    expect((await published.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('new')
    expect(await published.kvGet('cn', 'HOMEBREW_2_STORAGE')).toEqual(['new'])
    expect((await published.fileGet(source, 'data/spells/spells-phb.json'))?.text).toBe('{"spell":[]}')
    // 旧版本对象仍能读旧值（父链没被改写）
    expect((await old.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('old')
  })

  it('父版本没写的键沿父链回退；删除记号挡住父层', async () => {
    const { operations } = await setup()
    await db.derived.put({ key: 'parsed:cn-official:spell', fingerprint: 'old', value: { items: ['old'] }, savedAt: 1 })
    const h1 = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await h1.target.derivedPut('parsed:cn-official:item', 'new', { items: ['item'] })
    const v1 = await operations.publish(h1, {})
    expect((await v1.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('old')
    const h2 = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await h2.target.derivedDelete('parsed:cn-official:spell')
    const v2 = await operations.publish(h2, {})
    expect(await v2.derivedGet('parsed:cn-official:spell')).toBeUndefined()
    expect((await v1.derivedGet('parsed:cn-official:spell'))?.fingerprint).toBe('old')
  })

  it('失败 / 取消：准备版本作废，已发布指针不动', async () => {
    const { revisions, operations } = await setup()
    const before = (await revisions.published()).id
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await h.target.derivedPut('parsed:cn-official:spell', 'x', { items: ['x'] })
    await operations.abort(h, new Error('解析失败'))
    expect((await revisions.published()).id).toBe(before)
    expect(await (await revisions.published()).derivedGet('parsed:cn-official:spell')).toBeUndefined()
    expect((await db.revisions.get(h.target.id))?.status).toBe('aborted')
  })

  it('同一时间只允许一个修改：后来的排队，前一个释放后接上', async () => {
    const { operations } = await setup()
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    const waiting = operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.abort(h, new Error('先让位'))
    const next = await waiting
    await operations.abort(next, new Error('清理'))
  })

  it('取消后进度不能把状态写回 preparing；发布必须被拒绝', async () => {
    const { operations } = await setup()
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.cancel(h.record.id)
    await operations.progress(h, { stage: 'parse', done: 1, total: 2 })
    expect((await db.ops.get(h.record.id))?.status).toBe('cancelled')
    await expect(operations.publish(h, {})).rejects.toThrow('取消')
  })

  it('租约被另一操作接手后，旧操作不能发布', async () => {
    const { operations } = await setup()
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    const lock = await db.locks.get('library')
    await db.locks.put({ ...lock!, token: 'other-window', expiresAt: Date.now() + 10_000 })
    await expect(operations.publish(h, {})).rejects.toThrow('租约')
  })

  it('来源索引过滤沿父版本继承；明确 null 才取消限制', async () => {
    const { operations } = await setup()
    const path = 'data/spells/index.json'
    const text = JSON.stringify({ PHB: 'spells-phb.json', XPHB: 'spells-xphb.json' })
    const h1 = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.setTargetIndexes(h1, { [path]: ['PHB'] })
    const v1 = await operations.publish(h1, {})
    expect(JSON.parse(await v1.filterIndex(path, text))).toEqual({ PHB: 'spells-phb.json' })
    // 普通自制操作不写 sourceIndexes：沿用父版本的过滤
    const h2 = await operations.begin({ kind: 'brew', set: 'cn-brew', codeSet: 'cn' })
    const v2 = await operations.publish(h2, {})
    expect(JSON.parse(await v2.filterIndex(path, text))).toEqual({ PHB: 'spells-phb.json' })
    // 明确取消限制
    const h3 = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.setTargetIndexes(h3, { [path]: null })
    const v3 = await operations.publish(h3, {})
    expect(JSON.parse(await v3.filterIndex(path, text))).toEqual({ PHB: 'spells-phb.json', XPHB: 'spells-xphb.json' })
  })

  it('索引过滤按资料集隔离：英文 XPHB 不覆盖中文 PHB', async () => {
    const { operations } = await setup()
    const path = 'data/bestiary/index.json'
    const text = JSON.stringify({ PHB: 'phb.json', XPHB: 'xphb.json' })
    const h1 = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.setTargetIndexes(h1, { [`cn|${path}`]: ['PHB'] })
    const v1 = await operations.publish(h1, {})
    expect(JSON.parse(await v1.filterIndex(path, text, 'cn'))).toEqual({ PHB: 'phb.json' })
    const h2 = await operations.begin({ kind: 'test', set: 'en-official', codeSet: 'en' })
    await operations.setTargetIndexes(h2, { [`en|${path}`]: ['XPHB'] })
    const v2 = await operations.publish(h2, {})
    expect(JSON.parse(await v2.filterIndex(path, text, 'cn'))).toEqual({ PHB: 'phb.json' })
    expect(JSON.parse(await v2.filterIndex(path, text, 'en'))).toEqual({ XPHB: 'xphb.json' })
  })

  it('兼容旧库曾写入的空职业目录过滤，读取职业正文和附录的完整目录', async () => {
    const { operations } = await setup()
    const paths = ['data/class/index.json', 'data/class/fluff-index.json']
    const handle = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.setTargetIndexes(handle, Object.fromEntries(paths.map((path) => [`cn|${path}`, []])))
    const view = await operations.publish(handle, {})
    const text = JSON.stringify({ fighter: 'class-fighter.json' })
    for (const path of paths) expect(await view.filterIndex(path, text, 'cn')).toBe(text)
  })

  it('过期租约被新操作接管：旧操作标中断，旧回包不能发布', async () => {
    const { operations } = await setup()
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    const lock = await db.locks.get('library')
    await db.locks.put({ ...lock!, expiresAt: Date.now() - 1 })
    const next = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    expect((await db.ops.get(h.record.id))?.status).toBe('interrupted')
    await expect(operations.publish(h, {})).rejects.toThrow('租约')
    await operations.abort(next, new Error('清理'))
  })

  it('恢复不打断仍在运行的窗口；真正过期才标中断并释放锁', async () => {
    const { operations } = await setup()
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.restore()
    expect((await db.ops.get(h.record.id))?.status).toBe('preparing')
    await db.ops.put({ ...h.record, updatedAt: Date.now() - 120_000 })
    await db.locks.put({ ...(await db.locks.get('library'))!, expiresAt: Date.now() - 1 })
    await operations.restore()
    expect((await db.ops.get(h.record.id))?.status).toBe('interrupted')
    expect((await db.revisions.get(h.target.id))?.status).toBe('aborted')
    expect(await db.locks.get('library')).toBeUndefined()
  })

  it('发布后释放租约，下一个操作立即能开始', async () => {
    const { operations } = await setup()
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.publish(h, {})
    const h2 = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    expect(h2.base.id).toBe(h.target.id)
    await operations.abort(h2, new Error('清理'))
  })

  it('恢复：未发布的准备版本标中断，已经切了指針的算完成', async () => {
    const { revisions, operations } = await setup()
    const h = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.abort(h, new Error('模拟中断'))
    await db.ops.put({ ...h.record, status: 'preparing' })
    const restored = await operations.restore()
    expect(restored.map((r) => r.id)).toContain(h.record.id)
    expect((await db.ops.get(h.record.id))?.status).toBe('interrupted')
    // 已经发布的：把 revision 标记成中断，restore 按实际指针纠正为完成
    const h2 = await operations.begin({ kind: 'test', set: 'cn-official', codeSet: 'cn' })
    await operations.publish(h2, {})
    await db.ops.put({ ...h2.record, status: 'publishing' })
    await operations.restore()
    expect((await db.ops.get(h2.record.id))?.status).toBe('done')
    expect((await revisions.published()).id).toBe(h2.target.id)
  })
})
