import { describe, expect, it } from 'vitest'
import { MULTIPLIER, THRESHOLDS, XP_BY_CR, profByCr } from './consumer/expected/cr'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec } from './consumer/util'

const rows = (id: string): string[][] => arr(rec(lib().need(id).data).rows).map((r) => arr(rec(r).cells).map((c) => String(c).trim()))
const num = (s: string): number => Number(s.replace(/[,，+×\s]/g, ''))
const crNum = (s: string): string => (s.includes('/') ? String(Number(s.split('/')[0]) / Number(s.split('/')[1])) : s)
/** PHB 角色升级经验表（PHB 第 1 章）：下标 = 角色等级-1 */
const PHB_XP = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]
/** DMG 第 3 章“当日冒险经验”（每名角色校正 XP） */
const DAY_XP = [300, 600, 1200, 1700, 3500, 4000, 5000, 6000, 7500, 9000, 10500, 11500, 13500, 15000, 18000, 20000, 25000, 27000, 30000, 40000]

describe('G2c 经验值与遭遇相关的数字表（c12）', () => {
  it('经验值阈值、遭遇倍率、挑战等级经验值、熟练加值、升级经验、当日冒险经验', () => {
    const rec2 = new Recorder('g2c-tables')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    let checks = 0
    // 经验值阈值：等级列的写法不统一（“1环”“6th”）也一并记
    const th = rows('table.dmg-p82-r1')
    expect(th).toHaveLength(20)
    th.forEach((r, i) => {
      checks += 4
      THRESHOLDS[i].forEach((want, k) => { if (num(r[k + 1]) !== want) add('threshold-value', `${i + 1} 级 ${['容易', '中等', '困难', '致命'][k]}：数据=${r[k + 1]} 书=${want}`) })
      if (!/^\d+$/.test(r[0])) add('level-label', `dmg-p82-r1：第 ${i + 1} 行等级写成“${r[0]}”`)
    })
    // 当日冒险经验
    const day = rows('table.dmg-p84-r1')
    day.forEach((r, i) => { checks++; if (num(r[1]) !== DAY_XP[i]) add('day-xp-value', `${i + 1} 级：数据=${r[1]} 书=${DAY_XP[i]}`); if (!/^\d+$/.test(r[0])) add('level-label', `dmg-p84-r1：第 ${i + 1} 行等级写成“${r[0]}”`) })
    // 遭遇倍率
    const mult = rows('table.dmg-p82-r2')
    expect(mult.map((r) => num(r[1]))).toEqual(MULTIPLIER.map((m) => m[1]))
    checks += mult.length
    // 挑战等级 → 经验值（DMG 单列表与 MM 双列表）
    const xp1 = rows('table.dmg-p274-r2')
    const xp2 = rows('table.mm-p9-r1').flatMap((r) => [[r[0], r[1]], [r[2], r[3]]])
    for (const [name, list] of [['dmg-p274-r2', xp1], ['mm-p9-r1', xp2]] as const) {
      for (const [cr, xp] of list) {
        if (!cr) continue
        checks++
        const want = XP_BY_CR[crNum(cr)]
        const got = xp === '0或10' ? 10 : num(xp)
        if (want === undefined || got !== want) add('cr-xp-value', `${name}：挑战等级 ${cr} 数据=${xp} 书=${String(want)}`)
      }
    }
    // 挑战等级 → 熟练加值（MM 附录）
    for (const r of rows('table.mm-p8-r1').flatMap((r) => [[r[0], r[1]], [r[2], r[3]]])) { if (!r[0]) continue; checks++; if (num(r[1]) !== profByCr(Number(crNum(r[0])))) add('cr-prof-value', `挑战等级 ${r[0]} 数据=${r[1]} 书=${profByCr(Number(crNum(r[0])))}`) }
    // PHB 升级经验与熟练
    rows('table.phb-p15-r1').forEach((r, i) => { checks += 2; if (num(r[0]) !== PHB_XP[i]) add('level-xp-value', `${i + 1} 级：数据=${r[0]} 书=${PHB_XP[i]}`); if (num(r[2]) !== 2 + Math.floor(i / 4)) add('level-prof-value', `${i + 1} 级：数据=${r[2]}`) })
    rec2.stat('c12', 'checks', checks)
    rec2.stat('c12', 'tablesChecked', 8)
    const NOTE: Record<string, string> = {
      'threshold-value': '经验值阈值与书不符', 'day-xp-value': '当日冒险经验与书不符', 'level-label': '“角色等级”列写成“N环”或英文序数（6th、19th）：应为纯数字，程序按等级查表时对不上',
      'cr-xp-value': '挑战等级 → 经验值与书不符', 'cr-prof-value': '挑战等级 → 熟练加值与书不符', 'level-xp-value': '升级经验与 PHB 不符', 'level-prof-value': '等级 → 熟练加值与 PHB 不符',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `c12-${k}`, check: 'c12', kind: 'data-defect', fixSource: k === 'level-label' ? 'normalize' : 'self-structure', entries: ids, expected: 'PHB 第 1 章、DMG 第 3 章、MM 附录（已逐表手写期望值）', note: NOTE[k] })
    // 表读起来：全部是字符串单元格，数字带千分位逗号——程序要先去掉逗号；0 级别 CR 0 写 “0或10”
    rec2.find({ id: 'c12-cell-format', check: 'c12', kind: 'decision', fixSource: 'decision', entries: ['数字单元格是字符串，带千分位逗号（1,100）；个别没有（7300）；挑战等级 0 的经验值写“0或10”；倍数写“×1.5”；怪物数量写“3-6”“15 及以上”'], expected: '表格单元格写法', note: '这些表都是 `kind: "ref"` 的查表，单元格是字符串。人物/遭遇模块读它们时要自己去逗号、去×、拆区间；若要让程序直接用，可另给一份纯数字表（或用 R9 加过的 `values` 字段）。推荐：遭遇预算模块自己带这几张表的数字（本约定里已给出），不依赖单元格解析' })
    expect(rec2.settle()).toEqual([])
  })
})
