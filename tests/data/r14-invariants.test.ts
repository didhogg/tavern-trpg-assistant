import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'
import { loadBefore } from './r14-snapshot'

type Rec = Record<string, unknown>
const REF = /\{\{ref:([^|}]+)/g
const refsOf = (value: unknown): string[] => [...JSON.stringify(value).matchAll(REF)].map((m) => m[1]).sort()

/** 把数据里所有「不是文字」的结构（数字、布尔、键名）抽成一个签名；字符串叶子只保留是否为空。 */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Rec).map(([k, v]) => [k, shape(v)]))
  if (typeof value === 'string') return 's'
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

  it('每个条目的引用 id 集合不变', () => {
    const bad = now.filter((entry) => JSON.stringify(refsOf(entry.data)) !== JSON.stringify(refsOf(before[entry.id].data))).map((entry) => entry.id)
    expect(bad).toEqual([])
  })
})
