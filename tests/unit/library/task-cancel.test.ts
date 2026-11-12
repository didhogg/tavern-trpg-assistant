import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { LibraryOperations } from '../../../src/library/operations'
import { DownloadTasks } from '../../../src/library/tasks'
import { FileProvider } from '../../../src/library/files'
import { brewAddUrl, type BrewContext } from '../../../src/library/service-brew'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

describe('同一个任务入口取消安装', () => {
  it.each([
    ['official', 'cancelled'], ['brew', 'cancelled'], ['official', 'failed'], ['brew', 'failed'],
  ] as const)('%s 中止在途请求后标为 %s，作废准备版本', async (kind, status) => {
    db = new LibraryDatabase(`task-cancel-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    const operations = new LibraryOperations({ db, revisions })
    let start!: () => void
    const opened = new Promise<void>((resolve) => { start = resolve })
    let aborted = false
    let closed = false
    const waitForAbort = (signal: AbortSignal): Promise<never> => new Promise((_, reject) => {
      signal.addEventListener('abort', () => {
        aborted = true
        reject(signal.reason)
      }, { once: true })
      start()
    })
    const tasks = new DownloadTasks({
      db, revisions, operations, files: new FileProvider({ db }),
      openFrame: async () => { throw new Error('尚未下载') },
      planOfficial: async (_id, opts) => waitForAbort(opts.signal!),
    })
    const ctx = {
      db, revisions, operations,
      openFrame: async (_code: string, opts: { signal: AbortSignal }) => ({
        call: () => waitForAbort(opts.signal), close: () => { closed = true },
      }),
    } as unknown as BrewContext
    const id = kind === 'official'
      ? tasks.startOfficial('cn-official', { books: ['PHB'] })
      : tasks.startBrew('cn-brew', 'pack', async (signal) => {
        await brewAddUrl(ctx, 'cn-brew', 'https://fixture.test/pack.json', undefined, signal)
        return null
      })
    await opened
    if (status === 'cancelled') await tasks.cancel(id)
    else tasks.stopDownloads(new DOMException('网络断开', 'NetworkError'))
    expect((await tasks.wait(id)).status).toBe(status)
    expect(aborted).toBe(true)
    if (kind === 'brew') expect(closed).toBe(true)
    expect((await revisions.published()).id).toBe('rev-legacy')
    expect((await operations.list())[0].status).toBe(status)
    expect((await db.revisions.get((await operations.list())[0].revision))?.status).toBe('aborted')
  })
})
