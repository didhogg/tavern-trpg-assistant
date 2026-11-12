// 多选卸载（P5-5 §12 B1）：补上另一种语言、合并影响、按语言分步执行、第二步失败时写清已完成哪一步。
import { describe, expect, it } from 'vitest'
import { executeBatch, mergeImpacts, RemovalBatchError, withCounterparts } from '../../src/core/removal-batch'
import type { RemovalImpact, RemovalTarget } from '../../src/core/removal-impact'

const view = (states: Record<string, { status: string; books?: string[] | null; adventures?: string[] | null }>) => ({ officialState: async (id: string) => states[id] ?? null }) as never
const pairs = { installed: async () => [{ zh: { docIdLocal: 'z1' }, en: { docIdLocal: 'e1' }, status: 'paired' }, { zh: { docIdLocal: 'z2' }, en: null, status: 'zh-only' }] } as never
const impact = (t: RemovalTarget, over: Partial<RemovalImpact> = {}): RemovalImpact => ({ target: t, plan: { id: 'x', fingerprint: `fp:${JSON.stringify(t)}`, checkedAt: 0, removeTogether: [] }, packs: [], removeTogether: [], houseRules: [], choices: [], saves: [], ...over })

describe('多选卸载', () => {
  it('官方书：补上英文同一书号（只取英文那边装着的）；同一套合并成一个目标', async () => {
    const v = view({ 'en-official': { status: 'installed', books: ['PHB'], adventures: [] } })
    const out = await withCounterparts(v, pairs, [
      { kind: 'official', setId: 'cn-official', bookIds: ['PHB'], bookSources: ['PHB'] },
      { kind: 'official', setId: 'cn-official', bookIds: ['DMG'], bookSources: ['DMG'] },
    ])
    expect(out).toEqual([
      { kind: 'official', setId: 'cn-official', bookIds: ['PHB', 'DMG'], bookSources: ['PHB', 'DMG'] },
      { kind: 'official', setId: 'en-official', bookIds: ['PHB'], bookSources: ['PHB'] },
    ])
  })
  it('英文没装：只删中文那一份', async () => {
    const out = await withCounterparts(view({}), pairs, [{ kind: 'official', setId: 'cn-official', bookIds: ['PHB'] }])
    expect(out.map((t) => t.setId)).toEqual(['cn-official'])
  })
  it('自制包：配上的英文包一起删；没配上的只删自己', async () => {
    const out = await withCounterparts(view({}), pairs, [{ kind: 'brew', setId: 'cn-brew', docIdLocals: ['z1', 'z2'] }])
    expect(out).toEqual([{ kind: 'brew', setId: 'cn-brew', docIdLocals: ['z1', 'z2'] }, { kind: 'brew', setId: 'en-brew', docIdLocals: ['e1'] }])
  })
  it('合并影响：同一个包「必须一起删」优先；自己在名单里的包不算受影响；存档原因合并', () => {
    const a: RemovalTarget = { kind: 'official', setId: 'cn-official', bookIds: ['PHB'] }
    const b: RemovalTarget = { kind: 'brew', setId: 'cn-brew', docIdLocals: ['z1'] }
    const save = { ownerKey: 'o', ownerLabel: '战役', saveId: null, name: '当前数据', kind: 'current' as const, deleted: false }
    const m = mergeImpacts([a, b], [
      impact(a, { packs: [{ docIdLocal: 'p', filename: 'p', why: '受影响', mustRemove: false }, { docIdLocal: 'z1', filename: 'z1', why: 'x', mustRemove: false }], saves: [{ ...save, why: ['2 处人物引用'] }] }),
      impact(b, { packs: [{ docIdLocal: 'p', filename: 'p', why: '必删', mustRemove: true }], saves: [{ ...save, why: ['选了它的版本'] }] }),
    ])
    expect(m.packs).toEqual([{ docIdLocal: 'p', filename: 'p', why: '必删', mustRemove: true }])
    expect(m.saves[0].why).toEqual(['2 处人物引用', '选了它的版本'])
  })
  const fakeOps = () => {
    const log: string[] = []
    return { log, ops: { begin: async (o: { codeSet: string }) => { log.push(`begin:${o.codeSet}`); return { base: {} } }, abort: async () => { log.push('abort') } } as never }
  }
  it('按语言分步：中文一步、英文一步；官方书牵连的自制包并进同一步', async () => {
    const cn: RemovalTarget = { kind: 'official', setId: 'cn-official', bookIds: ['PHB'] }
    const en: RemovalTarget = { kind: 'official', setId: 'en-official', bookIds: ['PHB'] }
    const parts = [impact(cn, { removeTogether: ['z9'] }), impact(en)]
    const batch = mergeImpacts([cn, en], parts)
    const { log, ops } = fakeOps()
    const calls: unknown[] = []
    const r = await executeBatch({ operations: ops, brewSetOf: (c) => `${c}-brew`, impactAt: async (_v, t) => parts.find((p) => p.target === t)!, removeParts: async (p) => { calls.push(p) } }, batch)
    expect(r.done).toEqual(['cn', 'en'])
    expect(log).toEqual(['begin:cn', 'begin:en'])
    expect(calls[0]).toEqual({ official: [{ setId: 'cn-official', bookIds: ['PHB'], bookSources: undefined, adventureIds: undefined }], brews: [{ setId: 'cn-brew', ids: ['z9'] }] })
  })
  it('预览后资料变了：第一步就停，什么都不删', async () => {
    const cn: RemovalTarget = { kind: 'official', setId: 'cn-official', bookIds: ['PHB'] }
    const batch = mergeImpacts([cn], [impact(cn)])
    const { ops } = fakeOps()
    let ran = false
    await expect(executeBatch({ operations: ops, brewSetOf: (c) => `${c}-brew`, impactAt: async (_v, t) => impact(t, { plan: { id: 'y', fingerprint: 'changed', checkedAt: 0, removeTogether: [] } }), removeParts: async () => { ran = true } }, batch)).rejects.toThrow('重新预览')
    expect(ran).toBe(false)
  })
  it('中文成功、英文失败：报 RemovalBatchError，写清中文已卸载、英文没成功，并带上剩下的目标', async () => {
    const cn: RemovalTarget = { kind: 'official', setId: 'cn-official', bookIds: ['PHB'] }
    const en: RemovalTarget = { kind: 'official', setId: 'en-official', bookIds: ['PHB'] }
    const parts = [impact(cn), impact(en)]
    const { ops } = fakeOps()
    const err = await executeBatch({ operations: ops, brewSetOf: (c) => `${c}-brew`, impactAt: async (_v, t) => parts.find((p) => p.target === t)!, removeParts: async (p) => { if (p.official[0].setId === 'en-official') throw new Error('英文正在下载') } }, mergeImpacts([cn, en], parts)).catch((e) => e)
    expect(err).toBeInstanceOf(RemovalBatchError)
    expect(err.message).toBe('中文部分已卸载，英文部分没有成功：英文正在下载')
    expect(err.remaining).toEqual([en])
  })
})
