import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allEntries, R9_OLD_TYPES } from './r9-pack-helpers'

const before = JSON.parse(gunzipSync(readFileSync(join(process.cwd(), 'tests/data/fixtures/r9-old-entries-before.json.gz'))).toString('utf8')) as Record<string, unknown>

describe('R9 旧类型不变', () => {
  it('非表类型逐条相同（阶段 A 尚无正文替换）', () => {
    const current = new Map<string, unknown>()
    for (const entry of allEntries()) if (R9_OLD_TYPES.has(entry.type)) current.set(entry.id, entry.data)
    expect(current.size).toBe(Object.keys(before).length)
    const diff: string[] = []
    for (const [key, data] of Object.entries(before)) {
      const id = key.slice(key.indexOf('|') + 1)
      if (!current.has(id)) { diff.push(`${id} 缺失`); continue }
      if (JSON.stringify(current.get(id)) !== JSON.stringify(data)) diff.push(id)
    }
    expect(diff).toEqual([])
  })
})
