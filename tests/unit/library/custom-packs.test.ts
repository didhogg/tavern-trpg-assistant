import { describe, expect, it } from 'vitest'
import { createPack, exportPack, listPacks, moveEntries, type PackDeps } from '../../../src/library/custom-packs'
import { ruleScopes, sourceUnit, type Assignment } from '../../../src/library/scopes'
import registry from '../../../src/library/scopes.json'

// P5.5 B3：自己的包 = 作者可编辑自制里的一个来源。
function setup(doc: Record<string, unknown> = { _meta: { sources: [{ json: 'TRPGMINE', full: '我的资料', abbreviation: '我的' }] }, spell: [{ name: 'a', source: 'TRPGMINE', uniqueId: 'u1' }, { name: 'b', source: 'TRPGMINE', uniqueId: 'u2' }], feat: [{ name: 'c', source: 'TRPGMINE', uniqueId: 'u3' }] }, taken: string[] = ['PHB']) {
  const assigns = new Map<string, Assignment>()
  const calls: Array<[string, unknown[]]> = []
  const frame = { call: async (name: string, ...args: unknown[]) => {
    calls.push([name, args])
    if (name === 'sourceTaken') return taken.map((x) => x.toLowerCase()).includes(String(args[0]).toLowerCase())
    if (name === 'editableDoc') return { body: doc }
    if (name === 'editableExport') return { filename: 'x.json', body: { edition: args[1] } }
    return undefined
  } }
  const saved: Array<[string, Record<string, unknown>]> = []
  const d: PackDeps = {
    frame: async () => frame as never,
    mutate: async (_c, _k, run) => ({ value: await run(frame as never) }),
    manage: { assignments: async () => new Map(assigns), setAssignment: async (u: string, a: Assignment | null) => { if (a) assigns.set(u, a); else assigns.delete(u) } } as never,
    save: async (_c, prop, ent) => { saved.push([prop, ent]); return { uniqueId: String(ent.uniqueId), hash: 'h', renamed: null } },
  }
  return { d, calls, assigns, saved }
}

describe('自己的包', () => {
  it('建包：编号要合法、不能撞已有的书 / 包、要有名字；给了规则就打上这套规则的版本标签', async () => {
    const { d, calls, assigns } = setup()
    await expect(createPack(d, 'cn', { json: 'has space', full: 'x', abbreviation: 'x' })).rejects.toThrow('只能用')
    await expect(createPack(d, 'cn', { json: 'phb', full: 'x', abbreviation: 'x' })).rejects.toThrow('已经有书或包在用')
    await expect(createPack(d, 'cn', { json: 'MyPack', full: ' ', abbreviation: 'x' })).rejects.toThrow('要有名字')
    const rule = Object.keys(registry.rules)[0]
    const made = await createPack(d, 'cn', { json: 'MyPack', full: '我的包', abbreviation: '' }, { rule })
    expect(made).toEqual({ json: 'MyPack', full: '我的包', abbreviation: 'MyPack' })
    expect(calls.find(([n]) => n === 'editableEnsureSource')?.[1]).toEqual([made])
    expect(assigns.get(sourceUnit('MyPack'))).toEqual({ scopes: ruleScopes(rule).defaultScopes, global: false })
  })
  it('列包：每个来源每类几条', async () => {
    const { d } = setup()
    expect(await listPacks(d, 'cn')).toEqual([{ json: 'TRPGMINE', full: '我的资料', abbreviation: '我的', counts: { spell: 2, feat: 1 }, total: 3 }])
  })
  it('换包：改来源后走 custom 的保存；已经在那个包的跳过；目标包不存在报错', async () => {
    const doc = { _meta: { sources: [{ json: 'TRPGMINE', full: '', abbreviation: '' }, { json: 'MyPack', full: '', abbreviation: '' }] }, spell: [{ name: 'a', source: 'TRPGMINE', uniqueId: 'u1' }, { name: 'b', source: 'MyPack', uniqueId: 'u2' }] }
    const { d, saved } = setup(doc)
    await moveEntries(d, 'cn', 'spell', ['u1', 'u2'], 'MyPack')
    expect(saved).toEqual([['spell', { name: 'a', source: 'MyPack', uniqueId: 'u1' }]])
    await expect(moveEntries(d, 'cn', 'spell', ['u1'], 'Nope')).rejects.toThrow('没有这个包')
  })
  it('按包导出：包头 edition 按包的版本标签（只带一种版本时），否则用作者默认 classic', async () => {
    for (const rule of Object.keys(registry.rules)) {
      const { d, assigns } = setup()
      assigns.set(sourceUnit('TRPGMINE'), { scopes: ruleScopes(rule).defaultScopes, global: false })
      expect((await exportPack(d, 'cn', 'TRPGMINE')).body).toEqual({ edition: ruleScopes(rule).style })
    }
    const { d } = setup()
    expect((await exportPack(d, 'cn', 'TRPGMINE')).body).toEqual({ edition: 'classic' })
  })
})
