import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiEquipment, hasApi } from './consumer/refApi'
import { arr, fold, num, rec, str, strs } from './consumer/util'

const COPPER: Record<string, number> = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 }
/** 武器属性：5e API 的名字 → 数据里用的代码 */
const PROP: Record<string, string> = { light: 'L', finesse: 'F', thrown: 'T', versatile: 'V', 'two-handed': '2H', ammunition: 'A', loading: 'LD', heavy: 'H', reach: 'R', special: 'S' }
const ARMOR_CAT: Record<string, string> = { Light: 'light', Medium: 'medium', Heavy: 'heavy', Shield: 'shield' }

describe('G2a 物品基础：武器、护甲、套组、价格重量（a15）', () => {
  it('SRD 装备与 5e API 逐项对照', () => {
    if (!hasApi()) return
    const l = lib()
    const rec2 = new Recorder('g2a-item')
    const api = apiEquipment()
    // 普通物品（稀有度“无”）；具装这类“某某甲的具装”在数据里是基础物品的变体，也要能找到。先放变体，再放非变体（同名时非变体优先）
    const base = [...l.of('item').filter((r) => r.data.rarity === 'none' && 'variantOf' in r.data), ...l.of('item').filter((r) => r.data.rarity === 'none' && !('variantOf' in r.data))]
    // 英文名比较：去掉括号里的说明、忽略词序（API 写 “Crossbow, hand”，数据写 “Hand Crossbow”）
    const sigOf = (n: string): string => [...fold(n.replace(/\([^)]*\)/g, '').replace(/\barmor\b/gi, ''))].sort().join('')
    const byName = new Map(base.map((r) => [sigOf(r.nameEn ?? ''), r]))
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    const unmatched: string[] = []
    let checks = 0
    let matched = 0
    for (const a of Object.values(api)) {
      const row = byName.get(sigOf(a.name))
      if (!row) { unmatched.push(a.name); continue }
      matched++
      const d = row.data
      const eq = (k: string, ok: boolean): void => { checks++; if (!ok) add(k, `${row.id}（${a.name}）`) }
      // API 对成捆的物品（箭 20 支一捆）给的是整捆的价格和重量；数据按单件计
      // 铁蒺藜：API 的价格是单个的（5 铜币），重量是一包的；PHB 是“一包 20 个 1 gp、2 磅”，数据与 PHB 一致
      // 环甲具装：API 写 12 gp；PHB 规定具装价格是对应护甲的 4 倍，环甲 30 gp，故 120 gp，数据与 PHB 一致
      const apiWrongValue = ['caltrops', 'barding-ring-mail'].includes(a.index)
      const per = /\(bag of \d+\)/i.test(row.nameEn ?? '') ? 1 : (a.quantity ?? 1) // 数据里“铁蒺藜（一包 20 个）”本身就是整包
      const r4 = (n: number): number => Math.round(n * 10000) / 10000
      const cp = r4((a.cost.quantity * (COPPER[a.cost.unit] ?? NaN)) / per)
      if (!apiWrongValue && (d.value !== undefined || cp > 0)) eq('value', d.value === cp)
      // API 与 PHB 装备章不符的两处（以 PHB 为准，数据与 PHB 一致）：铁钉重量是 10 个的重量；特种鞍座 PHB 为 40 磅而 API 写 50 磅
      const apiWrongWeight = ['spike-iron', 'saddle-exotic'].includes(a.index)
      if (a.weight !== undefined && d.weight !== undefined && !apiWrongWeight) eq('weight', r4(num(d.weight)) === r4(a.weight / per))
      if (a.weapon_category) {
        const w = rec(d.weapon)
        const dmg = rec(arr(w.damage)[0])
        eq('weapon-category', str(w.category) === a.weapon_category.toLowerCase())
        if (a.damage) { eq('weapon-dice', dmg.dice === a.damage.damage_dice); eq('weapon-type', dmg.type === a.damage.damage_type.index) }
        eq('weapon-versatile', (a.two_handed_damage?.damage_dice ?? undefined) === (w.versatile === undefined ? undefined : str(w.versatile)))
        // API：近战的 range 是触及（5 尺），投掷用 throw_range，远程武器用 range
        const rng = a.throw_range ?? (a.weapon_range === 'Ranged' ? a.range : undefined)
        if (rng) eq('weapon-range', rec(w.range).normal === rng.normal && (rec(w.range).long ?? undefined) === (rng.long ?? undefined))
        const want = (a.properties ?? []).filter((p) => !['monk', 'range'].includes(p.index)).map((p) => PROP[p.index] ?? p.index).sort().join(',')
        eq('weapon-properties', strs(w.properties).sort().join(',') === want)
      }
      if (a.armor_category && a.armor_class) {
        const ar = rec(d.armor)
        eq('armor-category', ar.category === ARMOR_CAT[a.armor_category])
        eq('armor-ac', ar.ac === a.armor_class.base)
        eq('armor-dexcap', (ar.dexCap ?? (a.armor_class.dex_bonus ? undefined : 0)) === (a.armor_class.max_bonus ?? (a.armor_class.dex_bonus ? undefined : 0)) || a.armor_category === 'Shield')
        eq('armor-str', (ar.strReq ?? 0) === (a.str_minimum ?? 0))
        eq('armor-stealth', (ar.stealthDisadvantage ?? false) === (a.stealth_disadvantage ?? false))
      }
    }
    rec2.stat('a15', 'apiItems', Object.keys(api).length)
    rec2.stat('a15', 'matched', matched)
    rec2.stat('a15', 'unmatched', unmatched.length)
    rec2.stat('a15', 'checks', checks)
    const NOTE: Record<string, string> = { value: '价格（铜币）与 SRD 不符', weight: '重量与 SRD 不符', 'weapon-category': '武器类别（简易/军用）不符', 'weapon-dice': '伤害骰不符', 'weapon-type': '伤害类型不符', 'weapon-versatile': '两用伤害不符', 'weapon-range': '射程不符', 'weapon-properties': '武器属性不符', 'armor-category': '护甲类别不符', 'armor-ac': '基础护甲等级不符', 'armor-dexcap': '敏捷加值上限不符', 'armor-str': '力量需求不符', 'armor-stealth': '隐匿劣势不符' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a15-${k}`, check: 'a15', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '5e API（SRD 装备，对应 PHB 装备章表格）', note: NOTE[k] })
    if (unmatched.length) rec2.find({ id: 'a15-unmatched', check: 'a15', kind: 'data-defect', fixSource: 'self-structure', entries: unmatched, expected: '5e API 装备目录（对应 PHB 装备章与套组内容）', note: 'SRD 装备在库里没有对应的物品条目（牧师套组与学者套组里的香炉、祭袍、沙袋、小刀等；还有饲料、酒壶等）；套组内容物因此缺项（见 a15-contents-differ）' })
    expect(rec2.settle()).toEqual([])
  })

  it('套组与容器：内容物编号存在、数量与书一致；家族成员存在且同类', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-pack')
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    const withContents = l.of('item').filter((r) => Array.isArray(r.data.contents))
    for (const r of withContents) for (const c of arr(r.data.contents).map(rec)) if (!l.get(str(c.item))) add('contents-missing', r.id)
    rec2.stat('a15', 'itemsWithContents', withContents.length)
    if (hasApi()) {
      const api = apiEquipment()
      const byName = new Map(l.of('item').filter((r) => r.data.rarity === 'none').map((r) => [fold(r.nameEn ?? ''), r]))
      let compared = 0
      for (const a of Object.values(api)) {
        if (!a.contents?.length) continue
        const row = byName.get(fold(a.name))
        if (!row) continue
        compared++
        // 译名词序不同（hempen rope / rope, hempen）：用字母排序后的签名比较
        const sig = (n: string): string => [...fold(n)].sort().join('')
        const have = new Map(arr(row.data.contents).map(rec).map((c) => [sig(l.get(str(c.item))?.nameEn ?? str(c.item)), Number(c.qty)]))
        const want = new Map(a.contents.map((c) => [sig(c.item.name), c.quantity]))
        const same = have.size === want.size && [...want].every(([k, v]) => have.get(k) === v)
        if (!same) add('contents-differ', `${row.id}（${a.name}）数据${have.size}种 / 书${want.size}种；缺：${[...want].filter(([k, v]) => have.get(k) !== v).map(([k, v]) => `${a.contents?.find((c) => sig(c.item.name) === k)?.item.name}×${v}`).join('、')}`)
      }
      rec2.stat('a15', 'packsCompared', compared)
    }
    // 家族：成员都存在，且都是物品
    const families = l.of('item').filter((r) => r.data.category === 'family')
    let members = 0
    for (const f of families) for (const m of strs(f.data.members)) { members++; if (l.get(m)?.type !== 'item') add('family-member-missing', f.id) }
    rec2.stat('a15', 'families', families.length)
    rec2.stat('a15', 'familyMembers', members)
    const NOTE: Record<string, string> = { 'contents-missing': '套组/容器的内容物编号不存在', 'contents-differ': '套组内容物或数量与书不符', 'family-member-missing': '家族成员不存在' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a15-${k}`, check: 'a15', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: k === 'contents-differ' ? '5e API 套组 contents（对应 PHB 装备章“装备套组”）' : '条目库', note: NOTE[k] })
    expect(rec2.settle()).toEqual([])
  })
})
