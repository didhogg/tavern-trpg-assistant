import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import type { TaskState } from '../../src/library/tasks'
import { itemsOf, useDownloadsStore } from '../../src/stores/downloads'

const task = (id: string, status: TaskState['status'], over: Partial<TaskState> = {}): TaskState => ({
  id, kind: 'adventure', set: 'cn-official', item: 'CoS', status,
  progress: { stage: 'download', done: 0, total: 0 }, error: status === 'failed' ? '网络断了' : null, result: null, ...over,
})

describe('下载任务列表', () => {
  it('同一个请求只列最近一次任务，取消、完成、中断后退出列表', () => {
    expect(itemsOf([task('1', 'failed'), task('2', 'failed')], new Map()).map((i) => i.taskId)).toEqual(['2'])
    const now = itemsOf([task('1', 'failed'), task('2', 'running')], new Map())
    expect(now).toHaveLength(1)
    expect(now[0]).toMatchObject({ status: 'running', taskId: '2', key: 'adventure:cn-official/CoS' })
    for (const status of ['cancelled', 'done', 'interrupted'] as const) {
      expect(itemsOf([task('1', 'failed'), task('2', status)], new Map())).toEqual([])
    }
  })

  it('同名的不同书、以及中英两边各有自己的任务编号', () => {
    const names = new Map([['task:a', '玩家手册'], ['task:b', '玩家手册']])
    const items = itemsOf([
      task('a', 'running', { kind: 'official', item: 'books=PHB' }),
      task('b', 'running', { kind: 'official', item: 'books=MM' }),
      task('c', 'running', { kind: 'official', set: 'en-official', item: 'books=XPHB;sources=all' }),
    ], names)
    expect(items.map((i) => [i.taskId, i.label])).toEqual([['a', '玩家手册'], ['b', '玩家手册'], ['c', 'XPHB（英文）']])
    expect(new Set(items.map((i) => i.key)).size).toBe(3)
  })

  it('失败只出横幅，重试用原任务登记的动作，横幅可以关闭', () => {
    setActivePinia(createPinia())
    const dl = useDownloadsStore()
    const tasks = [task('a', 'failed', { kind: 'brew', set: 'cn-brew', item: 'pkg' })]
    const stop = dl.start(() => tasks, 1_000_000)
    const retry = vi.fn()
    dl.rememberTask('a', '自制包《试验》', retry)
    expect(dl.ring).toBe('none')
    expect(dl.running).toEqual([])
    expect(dl.failedAll).toHaveLength(1)
    const [failure] = dl.failedAll
    expect(failure.label).toBe('自制包《试验》')
    dl.retryOf(failure)?.()
    expect(retry).toHaveBeenCalledOnce()
    dl.dismiss(failure)
    expect(dl.failedAll).toEqual([])
    stop()
  })

  it('缺依赖已出专门横幅：任务算失败（不报「资料已就绪」），也不再重复一条下载失败横幅', async () => {
    setActivePinia(createPinia())
    const dl = useDownloadsStore()
    const list: TaskState[] = []
    const stop = dl.start(() => list, 1_000_000)
    let finished: Promise<void> = Promise.resolve()
    const queue = {
      startBrew: (set: string, item: string, run: (signal: AbortSignal, report: () => void) => Promise<string | null>) => {
        const t = task('x', 'running', { kind: 'brew', set, item })
        list.push(t)
        finished = run(new AbortController().signal, () => {}).then((error) => { t.status = error ? 'failed' : 'done'; t.error = error })
        return 'x'
      },
      wait: async () => { await finished; return list[0] },
    }
    const result = await dl.trackBrew(queue, 'cn-brew', 'pkg', '自制包《试验》', async () => ({ reported: '缺依赖包 llspell' }))
    expect(result.status).toBe('failed')
    expect(dl.failedAll).toEqual([])
    expect(dl.justDone).toBe(false)
    stop()
  })
})
