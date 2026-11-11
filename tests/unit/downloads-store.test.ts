// 下载失败的显示规则：同一件事只看最新一次；第一次失败亮警告环 + 悬停提示；点重试后再失败只出横幅（带重试），不再亮环、不自动再拉。
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { TaskState } from '../../src/library/tasks'
import { itemsOf, useDownloadsStore } from '../../src/stores/downloads'

const task = (id: string, status: TaskState['status'], over: Partial<TaskState> = {}): TaskState => ({ id, kind: 'adventure', set: 'cn-official', item: 'CoS', status, progress: { stage: 'download', done: 0, total: 0 }, error: status === 'failed' ? '网络断了' : null, result: null, ...over }) as TaskState

describe('itemsOf', () => {
  it('同一本冒险失败两次只列一条；重试开始后只剩「正在下载」', () => {
    expect(itemsOf([task('1', 'failed'), task('2', 'failed')], new Map()).map((i) => i.status)).toEqual(['failed'])
    const now = itemsOf([task('1', 'failed'), task('2', 'running')], new Map())
    expect(now).toHaveLength(1)
    expect(now[0]).toMatchObject({ status: 'running', key: 'adventure:cn-official/CoS' })
  })
  it('重试成功后不再出现', () => {
    expect(itemsOf([task('1', 'failed'), task('2', 'done')], new Map())).toEqual([])
  })
  it('官方失败带上要重试的数据集', () => {
    const items = itemsOf([task('a', 'failed', { kind: 'official', set: 'cn-official', item: null }), task('b', 'failed', { kind: 'official', set: 'en-official', item: null })], new Map())
    expect(items).toHaveLength(1)
    expect(items[0].sets).toEqual(['cn-official', 'en-official'])
  })
})

describe('itemsOf 按书下载（P5 T6 B1）', () => {
  it('登记了书名的官方任务各占一行、带任务号；暂停的标成已暂停；没登记的仍合并成「官方资料」', () => {
    const names = new Map([['task:t1', '玩家手册'], ['task:t2', '姜']])
    const items = itemsOf([
      task('t1', 'running', { kind: 'official', item: null, progress: { stage: 'download', done: 1, total: 4 } }),
      task('t2', 'paused', { kind: 'official', item: null }),
      task('w', 'running', { kind: 'official', set: 'en-official', item: null }),
    ], names)
    expect(items.map((i) => [i.key, i.status, i.taskId ?? null])).toEqual([['official', 'running', null], ['official-book:玩家手册', 'running', 't1'], ['official-book:姜', 'paused', 't2']])
    expect(items[2].stage).toBe('已暂停')
  })
  it('同一本书重试：只看最新一次任务', () => {
    const names = new Map([['task:a', '玩家手册'], ['task:b', '玩家手册']])
    const items = itemsOf([task('a', 'failed', { kind: 'official', item: null }), task('b', 'running', { kind: 'official', item: null })], names)
    expect(items.map((i) => [i.status, i.taskId])).toEqual([['running', 'b']])
  })
})

describe('下载状态仓库', () => {
  let tasks: TaskState[]
  beforeEach(() => { setActivePinia(createPinia()); tasks = [] })
  const open = () => { const dl = useDownloadsStore(); dl.start(() => tasks, 1_000_000); return dl }

  it('第一次失败：亮警告环；点重试后再失败：环和悬停提示都没有，只在横幅里（失败项仍在 failedAll）', () => {
    const dl = open()
    tasks = [task('1', 'failed')]
    dl.refresh()
    expect(dl.ring).toBe('warn')
    expect(dl.failed).toHaveLength(1)
    dl.markRetried('adventure:cn-official/CoS')
    tasks = [task('1', 'failed'), task('2', 'running')]
    dl.refresh()
    expect(dl.ring).toBe('spin')
    tasks = [task('1', 'failed'), task('2', 'failed')]
    dl.refresh()
    expect(dl.ring).toBe('none')
    expect(dl.failed).toHaveLength(0)
    expect(dl.count).toBe(0)
    expect(dl.failedAll).toHaveLength(1)
  })

  it('重试成功后记号清掉：下次失败重新算第一次', () => {
    const dl = open()
    tasks = [task('1', 'failed')]
    dl.refresh()
    dl.markRetried('adventure:cn-official/CoS')
    tasks = [task('1', 'failed'), task('2', 'done')]
    dl.refresh()
    tasks = [task('3', 'failed')]
    dl.refresh()
    expect(dl.ring).toBe('warn')
  })

  it('关掉横幅：不再列；自制包同样第二次失败只出横幅，retryBrew 调用登记的重试函数', async () => {
    const dl = open()
    let retried = 0
    await dl.trackBrew('brew:x', '自制包《X》', async () => '没成功', () => { retried++ })
    expect(dl.failed).toHaveLength(1)
    await dl.trackBrew('brew:x', '自制包《X》', async () => '又没成功', () => { retried++ })
    expect(dl.failed).toHaveLength(0)
    expect(dl.failedAll).toHaveLength(1)
    expect(dl.retryBrew('brew:x')).toBe(true)
    expect(retried).toBe(1)
    dl.dismiss('brew:x')
    expect(dl.failedAll).toHaveLength(0)
  })
})

describe('自制包阶段（P5 T6 B1）', () => {
  beforeEach(() => { setActivePinia(createPinia()) })
  it('trackBrew 把后端报的阶段实时写进这一行；结束后去掉；暂停的任务算进数字', async () => {
    const dl = useDownloadsStore()
    let release!: () => void
    const done = dl.trackBrew('brew:x', '自制包《X》', async (report) => { report('整理资料', 0.5); await new Promise<void>((r) => { release = r }); return null })
    await Promise.resolve()
    expect(dl.items.find((i) => i.key === 'brew:x')).toMatchObject({ stage: '整理资料', pct: 0.5, status: 'running' })
    release()
    await done
    expect(dl.items.find((i) => i.key === 'brew:x')).toBeUndefined()
  })
})
