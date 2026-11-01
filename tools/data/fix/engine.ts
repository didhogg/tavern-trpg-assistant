import type { Entry } from '../../../src/schemas/pack'
import type { ConvertedPack } from '../convert'
import { arrayIndex, deepEqual, getAt, parentOf } from './lib/pointer'

/**
 * T4 修正引擎：构建里 `cleanEntries` 之后执行「修正规则」与「逐条修正表」（规格见 docs/handoff/D1.2-G2.5_执行包/00 第 6 节）。
 * 任何一行对不上（找不到条目、before 不符、重复、越界）都不会悄悄跳过：全部收集后一次性让构建失败。
 */
export type RowFix =
  | { id: string; path: string; op: 'set'; before: unknown; after: unknown; basis: string }
  | { id: string; path: string; op: 'delete'; before: unknown; basis: string }
  | { id: string; path: string; op: 'insert'; after: unknown; basis: string }
export interface AddFix { op: 'add'; pack: string; entry: Entry; basis: string }
export type Fix = RowFix | AddFix
export interface RowSet { file: string; rows: Fix[] }

export interface RuleContext { entries: Map<string, Entry>; packOf: Map<string, string> }
export interface Rule {
  name: string
  /** 预期被改动的条目数；实际不等于它 → 构建失败。 */
  expectCount: number
  /** 只改本规则负责的字段；返回被改动的条目 id（去重后计数）。要幂等、要确定。 */
  apply(packs: ConvertedPack[], ctx: RuleContext): string[]
}

export interface FixReport {
  rules: Array<{ name: string; expect: number; changed: number }>
  rows: Array<{ file: string; id: string; path: string; op: string }>
  added: string[]
}

function indexOf(packs: ConvertedPack[]): RuleContext {
  const entries = new Map<string, Entry>()
  const packOf = new Map<string, string>()
  for (const p of packs) for (const e of p.entries) { entries.set(e.id, e); packOf.set(e.id, p.manifest.id) }
  return { entries, packOf }
}

export function applyFixes(packs: ConvertedPack[], rules: Rule[], sets: RowSet[]): FixReport {
  const errors: string[] = []
  const report: FixReport = { rules: [], rows: [], added: [] }
  const names = new Set<string>()
  for (const rule of rules) {
    if (names.has(rule.name)) { errors.push(`修正规则重名：${rule.name}`); continue }
    names.add(rule.name)
    const changed = new Set(rule.apply(packs, indexOf(packs)))
    report.rules.push({ name: rule.name, expect: rule.expectCount, changed: changed.size })
    if (changed.size !== rule.expectCount) errors.push(`规则 ${rule.name}：命中 ${changed.size} 个条目，预期 ${rule.expectCount}`)
  }
  const seen = new Set<string>()
  for (const { file, rows } of sets) {
    rows.forEach((row, n) => {
      const at = `${file} 第 ${n + 1} 行`
      try {
        if (row.op === 'add') {
          const key = `add|${row.entry.id}`
          if (seen.has(key)) throw new Error(`新增条目 ${row.entry.id} 出现两次`)
          seen.add(key)
          const ctx = indexOf(packs)
          if (ctx.entries.has(row.entry.id)) throw new Error(`条目 ${row.entry.id} 已存在`)
          const pack = packs.find((p) => p.manifest.id === row.pack)
          if (!pack) throw new Error(`没有包 ${row.pack}`)
          if (!row.basis.trim()) throw new Error('缺 basis（来源）')
          pack.entries.push(structuredClone(row.entry))
          report.added.push(row.entry.id)
          report.rows.push({ file, id: row.entry.id, path: '(新增)', op: 'add' })
          return
        }
        const key = `${row.id}|${row.path}|${row.op}`
        if (seen.has(key)) throw new Error(`同一条目同一路径同一操作出现两次：${row.id} ${row.path}`)
        seen.add(key)
        if (!row.basis.trim()) throw new Error('缺 basis（来源）')
        const matches = packs.flatMap((p) => p.entries).filter((e) => e.id === row.id)
        if (matches.length !== 1) throw new Error(`条目 ${row.id} 匹配到 ${matches.length} 个（必须正好 1 个）`)
        applyRow(matches[0], row)
        report.rows.push({ file, id: row.id, path: row.path, op: row.op })
      } catch (error) {
        errors.push(`${at}：${error instanceof Error ? error.message : String(error)}`)
      }
    })
  }
  if (errors.length) throw new Error(`修正失败 ${errors.length} 处：\n${errors.slice(0, 40).join('\n')}`)
  return report
}

const show = (v: unknown): string => JSON.stringify(v)?.slice(0, 200) ?? 'undefined'

function applyRow(entry: Entry, row: RowFix): void {
  const { parent, key } = parentOf(entry, row.path)
  if (row.op === 'insert') {
    const i = arrayIndex(parent, key, row.path, true)
    ;(parent as unknown[]).splice(i, 0, structuredClone(row.after))
    return
  }
  const current = Array.isArray(parent) ? getAt(entry, row.path) : key in parent ? (parent as Record<string, unknown>)[key] : undefined
  if (!deepEqual(current, row.before)) throw new Error(`${row.id} ${row.path} 现状与 before 不符：现状 ${show(current)}，before ${show(row.before)}`)
  if (row.op === 'set') {
    if (Array.isArray(parent)) parent[arrayIndex(parent, key, row.path, false)] = structuredClone(row.after)
    else (parent as Record<string, unknown>)[key] = structuredClone(row.after)
  } else if (Array.isArray(parent)) parent.splice(arrayIndex(parent, key, row.path, false), 1)
  else delete (parent as Record<string, unknown>)[key]
}
