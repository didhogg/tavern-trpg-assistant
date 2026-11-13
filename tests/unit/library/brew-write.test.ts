// P5.5 U2：编辑只写原文就发布、记脏，解析交给后台队列；队列停手合并、要编辑时让路、失败保留脏标记。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BrewParseQueue } from '../../../src/library/brew-queue'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { writeAuthor, type BrewContext } from '../../../src/library/service-brew'

let db: LibraryDatabase | undefined
afterEach(async () => { vi.useRealTimers(); await db?.delete(); db = undefined })

describe('writeAuthor', () => {
  it('写原文、刷盘、不解析就发布；版本状态记下改过的包（和以前没解析完的合并），然后通知后台', async () => {
    const d = (db = new LibraryDatabase(`brew-write-${Math.random()}`))
    const revisions = new LibraryRevisionStore(d)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db: d, revisions })
    const calls: string[] = []
    const dirtied: string[] = []
    const frame = { call: async (fn: string) => { calls.push(fn); if (fn === 'storageFlush') return []; if (fn === 'brewInstalled') return [{ head: { docIdLocal: 'a' } }, { head: { docIdLocal: 'b' } }]; throw new Error(`不该调 ${fn}`) }, close: () => undefined }
    const ctx = { db: d, revisions, operations, openFrame: async () => frame, frame: async () => frame, beforeWrite: async () => { calls.push('beforeWrite') }, onDirty: (c: string) => dirtied.push(c) } as unknown as BrewContext
    const r1 = await writeAuthor(ctx, 'cn', 'custom-entry', async () => ({ value: 1, touched: ['a'] }))
    expect(r1.dirty).toEqual(['a'])
    const r2 = await writeAuthor(ctx, 'cn', 'custom-entry', async () => ({ value: 2, touched: ['b', 'gone'] }))
    expect(r2).toMatchObject({ value: 2, dirty: ['a', 'b'] }) // 不在了的包不记
    expect((await (await revisions.published()).brewState('cn-brew'))?.dirty).toEqual(['a', 'b'])
    expect(calls).toEqual(['beforeWrite', 'storageFlush', 'brewInstalled', 'beforeWrite', 'storageFlush', 'brewInstalled'])
    expect(dirtied).toEqual(['cn', 'cn'])
  })
})

describe('BrewParseQueue', () => {
  it('停手前连着改：只跑一次', async () => {
    vi.useFakeTimers()
    const runs: string[] = []
    const q = new BrewParseQueue(async (c) => { runs.push(c) }, 5000)
    q.trigger('cn'); await vi.advanceTimersByTimeAsync(3000)
    q.trigger('cn'); await vi.advanceTimersByTimeAsync(3000)
    expect(runs).toEqual([])
    expect(q.busy('cn')).toBe(true)
    const done = q.settled('cn')
    await vi.advanceTimersByTimeAsync(5000)
    await done
    expect(runs).toEqual(['cn'])
    expect(q.busy('cn')).toBe(false)
  })
  it('正在跑又要编辑：取消这一轮、等它停下，再重新排队', async () => {
    vi.useFakeTimers()
    let runs = 0
    let aborted = false
    const q = new BrewParseQueue(async (_c, signal) => {
      runs++
      if (runs === 1) await new Promise<void>((resolve) => signal.addEventListener('abort', () => { aborted = true; resolve() }))
    }, 1000)
    q.trigger('cn'); await vi.advanceTimersByTimeAsync(1000)
    expect(runs).toBe(1)
    await q.yield('cn')
    expect(aborted).toBe(true)
    expect(q.busy('cn')).toBe(true) // 重新排队了
    await vi.advanceTimersByTimeAsync(1000)
    await q.settled('cn')
    expect(runs).toBe(2)
  })
  it('跑失败：记下原因，不影响下次', async () => {
    vi.useFakeTimers()
    let n = 0
    const q = new BrewParseQueue(async () => { if (++n === 1) throw new Error('缺依赖') }, 10)
    q.trigger('cn'); await vi.advanceTimersByTimeAsync(10); await q.settled('cn')
    expect(q.last.get('cn')).toMatchObject({ error: '缺依赖' })
    q.trigger('cn'); await vi.advanceTimersByTimeAsync(10); await q.settled('cn')
    expect(n).toBe(2)
  })
})
