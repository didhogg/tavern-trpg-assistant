import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { comparePair, compareLayers, deepEqual, isFoundryFile, recordSchemaOf, schemaIdOf, type RawRecord, type SchemaInfo } from '../../e2e/library/audit-layers34'
import { schemaInfo } from '../../../tools/audit/schema-info.mjs'

const spellSchema = { fields: ['name', 'source', 'level', '_copy'], markers: ['_copy'], open: false }
const schema: SchemaInfo = { version: 't', files: { 'spells/spells.json': { spell: spellSchema } }, byProp: { spell: spellSchema, item: { fields: ['name', 'source'], markers: [], open: false } } }
const raw = (prop: string, hash: string | null, rec: Record<string, unknown>, file = 'data/spells/spells-x.json'): RawRecord => ({ prop, file, hash, rec, schema: recordSchemaOf(schema, file, prop).schema })

describe('作者规则原样搬过来的部分', () => {
  it('数据文件 → 结构定义文件（作者 test-json.js）', () => {
    expect(schemaIdOf('data/spells/spells-xphb.json')).toBe('spells/spells.json')
    expect(schemaIdOf('data/bestiary/fluff-bestiary-mm.json')).toBe('bestiary/fluff-bestiary.json')
    expect(schemaIdOf('data/items.json')).toBe('items.json')
  })

  it('Foundry 补充文件（作者 test-foundry.js）', () => {
    expect(isFoundryFile('data/spells/foundry.json')).toBe(true)
    expect(isFoundryFile('data/foundry-items.json')).toBe(true)
    expect(isFoundryFile('data/items.json')).toBe(false)
    expect(isFoundryFile('data/class/class-bard.json')).toBe(false)
  })
})

describe('第 4 层逐字段比', () => {
  it('不看键顺序', () => {
    expect(deepEqual({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true)
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false)
  })

  it('只多了结构定义里没有的字段 = 加载器加的；结构定义允许的字段多出来、少了、变了 = 可疑；带解析标记 = 允许', () => {
    expect(comparePair({ name: 'a' }, { name: 'a', __prop: 'spell' }, spellSchema)).toMatchObject({ kind: 'runtimeOnly', runtime: ['__prop'] })
    expect(comparePair({ name: 'a' }, { name: 'a', level: 1 }, spellSchema)).toMatchObject({ kind: 'suspicious', diffs: ['added-in-schema:level'] })
    expect(comparePair({ name: 'a', level: 1 }, { name: 'a' }, spellSchema)).toMatchObject({ kind: 'suspicious', diffs: ['removed:level'] })
    expect(comparePair({ name: 'a', level: 1 }, { name: 'a', level: 2 }, spellSchema)).toMatchObject({ kind: 'suspicious', diffs: ['changed:level'] })
    expect(comparePair({ name: 'a', _copy: {} }, { name: 'b' }, spellSchema)).toMatchObject({ kind: 'marked' })
    expect(comparePair({ name: 'a' }, { name: 'a', __prop: 'x' }, undefined)).toMatchObject({ kind: 'noSchema' })
  })
})

describe('第 3 层四个桶', () => {
  it('A 对上；换类别（同一加载器、同名）；B 带标记；D 解释不了；作者不加载的类别单列', () => {
    const raws = [
      raw('spell', 's1', { name: 'A' }),
      raw('spell', 's2', { name: 'B', _copy: {} }),
      raw('spell', 's3', { name: 'C' }),
      raw('spell', null, { name: 'D' }),
      raw('baseitem', 'i1', { name: 'Axe' }, 'data/items-base.json'),
      raw('itemType', 'i2', { name: 'Ammo' }, 'data/items-base.json'),
      raw('encounter', 'e1', { name: 'E' }, 'data/encounters.json'),
    ]
    const parseds = [
      { prop: 'spell', hash: 's1', item: { name: 'A', __prop: 'spell' } },
      { prop: 'spell', hash: 's9', item: { name: 'Z' } },
      { prop: 'item', hash: 'i1', item: { name: 'Axe' } },
      { prop: 'itemProperty', hash: 'i2', item: { name: 'Ammunition' } },
    ]
    const r = compareLayers(raws, parseds, schema, [['spell'], ['item', 'baseitem', 'itemType', 'itemProperty']], new Set(['spell', 'item', 'itemProperty']))
    expect(r.notLoaded).toEqual({ encounter: 1 })
    expect(r.layer3.spell).toMatchObject({ raw: 4, parsed: 2, a: 1, bMarked: { _copy: 1 }, d: { rawOnly: 1, parsedOnly: 1, rawNoHash: 1 } })
    expect(r.layer3.baseitem.crossProp).toEqual({ '→item': 1 })
    expect(r.layer3.item.crossProp).toEqual({ '←baseitem': 1 })
    // 编号撞了但名字不同：不当成同一条
    expect(r.layer3.itemType.d.rawOnly).toBe(1)
    expect(r.layer3.itemProperty.d.parsedOnly).toBe(1)
    expect(r.layer4.spell).toMatchObject({ pairs: 1, runtimeOnly: 1, runtimeFields: { __prop: 1 } })
    expect(r.layer4['baseitem→item'].pairs).toBe(1)
    expect(r.totals).toMatchObject({ raw: 6, a: 1, crossProp: 1, bMarked: 1, dRaw: 3, dParsed: 2 })
  })

  it('同一编号多条：记为无法一一配对', () => {
    const r = compareLayers([raw('spell', 's1', { name: 'A' }), raw('spell', 's1', { name: 'A' })], [{ prop: 'spell', hash: 's1', item: { name: 'A' } }], schema, [['spell']], new Set(['spell']))
    expect(r.layer4.spell).toMatchObject({ pairs: 1, ambiguous: 1 })
    expect(r.layer4.spell.ambiguousSamples[0]).toContain('原始×2')
  })
})

describe('从作者结构定义读类别、字段、解析标记', () => {
  it('顺着引用找字段；指向 util-copy.json 的是解析标记；不是数组的顶层键不算类别', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'schema-'))
    const site = join(dir, 'schema', 'site')
    await mkdir(join(site, 'spells'), { recursive: true })
    await writeFile(join(dir, 'package.json'), JSON.stringify({ version: '9.9.9' }))
    await writeFile(join(site, 'util-copy.json'), JSON.stringify({ $defs: { copyBlock: { type: 'object' }, versions: { type: 'array', items: { $ref: '#/$defs/copyBlock' } } } }))
    await writeFile(join(site, 'spells', 'spells.json'), JSON.stringify({
      properties: { spell: { type: 'array', items: { $ref: '#/$defs/spell' } }, _meta: { type: 'object' } },
      $defs: {
        spell: { anyOf: [{ type: 'object', properties: { name: {}, _copy: { $ref: '../util-copy.json#/$defs/copyBlock' } }, additionalProperties: false }, { $ref: '#/$defs/more' }] },
        more: { type: 'object', properties: { level: {}, _versions: { type: 'array', items: { $ref: '../util-copy.json#/$defs/versions' } } }, additionalProperties: false },
      },
    }))
    await writeFile(join(site, 'items.json'), JSON.stringify({ properties: { item: { type: 'array', items: { type: 'object', properties: { name: {} } } }, meta: { type: 'object' } } }))
    const s = await schemaInfo(site)
    expect(s.version).toBe('9.9.9')
    expect(s.files['spells/spells.json'].spell).toEqual({ fields: ['_copy', '_versions', 'level', 'name'], markers: ['_copy', '_versions'], open: false })
    expect(Object.keys(s.files['items.json'])).toEqual(['item'])
    expect(s.byProp.item.open).toBe(false)
  })
})

describe('作者规则登记', () => {
  it('命中的差异单独计数，不进 D 和可疑；条件看作者打的来历字段和语言', async () => {
    const { AUTHOR_RULES } = await import('../../e2e/library/audit-author-rules')
    const raws = [raw('subrace', 'r1', { name: 'Sub' }, 'data/races.json'), raw('spell', 's1', { name: 'A', translator: 'x' })]
    const parseds = [
      { prop: 'item', hash: 'v1', item: { name: 'V', _variantName: '+1' } },
      { prop: 'item', hash: 'v2', item: { name: 'W' } },
      { prop: 'spell', hash: 's1', item: { name: 'A' } },
    ]
    const groups = [['spell'], ['race', 'subrace'], ['item']]
    const cn = compareLayers(raws, parseds, schema, groups, new Set(['spell', 'item']), AUTHOR_RULES, 'cn')
    expect(cn.layer3.subrace.authorRules).toEqual({ 'subrace-merged': 1 })
    expect(cn.layer3.item).toMatchObject({ authorRules: { 'specific-variants': 1 }, d: { parsedOnly: 1 } })
    expect(cn.layer4.spell).toMatchObject({ authorRule: 1, authorRules: { 'cn-translator': 1 }, suspicious: {} })
    const en = compareLayers(raws, parseds, schema, groups, new Set(['spell', 'item']), AUTHOR_RULES, 'en')
    expect(en.layer4.spell.suspicious).toHaveProperty('removed:translator')
  })
})
