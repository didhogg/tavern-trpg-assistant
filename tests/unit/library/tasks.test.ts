import { describe, expect, it } from 'vitest'
import { DownloadTasks, officialTaskKey } from '../../../src/library/tasks'
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'

describe('官方任务身份', () => {
  it('同语言不同书、不同语言不同选择、不同目标提交都不会被当成同一个任务', () => {
    expect(officialTaskKey({ books: ['PHB'] })).not.toBe(officialTaskKey({ books: ['MM'] }))
    expect(officialTaskKey({ books: ['PHB'], commit: 'a' })).not.toBe(officialTaskKey({ books: ['PHB'], commit: 'b' }))
    expect(officialTaskKey({ books: ['PHB'] })).toBe(officialTaskKey({ books: ['PHB'] }))
  })
})

it('更新等待前一个安装发布后，按锁内最新的书和冒险清单重算', async () => {
  const db = new LibraryDatabase(`task-queued-update-${Math.random()}`)
  const revisions = new LibraryRevisionStore(db)
  const operations = new LibraryOperations({ db, revisions })
  const set = 'cn-official'
  try {
    await db.sets.put({ id: set, commit: 'old', status: 'installed' })
    const installing = await operations.begin({ kind: 'official', set, codeSet: 'cn' })
    let seen: unknown
    const tasks = new DownloadTasks({
      db, revisions, operations, files: new FileProvider({ db }),
      openFrame: async () => { throw new Error('测试只检查重新规划的输入') },
      planOfficial: async (_set, opts) => {
        seen = { books: opts.books, adventures: opts.adventures, commit: opts.commit }
        throw new Error('已进入规划')
      },
    })
    const update = tasks.startOfficial(set, { commit: 'new', updateFrom: 'old' })
    await operations.publish(installing, { official: { [set]: { commit: 'old', status: 'installed', books: ['PHB', 'MM'], sources: ['PHB', 'MM'], adventures: ['BGDIA'] } } })
    expect(await tasks.wait(update)).toMatchObject({ error: '已进入规划' })
    expect(seen).toEqual({ books: ['MM', 'PHB'], adventures: ['BGDIA'], commit: 'new' })
  } finally {
    await db.delete()
  }
})
