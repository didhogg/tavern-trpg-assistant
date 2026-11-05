import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { fullCasterSlotsOf, parseBuyCosts, parseProfByCr, parseProfByLevel, parseXpTable } from '../../src/rules/dnd5e2014/derive/tables'
import { xpOf } from '../../src/rules/dnd5e2014/derive'
import { loadTablesFromSrd } from './helpers-sense'

describe('U5R2 T2 数值表读库', () => {
  it('等级表：真实 SRD 包里的升级表读出 20 级熟练加值', () => {
    const t = loadTablesFromSrd()
    expect(t.profByLevel).toHaveLength(20)
    expect(Object.keys(t.xpByCr).length).toBeGreaterThan(20)
    expect(t.xpByCr['6']).toBeGreaterThan(t.xpByCr['1']!)
    expect(t.profByLevel[0]).toBeLessThanOrEqual(t.profByLevel[19]!)
  })
  it('解析函数：缺等级整表作废；经验取较大值；购点两栏并排', () => {
    expect(parseProfByLevel({ rows: [{ values: { level: 1, proficiencyBonus: 2 } }] })).toEqual([])
    expect(parseXpTable({ rows: [{ values: { crValue: 0, xp: [0, 10] } }, { values: { crValue: 1, xp: 200 } }] })).toEqual({ '0': 10, '1': 200 })
    expect(parseProfByCr({ rows: [{ values: { crValue: 0.5, proficiencyBonus: 2 } }] })).toEqual({ '0.5': 2 })
    expect(parseBuyCosts({ rows: [{ cells: ['8', '0', '12', '4'] }, { cells: ['x', 'y'] }] })).toEqual({ 8: 0, 12: 4 })
    expect(fullCasterSlotsOf([])).toBeUndefined()
  })
  it('经验值：人物自己填的优先，其次读表；没有表就读不到', () => {
    expect(xpOf(1, 5, { '1': 200 })).toBe(5)
    expect(xpOf(1, undefined, { '1': 200 })).toBe(200)
    expect(xpOf(1)).toBeUndefined()
  })
  it('防回退：源码里不再有手写的经验表、购点花费表、法术位表（标准数组与购点总点数是授权例外）', () => {
    const files: string[] = []
    const walk = (d: string): void => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|vue)$/.test(n)) files.push(p) } }
    walk(join(process.cwd(), 'src'))
    // 标准数组、购点总点数（STANDARD_ARRAY / POINT_BUY_BUDGET）是驾驶员 2026-11-05 授权的界面自带功能，不在扫描范围
    const bad = /\b(XP_BY_CR|BUY_COST|BUY_BUDGET|FULL_CASTER|crProficiency|proficiencyAt)\b/
    expect(files.filter((f) => bad.test(readFileSync(f, 'utf8')))).toEqual([])
  })
})
