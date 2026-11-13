import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { configureBrewValidator } from '../../../src/library/brew-validate'
import { CustomLibrary } from '../../../src/library/custom'
import { LibraryDatabase } from '../../../src/library/db'
import { HISTORY_LIMIT, ManageStore } from '../../../src/library/manage'
import registry from '../../../src/library/scopes.json'

// P5.5 B2：撤销。管理记录用真的 ManageStore（测试库）；可编辑自制用一个照作者行为写的假文档：
// 按 uniqueId 存（有就覆盖、没有就加）、删时交回原文、编号 = 名字 + 来源。
configureBrewValidator(new URL('../../../', import.meta.url))

let db: LibraryDatabase
let manage: ManageStore
beforeEach(() => { db = new LibraryDatabase(`test-undo-${Math.random()}`); manage = new ManageStore(db) })
afterEach(async () => { db.close(); await db.delete() })

const hashOf = (e: Record<string, unknown>) => `${String(e.name)}_${String(e.source)}`.toLowerCase()
function setup() {
  const doc: Record<string, Array<Record<string, unknown>>> = {}
  let n = 0
  const frame = { call: async (name: string, ...args: unknown[]) => {
    const prop = args[0] as string
    const list = (doc[prop] ??= [])
    if (name === 'editablePut') {
      const ent = { ...(args[1] as Record<string, unknown>) }
      ent.uniqueId ??= `u${++n}`
      const i = list.findIndex((x) => x.uniqueId === ent.uniqueId)
      const before = i >= 0 ? structuredClone(list[i]) : null
      if (i >= 0) list[i] = ent; else list.push(ent)
      return { uniqueId: ent.uniqueId, hash: hashOf(ent), previousHash: before ? hashOf(before) : null, previous: before ? { name: before.name, source: before.source } : null, previousEntity: before }
    }
    if (name === 'editableRemove') {
      const ids = args[1] as string[]
      const removed = list.filter((x) => ids.includes(String(x.uniqueId))).map((x) => structuredClone(x))
      doc[prop] = list.filter((x) => !ids.includes(String(x.uniqueId)))
      return removed
    }
    if (name === 'editableRetargetCopies') return 0
    if (name === 'cleanEntity') return args[0]
    return undefined
  } }
  const lib = {
    frameOf: async () => frame,
    mutateAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<unknown>) => ({ value: await run({}), parse: {}, view: {} }), writeAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<{ value: unknown }>) => ({ value: (await run({})).value, view: {}, dirty: [] }),
    storedItem: async () => ({ item: { name: '火球术', source: 'PHB', level: 3 }, source: 'PHB' }),
  }
  const custom = new CustomLibrary(lib as never, { manage, choose: async (c: unknown) => c, reset: () => undefined } as never, {} as never)
  return { custom, doc }
}

describe('撤销（每条最近 HISTORY_LIMIT 步）', () => {
  it('新写 → 改两次 → 撤销三次：回到改之前，再撤销就是"没写过"（删掉）', async () => {
    const { custom, doc } = setup()
    const a = await custom.saveEntry('cn', 'spell', { name: '测试术', level: 1 })
    await custom.saveEntry('cn', 'spell', { name: '测试术', level: 2, uniqueId: a.uniqueId })
    await custom.saveEntry('cn', 'spell', { name: '测试术', level: 3, uniqueId: a.uniqueId })
    expect(await custom.undoSteps('cn', 'spell', a.uniqueId)).toBe(3)
    await custom.undo('cn', 'spell', a.uniqueId)
    expect(doc.spell[0].level).toBe(2)
    await custom.undo('cn', 'spell', a.uniqueId)
    expect(doc.spell[0].level).toBe(1)
    const last = await custom.undo('cn', 'spell', a.uniqueId)
    expect(last).toMatchObject({ undone: 'created', left: 0 })
    expect(doc.spell).toEqual([])
    await expect(custom.undo('cn', 'spell', a.uniqueId)).rejects.toThrow('没有可以撤销')
  })
  it('撤销自己不记成新的一步（不会撤销来撤销去）', async () => {
    const { custom } = setup()
    const a = await custom.saveEntry('cn', 'spell', { name: '测试术', level: 1 })
    await custom.saveEntry('cn', 'spell', { name: '测试术', level: 2, uniqueId: a.uniqueId })
    await custom.undo('cn', 'spell', a.uniqueId)
    expect(await custom.undoSteps('cn', 'spell', a.uniqueId)).toBe(1)
  })
  it('改名的撤销：名字改回来，编号也回到原来的', async () => {
    const { custom, doc } = setup()
    const a = await custom.saveEntry('cn', 'spell', { name: '旧名', level: 1 })
    await custom.saveEntry('cn', 'spell', { name: '新名', level: 1, uniqueId: a.uniqueId })
    const r = await custom.undo('cn', 'spell', a.uniqueId)
    expect(doc.spell[0].name).toBe('旧名')
    expect(r.undone === 'restored' && r.entry.hash).toBe(a.hash)
  })
  it('删掉的撤销：用原来的 uniqueId 加回来', async () => {
    const { custom, doc } = setup()
    const a = await custom.saveEntry('cn', 'spell', { name: '测试术', level: 1 })
    await custom.deleteEntries('cn', 'spell', [a.uniqueId])
    expect(doc.spell).toEqual([])
    await custom.undo('cn', 'spell', a.uniqueId)
    expect(doc.spell.map((x) => x.uniqueId)).toEqual([a.uniqueId])
  })
  it('房规：新建的撤销连链接一起去掉；删掉的撤销连链接一起恢复', async () => {
    const { custom, doc } = setup()
    const c = { rule: Object.keys(registry.rules)[0], codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} }
    const target = { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' }
    const hr = await custom.createHouseRule(c, target, { edited: { name: '火球术', source: 'PHB', level: 5 } }, { activate: false })
    await custom.deleteHouseRule('cn', hr.house, hr.uniqueId)
    expect(await manage.houseRules()).toEqual([])
    await custom.undo('cn', 'spell', hr.uniqueId)
    expect((await manage.houseRules()).map((l) => l.target)).toEqual([target])
    expect(doc.spell.length).toBe(1)
    await custom.undo('cn', 'spell', hr.uniqueId)
    expect(await manage.houseRules()).toEqual([])
    expect(doc.spell).toEqual([])
  })
  it(`最多留 ${HISTORY_LIMIT} 步，满了丢最早的`, async () => {
    const { custom } = setup()
    const a = await custom.saveEntry('cn', 'spell', { name: '测试术', level: 0 })
    for (let i = 1; i <= HISTORY_LIMIT + 5; i++) await custom.saveEntry('cn', 'spell', { name: '测试术', level: i, uniqueId: a.uniqueId })
    expect(await custom.undoSteps('cn', 'spell', a.uniqueId)).toBe(HISTORY_LIMIT)
  })
})
