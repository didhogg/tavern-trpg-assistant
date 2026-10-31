import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks, normalizeRefs } from './r11-pack-helpers'

function visible(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(visible)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'refs' && key !== 'characteristics').map(([key, item]) => [key, visible(item)]))
  return value
}

const before = JSON.parse(gunzipSync(readFileSync(join(process.cwd(), 'tests/data/fixtures/r11-text-before.json.gz'))).toString('utf8')) as Record<string, unknown>

describe('R11 引用纯文本回归', () => {
  it('去掉引用标记后，全部包的旧条目与改前逐字相同', () => {
    const current = new Map<string, unknown>()
    for (const pack of loadAllPacks()) for (const entry of pack.entries) if (entry.type !== 'table') current.set(`${pack.id}|${entry.id}`, visible(normalizeRefs(entry.data)))
    const diff: string[] = []
    for (const [key, data] of Object.entries(before)) {
      if (key.includes('|table.')) continue
      if (!current.has(key)) { diff.push(`${key} 缺失`); continue }
      if (JSON.stringify(current.get(key)) !== JSON.stringify(visible(data))) diff.push(key)
    }
    expect(diff).toEqual([])
  })
})
