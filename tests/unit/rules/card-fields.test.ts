import { describe, expect, it } from 'vitest'
import { cardFields, peopleProp, type CardTypesResult } from '../../../src/rules/kernel/card-types'
import { ruleKernel } from '../../../src/rules/kernel/adapters'

// P5.6：卡型怎么填，按「怎么建」分开给——从条目建 = 条目编辑器的字段表和表单安排；分步建卡 = 要选哪几类条目（规则数据 kernel.build）。
const ready: CardTypesResult = { status: 'ready', types: [
  { type: 'character', label: 'Player Character', labelZh: '玩家角色', build: ['steps'], store: null },
  { type: 'npc', label: 'Non-Player Character', labelZh: '非玩家角色', build: ['store'], store: 'monster' },
] }
const calls: string[] = []
const form = (result: CardTypesResult) => ({
  types: async () => result,
  fields: async (cs: string, prop: string) => { calls.push(`fields:${cs}:${prop}`); return { prop, table: true } },
  plan: async (cs: string, prop: string) => { calls.push(`plan:${cs}:${prop}`); return { prop, plan: true } },
})

describe('卡型的字段（P5.6）', () => {
  it('人物存放类别来自规则数据（11-02：怪物属性块）', () => {
    expect([peopleProp('dnd5e2014'), peopleProp('dnd5e2024'), peopleProp('nope')]).toEqual(['monster', 'monster', null])
  })
  it('NPC → 存放类别 monster 的字段表 + 表单安排，原样转交', async () => {
    calls.length = 0
    const r = await cardFields(form(ready), 'dnd5e2014', 'npc', 'cn')
    expect(r).toEqual({ type: ready.types[1], store: { prop: 'monster', fields: { prop: 'monster', table: true }, plan: { prop: 'monster', plan: true } } })
    expect(calls.sort()).toEqual(['fields:cn:monster', 'plan:cn:monster'])
  })
  it('玩家角色 → 分步建卡要选的类别（规则数据 kernel.build），不给怪物字段表（D2：人物只存引用 + 选择 + 状态）', async () => {
    calls.length = 0
    const r = await cardFields(form(ready), 'dnd5e2014', 'character', 'cn')
    expect(r).toEqual({ type: ready.types[0], steps: { parts: ruleKernel('dnd5e2014')!.build } })
    expect(r.store).toBeUndefined()
    expect(calls).toEqual([])
  })
  it('分步建卡的类别只写在规则数据里一份（存档重建也读它）', () => {
    expect(ruleKernel('dnd5e2014')!.build).toEqual(['race', 'background', 'class', 'subclass', 'feat', 'optionalfeature'])
  })
  it('规则没有的卡型报错，不猜', async () => {
    await expect(cardFields(form(ready), 'dnd5e2014', 'vehicle')).rejects.toThrow('没有这种卡型：vehicle')
  })
  it('卡型还读不出来（没接结算 / 没装资料）时说清原因', async () => {
    await expect(cardFields(form({ status: 'no-kernel', types: [] }), 'dnd5e2024', 'npc')).rejects.toThrow('还读不出来（no-kernel）')
  })
})
