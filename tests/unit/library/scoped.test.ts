import { afterEach, describe, expect, it, vi } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { ScopedLibrary } from '../../../src/library/scoped'
import type { LibraryService } from '../../../src/library/service'
import { defaultCampaignLibrary } from '../../../src/library/scopes'
import type { LibraryView } from '../../../src/library/revision'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

describe('ScopedLibrary.query 管理上下文（P5 M9）', () => {
  it('一次查询只读一次房规；不随条目数线性增长', async () => {
    db = new LibraryDatabase(`scoped-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const view = {
      id: 'v', legacy: false,
      officialState: async () => ({ status: 'installed', commit: 'c', sources: null, books: null, adventures: null }),
      brewState: async () => null, derivedGet: async () => undefined,
      visibleSources: async () => null, installedBooks: async () => null,
      commitOf: async () => 'c',
    } as unknown as LibraryView
    const rows = Array.from({ length: 30 }, (_, i) => ({ hash: `h${i}`, source: 'PHB', excluded: false, item: { name: `条目 ${i}` } }))
    const lib = {
      currentView: async () => view,
      query: async () => rows,
      parsed: async () => ({ items: [], hashes: [], sources: [] }),
      storedItem: async () => null,
      frameOf: async () => ({ call: async (fn: string) => fn === 'editionOf' ? {} : [] }),
      officialInstalled: async () => true,
      brewInstalled: async () => [],
      brewCorpora: async () => ({}),
    } as unknown as LibraryService
    const scoped = new ScopedLibrary(lib, db)
    const spy = vi.spyOn(scoped.manage, 'houseRules')
    const c = defaultCampaignLibrary('dnd5e2014', 'cn')
    const out = await scoped.query(c, 'spell', { view })
    expect(out).toHaveLength(30)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
