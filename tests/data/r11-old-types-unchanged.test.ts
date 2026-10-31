import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allEntries, loadAllPacks, normalizeRefs, OLD_TYPES } from './r11-pack-helpers'

function visible(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(visible).filter((item) => item !== undefined)
  if (value && typeof value === 'object') { const rec = value as Record<string, unknown>; if (rec.tableRef !== undefined || rec.table !== undefined) return undefined; return Object.fromEntries(Object.entries(rec).filter(([key]) => key !== 'refs' && key !== 'characteristics').map(([key, item]) => [key, visible(item)]).filter(([, item]) => item !== undefined)) }
  return value
}

const before = JSON.parse(gunzipSync(readFileSync(join(process.cwd(), 'tests/data/fixtures/r11-old-entries-before.json.gz'))).toString('utf8')) as Record<string, unknown>
const beforeKeys = Object.keys(before).filter((key) => !key.includes('|table.'))

describe('R11 已有类型不变', () => {
  it('R11 前 16 个类型的条目逐条相同（引用只按显示文字比较）', () => {
    const current = new Map<string, unknown>()
    for (const pack of loadAllPacks()) for (const entry of pack.entries) if (OLD_TYPES.has(entry.type) && entry.type !== 'table') current.set(`${pack.id}|${entry.id}`, visible(normalizeRefs(entry.data)))
    const diff: string[] = []
    for (const key of beforeKeys) {
      if (!current.has(key)) { diff.push(`${key} 缺失`); continue }
      if (JSON.stringify(current.get(key)) !== JSON.stringify(visible(before[key]))) diff.push(key)
    }
    expect(diff).toEqual([])
    const newRules = new Set(['script', 'skill', 'sense', 'itemProperty', 'itemType', 'itemTypeExtra', 'quickref'])
    expect(allEntries().filter((entry) => entry.type !== 'book').filter((entry) => !OLD_TYPES.has(entry.type) || (entry.type === 'rule' && newRules.has(String(entry.data.category)))).length).toBe(1120)
  })
})
