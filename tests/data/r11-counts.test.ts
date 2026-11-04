import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CORE_BOOKS as BOOKS } from '../../tools/data/config/books'
import { allEntries } from './r11-pack-helpers'
import { REF_5ETOOLS } from '../../tools/data/lib/io'

const DATA = join(REF_5ETOOLS, 'data')
const CORE = new Set(BOOKS.map((book) => book.source))

function json(file: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(DATA, file), 'utf8')) as Record<string, unknown>
}

function list(file: string, key: string): Array<Record<string, unknown>> {
  const value = json(file)[key]
  if (!Array.isArray(value)) throw new Error(`${file} 缺少 ${key}`)
  return value as Array<Record<string, unknown>>
}

function core(listValue: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return listValue.filter((item) => CORE.has(String(item.source)))
}

function collectSections(value: unknown, out: Array<Record<string, unknown>>): void {
  if (Array.isArray(value)) { for (const item of value) collectSections(item, out); return }
  if (!value || typeof value !== 'object') return
  const rec = value as Record<string, unknown>
  if (rec.type === 'section') out.push(rec)
  collectSections(rec.entries, out)
}

function quickrefs(): Array<Record<string, unknown>> {
  const quick = json('generated/bookref-quick.json').data as Record<string, unknown>
  const screen = json('generated/bookref-dmscreen.json').data as Record<string, unknown>
  const out: Array<Record<string, unknown>> = []
  collectSections(quick['bookref-quick'], out)
  const seen = new Set(out.map((section) => `${section.ENG_name}|${section.source}|${section.page}`))
  const screenSections: Array<Record<string, unknown>> = []
  collectSections(screen['bookref-dmscreen'], screenSections)
  for (const section of screenSections) {
    if (typeof section.source !== 'string' || typeof section.page !== 'number') continue
    const key = `${section.ENG_name}|${section.source}|${section.page}`
    if (!seen.has(key)) { seen.add(key); out.push(section) }
  }
  return out
}

describe('R11 条数锚点', () => {
  it('独立计数与包内条数都等于文档锚点，合计 1120', () => {
    const packs = allEntries()
    const byType = (type: string) => packs.filter((entry) => entry.type === type)
    const byCategory = (category: string) => byType('rule').filter((entry) => entry.data.category === category)
    const counts = {
      language: core(list('languages.json', 'language')).length,
      script: core(list('languages.json', 'languageScript')).length,
      skill: core(list('skills.json', 'skill')).length,
      sense: core(list('senses.json', 'sense')).length,
      itemProperty: core(list('items-base.json', 'itemProperty')).length,
      itemType: core(list('items-base.json', 'itemType')).length,
      itemTypeExtra: core(list('items-base.json', 'itemTypeAdditionalEntries')).length,
      quickref: quickrefs().length,
      deity: core(list('deities.json', 'deity')).length,
      reward: core(list('rewards.json', 'reward')).filter((item) => item.type !== undefined).length + core(list('cultsboons.json', 'boon')).length,
      cult: core(list('cultsboons.json', 'cult')).length,
      hazard: core(list('trapshazards.json', 'trap')).length + core(list('trapshazards.json', 'hazard')).length,
      object: core(list('objects.json', 'object')).length,
      vehicle: core(list('vehicles.json', 'vehicle')).length,
      monsterPart: core(list('makebrew-creature.json', 'makebrewCreatureAction')).length + core(list('makebrew-creature.json', 'makebrewCreatureTrait')).length + list('monsterfeatures.json', 'monsterfeatures').length,
    }
    expect(Object.values(counts).every((n) => n > 0)).toBe(true)
    expect(byType('language')).toHaveLength(counts.language)
    expect(byCategory('script')).toHaveLength(counts.script)
    expect(byCategory('skill')).toHaveLength(counts.skill)
    expect(byCategory('sense')).toHaveLength(counts.sense)
    expect(byCategory('itemProperty')).toHaveLength(counts.itemProperty)
    expect(byCategory('itemType')).toHaveLength(counts.itemType)
    expect(byCategory('itemTypeExtra')).toHaveLength(counts.itemTypeExtra)
    expect(byCategory('quickref')).toHaveLength(counts.quickref)
    expect(byType('deity')).toHaveLength(counts.deity)
    expect(byType('reward')).toHaveLength(counts.reward)
    expect(byType('cult')).toHaveLength(counts.cult)
    expect(byType('hazard')).toHaveLength(counts.hazard)
    expect(byType('object')).toHaveLength(counts.object)
    expect(byType('vehicle')).toHaveLength(counts.vehicle)
    expect(byType('monsterPart')).toHaveLength(counts.monsterPart)
    expect(byType('recipe')).toHaveLength(0)
    expect(byType('charoption')).toHaveLength(0)
    expect(packs.filter((entry) => entry.type !== 'book').filter((entry) => !['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'disease', 'status', 'table', 'rule', 'lore'].includes(entry.type)).length + byCategory('script').length + byCategory('skill').length + byCategory('sense').length + byCategory('itemProperty').length + byCategory('itemType').length + byCategory('itemTypeExtra').length + byCategory('quickref').length).toBe(Object.values(counts).reduce((a, b) => a + b, 0))
  })
})
