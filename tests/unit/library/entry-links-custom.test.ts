// 自制编号对照（EntryLinks.customRefs）按库的数据版本只算一次（驾驶员 2026-11-22：每次加人都逐包开隔离小窗解析全部自制包）。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { EntryLinks } from '../../../src/library/entry-links'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'
import type { LibraryService } from '../../../src/library/service'
import type { DocumentStore } from '../../../src/library/documents'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

const links = (revisions: LibraryRevisionStore) => {
  const l = new EntryLinks({ currentView: () => revisions.published() } as unknown as LibraryService, {} as DocumentStore)
  const build = vi.fn(async () => new Map([['monster|x_hb', { set: 'cn-brew', prop: 'monster', hash: 'x_hb' }]]))
  ;(l as unknown as { customRefsBuild: typeof build }).customRefsBuild = build
  return { l, build }
}

describe('自制编号对照按数据版本只算一次', () => {
  it('同一数据版本：同一会话只算一次；新会话从库里读，不重算；自制包变了就重算', async () => {
    db = new LibraryDatabase(`links-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const brew = (n: number) => ({ 'cn-brew': { packs: [{ docIdLocal: 'd1', stableId: 's1', checksum: `c${n}` }] } })
    const h = await operations.begin({ kind: 'test', set: 'cn-brew', codeSet: 'cn' })
    await operations.publish(h, { brews: brew(1) })

    const a = links(revisions)
    const first = await a.l.customRefs('cn')
    expect(first.get('monster|x_hb')?.set).toBe('cn-brew')
    await a.l.customRefs('cn')
    expect(a.build).toHaveBeenCalledTimes(1)

    const b = links(revisions) // 新会话：内存空，库里已有
    expect((await b.l.customRefs('cn')).size).toBe(1)
    expect(b.build).toHaveBeenCalledTimes(0)

    const h2 = await operations.begin({ kind: 'test', set: 'cn-brew', codeSet: 'cn' })
    await operations.publish(h2, { brews: brew(2) }) // 自制包变了 → 数据版本记号变了
    await b.l.customRefs('cn')
    expect(b.build).toHaveBeenCalledTimes(1)
  })
})
