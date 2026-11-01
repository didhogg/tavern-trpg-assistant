import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str } from './consumer/util'

/** 背包机制（b7）：重量与价格的缺失、同调条件、消耗品能否“使用”。 */
describe('G2b 背包机制（b7）', () => {
  it('重量价格缺失分类；同调条件；消耗品', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-bag')
    const items = l.of('item')
    const plain = items.filter((r) => r.data.rarity === 'none' && !['family', 'template'].includes(str(r.data.category)) && !('variantOf' in r.data))
    rec2.stat('b7', 'plainItems', plain.length)
    // PHB 装备表里很多物品重量写“—”（蜡烛、麦酒、纸、肥皂等）、魔法物品和毒药没有价格：这些是书上本来就没有，不算缺陷，只记数量
    rec2.stat('b7', 'plainWithoutWeight', plain.filter((r) => r.data.weight === undefined).length)
    rec2.stat('b7', 'plainWithoutValue', plain.filter((r) => r.data.value === undefined).length)
    // 同调：需要同调 767 个，其中写了“由谁同调”的 143 个，条件只是文字
    const attune = items.filter((r) => rec(r.data.attunement).required === true)
    const attuneBy = attune.filter((r) => typeof rec(r.data.attunement).by === 'string')
    rec2.stat('b7', 'attunementRequired', attune.length)
    rec2.stat('b7', 'attunementWithRestriction', attuneBy.length)
    rec2.find({ id: 'b7-attunement-restriction-text', check: 'b7', kind: 'decision', fixSource: 'decision', entries: attuneBy.map((r) => `${r.id} ${r.name}：${str(rec(r.data.attunement).by).slice(0, 24)}`), expected: 'DMG 各物品“需要同调（由……）”', note: '“由术士、魔契师、法师同调”这类限制只是文字，程序判断不了谁能同调；若要自动提示可结构化成职业/种族/阵营列表，不做则玩家自己看文字（建议：不做，按从简原则）' })
    // 消耗品：药水、油等；能“使用”（有行动，消耗物品次数）的才能一键结算
    const cons = items.filter((r) => r.data.consumable === true)
    const noAct = cons.filter((r) => !arr(r.data.activities).length && !arr(r.data.effects).length)
    rec2.stat('b7', 'consumables', cons.length)
    rec2.find({ id: 'b7-consumable-no-activity', check: 'b7', kind: 'data-defect', fixSource: 'self-structure', entries: noAct.map((r) => `${r.id} ${r.name}`), expected: 'DMG 各药水/油/灵药原文', note: '消耗品没有行动或效果，点“使用”无法结算（治疗药水已有，其余多是持续效果或需要掷表）' })
    // 弹药：单发与成捆的价格重量关系（成捆 = 数量 × 单发），价格小数修正后应成立
    const bundles = items.filter((r) => /\((\d+)\)/.test(r.name) && r.data.category === 'ammunition')
    rec2.stat('b7', 'ammunitionBundles', bundles.length)
    expect(items.length).toBeGreaterThan(2000)
    expect(rec2.settle()).toEqual([])
  })
})
