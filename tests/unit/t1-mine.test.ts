import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { MyLibrary, DEFAULT_MINE_NAME, defaultMinePackId } from '../../src/core/library/mine'
import { uuid } from '../../src/core/ids'
import type { Entry } from '../../src/schemas/pack'
import { makePack, makeRegistry } from '../helpers/fixtures'
import { setup, type Harness } from '../helpers/harness'

let db: TrpgDatabase
let h: Harness
let mine: MyLibrary
const rules = makeRegistry()
async function installTarget(): Promise<void> {
  const rec = h.packs.recognize(makePack({ id: 'target-ext', name: '目标包' }, [{ id: 'item.target.phb', type: 'item', name: '目标物品', keywords: [], unique: false, summary: '', data: {} }]))
  if (rec.type !== 'pack') throw new Error('目标包夹具')
  await h.packs.install(rec, { source: 'import' })
}
const base = { src: { book: 'PHB', page: 1 }, credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0' } }
const monster = (id: string, name: string, inventory?: Array<{ ref: string }>): Entry => ({
  id,
  type: 'monster',
  name,
  keywords: [],
  unique: false,
  summary: '',
  data: { ...base, size: ['S'], creatureType: { type: 'beast', tags: [] }, ac: [{ value: 10 }], hp: { average: 5 }, speed: { walk: 30 }, abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, ...(inventory ? { inventory } : {}) },
})
const spell = (id: string, name: string): Entry => ({ id, type: 'spell', name, keywords: [], unique: false, summary: '', data: { ...base, level: 0, school: 'evocation', castTime: [{ n: 1, unit: 'action' }], range: { type: 'point', amount: 30, unit: 'feet' }, components: {}, duration: [{ type: 'instant' }] } })

beforeEach(async () => {
  db = new TrpgDatabase(`mine-${uuid()}`)
  h = await setup(db)
  mine = new MyLibrary({ db, packs: h.packs, rules, now: h.clock })
})
afterEach(async () => {
  db.close()
  await db.delete()
})

describe('任务一：默认包与服务', () => {
  it('ensureDefault 幂等；默认包不能改名/删除，可改简介；复制为新包用「副本」名', async () => {
    const d = await mine.ensureDefault('dnd5e2014')
    expect(d).toMatchObject({ id: defaultMinePackId('dnd5e2014'), name: DEFAULT_MINE_NAME, category: 'rules', version: '1.0.0' })
    expect((await mine.ensureDefault('dnd5e2014')).id).toBe(d.id)
    await expect(mine.rename(d.id, { name: '别的包' })).rejects.toMatchObject({ code: 'E_BAD_NAME' })
    expect((await mine.rename(d.id, { name: DEFAULT_MINE_NAME, description: '说明' })).description).toBe('说明')
    await expect(mine.remove(d.id)).rejects.toMatchObject({ code: 'E_BAD_CONTENT' })
    const copy = await mine.duplicate(d.id)
    expect(copy.name).toBe(`${DEFAULT_MINE_NAME}（副本）`)
    expect(copy.id).not.toBe(d.id)
  })

  it('store：不选包进默认包；同名先返回冲突，update 覆盖，new 另起编号；版本 +1', async () => {
    const first = await mine.store({ ruleId: 'dnd5e2014', entry: monster('a', '影鼠') })
    expect(first.entryId).toMatch(/^m-[a-z0-9]{10}$/)
    expect(first.version).toBe('1.0.1')
    const d = (await db.packs.get(defaultMinePackId('dnd5e2014')))!
    expect(d.entryCount).toBe(1)
    const conflict = await mine.store({ ruleId: 'dnd5e2014', entry: monster('b', ' 影鼠 ') })
    expect(conflict.conflict?.entryId).toBe(first.entryId)
    expect((await db.packs.get(d.id))!.version).toBe('1.0.1')
    const updated = await mine.store({ ruleId: 'dnd5e2014', entry: { ...monster('b', '影鼠'), summary: '新版' }, mode: 'update' })
    expect(updated.entryId).toBe(first.entryId)
    expect(updated.version).toBe('1.0.2')
    expect((await db.entries.get([d.id, first.entryId!]))!.summary).toBe('新版')
    const another = await mine.store({ ruleId: 'dnd5e2014', entry: monster('c', '影鼠'), mode: 'new' })
    expect(another.entryId).not.toBe(first.entryId)
    expect(another.version).toBe('1.0.3')
  })

  it('store：类型校验、自动补依赖、引用检查失败回滚', async () => {
    await installTarget()
    const d = await mine.ensureDefault('dnd5e2014')
    await expect(mine.store({ ruleId: 'dnd5e2014', entry: { ...monster('bad', '坏条目'), data: { hp: 1 } } })).rejects.toMatchObject({ code: 'E_BAD_ENTRY' })
    const linked = await mine.store({ ruleId: 'dnd5e2014', entry: monster('linked', '带装备', [{ ref: 'item.target.phb' }]) })
    expect(linked.version).toBe('1.0.1')
    const withDep = (await db.packs.get(d.id))!
    expect(withDep.relationships.requires.map((x) => x.id)).toContain('target-ext')
    const before = withDep.entryCount
    await expect(mine.store({ ruleId: 'dnd5e2014', entry: monster('bad-ref', '坏引用', [{ ref: 'item.nope' }]) })).rejects.toMatchObject({ code: 'E_BAD_REFS' })
    const after = (await db.packs.get(d.id))!
    expect(after.entryCount).toBe(before)
    expect(after.version).toBe(withDep.version)
  })

  it('renameEntry：同包同类型重名报错；成功只加一次版本号', async () => {
    const d = await mine.ensureDefault('dnd5e2014')
    const a = await mine.store({ ruleId: 'dnd5e2014', entry: monster('a', '甲') })
    const b = await mine.store({ ruleId: 'dnd5e2014', entry: monster('b', '乙') })
    await expect(mine.renameEntry(d.id, b.entryId!, '甲')).rejects.toMatchObject({ code: 'E_BAD_NAME' })
    const done = await mine.renameEntry(d.id, b.entryId!, '丙')
    expect(done.version).toBe('1.0.3')
    expect((await db.entries.get([d.id, b.entryId!]))!.name).toBe('丙')
    expect(a.version).toBe('1.0.1')
  })

  it('moveEntries / deleteEntries：批量一次事务，版本各只 +1，目标自动补依赖', async () => {
    await installTarget()
    const a = await mine.create({ ruleId: 'dnd5e2014', name: '甲' })
    const b = await mine.create({ ruleId: 'dnd5e2014', name: '乙' })
    const x = await mine.saveEntry(a.id, monster('x', '甲怪', [{ ref: 'item.target.phb' }]))
    const y = await mine.saveEntry(a.id, spell('y', '甲法术'))
    expect(x.version).toBe('1.0.1')
    expect(y.version).toBe('1.0.2')
    await mine.moveEntries(a.id, b.id, ['x', 'y'])
    const aa = (await db.packs.get(a.id))!
    const bb = (await db.packs.get(b.id))!
    expect(aa.version).toBe('1.0.3')
    expect(bb.version).toBe('1.0.1')
    expect(aa.entryCount).toBe(0)
    expect(bb.entryCount).toBe(2)
    expect(bb.relationships.requires.map((r) => r.id)).toContain('target-ext')
    const deleted = await mine.deleteEntries(b.id, ['x', 'y'])
    expect(deleted.version).toBe('1.0.2')
    expect(deleted.entryCount).toBe(0)
  })
})
