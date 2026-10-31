import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'
import type { TextBlock } from '../../src/schemas/text'
import { planR12 } from '../../tools/data/convert/planR12'
import type { FluffRecord } from '../../tools/data/extract/fluff'

const reference = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R12_参考嵌入块.json'), 'utf8')) as Record<string, Array<{ mode: string; name: string; nameEn: string; source: string | null; target: string | null; pruned: boolean | null }>>

function lists(blocks: TextBlock[]): string[] {
  const out: string[] = []
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) { for (const item of value) walk(item); return }
    if (!value || typeof value !== 'object') return
    const rec = value as Record<string, unknown>
    if (Array.isArray(rec.list)) out.push(...rec.list.map(String))
    for (const item of Object.values(rec)) walk(item)
  }
  walk(blocks)
  return out
}

describe('R12 嵌入块', () => {
  const books = loadAllPacks().flatMap((pack) => pack.entries).filter((entry) => entry.type === 'book')
  it('参考里的 statblock 引用按顺序是输出 list 项的子序列；未解析 0', () => {
    const bad: string[] = []
    let refs = 0
    for (const entry of books) {
      const expected = (reference[entry.id] ?? []).filter((row) => row.mode === 'ref' || row.mode === 'refAndFluff')
      refs += expected.length
      const wanted = expected.map((row) => row.pruned ? row.name : `{{ref:${row.target}|${row.name}}}`)
      const actual = lists(entry.data.text as TextBlock[])
      let j = 0
      for (const item of actual) if (j < wanted.length && item === wanted[j]) j += 1
      if (j !== wanted.length) bad.push(`${entry.id} ${j}/${wanted.length}`)
    }
    expect(bad).toEqual([])
    expect(refs).toBe(1939)
  })

  it('471 个背景文字、按书计数与 12 个降级项一致', () => {
    const all = Object.values(reference).flat()
    expect(all.filter((row) => row.mode === 'refAndFluff' || row.mode === 'fluff')).toHaveLength(471)
    const byBook: Record<string, number> = {}
    for (const [id, rows] of Object.entries(reference)) { const source = id.split('.').pop()!.toUpperCase(); byBook[source] = (byBook[source] ?? 0) + rows.filter((row) => row.mode === 'refAndFluff' || row.mode === 'fluff').length }
    expect({ MM: byBook.MM, VGM: byBook.VGM, MTF: byBook.MTF, MPMM: byBook.MPMM }).toEqual({ MM: 175, VGM: 79, MTF: 47, MPMM: 170 })
    expect(all.filter((row) => row.pruned)).toHaveLength(12)
  })

  it('背景文字深拷贝，原 fluff 对象不变', () => {
    const fluff: FluffRecord[] = [{ kind: 'monster', raw: { name: '测试怪', ENG_name: 'Test Monster', source: 'PHB', entries: [{ type: 'entries', name: '测试怪', entries: [{ p: '原文' }] }] } }]
    const before = JSON.stringify(fluff)
    const book = { source: 'PHB', contents: [{ ENG_name: 'Test Chapter' }], chapters: [{ id: '000', name: '测试章', ENG_name: 'Test Chapter', page: 1, entries: [{ type: 'statblock', prop: 'monsterFluff', name: '测试怪', ENG_name: 'Test Monster', source: 'PHB' }] }] }
    const result = planR12({ books: [book], fluff, existing: [], r9: { tables: [], replacements: [], redirects: [], survivorByCandidate: new Map() }, options: { embeds: true, tables: false } })
    expect(JSON.stringify(fluff)).toBe(before)
    expect(JSON.stringify((result.entries[0].raw._chapter as { entries: unknown[] }).entries)).toContain('原文')
  })

  it('输出里没有 bookRefList 临时节点', () => {
    expect(JSON.stringify(books.map((entry) => entry.data.text))).not.toContain('bookRefList')
  })
})
