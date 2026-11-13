// P5.5 B8-6 迁移：可编辑自制里房规以外的来源搬成独立的包（撤销记录、草稿补上包）；旧副本补 internalCopies、去掉 Foundry 补充记录；只做一次。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { migrateMine } from '../../../src/library/custom-migrate'
import { LibraryDatabase } from '../../../src/library/db'
import { ManageStore } from '../../../src/library/manage'

let db: LibraryDatabase
let manage: ManageStore
beforeEach(() => { db = new LibraryDatabase(`test-mig-${Math.random()}`); manage = new ManageStore(db) })
afterEach(async () => { db.close(); await db.delete() })

function setup() {
  const calls: Array<[string, unknown[]]> = []
  const overlayRec = { name: '甲', source: 'PHB', activities: [] }
  const frame = { call: async (fn: string, ...a: unknown[]) => {
    calls.push([fn, a])
    switch (fn) {
      case 'editableDoc': return { body: { _meta: { sources: [{ json: 'TRPGHOUSE' }, { json: 'TRPGMINE' }, { json: 'B3PACK' }] } } }
      case 'editableTake': return { body: { _meta: { sources: [{ json: a[0] }] }, spell: [{ name: 'x', source: a[0], uniqueId: a[0] === 'TRPGMINE' ? 'u1' : 'u2' }] }, uniqueIds: [a[0] === 'TRPGMINE' ? 'u1' : 'u2'] }
      case 'brewAddFiles': return { value: { added: [{}], notJson: [] }, errors: [] }
      case 'brewDocIndex': return [{ docIdLocal: 'old', isEditable: false, url: null, sources: ['PHB'] }, { docIdLocal: 'kib', isEditable: false, url: null, sources: ['KIB'] }]
      case 'officialSourcesOf': return (a[0] as string[]).filter((s) => s === 'PHB')
      case 'authorDataFiles': return { paths: ['data/spells/spells-phb.json'], failed: [] }
      case 'packFixOldCopy': return { removed: (a[1] as string[]).length, internalCopies: ['subclass'] }
      default: throw new Error(`假小窗没有 ${fn}`)
    }
  }, close: () => undefined }
  const official = { 'data/spells/spells-phb.json': { spell: [{ name: '甲', source: 'PHB' }] }, 'data/spells/foundry.json': { spell: [overlayRec] } }
  const lib = {
    frameOf: async () => frame,
    openFrameIn: async () => frame,
    currentView: async () => ({ filePaths: async () => Object.keys(official), fileGet: async (_o: unknown, p: string) => ({ text: JSON.stringify(official[p as keyof typeof official]) }) }),
    mutateAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<unknown>) => ({ value: await run({}), parse: {}, view: {} }),
  }
  return { d: { db, lib: lib as never, manage, houseSource: 'TRPGHOUSE' }, calls, overlayRec }
}

describe('migrateMine', () => {
  it('房规以外的来源搬成独立的包；撤销记录、草稿补上包；旧副本去掉补充记录；只做一次', async () => {
    const { d, calls, overlayRec } = setup()
    await manage.pushHistory('cn-brew|spell|u1', { at: 1, prop: 'spell', before: null })
    await manage.putDraft('k', { at: 1, codeSet: 'cn', prop: 'spell', s: {}, m: { isModified: true, isPersisted: false, nameOriginal: null, styleHint: null }, target: { kind: 'mine', uniqueId: 'u2' } })
    const r = await migrateMine(d, 'cn')
    expect(calls.filter(([f]) => f === 'editableTake').map(([, a]) => a[0])).toEqual(['TRPGMINE', 'B3PACK'])
    expect(r?.moved.map((m) => m.pack)).toEqual(['trpgmine', 'b3pack'])
    expect((await manage.history('cn-brew|spell|u1'))[0].pack).toBe('trpgmine')
    expect((await manage.draft('k'))?.target).toEqual({ kind: 'mine', uniqueId: 'u2', pack: 'b3pack' })
    // 旧副本（包头全是官方来源）才修；补充记录 = 作者不读的文件里的那条
    const fix = calls.filter(([f]) => f === 'packFixOldCopy')
    expect(fix.map(([, a]) => a[0])).toEqual(['old'])
    expect(fix[0][1][1]).toEqual([JSON.stringify(overlayRec)])
    expect(r?.fixed).toEqual([{ pack: 'phb', removed: 1, internalCopies: ['subclass'] }])
    expect(await migrateMine(d, 'cn')).toBeNull()
  })
})
