import { describe, expect, it } from 'vitest'
import { configureBrewValidator } from '../../../src/library/brew-validate'
import { formatOfCampaign, formatOfCodeSet, getFormat } from '../../../src/library/formats'
import { CODE_SETS } from '../../../src/library/sources'
import { ruleScopes } from '../../../src/library/scopes'
import registry from '../../../src/library/scopes.json'

configureBrewValidator(new URL('../../../', import.meta.url))

describe('数据格式登记（P5.5 A1）', () => {
  it('每套资料集、每条规则都登记了格式，且格式都在登记表里（不写死名单，按登记表逐个查）', () => {
    for (const codeSet of Object.keys(CODE_SETS)) expect(formatOfCodeSet(codeSet).id).toBe(CODE_SETS[codeSet].format)
    for (const rule of Object.keys(registry.rules)) expect(() => getFormat(ruleScopes(rule).format)).not.toThrow()
  })

  it('战役的规则和资料集格式一致才放行；没登记的格式直接报错', () => {
    const rule = Object.keys(registry.rules)[0]
    const codeSet = Object.keys(CODE_SETS).find((cs) => CODE_SETS[cs].format === ruleScopes(rule).format)!
    expect(formatOfCampaign({ rule, codeSet }).id).toBe(ruleScopes(rule).format)
    expect(() => formatOfCodeSet('no-such-set')).toThrow('没有登记数据格式')
    expect(() => getFormat('no-such-format')).toThrow('没有登记这种数据格式')
  })

  it('按资料集取到的校验器就是作者结构定义：缺 _meta 必填项报错', async () => {
    const f = formatOfCodeSet(Object.keys(CODE_SETS)[0])
    const r = await f.validate({ _meta: { sources: [] } })
    expect(r.ok).toBe(false)
    expect(r.issues.some((i) => i.keyword === 'required')).toBe(true)
  })
})
