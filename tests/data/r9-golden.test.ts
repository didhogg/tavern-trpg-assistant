import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'

const REQUIRE_REF = true
const reference = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R9_参考清单.json'), 'utf8')) as { survivors: Array<Record<string, unknown>>; redirects: Array<[string, string]> }

describe('R9 参考清单', () => {
  it('表的集合、名称、种类、来源、SRD、行数逐项一致', () => {
    const packs = loadAllPacks()
    const packOf = new Map(packs.flatMap((pack) => pack.entries.map((entry) => [entry.id, pack.id] as const)))
    const tables = packs.flatMap((pack) => pack.entries).filter((entry) => entry.type === 'table')
    const expected = reference.survivors.filter((s) => REQUIRE_REF || s.kind !== 'ref')
    expect(tables).toHaveLength(expected.length)
    const byId = new Map(tables.map((entry) => [entry.id, entry]))
    const diff: string[] = []
    for (const row of expected) {
      const entry = byId.get(String(row.id))
      if (!entry) { diff.push(`${row.id} 缺失`); continue }
      const actual = {
        name: entry.name,
        kind: entry.data.kind,
        source: (entry.data.src as { book?: string }).book,
        srd: packOf.get(entry.id) === 'dnd5e2014-srd',
        dice: entry.data.dice === undefined ? null : String(entry.data.dice).split('+').map((term) => term.startsWith('d') ? `1${term}` : term).join('+'),
        modifierPrompt: (entry.data.modifier as { prompt?: string } | undefined)?.prompt ?? null,
        rows: (entry.data.rows as unknown[]).length,
        parent: (entry.data.parent as { id?: string } | undefined)?.id ?? null,
        chapter: (entry.data.chapter as { name?: string } | undefined)?.name ?? null,
        purpose: entry.data.purpose ?? null,
      }
      for (const key of ['name', 'kind', 'source', 'srd', 'dice', 'modifierPrompt', 'rows', 'parent', 'chapter', 'purpose'] as const) if (JSON.stringify(actual[key]) !== JSON.stringify(row[key])) diff.push(`${row.id} ${key}`)
    }
    expect(diff).toEqual([])
    expect(tables.some((entry) => entry.data.kind === 'ref')).toBe(REQUIRE_REF)
  })
})
