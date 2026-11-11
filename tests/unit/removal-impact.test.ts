import { afterEach, describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { impactOfRemoval, type ImpactDeps } from '../../src/core/removal-impact'
import type { BrewPack } from '../../src/library/brew-packs'

let db: TrpgDatabase
afterEach(async () => { await db?.delete() })

const pack = (id: string, sources: string[], hashes: Record<string, string[]> = {}, dependencies: unknown = null): BrewPack => ({
  docIdLocal: id, filename: `${id}.json`, url: null, origin: 'import', isEditable: false, timeAdded: 0, sources, sourceInfo: [], dependencies, includes: null,
  props: {}, hashes, entryCount: 0,
})
const packs = [pack('p1', ['Alpha'], { spell: ['fire_alpha'] }), pack('p2', ['Beta'], { spell: ['ice_beta'] }, { spell: ['alpha'] }), pack('p3', ['Gamma'])]

const kernel = (over: Record<string, unknown> = {}) => ({
  rule: 'dnd5e2014', kernelVersion: 1, library: { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} }, actors: [], ...over,
})
const ws = (ownerKey: string, k: unknown) => ({ ownerKey, ownerLabel: `卡 ${ownerKey}`, ruleId: 'dnd5e2014', currentSaveId: null, data: { kernel: k }, savedHash: '', schemaVersion: 1, updatedAt: 1 })
const slot = (id: string, ownerKey: string, k: unknown, extra: Record<string, unknown> = {}) => ({ id, ownerKey, ownerLabel: `卡 ${ownerKey}`, ruleId: 'dnd5e2014', name: `存档 ${id}`, note: '', kind: 'manual' as const, createdAt: 1, updatedAt: 1, summary: { partyNames: [], partyCount: 0 }, snapshot: { kernel: k }, hash: 'h', schemaVersion: 1, ...extra })

function deps(extra: Partial<ImpactDeps> = {}): ImpactDeps {
  return {
    db,
    manage: {
      houseRules: async () => [{ house: { set: 'cn-brew', prop: 'spell', hash: 'house_x' }, target: { set: 'cn-brew', prop: 'spell', hash: 'fire_alpha' } }, { house: { set: 'cn-brew', prop: 'spell', hash: 'house_y' }, target: { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' } }],
      allChoices: async () => [{ level: 'global', target: 'cn-official|spell|fireball_phb', altId: 'doc:p1' }, { level: 'rule:dnd5e2014', target: 'cn-official|spell|x', altId: 'base' }],
    },
    brewPacks: { list: async () => packs },
    brewSetOf: () => 'cn-brew',
    revision: 'rev-test',
    ...extra,
  }
}

describe('删除前的影响预览', () => {
  it('删自制包：依赖它的包、房规（目标在被删包里）、选了它的版本', async () => {
    db = new TrpgDatabase(`test-impact-${Math.random()}`)
    const r = await impactOfRemoval(deps(), { kind: 'brew', setId: 'cn-brew', docIdLocals: ['p1'] })
    expect(r.packs.map((p) => p.docIdLocal)).toEqual(['p2'])
    expect(r.houseRules.map((h) => h.house.hash)).toEqual(['house_x'])
    expect(r.choices.map((c) => c.altId)).toEqual(['doc:p1'])
    expect(r.saves).toEqual([])
  })

  it('战役与存档：人物引用了被删包里的条目、选书设置里有它的来源、选了它的版本，当前数据与存档分开列（含已删存档）', async () => {
    db = new TrpgDatabase(`test-impact2-${Math.random()}`)
    const ref = { kind: 'spell', set: 'cn-brew', prop: 'spell', hash: 'fire_alpha' }
    await db.workspaces.put(ws('A', kernel({ actors: [{ id: 'a', name: '甲', refs: [ref] }] })))
    await db.workspaces.put(ws('B', kernel()))
    await db.saves.put(slot('s1', 'A', kernel({ library: { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: ['src:alpha'], exclude: [], choices: {} } })))
    await db.saves.put(slot('s2', 'A', kernel({ library: { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: { 'cn-official|spell|z': 'doc:p1' } } }), { deletedAt: 5 }))
    await db.saves.put(slot('s3', 'B', kernel({ actors: [{ id: 'b', name: '乙', refs: [{ ...ref, hash: 'other' }] }] })))
    await db.saves.put(slot('s4', 'B', { not: 'a kernel' }))
    const r = await impactOfRemoval(deps(), { kind: 'brew', setId: 'cn-brew', docIdLocals: ['p1'] })
    const by = Object.fromEntries(r.saves.map((s) => [s.saveId ?? 'current:' + s.ownerKey, s]))
    expect(Object.keys(by).sort()).toEqual(['current:A', 's1', 's2'])
    expect(by['current:A'].why).toEqual(['1 处人物引用'])
    expect(by.s1.why).toEqual(['选书设置里有它的来源'])
    expect(by.s2).toMatchObject({ deleted: true, why: ['选了它的版本'] })
  })

  it('删整套官方资料：这套作者程序下的自制包都用不了；用这套资料的战役、引用它的房规都列出', async () => {
    db = new TrpgDatabase(`test-impact3-${Math.random()}`)
    await db.workspaces.put(ws('A', kernel()))
    await db.workspaces.put(ws('E', kernel({ library: { rule: 'dnd5e2014', codeSet: 'en', scopes: [], include: [], exclude: [], choices: {} } })))
    const r = await impactOfRemoval(deps(), { kind: 'official', setId: 'cn-official' })
    expect(r.packs.map((p) => p.docIdLocal)).toEqual(['p1', 'p2', 'p3'])
    expect(r.houseRules.map((h) => h.house.hash)).toEqual(['house_y'])
    expect(r.choices.map((c) => c.target)).toEqual(['cn-official|spell|fireball_phb', 'cn-official|spell|x'])
    expect(r.saves.map((s) => s.ownerKey)).toEqual(['A'])
  })

  it('自制包列不出来（没装官方数据）= 检查失败，禁止执行，不冒充没有包', async () => {
    db = new TrpgDatabase(`test-impact4-${Math.random()}`)
    await expect(impactOfRemoval(deps({ brewPacks: { list: async () => { throw new Error('没装') } } }), { kind: 'official', setId: 'cn-official' })).rejects.toThrow('没装')
  })

  it('B-25 依赖一路往下找：删 A，B 依赖 A、C 依赖 B，B 和 C 都"必须一起删"；官方整套被删时包不算必须', async () => {
    db = new TrpgDatabase(`test-impact-chain-${Math.random()}`)
    const chain = [pack('a', ['Alpha']), pack('b', ['Beta'], {}, { spell: ['alpha'] }), pack('c', ['Gamma'], {}, { spell: ['beta'] }), pack('d', ['Delta'])]
    const d = deps({ brewPacks: { list: async () => chain } })
    const r = await impactOfRemoval(d, { kind: 'brew', setId: 'cn-brew', docIdLocals: ['a'] })
    expect(r.packs.map((p) => [p.docIdLocal, p.mustRemove])).toEqual([['b', true], ['c', true]])
    expect(r.removeTogether).toEqual(['a', 'b', 'c'])
    const o = await impactOfRemoval(d, { kind: 'official', setId: 'cn-official' })
    expect(o.packs.every((p) => !p.mustRemove)).toBe(true)
    expect(o.removeTogether).toEqual([])
  })

  it('预览凭据包含版本 / 房规 / 选择 / 存档：影响变了就不能沿用旧预览', async () => {
    db = new TrpgDatabase(`test-impact-plan-${Math.random()}`)
    const a = await impactOfRemoval(deps(), { kind: 'brew', setId: 'cn-brew', docIdLocals: ['p1'] })
    const b = await impactOfRemoval(deps({ revision: 'rev-other' }), { kind: 'brew', setId: 'cn-brew', docIdLocals: ['p1'] })
    expect(a.plan.fingerprint).not.toBe(b.plan.fingerprint)
    await db.workspaces.put(ws('A', kernel({ actors: [{ id: 'a', name: '甲', refs: [{ kind: 'spell', set: 'cn-brew', prop: 'spell', hash: 'fire_alpha' }] }] })))
    const c = await impactOfRemoval(deps(), { kind: 'brew', setId: 'cn-brew', docIdLocals: ['p1'] })
    expect(c.plan.fingerprint).not.toBe(a.plan.fingerprint)
    expect(c.saves.length).toBe(1)
  })

  it('B-20 战役设置以战役级那份为准：存档快照里的副本过期了也按最新的算', async () => {
    db = new TrpgDatabase(`test-impact-meta-${Math.random()}`)
    await db.workspaces.put({ ...ws('A', kernel()), currentSaveId: 's1' })
    await db.saves.put(slot('s1', 'A', kernel()))
    await db.setMeta('campaignLibrary:s1', { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: ['src:alpha'], exclude: [], choices: {} })
    const r = await impactOfRemoval(deps(), { kind: 'brew', setId: 'cn-brew', docIdLocals: ['p1'] })
    expect(r.saves.map((x) => [x.saveId, x.why])).toEqual([[null, ['选书设置里有它的来源']], ['s1', ['选书设置里有它的来源']]])
  })
})
