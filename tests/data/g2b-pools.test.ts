import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiClasses, hasApi } from './consumer/refApi'
import { findScale, scaleAt } from './consumer/scale'
import { arr, rec, str } from './consumer/util'
import { evaluateFormula } from '../../src/rules/dnd5e2014/data/formula'

/** 职业资源池的最大值（成长数值）逐级对照：独立来源 5e API 的逐级表（SRD 职业）。 */
interface Pool { cls: string; scale: string; api: (cs: Record<string, unknown>) => number | string | undefined; kind: 'number' | 'dice' | 'distance'; sub?: string }
const dice = (o: unknown): string => `${rec(o).dice_count}d${rec(o).dice_value}`
const POOLS: Pool[] = [
  { cls: 'barbarian', scale: 'rage-uses', kind: 'number', api: (c) => Number(c.rage_count) },
  { cls: 'barbarian', scale: 'rage-damage', kind: 'number', api: (c) => Number(c.rage_damage_bonus) },
  { cls: 'bard', scale: 'bardic-inspiration', kind: 'dice', api: (c) => `d${c.bardic_inspiration_die}` },
  { cls: 'bard', scale: 'song-of-rest', kind: 'dice', api: (c) => (Number(c.song_of_rest_die) ? `d${c.song_of_rest_die}` : undefined) },
  { cls: 'cleric', scale: 'channel-divinity', kind: 'number', api: (c) => Number(c.channel_divinity_charges) },
  { cls: 'fighter', scale: 'action-surge', kind: 'number', api: (c) => Number(c.action_surges) },
  { cls: 'fighter', scale: 'indomitable', kind: 'number', api: (c) => Number(c.indomitable_uses) },
  { cls: 'monk', scale: 'martial-arts', kind: 'dice', api: (c) => dice(c.martial_arts) },
  { cls: 'monk', scale: 'ki-points', kind: 'number', api: (c) => Number(c.ki_points) },
  { cls: 'monk', scale: 'unarmored-movement', kind: 'distance', api: (c) => Number(c.unarmored_movement) },
  { cls: 'rogue', scale: 'sneak-attack', kind: 'dice', api: (c) => dice(c.sneak_attack) },
  { cls: 'sorcerer', scale: 'sorcery-points', kind: 'number', api: (c) => Number(c.sorcery_points) },
]

/** 数据里的值写法各异（数字、"d6"、"1d6"、"+10尺"、"无限制"）：统一成可比较的字符串，0 与没有等价 */
function norm(v: unknown, kind: string): string {
  if (v === undefined || v === null || v === '' || v === 0 || v === '0') return '0'
  if (kind === 'distance') return String(v).replace(/[^\d]/g, '') || '0'
  if (kind === 'dice') return String(v).replace(/^1d/, 'd')
  if (typeof v === 'string' && /无限|unlimited|∞/i.test(v)) return 'unlimited'
  return String(v)
}

describe('G2b 职业资源池：最大值逐级与 5e API 一致（b5）', () => {
  it('成长数值对照', () => {
    if (!hasApi()) return
    const l = lib()
    const rec2 = new Recorder('g2b-pools')
    const api = apiClasses()
    const bad: Record<string, string[]> = {}
    let checks = 0
    for (const p of POOLS) {
      const cls = l.need(`class.${p.cls}.phb`)
      const sc = findScale([cls], p.scale)
      if (!sc) { (bad['scale-missing'] ??= []).push(`${p.cls}:${p.scale}`); continue }
      const diffs: string[] = []
      for (let lv = 1; lv <= 20; lv++) {
        checks++
        const want = norm(p.api(rec(api.levels[p.cls][lv - 1].class_specific)), p.kind)
        const got = norm(scaleAt(sc, lv), p.kind)
        // 狂暴 20 级“无限制”：API 写 9999，数据写 999，都是无限
        if (want === '9999' && (got === 'unlimited' || got === '999')) continue
        if (want !== got) diffs.push(`${lv}级 数据=${got} API=${want}`)
      }
      if (diffs.length) (bad[`scale-${p.cls}-${p.scale}`] ??= []).push(...diffs.map((d) => `${p.cls}:${p.scale} ${d}`))
    }
    rec2.stat('b5', 'checks', checks)
    rec2.stat('b5', 'pools', POOLS.length)
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `b5-${k}`, check: 'b5', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '5e API 逐级表（class_specific）', note: k === 'scale-missing' ? '职业没有这个成长数值' : '资源池最大值与 5e API 不符' })
    expect(rec2.settle()).toEqual([])
  })
})

/** 魔契师“已知祈唤”：PHB 魔契师职业表（中译文本第 7788 行起）。5e API 的第 4、6 级与书不符（写 3、4），以书为准。 */
const INVOCATIONS = [0, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8]

interface PoolExpect { id: string; owner: string; levels: number[]; max: number[]; recharge: string }
/** 逐个读过 PHB 原文后写下的资源池期望：特性编号、所属职业（成长数值从它那里取）、等级、该等级最大次数（魅力等调整值按 +3 算）。 */
const PHB_POOLS: PoolExpect[] = [
  { id: 'feature.barbarian-rage.phb', owner: 'class.barbarian.phb', levels: [1, 3, 6, 12, 17], max: [2, 3, 4, 5, 6], recharge: 'long' },
  { id: 'feature.bard-bardic-inspiration.phb', owner: 'class.bard.phb', levels: [1], max: [3], recharge: 'long' },
  { id: 'feature.cleric-channel-divinity.phb', owner: 'class.cleric.phb', levels: [2, 6, 18], max: [1, 2, 3], recharge: 'shortOrLong' },
  { id: 'feature.fighter-action-surge.phb', owner: 'class.fighter.phb', levels: [2, 17], max: [1, 2], recharge: 'shortOrLong' },
  { id: 'feature.fighter-second-wind.phb', owner: 'class.fighter.phb', levels: [1], max: [1], recharge: 'shortOrLong' },
  { id: 'feature.fighter-indomitable.phb', owner: 'class.fighter.phb', levels: [9, 13, 17], max: [1, 2, 3], recharge: 'long' },
  { id: 'feature.monk-ki.phb', owner: 'class.monk.phb', levels: [2, 5, 20], max: [2, 5, 20], recharge: 'shortOrLong' },
  { id: 'feature.sorcerer-sorcery-points.phb', owner: 'class.sorcerer.phb', levels: [2, 9, 20], max: [2, 9, 20], recharge: 'long' },
  { id: 'feature.paladin-lay-on-hands.phb', owner: 'class.paladin.phb', levels: [1, 5], max: [5, 25], recharge: 'long' },
  { id: 'feature.paladin-cleansing-touch.phb', owner: 'class.paladin.phb', levels: [14], max: [3], recharge: 'long' },
  { id: 'feature.druid-wild-shape.phb', owner: 'class.druid.phb', levels: [2], max: [2], recharge: 'shortOrLong' },
  // 以下是 PHB 原文与数据不符的：
  { id: 'feature.paladin-channel-divinity.phb', owner: 'class.paladin.phb', levels: [3, 7, 20], max: [1, 1, 1], recharge: 'shortOrLong' }, // 圣武士引导神力只有 1 次
  { id: 'feature.paladin-divine-sense.phb', owner: 'class.paladin.phb', levels: [1], max: [4], recharge: 'long' }, // 1 + 魅力调整值
  { id: 'feature.fighter-battle-master-combat-superiority.phb', owner: 'subclass.fighter-battle-master.phb', levels: [3, 7, 15], max: [4, 5, 6], recharge: 'shortOrLong' }, // 卓越骰 4/5/6 个
  { id: 'feature.wizard-school-of-divination-portent.phb', owner: 'subclass.wizard-school-of-divination.phb', levels: [2, 14], max: [2, 3], recharge: 'long' }, // 预兆骰 2 个，14 级 3 个
]

describe('G2b 资源池特性的最大次数与恢复时机逐个对 PHB（b5）', () => {
  it('魔契师已知祈唤逐级与 PHB 职业表一致', () => {
    const l = lib()
    const sc = findScale([l.need('class.warlock.phb')], 'invocations-known')
    expect(sc).toBeDefined()
    for (let lv = 1; lv <= 20; lv++) expect(Number(scaleAt(sc!, lv) ?? 0), `${lv} 级`).toBe(INVOCATIONS[lv - 1])
  })

  it('PHB 的资源池：公式求值、恢复时机', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-pools-feature')
    const bad: Record<string, string[]> = {}
    let checks = 0
    for (const x of PHB_POOLS) {
      const f = l.need(x.id)
      const u = rec(f.data.uses)
      const owners = [l.need(x.owner), ...(x.owner.startsWith('subclass') ? [l.need(str(l.need(x.owner).data.classId))] : [])]
      x.levels.forEach((lv, i) => {
        checks++
        const scales: Record<string, number> = {}
        for (const o of owners) for (const a of arr(o.data.advancement).map(rec)) if (a.kind === 'scaleValue' && a.type === 'number') { const v = scaleAt({ scale: rec(a.scale) as Record<string, number | string> }, lv); if (typeof v === 'number') scales[str(a.id)] = v }
        let got: number | string
        try { got = typeof u.max === 'number' ? u.max : evaluateFormula(str(u.max), { level: lv, prof: 2 + Math.floor((lv - 1) / 4), abilityMods: { str: 3, dex: 3, con: 3, int: 3, wis: 3, cha: 3 }, classLevels: { [x.owner.split('.')[1]]: lv, paladin: lv, wizard: lv }, scales }) } catch (e) { got = `算不出（${(e as Error).message}）` }
        if (got !== x.max[i]) (bad[`max-${x.id}`] ??= []).push(`${f.name} ${lv}级 数据=${got} 书=${x.max[i]}`)
      })
      checks++
      if (u.recharge !== x.recharge) (bad[`recharge-${x.id}`] ??= []).push(`${f.name} 数据=${str(u.recharge)} 书=${x.recharge}`)
    }
    rec2.stat('b5', 'checks', checks)
    rec2.stat('b5', 'pools', PHB_POOLS.length)
    // 次数写成“1 次/长休”但书上的限制不是这样（读过 PHB 原文）：神圣干预成功后 7 天内不能再用；催眠凝视对同一生物长休前不能再用；
    // 混沌之潮用完后长休恢复，或在 DM 让你掷狂野魔法浪涌表时恢复；王车易位用完后长休恢复，或在你施展 1 环以上咒法法术时恢复。
    const PECULIAR: Record<string, string> = {
      'feature.cleric-divine-intervention.phb': '成功后 7 天内不能再用，失败则长休后可再用（冷却天数）→ tracker',
      'feature.wizard-school-of-enchantment-hypnotic-gaze.phb': '对同一生物，长休前不能再用（按目标）→ tracker: perTarget',
      'feature.sorcerer-wild-magic-tides-of-chaos.phb': '长休恢复，或 DM 让你掷狂野魔法浪涌表时恢复 → restores（事件：狂野魔法浪涌）',
      'feature.wizard-school-of-conjuration-benign-transposition.phb': '长休恢复，或你施展 1 环以上咒法法术时恢复 → restores（事件：施展咒法法术）',
    }
    const peculiar = Object.keys(PECULIAR).filter((id) => l.get(id)?.data.uses !== undefined).map((id) => `${id} ${l.need(id).name}：${PECULIAR[id]}`)
    rec2.stat('b5', 'peculiarRestRules', peculiar.length)
    if (peculiar.length) rec2.find({ id: 'b5-peculiar-rest-rule', check: 'b5', kind: 'data-defect', fixSource: 'self-structure', entries: peculiar, expected: 'PHB 各特性原文（已逐个读过）', note: '写成“1 次/长休”，但书上的限制是冷却天数、按目标、或有事件触发的额外恢复；应按“资源与休息”结构的 tracker / restores 表示' })
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `b5-${k}`, check: 'b5', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: 'PHB 各职业特性原文（已逐个读过）', note: k.startsWith('max-') ? '资源池最大次数与 PHB 不符' : '资源池恢复时机与 PHB 不符' })
    expect(rec2.settle()).toEqual([])
  })
})
