import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'

const reference = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R9_参考清单.json'), 'utf8')) as { survivors: Array<{ kind: string; source: string; oldId: string | null }>; redirects: unknown[]; dropped: unknown[] }

describe('R9 独立数量', () => {
  it('R9 来源类型矩阵没有 lost', () => {
    const types = new Set(['table', 'table-group', 'life-class', 'life-background', 'life-trinket', 'name', 'deck', 'card', 'hoard', 'individual', 'gems', 'art-object', 'magic-item', 'encounter', 'cr', 'dragon', 'dragon-mundane-item'])
    expect(Object.entries(FIELD_COVERAGE).filter(([path, entry]) => types.has(path.split('.', 1)[0]) && entry.how === 'lost')).toEqual([])
  })

  it('最终 1095、kind/来源分布与参考清单和文档锚点一致', () => {
    const packs = loadAllPacks()
    const tables = packs.flatMap((pack) => pack.entries).filter((entry) => entry.type === 'table')
    expect(tables).toHaveLength(1095)
    const kind: Record<string, number> = {}
    const source: Record<string, number> = {}
    for (const table of tables) { kind[String(table.data.kind)] = (kind[String(table.data.kind)] ?? 0) + 1; const book = String((table.data.src as { book?: string }).book); source[book] = (source[book] ?? 0) + 1 }
    expect(kind).toEqual({ roll: 540, names: 69, life: 55, encounter: 47, loot: 28, deck: 16, ref: 340 })
    expect(source).toEqual({ DMG: 259, XGE: 244, PHB: 199, TCE: 116, VGM: 89, MTF: 96, BMT: 43, SCAG: 19, MPMM: 19, MM: 11 })
    expect(reference.survivors.filter((row) => row.oldId)).toHaveLength(136)
    expect(reference.redirects).toHaveLength(28)
    expect(reference.dropped).toHaveLength(457)
  })
})
