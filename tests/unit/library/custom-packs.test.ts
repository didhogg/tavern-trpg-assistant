import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { configureBrewValidator } from '../../../src/library/brew-validate'
import { createPack, exportPack, listPacks, renamePack, type PackDeps } from '../../../src/library/custom-packs'
import { moveEntries, persist, remove, undo, type EntryDeps } from '../../../src/library/custom-entries'
import { LibraryDatabase } from '../../../src/library/db'
import { ManageStore } from '../../../src/library/manage'
import { ruleScopes, sourceUnit } from '../../../src/library/scopes'
import registry from '../../../src/library/scopes.json'

// P5.5 B8-1 / B8-2：【我的库】的包 = 作者的一个独立自制包。假的作者存储照作者行为写：
// 包按本地编号存、按「来源编号组合」认包（导入同组合的会顶掉旧的）、条目编号 = 名字 + 来源。
configureBrewValidator(new URL('../../../', import.meta.url))

type Doc = { docIdLocal: string; filename: string; isEditable?: boolean; body: Record<string, any> } // eslint-disable-line @typescript-eslint/no-explicit-any
const hashOf = (e: Record<string, unknown>) => `${String(e.name)}_${String(e.source)}`.toLowerCase()

let db: LibraryDatabase
let manage: ManageStore
beforeEach(() => { db = new LibraryDatabase(`test-packs-${Math.random()}`); manage = new ManageStore(db) })
afterEach(async () => { db.close(); await db.delete() })

function setup(taken: string[] = ['PHB']) {
  const docs: Doc[] = []
  let n = 0
  const doc = (id: string) => { const d = docs.find((x) => x.docIdLocal === id); if (!d) throw new Error('no doc'); return d }
  const frame = { call: async (name: string, ...a: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    switch (name) {
      case 'sourceTaken': return taken.includes(a[0]) || docs.some((d) => d.body._meta.sources.some((s: { json: string }) => s.json === a[0]))
      case 'brewDocIndex': return docs.map((d) => ({ docIdLocal: d.docIdLocal, isEditable: !!d.isEditable, url: null, sources: d.body._meta.sources.map((s: { json: string }) => s.json) }))
      case 'packEntity': { const e = (doc(a[0]).body[a[1]] ?? []).find((x: Record<string, unknown>) => x.uniqueId === a[2].uniqueId || hashOf(x) === a[2].hash); return e ? { entity: { ...e, uniqueId: e.uniqueId ?? `u${++n}` }, hash: hashOf(e), hadId: !!e.uniqueId } : null }
      case 'packPut': {
        const list = (doc(a[0]).body[a[1]] ??= [])
        let i = a[2].uniqueId ? list.findIndex((x: Record<string, unknown>) => x.uniqueId === a[2].uniqueId) : -1
        if (i < 0 && a[3]?.replaceHash) i = list.findIndex((x: Record<string, unknown>) => !x.uniqueId && hashOf(x) === a[3].replaceHash)
        const before = i >= 0 ? structuredClone(list[i]) : null
        const e = { ...a[2], uniqueId: a[2].uniqueId ?? `u${++n}` }
        if (i >= 0) list[i] = e; else list.push(e)
        return { uniqueId: e.uniqueId, hash: hashOf(e), previousHash: before ? hashOf(before) : null, previous: before ? { name: before.name, source: before.source } : null, previousEntity: before }
      }
      case 'packRemove': { const d = doc(a[0]); const out = (d.body[a[1]] ?? []).filter((x: Record<string, unknown>) => a[2].includes(x.uniqueId)); d.body[a[1]] = (d.body[a[1]] ?? []).filter((x: Record<string, unknown>) => !a[2].includes(x.uniqueId)); return structuredClone(out) }
      case 'packRetargetCopies': case 'editableRetargetCopies': return 0
      case 'packRenameSource': { const s = doc(a[0]).body._meta.sources.find((x: { json: string }) => x.json === a[1]); Object.assign(s, a[2]); return undefined }
      case 'packExport': return { filename: 'x.json', body: { _meta: { ...doc(a[0]).body._meta, ...(a[1] ? { edition: a[1] } : {}) } } }
      default: return undefined
    }
  } }
  const lib = {
    frameOf: async () => frame,
    mutateAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<unknown>) => ({ value: await run({}), parse: {}, view: {} }), writeAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<{ value: unknown }>) => ({ value: (await run({})).value, view: {}, dirty: [] }),
    brewImport: async (_s: string, files: Array<{ name: string; text: string }>) => {
      for (const f of files) {
        const body = JSON.parse(f.text)
        const id = body._meta.sources.map((s: { json: string }) => s.json.toLowerCase()).sort().join(' :: ')
        const i = docs.findIndex((d) => d.body._meta.sources.map((s: { json: string }) => s.json.toLowerCase()).sort().join(' :: ') === id)
        if (i >= 0) docs.splice(i, 1)
        docs.push({ docIdLocal: `d${++n}`, filename: f.name, body })
      }
      return { ok: true, errors: [], value: { added: files } }
    },
    brewDelete: async () => ({}),
  }
  const packsOf = async () => docs.filter((d) => !d.isEditable).map((d) => ({ docIdLocal: d.docIdLocal, filename: d.filename, url: null, origin: 'import', isEditable: false, timeAdded: 0, sources: d.body._meta.sources.map((s: { json: string }) => s.json), sourceInfo: d.body._meta.sources.map((s: { json: string; full: string; abbreviation: string }) => ({ json: s.json, full: s.full, abbreviation: s.abbreviation, authors: [], version: null, dateReleased: null })), dependencies: null, includes: null, requires: [], props: {}, hashes: {}, entryCount: 0 }))
  const pd: PackDeps = { lib: lib as never, manage, packsOf: packsOf as never }
  const ed: EntryDeps = { lib: lib as never, manage, mineSource: { json: 'TRPGMINE', full: '我的资料', abbreviation: '我的' }, validateEntry: async () => [] }
  return { pd, ed, docs }
}
const rule = Object.keys(registry.rules)[0]

describe('包 = 作者的一个独立自制包（B8-1）', () => {
  it('建包：编号要合法、不能撞已有的书 / 包、要有名字；导入一个只有包头的文件；给了规则就打版本标签、包头写版本风格', async () => {
    const { pd, docs } = setup()
    await expect(createPack(pd, 'cn', { json: 'has space', full: 'x', abbreviation: 'x' })).rejects.toThrow('只能用')
    await expect(createPack(pd, 'cn', { json: 'PHB', full: 'x', abbreviation: 'x' })).rejects.toThrow('已经有书或包在用')
    await expect(createPack(pd, 'cn', { json: 'OK1', full: ' ', abbreviation: 'x' })).rejects.toThrow('要有名字')
    const p = await createPack(pd, 'cn', { json: 'PIRATE', full: '海盗战役', abbreviation: '' }, { rule })
    expect(p.id).toBe('pirate')
    expect(docs[0].body._meta).toMatchObject({ sources: [{ json: 'PIRATE', full: '海盗战役', abbreviation: 'PIRATE' }], edition: ruleScopes(rule).style })
    expect((await manage.assignments()).get(sourceUnit('PIRATE'))?.scopes).toEqual([...ruleScopes(rule).defaultScopes])
  })
  it('列包：身份 = 来源编号组合；自己的来源 = 包头最后一行；改名不变身份；导出按版本标签写 edition', async () => {
    const { pd } = setup()
    await createPack(pd, 'cn', { json: 'PIRATE', full: '海盗战役', abbreviation: 'P' }, { rule })
    const [p] = await listPacks(pd, 'cn')
    expect(p).toMatchObject({ id: 'pirate', own: { json: 'PIRATE', full: '海盗战役' } })
    await renamePack(pd, 'cn', 'pirate', { full: '海盗战役·改' })
    const [q] = await listPacks(pd, 'cn')
    expect(q).toMatchObject({ id: 'pirate', own: { full: '海盗战役·改' } })
    const ex = await exportPack(pd, 'cn', 'pirate') as { body: { _meta: { edition?: string } } }
    expect(ex.body._meta.edition).toBeDefined()
  })
})

describe('包里的条目（B8-2）', () => {
  it('存进包：来源默认是包自己的来源；改两次撤销两次；删掉的撤销回到同一个包', async () => {
    const { pd, ed, docs } = setup()
    await createPack(pd, 'cn', { json: 'PIRATE', full: '海盗战役', abbreviation: 'P' })
    const a = await persist(ed, 'cn', 'spell', { name: '火焰鹦鹉', level: 1 }, { record: true, pack: 'pirate' })
    expect(docs[0].body.spell[0]).toMatchObject({ name: '火焰鹦鹉', source: 'PIRATE' })
    await persist(ed, 'cn', 'spell', { name: '火焰鹦鹉', level: 2, uniqueId: a.uniqueId }, { record: true, pack: 'pirate' })
    await undo(ed, 'cn', 'spell', a.uniqueId)
    expect(docs[0].body.spell[0].level).toBe(1)
    await remove(ed, 'cn', 'spell', [a.uniqueId], { record: true, pack: 'pirate' })
    expect(docs[0].body.spell).toEqual([])
    await undo(ed, 'cn', 'spell', a.uniqueId)
    expect(docs[0].body.spell.map((x: { uniqueId: string }) => x.uniqueId)).toEqual([a.uniqueId])
  })
  it('改导入 / 复制来的条目（没有 uniqueId）：按作者编号换掉那一条，不另加一条', async () => {
    const { pd, ed, docs } = setup()
    await pd.lib.brewImport('cn-brew', [{ name: 'c.json', text: JSON.stringify({ _meta: { sources: [{ json: 'PHB' }, { json: 'PHB_COPY1', full: '玩家手册（副本 1）' }] }, spell: [{ name: '火球术', source: 'PHB', level: 3 }] }) }])
    await persist(ed, 'cn', 'spell', { name: '火球术', source: 'PHB', level: 9 }, { record: true, pack: 'phb :: phb_copy1', replaceHash: '火球术_phb' })
    expect(docs[0].body.spell).toHaveLength(1)
    expect(docs[0].body.spell[0]).toMatchObject({ level: 9, source: 'PHB' })
  })
  it('换包：来源换成目标包的，原来的包里没了；撤销两步回到原样，插件记录跟着搬回', async () => {
    const { pd, ed, docs } = setup()
    await createPack(pd, 'cn', { json: 'AAA', full: 'A', abbreviation: 'A' })
    await createPack(pd, 'cn', { json: 'BBB', full: 'B', abbreviation: 'B' })
    const s = await persist(ed, 'cn', 'spell', { name: '术', level: 1 }, { record: true, pack: 'aaa', rule })
    const oldUnit = `ent:cn-brew:spell:术_aaa`
    expect((await manage.assignments()).has(oldUnit)).toBe(true)
    await moveEntries(ed, 'cn', 'spell', [s.uniqueId], 'aaa', 'bbb')
    expect(docs[0].body.spell).toEqual([])
    expect(docs[1].body.spell[0]).toMatchObject({ name: '术', source: 'BBB', uniqueId: s.uniqueId })
    expect((await manage.assignments()).has(`ent:cn-brew:spell:术_bbb`)).toBe(true)
    await undo(ed, 'cn', 'spell', s.uniqueId)
    expect(docs[0].body.spell[0]).toMatchObject({ source: 'AAA' })
    expect((await manage.assignments()).has(oldUnit)).toBe(true)
    await undo(ed, 'cn', 'spell', s.uniqueId)
    expect(docs[1].body.spell).toEqual([])
  })
})
