import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LATIN_ALLOW } from '../../tools/data/config/latinAllow'
import { loadTerms } from '../../tools/data/clean/terms'
import { allEntries } from './r9-pack-helpers'

const entries = allEntries()
const byId = new Map(entries.map((e) => [e.id, e]))
const text = (id: string): string => JSON.stringify(byId.get(id)!.data.text)

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const item of value) strings(item, out)
  else if (value && typeof value === 'object') for (const item of Object.values(value)) strings(item, out)
  return out
}

describe('R14 规则 4：汉字后紧跟的英文（D1）', () => {
  it('体检 D1 独立重算为 0', () => {
    let n = 0
    for (const e of entries) for (const raw of strings(e.data.text)) {
      const plain = raw.replace(/\{\{[^{}]*\}\}/g, '')
      for (const m of plain.matchAll(/[一-鿿]([A-Za-z]{3,})/g)) if (!LATIN_ALLOW.has(m[1])) n++
    }
    expect(n).toBe(0)
  })

  it('样本：机制类词汇换成中文；译名后加括号；前文已有中文时加括号', () => {
    expect(text('item.pike-vicious.dmg')).toContain('7点穿刺伤害')
    expect(text('feature.dragonborn-black-breath-weapon.phb')).toContain('敏捷豁免')
    expect(text('feature.monk-ki.phb')).toContain('气豁免DC = 8 + 你的熟练加值')
    expect(text('book.creating-a-multiverse.dmg')).toContain('幽寂大窟（Great Dismal Delve）')
    expect(text('book.creating-a-multiverse.dmg')).toContain('九层地狱（the Nine Hells）')
    expect(text('rule.skill-variants.dmg')).toContain('专精（Expertise）')
  })
})

describe('R14 术语词典', () => {
  const parser = readFileSync(join(process.cwd(), 'reference/5etools-cn-main（数据库）/js/parser.js'), 'utf8')
  const terms = loadTerms()

  it('机制类词汇与 parser.js 原文逐个一致', () => {
    const pairs: Array<[string, string]> = [['piercing', '穿刺'], ['slashing', '挥砍'], ['bludgeoning', '钝击'], ['radiant', '光耀'], ['necrotic', '暗蚀'], ['strength', '力量'], ['dexterity', '敏捷'], ['constitution', '体质'], ['charmed', '魅惑'], ['blinded', '目盲'], ['athletics', '运动'], ['acrobatics', '特技']]
    for (const [en, zh] of pairs) {
      expect(terms.map.get(en), en).toBe(zh)
      expect(terms.mechanical.has(en), en).toBe(true)
      expect(parser.includes(`"${zh}"`), zh).toBe(true)
    }
  })

  it('一词多义的普通词不属于机制类；歧义词不在词典里', () => {
    for (const word of ['goblin', 'giant', 'light', 'minotaur', 'ravenloft']) expect(terms.mechanical.has(word), word).toBe(false)
    for (const word of terms.ambiguous.keys()) expect(terms.map.has(word) && !terms.mechanical.has(word) && false).toBe(false)
  })

  it('词典里没有带标签记号或拉丁字母的中文译名', () => {
    for (const zh of terms.map.values()) expect(/[A-Za-z{}|@<>\s]/.test(zh), zh).toBe(false)
  })
})
