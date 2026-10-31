import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { allEntries, packPath } from './r9-pack-helpers'
import type { Entry } from '../../src/schemas/pack'

type Raw = Record<string, unknown>
const EN_DIR = join(process.cwd(), 'reference/5etools-cn-main（数据库）/data-bak')
const readEn = (file: string): Raw => JSON.parse(readFileSync(join(EN_DIR, file), 'utf8')) as Raw
const i18nOf = (entry: Entry): { name: string; summary?: string; fields: Record<string, unknown> } | undefined => (entry as { i18n?: { en: { name: string; summary?: string; fields: Record<string, unknown> } } }).i18n?.en
const plain = (text: string): string => text.replace(/\{@\w+ ([^{}|]*)[^{}]*\}/g, '$1')

describe('R13 英文对照：独立读 data-bak 核对', () => {
  const entries = allEntries()
  const byId = new Map(entries.map((entry) => [entry.id, entry]))

  it('火球术：英文名与正文开头来自英文原文', () => {
    const spell = (readEn('spells/spells-phb.json').spell as Raw[]).find((s) => s.name === 'Fireball')!
    const first = plain(String((spell.entries as unknown[])[0]))
    const en = i18nOf(byId.get('spell.fireball.phb')!)!
    expect(en.name).toBe('Fireball')
    expect(first.startsWith('A bright streak flashes')).toBe(true)
    expect(JSON.stringify(en.fields.text)).toContain(first.slice(0, 40))
  })

  it('异端 Aboleth：特性名「Amphibious」在英文 traits 里；动作名也在', () => {
    const monster = (readEn('bestiary/bestiary-mm.json').monster as Raw[]).find((m) => m.name === 'Aboleth')!
    const traitNames = ((monster.trait as Raw[]) ?? []).map((t) => String(t.name))
    expect(traitNames).toContain('Amphibious')
    const fields = i18nOf(byId.get('monster.aboleth.mm')!)!.fields
    const values = Object.entries(fields).filter(([key]) => /^traits\.\d+\.name$/.test(key)).map(([, value]) => value)
    expect(values).toContain('Amphibious')
    const actionNames = ((monster.action as Raw[]) ?? []).map((t) => String(t.name))
    const actionValues = Object.entries(fields).filter(([key]) => /^actions\.\d+\.name$/.test(key)).map(([, value]) => value)
    for (const name of actionNames) expect(actionValues.some((value) => String(value).startsWith(name))).toBe(true)
  })

  it('物品、职业特性、规则的英文名', () => {
    const items = (readEn('items-base.json').baseitem as Raw[]).filter((r) => r.source === 'PHB').map((r) => String(r.name))
    expect(items).toContain('Longsword')
    expect(i18nOf(byId.get('item.longsword.phb')!)?.name).toBe('Longsword')
    const features = (readEn('class/class-fighter.json').classFeature as Raw[]).filter((r) => r.source === 'PHB').map((r) => String(r.name))
    expect(features).toContain('Second Wind')
    expect([...byId.values()].filter((e) => e.type === 'feature' && i18nOf(e)?.name === 'Second Wind').length).toBeGreaterThan(0)
  })

  it('除 4 个基线别名外，所有条目都有英文版', () => {
    const missing = entries.filter((entry) => !i18nOf(entry)).map((entry) => entry.id).sort()
    expect(missing).toEqual(['item.rapier-sword-of-sharpness.dmg', 'item.rapier-vorpal-sword.dmg', 'item.shortsword-sword-of-sharpness.dmg', 'item.shortsword-vorpal-sword.dmg'])
    expect(entries).toHaveLength(8853)
  })

  it('英文名里没有汉字；字段里没有汉字、没有 {@', () => {
    const bad: string[] = []
    for (const entry of entries) {
      const en = i18nOf(entry)
      if (!en) continue
      if (/[㐀-鿿]/.test(en.name)) bad.push(`${entry.id} 名称`)
      const json = JSON.stringify(en.fields)
      if (/[㐀-鿿]/.test(json)) bad.push(`${entry.id} 字段含汉字`)
      if (json.includes('{@')) bad.push(`${entry.id} 含 {@`)
    }
    expect(bad).toEqual([])
  })

  it('子表：魔法物品表G·异能塑像 的英文名、列、行', () => {
    const table = byId.get('table.magic-item-table-g.dmg-row12-14')!
    const en = i18nOf(table)!
    expect(en.name).toBe('Magic Item Table G·Figurine of Wondrous Power')
    const rows = (table.data.rows as unknown[]).length
    expect(rows).toBe(7)
    expect(Object.keys(en.fields).filter((key) => /^rows\.\d+\.cells\.0$/.test(key))).toHaveLength(7)
  })

  it('书章节：96 章都有英文版，英文标题块的锚点集合与中文相同', () => {
    const books = entries.filter((entry) => entry.type === 'book')
    expect(books).toHaveLength(96)
    const anchors = (value: unknown, out: string[] = []): string[] => {
      if (Array.isArray(value)) { for (const item of value) anchors(item, out); return out }
      if (value && typeof value === 'object') { const rec = value as Raw; if (typeof rec.h === 'string' && typeof rec.anchor === 'string') out.push(rec.anchor); for (const item of Object.values(rec)) anchors(item, out) }
      return out
    }
    const bad: string[] = []
    for (const book of books) {
      const en = i18nOf(book)
      if (!/[\u3400-\u9fff]/.test(JSON.stringify(book.data.text))) { if (!en) bad.push(`${book.id} 无英文版`); continue } // 只有插图的章节（如 MPMM 地图）正文里没有文字
      if (!en || !en.fields.text) { bad.push(`${book.id} 无英文正文`); continue }
      if (JSON.stringify(anchors(en.fields.text)) !== JSON.stringify(anchors(book.data.text))) bad.push(`${book.id} 锚点不同`)
    }
    expect(bad).toEqual([])
  })

  it('每种类型的英文条数：与中文条数相同（别名除外）', () => {
    const byType = new Map<string, { cn: number; en: number }>()
    for (const entry of entries) { const row = byType.get(entry.type) ?? { cn: 0, en: 0 }; row.cn++; if (i18nOf(entry)) row.en++; byType.set(entry.type, row) }
    for (const [type, row] of byType) expect(row.en, type).toBe(type === 'item' ? row.cn - 4 : row.cn)
  })

  it('体积：单包 ≤ 3 MB，合计 ≤ 10.5 MB', () => {
    const files = [SRD_PACK_ID, ...BOOKS.map((book) => book.packId)].map(packPath)
    for (const file of files) expect(existsSync(file)).toBe(true)
    const sizes = files.map((file) => statSync(file).size)
    expect(Math.max(...sizes)).toBeLessThanOrEqual(3 * 1024 * 1024)
    expect(sizes.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(10.5 * 1024 * 1024)
  })
})
