// 后台补换算队列：停手一段时间才开始；等的时候连着改只跑一次；跑的时候又改了，跑完再来一遍。
import { describe, expect, it, vi } from 'vitest'
import { PrecomputeQueue } from '../../src/rules/kernel/precompute-queue'

describe('PrecomputeQueue', () => {
  it('停手前连着触发三次：只跑一次；settled 等到跑完', async () => {
    vi.useFakeTimers()
    const runs: string[] = []
    const q = new PrecomputeQueue(async (c) => { runs.push(c); return c }, 5000)
    q.trigger('cn'); await vi.advanceTimersByTimeAsync(2000)
    q.trigger('cn'); await vi.advanceTimersByTimeAsync(2000)
    q.trigger('cn')
    expect(runs).toEqual([])
    const done = q.settled()
    await vi.advanceTimersByTimeAsync(5000)
    expect(await done).toBe('cn')
    expect(runs).toEqual(['cn'])
    vi.useRealTimers()
  })
  it('跑的时候又改了：这一轮跑完接着再跑一轮', async () => {
    let release: () => void = () => undefined
    const runs: number[] = []
    const q = new PrecomputeQueue(async () => { runs.push(runs.length); if (runs.length === 1) await new Promise<void>((r) => { release = r }) }, 0)
    q.trigger('cn')
    await new Promise((r) => setTimeout(r, 5))
    q.trigger('cn')
    release()
    await q.settled()
    expect(runs).toEqual([0, 1])
  })
  it('装资料后的完整换算：同一套排两次取范围大的（full 盖过 changed）', async () => {
    const runs: string[] = []
    const q = new PrecomputeQueue(async (c, mode) => { runs.push(`${c}:${mode}`) }, 0)
    q.trigger('cn', 'full')
    q.trigger('cn', 'changed')
    q.trigger('en', 'full')
    await q.settled()
    expect(runs).toEqual(['cn:full', 'en:full'])
  })
  it('还有下载任务在跑（hold）就先不跑；都装完了才跑，而且只跑一轮', async () => {
    vi.useFakeTimers()
    let installing = true
    const runs: string[] = []
    const q = new PrecomputeQueue(async (c) => { runs.push(c) }, 1000, () => installing)
    q.trigger('cn', 'full')
    await vi.advanceTimersByTimeAsync(3000)
    q.trigger('en', 'full')
    await vi.advanceTimersByTimeAsync(3000)
    expect(runs).toEqual([])
    expect(q.state().pending.map((p) => p.codeSet)).toEqual(['cn', 'en'])
    installing = false
    const done = q.settled()
    await vi.advanceTimersByTimeAsync(1000)
    await done
    expect(runs).toEqual(['cn', 'en'])
    vi.useRealTimers()
  })
  it('跑的时候又开始装资料（interrupt）：这一轮停下放回队里，装完接着跑', async () => {
    vi.useFakeTimers()
    let installing = false
    const runs: string[] = []
    const q = new PrecomputeQueue(async (c, _mode, signal) => {
      runs.push(`${c}:start`)
      await new Promise<void>((r) => { signal.addEventListener('abort', () => r()); setTimeout(r, 10_000) })
      runs.push(`${c}:${signal.aborted ? 'stopped' : 'done'}`)
    }, 1000, () => installing)
    q.trigger('en', 'full')
    await vi.advanceTimersByTimeAsync(1000)
    expect(q.state().running).toEqual({ codeSet: 'en', mode: 'full' })
    installing = true
    q.interrupt()
    await vi.advanceTimersByTimeAsync(5000)
    expect(runs).toEqual(['en:start', 'en:stopped'])
    expect(q.state().pending).toEqual([{ codeSet: 'en', mode: 'full' }])
    installing = false
    const done = q.settled()
    await vi.advanceTimersByTimeAsync(12_000)
    await done
    expect(runs).toEqual(['en:start', 'en:stopped', 'en:start', 'en:done'])
    vi.useRealTimers()
  })
})
