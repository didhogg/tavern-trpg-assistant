import { describe, expect, it } from 'vitest'
import { configureBrewValidator } from '../../../src/library/brew-validate'
import { CustomLibrary } from '../../../src/library/custom'
import { entryUnit, isMineWithoutEdition, ruleScopes, type Assignment } from '../../../src/library/scopes'
import registry from '../../../src/library/scopes.json'

configureBrewValidator(new URL('../../../', import.meta.url))

// P5.5 A2（R78）：新建跟战役版本走、改名搬归类；【我的库】里没写版本的自制不猜旧版。
const doc = (source: string, { url = null, edition }: { url?: string | null; edition?: string } = {}) => ({ head: { url }, body: { _meta: { sources: [{ json: source }], ...(edition ? { edition } : {}) } } })

describe('我的库里没写版本的自制 → 未归类（isMineWithoutEdition）', () => {
  it('本地导入 / 自己写的、包头没写 edition：是', () => {
    expect(isMineWithoutEdition([doc('MINE')], 'mine')).toBe(true)
  })
  it('写了 edition、或从网址下载的：不是（照作者判断）', () => {
    expect(isMineWithoutEdition([doc('A', { edition: 'one' })], 'A')).toBe(false)
    expect(isMineWithoutEdition([doc('B', { url: 'https://x/b.json' })], 'B')).toBe(false)
    expect(isMineWithoutEdition([doc('C'), doc('C', { url: 'https://x/c.json' })], 'C')).toBe(false)
  })
  it('没有包含这个来源的包：不是（交回作者判断）', () => {
    expect(isMineWithoutEdition([doc('X')], 'Y')).toBe(false)
  })
})

describe('saveEntry / createHouseRule 的版本归类', () => {
  const setup = (put: { uniqueId: string; hash: string; previousHash?: string | null }, existing: Record<string, Assignment> = {}) => {
    const assigns = new Map(Object.entries(existing))
    const manage = {
      assignments: async () => new Map(assigns),
      setAssignment: async (u: string, a: Assignment | null) => { if (a) assigns.set(u, a); else assigns.delete(u) },
      houseRules: async () => [],
      linkHouseRule: async () => undefined,
    }
    const frame = { call: async (name: string) => (name === 'editablePut' ? put : undefined) }
    const lib = {
      frameOf: async () => frame,
      mutateAuthor: async (_c: string, _k: string, run: (view: unknown) => Promise<unknown>) => ({ value: await run({}), parse: {}, view: {} }),
      storedItem: async () => ({ item: { name: '火球术', source: 'PHB' }, source: 'PHB' }),
    }
    const scoped = { manage, choose: async (c: unknown) => c, reset: () => undefined }
    return { custom: new CustomLibrary(lib as never, scoped as never, {} as never), assigns }
  }
  const spell = { name: '测试术', level: 1 }
  const rules = Object.keys(registry.rules)

  it('新写的一条：给了规则就归到这套规则的默认范围（按登记表，不写死）', async () => {
    for (const rule of rules) {
      const { custom, assigns } = setup({ uniqueId: 'u1', hash: 'h1' })
      await custom.saveEntry('cn', 'spell', spell, { rule })
      expect(assigns.get(entryUnit({ set: 'cn-brew', prop: 'spell', hash: 'h1' }))).toEqual({ scopes: ruleScopes(rule).defaultScopes, global: false })
    }
  })
  it('没给规则：不归类（不猜）', async () => {
    const { custom, assigns } = setup({ uniqueId: 'u1', hash: 'h1' })
    await custom.saveEntry('cn', 'spell', spell)
    expect(assigns.size).toBe(0)
  })
  it('改已有的一条、名字没变：归类不动', async () => {
    const unit = entryUnit({ set: 'cn-brew', prop: 'spell', hash: 'h1' })
    const mine: Assignment = { scopes: ['user-x'], global: false }
    const { custom, assigns } = setup({ uniqueId: 'u1', hash: 'h1', previousHash: 'h1' }, { [unit]: mine })
    await custom.saveEntry('cn', 'spell', { ...spell, uniqueId: 'u1' }, { rule: rules[0] })
    expect(assigns.get(unit)).toEqual(mine)
  })
  it('改名（编号变了）：旧编号上的归类搬到新编号，旧的清掉', async () => {
    const old = entryUnit({ set: 'cn-brew', prop: 'spell', hash: 'h-old' })
    const mine: Assignment = { scopes: ['5e2024'], global: false }
    const { custom, assigns } = setup({ uniqueId: 'u1', hash: 'h-new', previousHash: 'h-old' }, { [old]: mine })
    await custom.saveEntry('cn', 'spell', { ...spell, uniqueId: 'u1' }, { rule: rules[0] })
    expect(assigns.get(entryUnit({ set: 'cn-brew', prop: 'spell', hash: 'h-new' }))).toEqual(mine)
    expect(assigns.has(old)).toBe(false)
  })
  it('房规：按战役规则归类', async () => {
    const rule = rules[0]
    const { custom, assigns } = setup({ uniqueId: 'r1', hash: 'house-h' })
    const c = { rule, codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} }
    await custom.createHouseRule(c, { set: 'cn-official', prop: 'spell', hash: 'fireball' }, { entity: { name: '火球术' } }, { activate: false })
    expect(assigns.get(entryUnit({ set: 'cn-brew', prop: 'spell', hash: 'house-h' }))).toEqual({ scopes: ruleScopes(rule).defaultScopes, global: false })
  })
})
