// B-26 统一后端日志：按时间记、滚动保留、能筛选和导出全文。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LogStore } from '../../../src/library/logs'

let db: LibraryDatabase
let t = 1_700_000_000_000
beforeEach(() => { db = new LibraryDatabase(`test-logs-${Math.random()}`) })
afterEach(async () => { await db.delete() })
const store = (max = 500) => new LogStore(db, { max, now: () => ++t })

describe('LogStore', () => {
  it('最近的在前；可按级别 / 来源 / 种类筛选；limit 生效', async () => {
    const logs = store()
    await logs.add({ level: 'error', source: 'cn-official', kind: 'task:official', message: '下载失败' })
    await logs.add({ level: 'warn', source: 'cn-brew', kind: 'brew-parse', message: 'a' })
    await logs.add({ level: 'error', source: 'cn-brew', kind: 'brew-parse', message: 'b' })
    expect((await logs.list()).map((e) => e.message)).toEqual(['b', 'a', '下载失败'])
    expect((await logs.list({ level: 'error' })).map((e) => e.message)).toEqual(['b', '下载失败'])
    expect((await logs.list({ source: 'cn-brew', kind: 'brew-parse', limit: 1 })).map((e) => e.message)).toEqual(['b'])
  })

  it('滚动保留：超过上限丢最旧的', async () => {
    const logs = store(3)
    for (const m of ['1', '2', '3', '4', '5']) await logs.add({ level: 'info', source: 's', kind: 'k', message: m })
    expect(await logs.count()).toBe(3)
    expect((await logs.list()).map((e) => e.message)).toEqual(['5', '4', '3'])
  })

  it('同一毫秒连续记也不会覆盖（序号区分）', async () => {
    const logs = new LogStore(db, { now: () => 5 })
    await logs.add({ level: 'info', source: 's', kind: 'k', message: 'x' })
    await logs.add({ level: 'info', source: 's', kind: 'k', message: 'y' })
    expect((await logs.list()).map((e) => e.message)).toEqual(['y', 'x'])
  })

  it('导出全文：时间正序，细节为 JSON；清空后没有了', async () => {
    const logs = store()
    await logs.add({ level: 'error', source: 'cn-brew', kind: 'brew-parse', message: '第一条', detail: { prop: 'spell' } })
    await logs.add({ level: 'warn', source: 'cn-brew', kind: 'brew-author-errors', message: '第二条' })
    const text = await logs.exportText()
    expect(text.indexOf('第一条')).toBeLessThan(text.indexOf('第二条'))
    expect(text).toContain('[error] cn-brew brew-parse')
    expect(text).toContain('"prop": "spell"')
    await logs.clear()
    expect(await logs.exportText()).toBe('')
  })

  it('sink：写日志失败不抛给调用方，只在控制台留一笔', async () => {
    const logs = store()
    await db.close()
    const original = console.error
    let seen = 0
    console.error = () => { seen++ }
    try {
      logs.sink()({ level: 'error', source: 's', kind: 'k', message: 'm' })
      await new Promise((r) => setTimeout(r, 50))
    } finally { console.error = original }
    expect(seen).toBe(1)
  })
})
