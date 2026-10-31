import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

const ROOT = process.cwd()
const reference = JSON.parse(readFileSync(join(ROOT, 'docs/probes/D1.2a_R9_关键表数值.json'), 'utf8')) as { tables: Array<{ purpose: string; id: string; columns: unknown[]; rows: Array<Record<string, unknown>> }> }
const foundry = readFileSync(join(ROOT, 'reference/dnd5e-6.1.x（开源VTT）/module/config.mjs'), 'utf8')
const parser = readFileSync(join(ROOT, 'reference/5etools-cn-main（数据库）/js/parser.js'), 'utf8')

function arr(name: string): number[] {
  const match = new RegExp(`${name} = \\[([\\s\\S]*?)\\];`).exec(foundry)
  if (!match) throw new Error(`找不到 ${name}`)
  return JSON.parse(`[${match[1].replace(/\s+/g, ' ')}]`) as number[]
}

describe('R9 关键表数值', () => {
  const tables = new Map(allEntries().filter((entry) => entry.type === 'table').map((entry) => [entry.id, entry]))
  it('14 张关键表的 purpose/columns/values 与参考文件深度相同', () => {
    expect(reference.tables).toHaveLength(14)
    for (const row of reference.tables) {
      const entry = tables.get(row.id)
      expect(entry, row.id).toBeDefined()
      expect(entry!.data.purpose).toBe(row.purpose)
      expect(entry!.data.columns).toEqual(row.columns)
      expect((entry!.data.rows as Array<{ values?: unknown }>).map((r) => r.values)).toEqual(row.rows)
    }
  })

  it('角色等级表与独立来源一致', () => {
    const rows = (tables.get('table.phb-p15-r1')!.data.rows as Array<{ values: Record<string, number> }>).map((r) => r.values)
    expect(rows.map((r) => r.xp)).toEqual(arr('DND5E\\.CHARACTER_EXP_LEVELS'))
    const levels = JSON.parse(/Parser\.LEVEL_XP_REQUIRED = (\[[^\]]*\])/.exec(parser)![1]) as number[]
    expect(rows.map((r) => r.xp)).toEqual(levels)
    expect(rows.map((r) => r.proficiencyBonus)).toEqual(rows.map((r) => 2 + Math.floor((r.level - 1) / 4)))
  })

  it('挑战等级经验与独立来源一致', () => {
    const rows = (tables.get('table.dmg-p274-r2')!.data.rows as Array<{ values: Record<string, unknown> }>).map((r) => r.values)
    const chart: Record<string, number> = {}
    for (const m of /Parser\.XP_CHART_ALT = \{([\s\S]*?)\n\};/.exec(parser)![1].matchAll(/"([^"]+)":\s*([\d]+)/g)) chart[m[1]] = Number(m[2])
    const foundryXp = arr('DND5E\\.CR_EXP_LEVELS')
    for (const row of rows) {
      const got = Array.isArray(row.xp) ? row.xp[1] : row.xp
      expect(got, String(row.cr)).toBe(chart[String(row.cr)])
      if (Number.isInteger(row.crValue)) expect(got, String(row.cr)).toBe(foundryXp[Number(row.crValue)])
    }
  })

  it('兼职法术位与 Foundry 表一致，怪物 CR 列表与熟练加值公式一致', () => {
    const slots = (tables.get('table.multiclassing.phb-3')!.data.rows as Array<{ values: Record<string, number> }>).map((r) => r.values)
    const match = /const SPELL_SLOT_TABLE = DND5E\.SPELL_SLOT_TABLE = \[([\s\S]*?)\n\];/.exec(foundry)!
    const expected = JSON.parse(`[${match[1].replace(/\s+/g, '')}]`) as number[][]
    expect(slots.map((r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => r[`slots${n}`]))).toEqual(expected.map((row) => [...row, ...Array(9 - row.length).fill(0)]))
    const crs = JSON.parse(/Parser\.CRS = (\[[^\]]*\])/.exec(parser)![1]) as string[]
    const monsters = (tables.get('table.monster-statistics-by-challenge-rating.dmg')!.data.rows as Array<{ values: Record<string, number | string> }>).map((r) => r.values)
    expect(monsters.map((r) => r.cr)).toEqual(crs)
    expect(monsters.map((r) => r.proficiencyBonus)).toEqual(monsters.map((r) => Number(r.crValue) < 1 ? 2 : 2 + Math.max(0, Math.ceil(Number(r.crValue) / 4) - 1)))
  })

  it('阈值、倍数、生命骰内部不变量', () => {
    const thresholds = (tables.get('table.dmg-p82-r1')!.data.rows as Array<{ values: Record<string, number> }>).map((r) => r.values)
    for (let i = 0; i < thresholds.length; i++) {
      const r = thresholds[i]
      expect(r.easy < r.medium && r.medium < r.hard && r.hard < r.deadly).toBe(true)
      if (i) expect(r.easy > thresholds[i - 1].easy && r.deadly > thresholds[i - 1].deadly).toBe(true)
    }
    const group = (tables.get('table.dmg-p82-r2')!.data.rows as Array<{ values: { monsters: { min: number; max: number | null } } }>).map((r) => r.values.monsters)
    let prev = 0
    for (const row of group) { expect(row.min).toBe(prev + 1); prev = row.max ?? 999 }
    expect(group.at(-1)?.max).toBeNull()
    const hit = (tables.get('table.mm-p7-r1')!.data.rows as Array<{ values: { hitDie: string; average: number } }>).map((r) => r.values)
    for (const row of hit) expect(row.average).toBe((Number(row.hitDie.slice(1)) + 1) / 2)
  })
})
