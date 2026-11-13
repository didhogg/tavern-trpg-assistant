// P5.5 §16.7 第 5 条：再次编辑已有的房规——直接改那一条（作者按 uniqueId 覆盖），不再新建第二条。
import { describe, expect, it } from 'vitest'
import { configureBrewValidator } from '../../../src/library/brew-validate'
import { CustomLibrary } from '../../../src/library/custom'
import registry from '../../../src/library/scopes.json'

configureBrewValidator(new URL('../../../', import.meta.url))

const base = { name: '火球术', source: 'PHB', level: 3, entries: ['a'], page: 241 }
const target = { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' }
const house = { set: 'cn-brew', prop: 'spell', hash: 'fireball_trpghouse' }
const rule = Object.keys(registry.rules)[0]
const c = { rule, codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} }

function setup({ newHash = 'fireball_trpghouse' } = {}) {
  const puts: Array<Record<string, unknown>> = []
  const log: string[] = []
  const history: unknown[] = []
  const old = { name: '火球术', source: 'TRPGHOUSE', level: 4, uniqueId: 'house-1', _copy: { name: '火球术', source: 'PHB' } }
  const manage = {
    houseRules: async () => [{ house, target }],
    linkHouseRule: async (l: { house: { hash: string } }) => { log.push(`link:${l.house.hash}`) },
    setAssignment: async () => { log.push('assign') },
    pushHistory: async (_k: string, step: unknown) => { history.push(step) },
    assignments: async () => new Map(), allChoices: async () => [], history: async () => [],
    // carryRefs 用到的
    unlinkHouseRule: async () => { log.push('unlink') }, setChoice: async () => { log.push('choice') },
  }
  const clean = (e: Record<string, unknown>) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith('_') || k === '_copy'))
  const frame = { call: async (name: string, ...args: unknown[]) => {
    if (name === 'cleanEntity') return clean(args[0] as Record<string, unknown>)
    if (name === 'editableDoc') return { body: { spell: [old] } }
    // 现在的原文（C2：读作者存储，不读解析结果）
    if (name === 'brewDocIndex') return [{ docIdLocal: 'editable', isEditable: true }]
    if (name === 'brewRaw') return [{ body: { spell: [old] } }]
    if (name === 'packEntity') return (args[2] as { hash: string }).hash === house.hash ? { entity: old, hadId: true } : null
    if (name === 'editablePut') { puts.push(args[1] as Record<string, unknown>); return { uniqueId: 'house-1', hash: newHash, previousHash: house.hash, previous: { name: old.name, source: old.source }, previousEntity: old } }
    return undefined
  } }
  const lib = {
    frameOf: async () => frame,
    storedItem: async (set: string) => ({ item: set === 'cn-brew' ? old : base }),
    writeAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<{ value: unknown }>) => ({ value: (await run({})).value, view: {}, dirty: [] }),
  }
  const custom = new CustomLibrary(lib as never, { manage, choose: async (x: unknown) => x, reset: () => undefined } as never, {} as never)
  return { custom, puts, log, history, old }
}

describe('createHouseRule({ replace })：直接改已有的房规', () => {
  it('写回同一条（同一个 uniqueId、名字不变），仍只记和原件不一样的；不再建新链接', async () => {
    const { custom, puts, log } = setup()
    const r = await custom.createHouseRule(c, target, { edited: { ...base, level: 6 } }, { activate: false, replace: house })
    expect(puts).toHaveLength(1)
    expect(puts[0]).toEqual({ level: 6, name: '火球术', source: 'TRPGHOUSE', uniqueId: 'house-1', _copy: { name: '火球术', source: 'PHB' } })
    expect(log.filter((x) => x.startsWith('link'))).toEqual([])
    expect(r.house).toEqual(house)
  })

  it('撤销记的是房规的上一版（不是「删掉这条房规」）', async () => {
    const { custom, history, old } = setup()
    await custom.createHouseRule(c, target, { edited: { ...base, level: 6 } }, { activate: false, replace: house })
    expect(history).toEqual([expect.objectContaining({ before: old, pack: null })])
    expect((history[0] as Record<string, unknown>).link).toBeUndefined()
  })

  it('给的不是这条条目的房规：报错，不写', async () => {
    const { custom, puts } = setup()
    await expect(custom.createHouseRule(c, target, { edited: { ...base, level: 6 } }, { activate: false, replace: { ...house, hash: 'other' } })).rejects.toThrow('不是这一条条目的房规')
    expect(puts).toHaveLength(0)
  })

  it('改了名字：编号变了，房规链接搬到新编号', async () => {
    const { custom, log } = setup({ newHash: 'big_fireball_trpghouse' })
    const r = await custom.createHouseRule(c, target, { edited: { ...base, name: '大火球术', level: 6 } }, { activate: false, replace: house })
    expect(r.house.hash).toBe('big_fireball_trpghouse')
    expect(log).toEqual(['unlink', 'link:big_fireball_trpghouse'])
  })
})
