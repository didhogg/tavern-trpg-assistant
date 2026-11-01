import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BOOKS, BOOK_NAMES, packIdOf } from '../../tools/data/config/books'
import { BOOK_POLICY } from '../../tools/data/config/bookPolicy'
import { loadAllPacks } from './r9-pack-helpers'
import { manifestOf } from './g1-snapshot'
import { loadG2Before } from './g2-snapshot'

/** G1：书目不写死——书目由政策表 + books.json 生成，依赖由引用推导，书名跟着包走。 */
describe('G1 书目由政策表生成', () => {
  // 开工快照：G1 的基线夹具已随 G2.5 退役，改用 G2 开工基线（包名称、lineage、依赖与 G1 完成时相同）
  const before = loadG2Before()

  it('生成的 10 本书与开工快照一致：包编号、名称、英文名、层级、lineage', () => {
    expect(BOOKS.map((b) => b.packId)).toEqual(['phb', 'scag', 'dmg', 'mm', 'xge', 'tce', 'vgm', 'mtf', 'mpmm', 'bmt'].map((c) => `dnd5e2014-${c}`))
    for (const b of BOOKS) {
      const old = before.packs[b.packId]
      const m = manifestOf(b.packId)
      expect({ name: m.name, nameEn: m.nameEn, lineage: m.lineage }, b.packId).toEqual({ name: old.name, nameEn: old.nameEn, lineage: old.lineage })
      expect(b.name, b.packId).toBe(old.name)
      expect(b.nameEn, b.packId).toBe(old.nameEn)
      expect(packIdOf(b.source), b.source).toBe(b.packId)
    }
  })

  it('政策表：层级唯一；政策表里额外写明的依赖都比本书层级低；覆盖名只在与 books.json 不同时才写', () => {
    expect(new Set(BOOK_POLICY.map((p) => p.order)).size).toBe(BOOK_POLICY.length)
    for (const p of BOOK_POLICY) for (const r of p.requires ?? []) expect(BOOK_POLICY.find((x) => x.source === r)!.order, `${p.source} -> ${r}`).toBeLessThan(p.order)
    expect(BOOK_NAMES.MM).toBe('怪物图鉴')
    expect(BOOK_NAMES.MPMM).toBe('魔邓肯巨献：多元宇宙的怪物')
  })

  it('依赖：每个包的清单依赖 = 条目引用推出的 + 政策表额外写明的（与开工快照相同）', () => {
    for (const [id, old] of Object.entries(before.packs)) expect(manifestOf(id).requires, id).toEqual(old.requires)
  })

  it('书名跟着包走：每个包的清单带 sourceNames，覆盖本包条目出现的全部来源代号，名称与政策表一致', () => {
    for (const pack of loadAllPacks()) {
      const names = manifestOf(pack.id).sourceNames
      const used = new Set(pack.entries.map((e) => (e.data.src as { book?: string } | undefined)?.book).filter((s): s is string => !!s && BOOKS.some((b) => b.source === s)))
      expect(Object.keys(names).sort(), pack.id).toEqual([...used].sort())
      for (const [code, v] of Object.entries(names)) expect(v.name, `${pack.id} ${code}`).toBe(BOOKS.find((b) => b.source === code)!.name)
    }
  })

  it('代码里没有字面写死的书目代码列表（政策表与测试夹具除外）', () => {
    const codes = BOOKS.map((b) => b.source)
    const literal = new RegExp(`\\[\\s*(?:'(?:${codes.join('|')})'\\s*,?\\s*){4,}`)
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name)
        if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'out') walk(p, out) } else if (/\.(ts|vue|mjs)$/.test(e.name)) out.push(p)
      }
      return out
    }
    const hits = [...walk(join(process.cwd(), 'tools')), ...walk(join(process.cwd(), 'src'))].filter((f) => literal.test(readFileSync(f, 'utf8')))
    expect(hits.map((f) => f.replace(process.cwd() + '/', ''))).toEqual([])
    expect(readFileSync(join(process.cwd(), 'tools/data/validate/layers.ts'), 'utf8')).not.toContain('EXPECTED_REQUIRES')
  })
})
