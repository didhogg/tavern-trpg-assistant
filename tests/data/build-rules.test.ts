import { describe, expect, it } from 'vitest'
import { buildPackFile } from '../../src/core/packs/file'
import { sha256Hex } from '../../src/core/hash'
import { entryDataByType } from '../../src/rules/dnd5e2014/data/entries'
import { assertVolume, validatePacks } from '../../tools/data/validate'
import { tableFromBlock } from '../../tools/data/convert/tables'
import { tagSpec, TAGS } from '../../tools/data/markup/tags'
import { checkPublished } from '../../tools/data/version'
import { fixtureEntries, fixtureFeatures } from './fixtures'
import type { ConvertedPack } from '../../tools/data/convert'

function pack(): ConvertedPack {
  return {
    manifest: {
      id: 'fixture-data',
      ruleId: 'dnd5e2014',
      category: 'rules',
      name: '测试数据包',
      version: '1.0.0',
      license: 'CC-BY-NC-SA-4.0',
      attribution: '',
      description: '',
      entryCount: fixtureEntries().length,
      typeCounts: {},
      contributes: {},
      relationships: { requires: [], recommends: [], conflicts: [] },
      blobs: [],
      dataVersion: 1,
    },
    entries: fixtureEntries(),
    features: fixtureFeatures(),
  }
}

function mutate(fn: (p: ConvertedPack) => void): ConvertedPack {
  const p = pack()
  fn(p)
  return p
}

function fails(p: ConvertedPack, text: string): void {
  expect(() => validatePacks([p])).toThrow(text)
}

describe('D1 §7 校验', () => {
  it('合法夹具通过；条目数据通过运行时 zod 定义', () => {
    expect(() => validatePacks([pack()])).not.toThrow()
    expect(entryDataByType.spell.safeParse(pack().entries[0].data).success).toBe(true)
  })

  it('条目数据、来源、引用、骰式、随机表范围、摘要、id 各自失败', () => {
    fails(mutate((p) => { p.entries[0].data.level = 99 }), 'level')
    fails(mutate((p) => { delete p.entries[0].data.credit }), 'credit')
    fails(mutate((p) => { (p.entries[0].data.credit as { license: string }).license = 'MIT' }), '许可必须是')
    fails(mutate((p) => { delete p.entries[0].data.src }), 'src')
    fails(mutate((p) => { (p.entries[1].data.text as unknown[]).push({ p: '{{ref:missing|x}}' }) }), '引用的 missing 不存在')
    fails(mutate((p) => { (p.entries[2].data.weapon as { damage: Array<{ dice: string }> }).damage[0].dice = 'abc' }), '骰式')
    fails(mutate((p) => { const t = p.entries.find((e) => e.id === 'table.loot-a.test')!; t.data.rows = [{ min: 1, max: 3, cells: ['x'], refs: [] }] }), '没有恰好覆盖')
    fails(mutate((p) => { p.entries[0].summary = '字'.repeat(81) }), '摘要超过 80 字')
    fails(mutate((p) => { p.entries[0].id = 'Spell.Bad' }), 'id 不符合规则')
    fails(mutate((p) => { (p.entries[1].data.text as unknown[]).push({ p: '命中[object Object]' }) }), '转换残留')
    fails(mutate((p) => { (p.entries[1].data.text as unknown[]).push({ p: '{"immune":["poison"]}' }) }), '转换残留')
    fails(mutate((p) => { (p.entries[1].data.text as unknown[]).push({ p: '{{ref:spell.fireball.test|PHB}}' }) }), '书籍代码')
    fails(mutate((p) => { p.entries[0].id = 'subclass.cleric-entry.phb' }), '占位词 entry')
  })

  it('体积上限：单包 3MB、合计 12MB', () => {
    expect(() => assertVolume([{ id: 'big', bytes: 3 * 1024 * 1024 + 1 }])).toThrow('超过 3MB')
    expect(() => assertVolume(Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, bytes: 2.5 * 1024 * 1024 })))).toThrow('超过 12MB')
    expect(() => assertVolume([{ id: 'ok', bytes: 1024 }])).not.toThrow()
  })

  it('确定性：同样的内容得到相同字节，条目顺序不影响结果', () => {
    const manifest = pack().manifest
    const a = buildPackFile({ manifest, entries: pack().entries })
    const b = buildPackFile({ manifest, entries: [...pack().entries].reverse() })
    expect(sha256Hex(a)).toBe(sha256Hex(b))
  })

  it('版本检查：内容变了版本没变失败；版本升级内容没变警告；版本降低失败', () => {
    const old = { formatVersion: 1 as const, packs: { x: { version: '1.0.0', sha256: 'a' } } }
    expect(checkPublished([{ id: 'x', version: '1.0.0', sha256: 'b' }], old).errors[0]).toContain('内容变了但版本仍是')
    expect(checkPublished([{ id: 'x', version: '1.1.0', sha256: 'a' }], old).warnings[0]).toContain('内容与 1.0.0 相同')
    expect(checkPublished([{ id: 'x', version: '0.9.0', sha256: 'a' }], old).errors[0]).toContain('低于已发布的')
  })
})

describe('变异检查（故意改坏时应失败）', () => {
  it('改坏标签对照表：未知标签构建失败', () => {
    const saved = TAGS.dice
    delete (TAGS as Record<string, unknown>).dice
    try {
      expect(() => tagSpec('dice', '测试')).toThrow('未知的 5etools 标签')
    } finally {
      TAGS.dice = saved
    }
  })

  it('改坏随机表范围：缺行时构建失败', () => {
    const block = { colLabels: ['d6', '结果'], rows: [['1', 'a'], ['2', 'b']] }
    expect(() => tableFromBlock(block, { source: 'TEST', page: 1, parentName: '测试', parentKey: 't' })).toThrow('没有恰好覆盖')
  })

  it('改坏 id 规则：大写 id 校验失败', () => {
    fails(mutate((p) => { p.entries[0].id = 'SPELL.FIREBALL.TEST' }), 'id 不符合规则')
  })

  it('改坏往返比较：内容变化时哈希不同', () => {
    const original = buildPackFile({ manifest: pack().manifest, entries: pack().entries })
    const changed = buildPackFile({ manifest: pack().manifest, entries: mutate((p) => { p.entries[0].name = '改了名字' }).entries })
    expect(sha256Hex(original)).not.toBe(sha256Hex(changed))
  })
})

describe('P11 变异检查', () => {
  it('改坏法术位行数、uses 公式、scale 引用、伤害枚举、2024 来源都应失败', () => {
    const slots = pack()
    const cls = slots.entries.find((e) => e.type === 'class')!
    cls.data.spellcasting = { ability: 'int', progression: 'full', slotsByLevel: [{ level: 1, slots: [1, 0, 0, 0, 0, 0, 0, 0, 0] }] }
    expect(() => validatePacks([slots])).toThrow()

    const formula = pack()
    const feature = formula.entries.find((e) => e.type === 'feature')!
    feature.data.uses = { max: 'bad(', recharge: 'long' }
    expect(() => validatePacks([formula])).toThrow()

    const scale = pack()
    const feat = scale.entries.find((e) => e.type === 'feat')!
    feat.data.uses = { max: 'scale.missing', recharge: 'long' }
    expect(() => validatePacks([scale])).toThrow('scale.missing')

    const damage = pack()
    const spell = damage.entries.find((e) => e.type === 'spell')!
    spell.data.damage = [{ dice: '1d6', type: 'holy' }]
    expect(() => validatePacks([damage])).toThrow()

    const old = pack()
    const entry = old.entries[0]
    entry.data.src = { book: 'XPHB', page: 1 }
    expect(() => validatePacks([old])).toThrow('2024')
  })
})
