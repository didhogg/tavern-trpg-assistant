import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BOOKS } from '../../tools/data/config/books'
import { allEntries, normalizeRefs } from './r11-pack-helpers'

const PREFIX: Record<string, string> = {
  script: 'script', skill: 'skill', sense: 'sense', itemProperty: 'item-property', itemType: 'item-type', itemTypeExtra: 'item-type-extra', quickref: 'quickref',
}
const NEW_TYPES = new Set(['language', 'deity', 'reward', 'cult', 'hazard', 'object', 'vehicle', 'monsterPart'])
const DATA = join(process.cwd(), 'reference', '5etools-cn-main（数据库）', 'data')
const CORE = new Set(BOOKS.map((book) => book.source))

function isR11(entry: { type: string; data: Record<string, unknown> }): boolean {
  return NEW_TYPES.has(entry.type) || (entry.type === 'rule' && String(entry.data.category) in PREFIX)
}

describe('R11 条目编号与名称', () => {
  it('新增规则分类的 id 带类别前缀，R11 条目的 id 不靠 -N 后缀区分', () => {
    for (const entry of allEntries()) {
      if (!isR11(entry)) continue
      if (entry.type === 'rule') expect(entry.id.startsWith(`rule.${PREFIX[String(entry.data.category)]}-`), entry.id).toBe(true)
      expect(/\.[a-z0-9]+-\d+$/.test(entry.id), `${entry.id} 带数字后缀`).toBe(false)
    }
  })

  it('R11 条目的名称保持来源原样：没有同名后缀', () => {
    for (const entry of allEntries()) if (isR11(entry)) {
      expect(entry.data.nameSuffix, entry.id).toBeUndefined()
      expect(/（\d+）$/.test(entry.name), entry.name).toBe(false)
    }
  })

  it('旧规则的 fromVariantRule 都指向变体规则', () => {
    const entries = allEntries()
    const byId = new Map(entries.map((entry) => [entry.id, entry]))
    const linked = entries.filter((entry) => entry.type === 'rule' && typeof entry.data.fromVariantRule === 'string')
    expect(linked.length).toBeGreaterThan(0)
    for (const entry of linked) expect(byId.get(String(entry.data.fromVariantRule))?.data.category, entry.id).toBe('variant')
  })

  it('MTF 三艘载具的背景文字（fluff）挂到了条目的 lore 上，内容与来源一致', () => {
    const fluff = (JSON.parse(readFileSync(join(DATA, 'fluff-vehicles.json'), 'utf8')) as { vehicleFluff: Array<Record<string, unknown>> }).vehicleFluff
    const withText = fluff.filter((item) => CORE.has(String(item.source)) && Array.isArray(item.entries) && item.entries.length)
    expect(withText.map((item) => item.name).sort()).toEqual(['位面掠夺者', '星界快艇', '星界帆船'].sort())
    const vehicles = allEntries().filter((entry) => entry.type === 'vehicle')
    for (const item of withText) {
      const entry = vehicles.find((v) => v.name === item.name && (v.data.src as { book: string }).book === item.source)
      expect(entry, String(item.name)).toBeDefined()
      const lore = entry!.data.lore as unknown[] | undefined
      expect(lore?.length ?? 0, String(item.name)).toBeGreaterThan(0)
      const plain = JSON.stringify(normalizeRefs(lore))
      const first = (item.entries as unknown[]).find((x): x is string => typeof x === 'string') ?? ''
      const snippet = first.replace(/\{@\w+ ([^}|]*)[^}]*\}/g, '$1').slice(0, 12)
      expect(plain, String(item.name)).toContain(snippet)
    }
    for (const entry of vehicles) if (!withText.some((item) => item.name === entry.name)) expect(entry.data.lore, entry.id).toBeUndefined()
  })
})
