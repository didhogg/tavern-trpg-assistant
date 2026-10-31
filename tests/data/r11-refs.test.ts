import { describe, expect, it } from 'vitest'
import { LANGUAGES } from '../../src/rules/dnd5e2014/data/enums'
import { LANGUAGE_DIALECT_CODES, PSEUDO_LANGUAGE_CODES } from '../../tools/data/config/languageCodes'
import { allEntries } from './r11-pack-helpers'

function languageValues(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') out.add(value)
  else if (Array.isArray(value)) for (const item of value) languageValues(item, out)
  else if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>
    if (Array.isArray(rec.fixed)) languageValues(rec.fixed, out)
  }
}

describe('R11 引用接通', () => {
  it('所有语言编号都能落到语言条目、方言表或伪编号表', () => {
    const entries = allEntries()
    const codes = new Set(entries.filter((entry) => entry.type === 'language').map((entry) => String(entry.data.code)))
    const used = new Set<string>(LANGUAGES)
    for (const entry of entries) if (['race', 'subrace', 'background', 'feat'].includes(entry.type)) languageValues(entry.data.languages, used)
    for (const code of used) {
      const ok = codes.has(code) || code in LANGUAGE_DIALECT_CODES || code in PSEUDO_LANGUAGE_CODES
      expect(ok, code).toBe(true)
    }
    for (const [code, value] of Object.entries(LANGUAGE_DIALECT_CODES)) {
      expect(codes.has(value.parent), code).toBe(true)
      const parent = entries.find((entry) => entry.type === 'language' && entry.data.code === value.parent)!
      expect((parent.data.dialects as string[] | undefined) ?? [], code).toContain(value.zh)
    }
  })

  it('所有物品属性码都能唯一解析到 itemProperty 条目', () => {
    const entries = allEntries()
    const props = entries.filter((entry) => entry.type === 'rule' && entry.data.category === 'itemProperty')
    const byAbbr = new Map<string, string[]>()
    for (const entry of props) {
      const abbr = String(entry.data.abbreviation)
      byAbbr.set(abbr, [...(byAbbr.get(abbr) ?? []), entry.id])
    }
    const used = new Set<string>()
    for (const entry of entries) {
      if (entry.type !== 'item') continue
      const weapon = entry.data.weapon as { properties?: unknown } | undefined
      if (!Array.isArray(weapon?.properties)) continue
      for (const value of weapon.properties) used.add(String(value).split('|')[0])
    }
    for (const code of used) expect(byAbbr.get(code)?.length, code).toBe(1)
    expect(byAbbr.has('ZZ')).toBe(false)
  })

  it('恩赐 8 条、教团 2 条 supersededBy 指向 MPMM 教团', () => {
    const entries = allEntries()
    const byId = new Map(entries.map((entry) => [entry.id, entry]))
    const boons = entries.filter((entry) => entry.type === 'reward' && entry.data.rewardKind === 'demonicBoon' && entry.data.supersededBy)
    const cults = entries.filter((entry) => entry.type === 'cult' && entry.data.supersededBy)
    expect(boons).toHaveLength(8)
    expect(cults).toHaveLength(2)
    for (const entry of [...boons, ...cults]) {
      const target = byId.get(String(entry.data.supersededBy))
      expect(target?.type, entry.id).toBe('cult')
      expect((target?.data.src as { book?: string }).book, entry.id).toBe('MPMM')
    }
  })
})
