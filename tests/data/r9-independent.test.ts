import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'

const reference = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R9_参考清单.json'), 'utf8')) as { survivors: Array<{ kind: string; source: string; oldId: string | null }>; redirects: unknown[]; dropped: unknown[] }

describe('R9 独立数量', () => {
  it('最终 1078、kind/来源分布与参考清单和文档锚点一致', () => {
    const packs = loadAllPacks()
    const tables = packs.flatMap((pack) => pack.entries).filter((entry) => entry.type === 'table')
    expect(tables).toHaveLength(1078)
    const kind: Record<string, number> = {}
    const source: Record<string, number> = {}
    for (const table of tables) { kind[String(table.data.kind)] = (kind[String(table.data.kind)] ?? 0) + 1; const book = String((table.data.src as { book?: string }).book); source[book] = (source[book] ?? 0) + 1 }
    expect(kind).toEqual({ roll: 530, names: 69, life: 55, encounter: 47, loot: 28, deck: 16, ref: 333 })
    expect(source).toEqual({ DMG: 259, XGE: 244, PHB: 193, TCE: 116, VGM: 89, MTF: 87, BMT: 43, SCAG: 19, MPMM: 18, MM: 10 })
    expect(reference.survivors.filter((row) => row.oldId)).toHaveLength(136)
    expect(reference.redirects).toHaveLength(28)
    expect(reference.dropped).toHaveLength(402)
  })
})
