import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { entryDataByType } from '../../src/rules/dnd5e2014/data/entries'
import { languageDataSchema } from '../../src/rules/dnd5e2014/data/entries/world'
import { hazardDataSchema } from '../../src/rules/dnd5e2014/data/entries/world'
import { monsterPartDataSchema } from '../../src/rules/dnd5e2014/data/entries/parts'
import { MONSTER_PART_TOKENS, assertMonsterPartTokens, tokenPatternOf } from '../../tools/data/config/monsterPartTokens'
import { allEntries, R11_TYPES } from './r11-pack-helpers'

const DATA = join(process.cwd(), 'reference', '5etools-cn-main（数据库）', 'data')

function sourceTokens(): Set<string> {
  const files = ['monsterfeatures.json', 'makebrew-creature.json']
  const out = new Set<string>()
  const walk = (value: unknown) => {
    if (typeof value === 'string') for (const match of value.matchAll(/<\$([^$]+)\$>/g)) out.add(match[1])
    else if (Array.isArray(value)) for (const item of value) walk(item)
    else if (value && typeof value === 'object') for (const item of Object.values(value)) walk(item)
  }
  for (const file of files) walk(JSON.parse(readFileSync(join(DATA, file), 'utf8')))
  return out
}

describe('R11 格式与 zod', () => {
  it('全部新条目通过自己的 strict schema，无原始标签、摘要不超过 80 字、id 合法', () => {
    const entries = allEntries().filter((entry) => R11_TYPES.includes(entry.type as never) || (entry.type === 'rule' && ['script', 'skill', 'sense', 'itemProperty', 'itemType', 'itemTypeExtra', 'quickref'].includes(String(entry.data.category))))
    expect(entries).toHaveLength(1120)
    const bad: string[] = []
    for (const entry of entries) {
      const schema = entryDataByType[entry.type as keyof typeof entryDataByType]
      const parsed = schema.safeParse(entry.data)
      if (!parsed.success) bad.push(`${entry.id}: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`)
      if (JSON.stringify(entry.data).includes('{@')) bad.push(`${entry.id}: 原始标签`)
      if (Array.from(entry.summary).length > 80) bad.push(`${entry.id}: 摘要过长`)
      if (!/^[a-z0-9][a-z0-9.-]*$/.test(entry.id) || /(^|[.-])entry([.-]|$)/.test(entry.id)) bad.push(`${entry.id}: id 非法`)
    }
    expect(bad).toEqual([])
  })

  it('语言 code 唯一且等于英文名小写；文字系统软指针可解析', () => {
    const entries = allEntries()
    const languages = entries.filter((entry) => entry.type === 'language')
    const codes = languages.map((entry) => String(entry.data.code))
    expect(new Set(codes).size).toBe(codes.length)
    for (const entry of languages) expect(entry.data.code).toBe(String(entry.nameEn).toLowerCase())
    const scripts = new Set(entries.filter((entry) => entry.type === 'rule' && entry.data.category === 'script').map((entry) => entry.id))
    for (const entry of languages) if (typeof entry.data.scriptRule === 'string') expect(scripts.has(entry.data.scriptRule), entry.id).toBe(true)
  })

  it('令牌全集被登记覆盖；未知令牌让构建失败', () => {
    const tokens = sourceTokens()
    expect(tokens.size).toBe(29)
    for (const token of tokens) expect(tokenPatternOf(token), token).toBeDefined()
    expect(MONSTER_PART_TOKENS.length).toBeGreaterThan(0)
    expect(() => assertMonsterPartTokens(['foo'])).toThrow('未登记的怪物部件令牌')
  })

  it('奖励的 17 条法术授予与生命值恩惠读回正确', () => {
    const rewards = allEntries().filter((entry) => entry.type === 'reward')
    const granted = rewards.filter((entry) => Array.isArray(entry.data.spellGrants))
    expect(granted).toHaveLength(17)
    expect(granted.reduce((n, entry) => n + (entry.data.spellGrants as unknown[]).length, 0)).toBe(19)
    const fortitude = rewards.find((entry) => entry.name === '超凡强韧之恩惠')!
    expect(fortitude.data.effects).toEqual([{ flat: 40, kind: 'hpMax', transfer: true }])
    const restoration = rewards.find((entry) => entry.name === '复原护咒')!
    expect((restoration.data.spellGrants as Array<{ spell: string }>).map((grant) => grant.spell)).toEqual(['spell.greater-restoration.phb', 'spell.lesser-restoration.phb'])
  })

  it('故意造坏数据会让 strict schema 失败', () => {
    expect(languageDataSchema.safeParse({ src: { book: 'X', page: 1 }, credit: {}, code: 'x', extra: 1 }).success).toBe(false)
    expect(hazardDataSchema.safeParse({ src: { book: 'X', page: 1 }, credit: {}, hazardKind: 'trap', kind: 'ZZ' }).success).toBe(false)
    expect(hazardDataSchema.safeParse({ src: { book: 'X', page: 1 }, credit: {}, hazardKind: 'trap', rating: [{ tier: 1, threat: 'x' }] }).success).toBe(false)
    expect(monsterPartDataSchema.safeParse({ src: { book: 'X', page: 1 }, credit: {}, partKind: 'feature', foo: 1 }).success).toBe(false)
  })
})
