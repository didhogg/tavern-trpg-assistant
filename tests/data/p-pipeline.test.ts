import { describe, expect, it } from 'vitest'
import { lib } from './consumer/load'
import { arr, rec } from './consumer/util'

/**
 * G2.5 P 管线站的通用验收：扫全库，不按书写死条数。
 * D1.2b 导入新书后，这些测试自动检查新书（管线错了就在这里红）。
 */
const l = lib()
const realItems = l.of('item').filter((r) => !['template', 'family'].includes(String(r.data.category)))
const namedActions = (r: { data: Record<string, unknown> }): Array<Record<string, unknown>> =>
  [...arr(r.data.traits), ...arr(r.data.actions), ...arr(r.data.bonusActions), ...arr(r.data.reactions), ...arr(rec(r.data.legendary).actions)].map(rec)

describe('P1 Foundry 映射：不写 0、不留可映射的说明', () => {
  it('没有数值为 0 的速度／护甲／生命上限／先攻／感官／加值效果（状态本身把速度变 0 的除外）', () => {
    const zero: string[] = []
    for (const r of l.rows) {
      if (r.type === 'condition') continue
      for (const e of arr(r.data.effects).map(rec)) if (['amount', 'bonus', 'range', 'flat', 'perLevel'].some((k) => e[k] === 0)) zero.push(`${r.id}:${String(e.kind)}`)
    }
    expect(zero).toEqual([])
  })
  it('职业／子职业／可选特性的消耗目标 resource 都解析成存在的特性编号', () => {
    const bad: string[] = []
    for (const r of l.of('feature')) for (const a of arr(r.data.activities).map(rec)) for (const t of arr(rec(a.consumption).targets).map(rec)) if (t.type === 'resource' && l.get(String(t.target))?.type !== 'feature') bad.push(`${r.id} → ${String(t.target)}`)
    expect(bad).toEqual([])
  })
})

describe('P2 物品：标准类型与消耗品', () => {
  it('每件真实物品都有 itemKind', () => {
    expect(realItems.filter((r) => typeof r.data.itemKind !== 'string').map((r) => r.id)).toEqual([])
  })
  it('consumable 恰为 5etools 的消耗品标记（CNS）加药水／卷轴（普通弹药 5etools 不标）', () => {
    const cns = (r: { data: Record<string, unknown> }): boolean => arr(rec(r.data.facets).misc).includes('CNS')
    const mismatch = realItems.filter((r) => (r.data.consumable === true) !== (cns(r) || r.data.category === 'consumable')).map((r) => r.id)
    expect(mismatch).toEqual([])
    // 普通箭矢弹丸 5etools 不标 CNS，所以不是消耗品；火器子弹、能量匣（现代／文艺复兴）5etools 标了 CNS，按来源标
  })
  it('类型代码带来源后缀的物品不再掉进"奇物"：卷轴、爆炸物、载具、宝石、艺术品', () => {
    const wrong = realItems.filter((r) => (['scroll'].includes(String(r.data.itemKind)) && r.data.category !== 'consumable') || (r.data.itemKind === 'vehicle' && r.data.category !== 'vehicle') || (['gem', 'artObject', 'coinage'].includes(String(r.data.itemKind)) && r.data.category !== 'treasure') || (r.data.itemKind === 'explosive' && r.data.category !== 'gear'))
    expect(wrong.map((r) => r.id)).toEqual([])
  })
})

describe('P3 怪物：原始数据里本来结构化的机制', () => {
  it('护甲来源 items 都指向存在的物品；攻击所用武器 item 必须是该怪物携带的', () => {
    const bad: string[] = []
    for (const r of l.of('monster')) {
      for (const a of arr(r.data.ac).map(rec)) for (const id of arr(a.items)) if (l.get(String(id))?.type !== 'item') bad.push(`${r.id} ac → ${String(id)}`)
      const carried = new Set(arr(r.data.attachedItems).map(String))
      for (const act of namedActions(r)) for (const x of arr(act.activities).map(rec)) if (x.item !== undefined && !carried.has(String(x.item))) bad.push(`${r.id} ${String(act.name)} → ${String(x.item)}`)
    }
    expect(bad).toEqual([])
  })
  it('带条件的抗性／免疫／易伤：每项有伤害代码和书上原话；纯代码数组里没有条件文字', () => {
    const bad: string[] = []
    for (const r of l.of('monster')) for (const k of ['resist', 'immune', 'vulnerable']) {
      for (const c of arr(r.data[`${k}Conditional`]).map(rec)) if (!arr(c.damage).length || !String(c.when ?? '').trim()) bad.push(`${r.id} ${k}Conditional`)
      for (const x of arr(r.data[k])) if (/来自非|（.*攻击.*）/.test(String(x))) bad.push(`${r.id} ${k} 仍含条件文字：${String(x).slice(0, 30)}`)
    }
    expect(bad).toEqual([])
  })
  it('动作名里的"充能 N–M"都有 rechargeRoll；"短休或长休后充能"等有 uses；传奇动作"花费 N 个动作"有 cost', () => {
    const bad: string[] = []
    for (const r of l.of('monster')) for (const a of namedActions(r)) {
      const name = String(a.name)
      if (/充能\s*\d/.test(name) && a.rechargeRoll === undefined) bad.push(`${r.id} ${name}`)
      else if (/充能/.test(name) && !/充能\s*\d/.test(name) && a.uses === undefined) bad.push(`${r.id} ${name}`)
      if (/花费\s*\d+\s*个动作/.test(name) && a.cost === undefined) bad.push(`${r.id} ${name}`)
    }
    expect(bad).toEqual([])
  })
})

describe('P5 法术：可选扩展列表与核心职业表分开', () => {
  const anchors = l.of('feature').filter((r) => /-additional-spells\./.test(r.id))
  it('每个锚点指向存在的职业和法术，且这些法术不在核心职业表里', () => {
    expect(anchors.length).toBeGreaterThan(0)
    const bad: string[] = []
    for (const r of anchors) for (const sl of arr(r.data.spellLists).map(rec)) {
      if (l.get(String(sl.to))?.type !== 'class') bad.push(`${r.id} 职业 ${String(sl.to)}`)
      for (const s of arr(sl.spells)) {
        const spell = l.get(String(s))
        if (!spell) bad.push(`${r.id} 法术 ${String(s)}`)
        else if (arr(spell.data.classes).includes(String(sl.to))) bad.push(`${r.id} ${String(s)} 已在核心职业表里`)
      }
    }
    expect(bad).toEqual([])
  })
})
