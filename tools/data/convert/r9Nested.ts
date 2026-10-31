import type { Raw } from '../extract/load'
import { cellText, isObj, normRaw, parseLabel, rangeOf, refCell, str } from './r9lib'
import type { R9Candidate } from './r9Types'

export interface NestedRaw {
  /** 子表在外层表里占的行（掷骰区间）。 */
  min: number
  max: number
  table: Raw
}

export interface NestedTable extends NestedRaw {
  /** 外层表的幸存者（子表所在的那张表）。 */
  outer: R9Candidate
  candidate: R9Candidate
}

/**
 * 表格的某一行里，单元格本身是一张子表（5etools 写成 `["12-14", {type:'table', …}]`，
 * 如 DMG「魔法物品表G」第 12—14 行的「异能塑像」）。外层表的行只取单元格文字，子表会被当成空；
 * 这里把子表的原始块连同所在行区间收集起来，供 planR9 在选完幸存者之后补成独立的可掷表。
 */
export function nestedOfRows(rows: unknown, hi: number): NestedRaw[] {
  const out: NestedRaw[] = []
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!Array.isArray(row)) continue
    for (const cell of row.slice(1)) {
      if (!isObj(cell) || cell.type !== 'table') continue
      const range = rangeOf(row[0], hi)
      if (!range) throw new Error(`R9 子表所在行的区间无法解析：${str(cell.caption)}`)
      out.push({ ...range, table: cell })
    }
  }
  return out
}

/** 把收集到的子表原始块变成候选；名称、来源、页码跟随外层表的幸存者。 */
export function findNestedTables(pool: R9Candidate[], survivorOf: (candidate: R9Candidate) => R9Candidate | undefined): NestedTable[] {
  const out: NestedTable[] = []
  const seen = new Set<unknown>()
  for (const outer of pool) {
    for (const nested of outer.extra.nested ?? []) {
      if (seen.has(nested.table)) continue
      seen.add(nested.table)
      const survivor = survivorOf(outer)
      if (!survivor) throw new Error(`R9 子表的外层表没有幸存者：${outer.name}`)
      const caption = str(nested.table.caption)
      const parsed = parseLabel(Array.isArray(nested.table.colLabels) ? nested.table.colLabels[0] : undefined)
      if (!caption || !parsed) throw new Error(`R9 子表缺少标题或骰式：${survivor.name}`)
      const labels = (Array.isArray(nested.table.colLabels) ? nested.table.colLabels : []).slice(1).map(refCell).map((label) => label || '结果')
      const rows = (Array.isArray(nested.table.rows) ? nested.table.rows : []).map((sub) => {
        const rg = Array.isArray(sub) ? rangeOf(sub[0], parsed.hi) : undefined
        if (!rg || !Array.isArray(sub)) throw new Error(`R9 子表的行无法解析：${survivor.name}·${caption}`)
        return { ...rg, cells: sub.slice(1).map(cellText) }
      })
      if (!rows.length) throw new Error(`R9 子表没有行：${survivor.name}·${caption}`)
      out.push({
        ...nested,
        outer: survivor,
        candidate: {
          origin: 'B',
          source: survivor.source,
          page: survivor.page,
          srd: survivor.srd === true,
          name: `${survivor.name}·${caption}`,
          nameEn: `${survivor.nameEn ?? survivor.name} ${caption}`,
          cap: normRaw(caption),
          expr: parsed.expr,
          kind: 'roll',
          cols: labels.length ? labels : ['结果'],
          rows,
          extra: { parentKey: survivor.extra.parentKey },
        },
      })
    }
  }
  return out
}
