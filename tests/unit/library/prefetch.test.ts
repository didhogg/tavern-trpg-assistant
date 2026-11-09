// 首次启动后台预取：缓存缺才取；联网失败静默；同时只跑一次；自动化浏览器默认不做；只在缓存缺失时联网（更新留 P5）。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CatalogPrefetch, prefetchAllowed, scheduleCatalogPrefetch } from '../../../src/library/prefetch'

function world(opts: { failDirectory?: boolean; dirErrors?: boolean; failList?: string } = {}) {
  const calls: string[] = []
  const dirs = new Set<string>()
  const lists = new Set<string>()
  const directory = {
    peek: async (cs: string) => (dirs.has(cs) ? { codeSet: cs } : null),
    get: async (cs: string) => {
      calls.push(`目录 ${cs}`)
      if (opts.failDirectory) throw new Error('断网')
      if (opts.dirErrors) return { errors: { books: '官方书目（cn）取不到：网络连接失败', adventures: null } }
      dirs.add(cs)
      return { errors: { books: null, adventures: null } }
    },
  }
  const files = {
    cachedFileList: async (s: { id: string }) => (lists.has(s.id) ? {} : null),
    fileList: async (s: { id: string }) => { calls.push(`清单 ${s.id}`); if (opts.failList === s.id) throw new Error('限流'); lists.add(s.id); return {} },
  }
  return { calls, make: () => new CatalogPrefetch({ files: files as never, directory: directory as never, codeSets: ['cn'] }) }
}

afterEach(() => { vi.useRealTimers() })

describe('CatalogPrefetch', () => {
  it('缓存是空的：取中文书目 + 每套官方数据的文件清单；第二次缓存都在，不再联网', async () => {
    const w = world()
    const p = w.make()
    const r = await p.run()
    expect(r.errors).toEqual([])
    expect(r.fetched).toEqual(['书目（cn）', '文件清单（cn-official）', '文件清单（en-official）'])
    expect(w.calls).toEqual(['目录 cn', '清单 cn-official', '清单 en-official'])
    const again = await p.run()
    expect(again.fetched).toEqual([])
    expect(again.cached).toHaveLength(3)
    expect(w.calls).toHaveLength(3)
  })

  it('联网失败不抛错，只记原因；成功的部分照常存，下次启动补失败的', async () => {
    const w = world({ failDirectory: true, failList: 'en-official' })
    const r = await w.make().run()
    expect(r.errors).toEqual(['书目（cn）：断网', '文件清单（en-official）：限流'])
    expect(r.fetched).toEqual(['文件清单（cn-official）'])
  })

  it('书目或冒险目录没取全：记错误、不算取到（directory 不会写缓存）', async () => {
    const r = await world({ dirErrors: true }).make().run()
    expect(r.errors[0]).toMatch(/官方书目（cn）取不到/)
    expect(r.fetched).not.toContain('书目（cn）')
  })

  it('同时只跑一次：并发调用共用同一次联网', async () => {
    const w = world()
    const p = w.make()
    const [a, b] = await Promise.all([p.run(), p.run()])
    expect(a).toBe(b)
    expect(w.calls).toHaveLength(3)
  })
})

describe('什么时候做', () => {
  it('真实用户联网时做；离线、自动化浏览器不做；测试可强制开 / 关', () => {
    expect(prefetchAllowed({ navigator: { webdriver: false, onLine: true } })).toBe(true)
    expect(prefetchAllowed({ navigator: { onLine: false } })).toBe(false)
    expect(prefetchAllowed({ navigator: { webdriver: true, onLine: true } })).toBe(false)
    expect(prefetchAllowed({ __TRPG_PREFETCH__: true, navigator: { webdriver: true } })).toBe(true)
    expect(prefetchAllowed({ __TRPG_PREFETCH__: false, navigator: { onLine: true } })).toBe(false)
  })

  it('界面可用后延迟几秒才做、不阻塞；不允许时什么都不排；能取消', async () => {
    vi.useFakeTimers()
    const run = vi.fn(async () => ({ skipped: null, fetched: [], cached: [], errors: [] }))
    const prefetch = { run } as never
    scheduleCatalogPrefetch(prefetch, { delayMs: 3000, allowed: false })
    await vi.advanceTimersByTimeAsync(10_000)
    expect(run).not.toHaveBeenCalled()
    scheduleCatalogPrefetch(prefetch, { delayMs: 3000, allowed: true })
    await vi.advanceTimersByTimeAsync(2_999)
    expect(run).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(2)
    expect(run).toHaveBeenCalledTimes(1)
    const stop = scheduleCatalogPrefetch(prefetch, { delayMs: 3000, allowed: true })
    stop()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('预取自己出错也只记日志，不抛出来影响别的', async () => {
    vi.useFakeTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    scheduleCatalogPrefetch({ run: async () => { throw new Error('炸了') } } as never, { delayMs: 10, allowed: true })
    await vi.advanceTimersByTimeAsync(50)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
