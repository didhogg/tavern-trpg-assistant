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
})
