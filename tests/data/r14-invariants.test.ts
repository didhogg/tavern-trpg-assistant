import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'
import { loadBefore } from './r14-snapshot'

const REF = /\{\{ref:([^|}]+)/g
const refsOf = (value: unknown): string[] => [...JSON.stringify(value).matchAll(REF)].map((m) => m[1]).sort()

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
const HAN = /[\u3400-\u9fff]/
const BLOCK_KEYS = ['p', 'h', 'list', 'quote', 'table', 'tableRef', 'read']
const isBlocks = (v: unknown): v is Rec[] => Array.isArray(v) && v.length > 0 && v.every((x) => isObj(x) && BLOCK_KEYS.some((k) => k in x))

/**
 * 独立的「归一化」：把 R14 允许的改动抹平后再比较结构。
 * 抹平的有：空段落与空列表项（含因此变空的列表）、表格空单元格、武器属性来源代码、
 * 以及所有含汉字或含 {{spellcasting_mod}} 的字符串（文字内容由各规则的专项测试核对）。
 * 其余字符串（id、骰式、代码）逐字比较。
 */
function norm(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return HAN.test(value) || value.includes('{{spellcasting_mod}}') ? '〈文字〉' : value
  if (Array.isArray(value)) {
    if (isBlocks(value)) {
      return value
        .filter((b) => !(typeof b.p === 'string' && b.p.trim() === ''))
        .map((b) => {
          const out: Rec = { ...b }
          if (Array.isArray(b.list)) { const kept = b.list.filter((x) => !(typeof x === 'string' && x.trim() === '')); out.list = kept }
          return out
        })
        .filter((b) => !(Array.isArray(b.list) && b.list.length === 0))
        .map((b) => norm(b))
    }
    if (key === 'properties') return [...new Set(value.map((x) => (typeof x === 'string' ? x.replace(/\|[A-Za-z0-9]+$/, '') : x)))]
    if (value.length && value.every((x) => typeof x === 'string') && value.some((x) => x === '')) return value.map((x) => (x === '' ? '—' : norm(x)))
    return value.map((x) => norm(x))
  }
  if (isObj(value)) {
    const out: Rec = {}
    for (const [k, v] of Object.entries(value)) out[k] = k === 'credit' ? '〈出处〉' : norm(v, k) // credit.missing 随名称覆盖变化（规则 1）
    if (isObj(out.table) && Array.isArray((out.table as Rec).rows)) (out.table as Rec).rows = ((out.table as Rec).rows as unknown[]).map((row) => (Array.isArray(row) ? row.map((c) => (c === '' || c === '—' ? '〈文字〉' : c)) : row))
    return out
  }
  return value
}

describe('R14 不变量：清理只改文字，不改结构', () => {
  const before = loadBefore()
  const now = allEntries()

  it('条目集合不变：8,853 个 id、type、nameEn', () => {
    expect(now).toHaveLength(8853)
    for (const entry of now) {
      const old = before[entry.id]
      expect(old, entry.id).toBeDefined()
      expect(entry.type).toBe(old.type)
      expect(entry.nameEn).toBe(old.nameEn)
    }
  })

  it('结构不变：抹平允许的改动后，data 与旧版逐条相同', () => {
    const bad: string[] = []
    for (const entry of now) {
      if (JSON.stringify(norm(entry.data)) !== JSON.stringify(norm(before[entry.id].data))) bad.push(entry.id)
    }
    expect(bad.slice(0, 20)).toEqual([])
  }, 120_000)

  it('每个条目的引用 id 集合不变', () => {
    const bad = now.filter((entry) => JSON.stringify(refsOf(entry.data)) !== JSON.stringify(refsOf(before[entry.id].data))).map((entry) => entry.id)
    expect(bad).toEqual([])
  })
})
