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
      case 'brewDocIndex': return [{ docIdLocal: 'ed', isEditable: true, url: null, sources: ['TRPGHOUSE', 'TRPGMINE', 'B3PACK'] }, { docIdLocal: 'old', isEditable: false, url: null, sources: ['PHB'] }, { docIdLocal: 'kib', isEditable: false, url: null, sources: ['KIB'] }]
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

describe('旧副本补「抄全」（P5.5 C1）', () => {
  it('只处理本地导入的包（没有网址、不是可编辑自制）；做一次就记标记，第二次不再做', async () => {
    const { flattenOldCopies } = await import('../../../src/library/custom-migrate')
    const { LibraryDatabase } = await import('../../../src/library/db')
    const { ManageStore } = await import('../../../src/library/manage')
    const db = new LibraryDatabase(`test-flatten-${Math.random()}`)
    const manage = new ManageStore(db)
    const called: string[] = []
    const frame = { call: async (fn: string, ...a: unknown[]) => {
      if (fn === 'brewDocIndex') return [{ docIdLocal: 'mine', isEditable: false, url: null, sources: ['LMOP', 'LMOP_COPY1'] }, { docIdLocal: 'dl', isEditable: false, url: 'https://x/y.json', sources: ['KIB'] }, { docIdLocal: 'ed', isEditable: true, url: null, sources: ['TRPGHOUSE'] }]
      if (fn === 'packFlattenCopies') { called.push(String(a[0])); return { flattened: 3, failed: [] } }
      throw new Error(`假小窗没有 ${fn}`)
    } }
    let touched: string[] = []
    const lib = { frameOf: async () => frame, writeAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<{ value: unknown; touched?: string[] }>) => { const r = await run({}); touched = r.touched ?? []; return { value: r.value, view: {}, dirty: touched } } }
    const r = await flattenOldCopies({ lib: lib as never, manage }, 'cn')
    expect(called).toEqual(['mine'])
    expect(touched).toEqual(['mine'])
    expect(r).toEqual([{ pack: 'lmop :: lmop_copy1', flattened: 3, failed: 0 }])
    expect(await flattenOldCopies({ lib: lib as never, manage }, 'cn')).toBeNull()
    expect(called).toEqual(['mine'])
    db.close(); await db.delete()
  })
})

describe('迁移：这一套还没有可编辑自制（例如第一次用英文那套）', () => {
  it('不去读可编辑自制（作者会新建一个，等于在只读版本上写），也没有要搬的', async () => {
    const { migrateMine } = await import('../../../src/library/custom-migrate')
    const { LibraryDatabase } = await import('../../../src/library/db')
    const { ManageStore } = await import('../../../src/library/manage')
    const db = new LibraryDatabase(`test-mig-en-${Math.random()}`)
    const calls: string[] = []
    const frame = { call: async (fn: string) => { calls.push(fn); if (fn === 'brewDocIndex') return []; throw new Error(`不该调 ${fn}`) } }
    const lib = { frameOf: async () => frame, mutateAuthor: async () => { throw new Error('不该写') } }
    expect(await migrateMine({ db, lib: lib as never, manage: new ManageStore(db), houseSource: 'TRPGHOUSE' }, 'en')).toEqual({ moved: [], fixed: [] })
    expect(calls).toEqual(['brewDocIndex'])
    db.close(); await db.delete()
  })
})
