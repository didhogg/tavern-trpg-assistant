import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { BOOKS } from '../../tools/data/config/books'
import type { PlannedEntry } from '../../tools/data/convert/plan'
import type { ConvertContext } from '../../tools/data/convert/context'
import { convertRecipe, convertCharOption } from '../../tools/data/convert/parts'
import { convertVehicle } from '../../tools/data/convert/world'
import { vehicleDataSchema } from '../../src/rules/dnd5e2014/data/entries/world'
import { loadR11Data } from '../../tools/data/extract/r11'
import type { InlineContext } from '../../tools/data/markup/inline'

const CORE = new Set(BOOKS.map((book) => book.source))

function planned(type: 'recipe' | 'charoption' | 'vehicle', raw: Record<string, unknown>, id: string): PlannedEntry {
  return {
    key: `${type}|${String(raw.source)}|${String(raw.name)}`,
    type,
    raw,
    source: String(raw.source),
    packId: 'test',
    srd: false,
    name: String(raw.name),
    nameEn: String(raw.ENG_name ?? raw.name),
    page: Number(raw.page ?? 0),
    id,
    missingName: false,
    missingPage: typeof raw.page !== 'number',
    context: {},
  }
}

function context(book: string): { ctx: ConvertContext; inline: InlineContext } {
  const index = { byTypeName: new Map(), byTypeNameSource: new Map() }
  return {
    ctx: {
      bookMachine: new Map([[book, false]]),
      classIds: new Map(), subclassIds: new Map(), spellLookup: {}, itemGroups: [], legendaryGroups: [],
      featuresByOwner: new Map(), subclassLevelByClass: new Map(), subclassNames: new Map(),
      tablesByParent: new Map(), tableByName: new Map(), index,
      resolveEntryId: () => undefined,
    },
    inline: { index, book, ownPack: 'test', allowed: new Set(), softRefs: { count: 0 }, missingTags: new Map() },
  }
}


describe('R11 配方与角色创建选项转换器', () => {
  it('D1.2b 配方按中文名排序取前 5 条，字段可读回', async () => {
    const data = await loadR11Data()
    const samples = data.recipes.filter((raw) => !CORE.has(String(raw.source))).sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh')).slice(0, 5)
    expect(samples).toHaveLength(5)
    for (const raw of samples) {
      const entry = planned('recipe', raw, `recipe.${String(raw.ENG_name).toLowerCase()}.${String(raw.source).toLowerCase()}`)
      const { ctx, inline } = context(entry.source)
      const built = convertRecipe(entry, ctx, inline)
      const dataOut = built.data as Record<string, unknown>
      expect(dataOut.diet).toBe(raw.diet)
      expect(dataOut.makes === undefined || dataOut.makes === raw.makes || typeof dataOut.makes === 'string').toBe(true)
      expect(Array.isArray(dataOut.ingredients)).toBe(true)
      expect((dataOut.ingredients as Array<{ text: string }>).map((item) => item.text).join('')).not.toContain('{=')
      expect(JSON.stringify(built.summary).length).toBeLessThan(500)
    }
  })

  it('含 amount2 的配方占位被替换，unit 在 6 个时用复数', async () => {
    const data = await loadR11Data()
    const raw = data.recipes.find((item) => String(item.name).includes('剩菜') && JSON.stringify(item).includes('amount2'))
    expect(raw).toBeDefined()
    const entry = planned('recipe', raw!, 'recipe.leftovers.test')
    const { ctx, inline } = context(entry.source)
    const built = convertRecipe(entry, ctx, inline)
    const text = (built.data.ingredients as Array<{ text: string }>).map((item) => item.text).join('')
    expect(text).not.toContain('{=')
    expect(text).toContain('鸡蛋')
    expect(text).not.toContain('蛋|鸡蛋')
  })

  it('分组食材输出 {group, items}', async () => {
    const data = await loadR11Data()
    const raw = data.recipes.find((item) => JSON.stringify(item.ingredients).includes('"entries"'))
    expect(raw).toBeDefined()
    const entry = planned('recipe', raw!, 'recipe.grouped.test')
    const { ctx, inline } = context(entry.source)
    const built = convertRecipe(entry, ctx, inline)
    const groups = (built.data.ingredients as Array<{ group?: string; items?: unknown[] }>).filter((item) => item.group)
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0].items?.length).toBeGreaterThan(0)
  })

  it('D1.2b SPELLJAMMER 载具取 2 条内存转换并通过 zod', async () => {
    const data = await loadR11Data()
    const raw = JSON.parse((await import('node:fs')).readFileSync(join(process.cwd(), 'reference', '5etools-cn-main（数据库）', 'data', 'vehicles.json'), 'utf8')) as { vehicle: Array<Record<string, unknown>> }
    const samples = raw.vehicle.filter((item) => item.vehicleType === 'SPELLJAMMER').slice(0, 2)
    expect(samples).toHaveLength(2)
    for (const item of samples) {
      const entry = planned('vehicle', item, `vehicle.${String(item.ENG_name).toLowerCase()}.${String(item.source).toLowerCase()}`)
      const { ctx, inline } = context(entry.source)
      const built = convertVehicle(entry, ctx, inline)
      expect(vehicleDataSchema.safeParse(built.data).success).toBe(true)
      expect(built.data.vehicleType).toBe('SPELLJAMMER')
    }
    expect(data.vehicles.length).toBe(4)
  })

  it('角色创建选项按（来源，名称）取前 5 条，optionType 与正文保留', async () => {
    const data = await loadR11Data()
    const samples = data.charOptions.filter((raw) => !CORE.has(String(raw.source))).sort((a, b) => `${a.source}|${a.name}`.localeCompare(`${b.source}|${b.name}`, 'zh')).slice(0, 5)
    expect(samples).toHaveLength(5)
    for (const raw of samples) {
      const entry = planned('charoption', raw, `charoption.${String(raw.ENG_name).toLowerCase()}.${String(raw.source).toLowerCase()}`)
      const { ctx, inline } = context(entry.source)
      const built = convertCharOption(entry, ctx, inline)
      expect(built.data.optionType).toEqual(raw.optionType)
      expect(Array.isArray(built.data.text)).toBe(true)
      expect((built.data.text as unknown[]).length).toBeGreaterThan(0)
    }
  })
})
