import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stableStringify } from '../../src/core/hash'
import { allEntries } from './r9-pack-helpers'

const before = JSON.parse(readFileSync(join(process.cwd(), 'tests/data/fixtures/r13-hashes-before.json'), 'utf8')) as Record<string, string>
// 哈希只含中文部分的字段；`i18n` 不在其中，所以 R13 只增不改
const hash = (entry: { id: string; type: string; name: string; nameEn?: string; keywords: string[]; summary: string; data: unknown }): string => createHash('sha256').update(stableStringify([entry.id, entry.type, entry.name, entry.nameEn, entry.keywords, entry.summary, entry.data])).digest('hex')

describe('R13 已有条目的中文部分不变', () => {
  it('快照里的 8,853 个 id 都还在，且哈希相同', () => {
    const byId = new Map(allEntries().map((entry) => [entry.id, entry]))
    expect(Object.keys(before)).toHaveLength(8853)
    const diff: string[] = []
    for (const [id, expected] of Object.entries(before)) {
      const entry = byId.get(id)
      if (!entry) { diff.push(`${id} 缺失`); continue }
      if (hash(entry) !== expected) diff.push(`${id} 哈希变化`)
    }
    expect(diff).toEqual([])
    expect(byId.size).toBe(8853)
  })
})
