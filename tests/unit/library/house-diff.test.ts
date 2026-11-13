import { describe, expect, it } from 'vitest'
import { configureBrewValidator } from '../../../src/library/brew-validate'
import { CustomLibrary } from '../../../src/library/custom'
import { topLevelChanges } from '../../../src/library/house-diff'
import { ruleScopes } from '../../../src/library/scopes'
import registry from '../../../src/library/scopes.json'

/** 测共用逻辑：不指定包时走可编辑自制（P5.5 B8-6 起默认存进「我的资料」包，那条路见 custom-packs.test.ts）。 */
const toEditable = <T>(c: T): T => { (c as unknown as { defaultPack: () => Promise<null> }).defaultPack = async () => null; return c }

// P5.5 B1：房规只记改动（作者 _copy：写了的覆盖，null 删掉，没写的从原件抄）；新条目按规则写条目级版本。
configureBrewValidator(new URL('../../../', import.meta.url))

describe('topLevelChanges', () => {
  const was = { name: '火球术', source: 'PHB', level: 3, entries: ['a'], range: { type: 'point', distance: { type: 'feet', amount: 150 } }, page: 241 }
  it('只给改过的；删掉的给 null；新加的给新值', () => {
    const now = { name: '火球术', source: 'PHB', level: 4, entries: ['a'], range: was.range, meta: { ritual: true } }
    expect(topLevelChanges(was, now)).toEqual({ level: 4, page: null, meta: { ritual: true } })
  })
  it('嵌套对象只是键的顺序不同：不算改', () => {
    const now = { ...was, range: { distance: { amount: 150, type: 'feet' }, type: 'point' } }
    expect(topLevelChanges(was, now)).toEqual({})
  })
  it('来源、_copy 不算改动；名字改了要报出来（房规用新名字）', () => {
    expect(topLevelChanges(was, { ...was, source: 'X', _copy: { name: 'y' } })).toEqual({})
    expect(topLevelChanges(was, { ...was, name: '大火球术' })).toEqual({ name: '大火球术' })
  })
})

describe('createHouseRule({ edited }) / saveEntry 写版本', () => {
  const base = { name: '火球术', source: 'PHB', level: 3, entries: ['a'], _isCopy: true, page: 241 }
  const setup = () => {
    const puts: Array<[string, Record<string, unknown>]> = []
    const manage = { assignments: async () => new Map(), setAssignment: async () => undefined, houseRules: async () => [], linkHouseRule: async () => undefined, allChoices: async () => [], pushHistory: async () => undefined, history: async () => [] }
    // 小窗的 cleanEntity 照作者 cleanJson：去掉下划线开头的运行时字段（_copy 保留）
    const clean = (e: Record<string, unknown>) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith('_') || k === '_copy'))
    const frame = { call: async (name: string, ...args: unknown[]) => {
      if (name === 'cleanEntity') return clean(args[0] as Record<string, unknown>)
      if (name === 'editablePut') { puts.push([args[0] as string, args[1] as Record<string, unknown>]); return { uniqueId: 'u', hash: 'h', previousHash: null, previous: null } }
      return undefined
    } }
    const lib = { frameOf: async () => frame, storedItem: async () => ({ item: base, source: 'PHB' }), mutateAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<unknown>) => ({ value: await run({}), parse: {}, view: {} }), writeAuthor: async (_c: string, _k: string, run: (v: unknown) => Promise<{ value: unknown }>) => ({ value: (await run({})).value, view: {}, dirty: [] }) }
    const custom = toEditable(new CustomLibrary(lib as never, { manage, choose: async (c: unknown) => c, reset: () => undefined } as never, {} as never))
    return { custom, puts }
  }
  const rule = Object.keys(registry.rules)[0]
  const c = { rule, codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} }
  const target = { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' }

  it('只存改过的那几项 + _copy 指向原件；原件的运行时字段不算改动', async () => {
    const { custom, puts } = setup()
    const r = await custom.createHouseRule(c, target, { edited: { name: '火球术', source: 'PHB', level: 5, entries: ['a'] } }, { activate: false })
    const [, ent] = puts[0]
    expect(ent).toEqual({ level: 5, page: null, name: '火球术', source: 'TRPGHOUSE', _copy: { name: '火球术', source: 'PHB' } })
    expect(r.changed.sort()).toEqual(['level', 'page'])
  })
  it('和原件一样：报错，不存', async () => {
    const { custom, puts } = setup()
    await expect(custom.createHouseRule(c, target, { edited: { name: '火球术', source: 'PHB', level: 3, entries: ['a'], page: 241 } }, { activate: false })).rejects.toThrow('没有改动')
    expect(puts.length).toBe(0)
  })
  it('改了名字：房规用新名字，仍指向原件', async () => {
    const { custom, puts } = setup()
    await custom.createHouseRule(c, target, { edited: { ...base, name: '大火球术', level: 3 } }, { activate: false })
    expect(puts[0][1]).toMatchObject({ name: '大火球术', _copy: { name: '火球术', source: 'PHB' } })
  })
  it('新条目：能自带版本的类别（按字段说明表）写上规则的版本；不能的、改已有的、自己写了的都不动', async () => {
    for (const r of Object.keys(registry.rules)) {
      const { custom, puts } = setup()
      await custom.saveEntry('cn', 'background', { name: '新背景' }, { rule: r })
      await custom.saveEntry('cn', 'spell', { name: '新法术' }, { rule: r })
      await custom.saveEntry('cn', 'background', { name: '旧背景', uniqueId: 'x' }, { rule: r })
      await custom.saveEntry('cn', 'race', { name: '写了版本', edition: 'classic' }, { rule: r })
      expect(puts[0][1].edition).toBe(ruleScopes(r).style)
      expect('edition' in puts[1][1]).toBe(false)
      expect('edition' in puts[2][1]).toBe(false)
      expect(puts[3][1].edition).toBe('classic')
    }
  })
})
