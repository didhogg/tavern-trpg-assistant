// 前端不内嵌后端（P5.5 收尾）：包属于哪套规则由后端判断（scopes.ruleOfScopes / MyPack.rule），改规则走 custom.setPackRule。
import { describe, expect, it } from 'vitest'
import { listPacks, setPackRule } from '../../../src/library/custom-packs'
import { ruleOfScopes, ruleScopes } from '../../../src/library/scopes'
import registry from '../../../src/library/scopes.json'

const rules = Object.keys(registry.rules)

describe('包属于哪套规则', () => {
  it('范围和哪套规则的默认范围一模一样就是它（按登记表）；空的、对不上的是未归类', () => {
    for (const r of rules) expect(ruleOfScopes([...ruleScopes(r).defaultScopes])).toBe(r)
    expect(ruleOfScopes([])).toBeNull()
    expect(ruleOfScopes(['没有这个范围'])).toBeNull()
  })
  it('列包时带上 rule；改规则写这套规则的默认范围，未归类清掉', async () => {
    const assigns = new Map<string, { scopes: string[]; global: boolean } | null>()
    const manage = { assignments: async () => assigns, setAssignment: async (u: string, a: { scopes: string[]; global: boolean } | null) => { assigns.set(u, a) } }
    const d = { manage, lib: {} as never, packsOf: async () => [{ origin: 'import', sources: ['PIRATE'], sourceInfo: [{ json: 'PIRATE' }], docIdLocal: 'd1' }] } as never
    expect((await listPacks(d, 'cn'))[0].rule).toBeNull()
    await setPackRule(d, 'cn', 'pirate', rules[0])
    expect((await listPacks(d, 'cn'))[0]).toMatchObject({ rule: rules[0], scopes: [...ruleScopes(rules[0]).defaultScopes] })
    await setPackRule(d, 'cn', 'pirate', null)
    expect((await listPacks(d, 'cn'))[0].rule).toBeNull()
  })
})
