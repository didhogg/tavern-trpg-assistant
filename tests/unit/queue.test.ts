import { describe, expect, it } from 'vitest'
import { OpQueue } from '../../src/core/libraryQueue'

const deferred = <T = void>() => {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
const tick = () => new Promise((r) => setTimeout(r, 0))

describe('库操作队列', () => {
  it('操作依次执行，排队中的显示 waiting', async () => {
    const q = new OpQueue()
    const order: string[] = []
    const gate = deferred()
    const a = q.enqueue({ id: 'a', label: 'A', run: async () => { order.push('a-start'); await gate.promise; order.push('a-end') } })
    const b = q.enqueue({ id: 'b', label: 'B', run: async () => { order.push('b') } })
    await tick()
    expect(q.state('a')).toBe('running')
    expect(q.state('b')).toBe('waiting')
    gate.resolve()
    await Promise.all([a, b])
    expect(order).toEqual(['a-start', 'a-end', 'b'])
    expect(q.busy).toBe(false)
  })

  it('一个操作失败不会卡住后面的操作', async () => {
    const q = new OpQueue()
    const a = q.enqueue({ id: 'a', label: 'A', run: async () => { throw new Error('坏了') } })
    const b = q.enqueue({ id: 'b', label: 'B', run: async () => 'ok' })
    await expect(a).rejects.toThrow('坏了')
    await expect(b).resolves.toBe('ok')
  })

  it('同一个 id 重复提交返回同一个结果，只执行一次', async () => {
    const q = new OpQueue()
    let runs = 0
    const gate = deferred()
    const first = q.enqueue({ id: 'x', label: 'X', run: async () => { runs++; await gate.promise; return 1 } })
    const second = q.enqueue({ id: 'x', label: 'X', run: async () => { runs++; return 2 } })
    expect(second).toBe(first)
    gate.resolve()
    expect(await first).toBe(1)
    expect(runs).toBe(1)
  })

  it('取消排队中的操作：不执行，结果为已取消', async () => {
    const q = new OpQueue()
    const gate = deferred()
    let ran = false
    const a = q.enqueue({ id: 'a', label: 'A', run: async () => { await gate.promise } })
    const b = q.enqueue({ id: 'b', label: 'B', run: async () => { ran = true } })
    expect(q.cancel('b')).toBe(true)
    gate.resolve()
    await a
    await expect(b).rejects.toMatchObject({ code: 'E_CANCELLED' })
    expect(ran).toBe(false)
  })

  it('取消运行中的操作：收到中止信号', async () => {
    const q = new OpQueue()
    const a = q.enqueue({
      id: 'a',
      label: 'A',
      run: (signal) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('中止')))),
    })
    await tick()
    q.cancel('a')
    await expect(a).rejects.toThrow('中止')
    expect(q.cancel('a')).toBe(false)
  })

  it('变化时通知订阅者，取消订阅后不再通知', async () => {
    const q = new OpQueue()
    let n = 0
    const off = q.onChange(() => n++)
    await q.enqueue({ id: 'a', label: 'A', run: async () => undefined })
    expect(n).toBeGreaterThanOrEqual(2)
    off()
    const seen = n
    await q.enqueue({ id: 'b', label: 'B', run: async () => undefined })
    expect(n).toBe(seen)
  })
})
