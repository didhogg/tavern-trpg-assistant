import { afterEach, describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { LibraryOperations } from '../../../src/library/operations'
import { DownloadTasks } from '../../../src/library/tasks'
import { FileProvider } from '../../../src/library/files'
import { gitBlobSha } from '../../../src/library/fetcher'
import { utf8ToBytes } from '@noble/hashes/utils.js'
import { getSource } from '../../../src/library/sources'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

describe('任务暂停 / 继续', () => {
  it('暂停不发布；继续复用已校验文件，不发第二次文件请求', async () => {
    db = new LibraryDatabase(`task-pause-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const source = getSource('cn-official')
    const path = 'data/spells/spells-phb.json'
    const bytes = utf8ToBytes('{"spell":[]}')
    const sha = gitBlobSha(bytes)
    const common = { files: [] as string[], bytes: 0 }
    const plan = { ...common, files: [path], bytes: bytes.length, shared: common, bySource: { files: [path], bytes: bytes.length }, byBook: common, byClass: common, byAdventure: common, sourceIndexes: {}, missing: { sources: [], books: [] }, sources: ['PHB'], books: ['PHB'], adventures: [] }
    let fileRequests = 0
    const fetchImpl = (async (url: string) => {
      if (url.includes('/git/trees/')) return { ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(0), json: async () => ({ tree: [{ path, type: 'blob', sha, size: bytes.length }] }) }
      if (url.endsWith(path)) { fileRequests++; return { ok: true, status: 200, arrayBuffer: async () => bytes.slice().buffer, json: async () => null } }
      return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0), json: async () => null }
    }) as never
    const frame = { codeSet: 'cn', frame: null, ready: null, failures: [], close: () => undefined, call: async (fn: string) => fn === 'loaders' ? [{ props: ['spell'], page: 'spells.html', kind: 'site' }] : fn === 'parseProp' ? { items: [], hashes: [], sources: [] } : fn === 'searchIndexHashes' ? {} : fn === 'excludeList' ? [] : fn === 'excludedFlags' ? { excluded: null, hashes: [] } : fn === 'fluffOfMany' ? {} : fn === 'searchIndexDump' ? { json: '[]' } : fn === 'extractTables' ? { tables: [], skipped: [] } : undefined }
    const tasks = new DownloadTasks({ db, revisions, operations, files: new FileProvider({ db, fetchImpl }), openFrame: async () => frame as never, planOfficial: async () => plan })
    const first = tasks.startOfficial('cn-official', { books: ['PHB'] })
    tasks.pause(first)
    const paused = await tasks.wait(first)
    expect(paused.status).toBe('paused')
    // 模拟暂停前已经下发并校验过的内容仍在内容表里；继续时应直接复用。
    await db.fileContents.put({ source: source.id, path, gitSha: sha, text: '{"spell":[]}', size: bytes.length, savedAt: 1 })
    const second = await tasks.resume(first)
    expect(second).toBeTruthy()
    const done = await tasks.wait(second!)
    expect(done.status).toBe('done')
    expect((done.result as { download: { reused: number } }).download.reused).toBe(1)
    expect(fileRequests).toBe(0)
  })
})
