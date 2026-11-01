import { describe, expect, it } from 'vitest'
import { profByCr } from './consumer/expected/cr'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { abilityMod, crValue } from './consumer/monsterSheet'
import { arr, refsIn, rec, str } from './consumer/util'

const flat = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : '')

/** 怪物施法（c5）：法术名都能点开；法术豁免难度与攻击加值 = 8 + 熟练 + 属性调整值（自洽）；每日次数/法术位的写法。 */
describe('G2c 怪物施法（c5）', () => {
  it('施法列表里的法术引用、每日次数、法术豁免难度', () => {
    const l = lib()
    const rec2 = new Recorder('g2c-spellcasting')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    let mentions = 0
    let blocks = 0
    let dcChecks = 0
    const spellNames = new Map(l.of('spell').map((s) => [s.name, s.id]))
    for (const m of l.of('monster')) {
      const prof = profByCr(crValue(m.data.cr))
      const ab = rec(m.data.abilities) as Record<string, number>
      for (const sc of arr(m.data.spellcasting).map(rec)) {
        blocks++
        const lists: string[] = [...arr(sc.atWill).map(String), ...Object.values(rec(sc.perDay)).flatMap((v) => arr(v).map(String))]
        for (const lv of Object.values(rec(sc.spells)).map(rec)) lists.push(...arr(lv.spells).map(String))
        for (const key of ['recharge', 'rest', 'restLong', 'legendary', 'charges']) for (const v of Object.values(rec(sc[key]))) lists.push(...arr(v).map(String))
        for (const x of lists) {
          mentions++
          const ids = refsIn(x)
          // 一项里可以有多个引用（“寻获魔宠（魔宠可以是蠕行之爪……）”后面的是怪物引用）；第一个引用是法术本身，它必须是法术
          if (ids.length) { if (l.get(ids[0])?.type !== 'spell') add('spell-ref-missing', `${m.id} ${m.name}：${x}`) }
          else add(spellNames.has(x.replace(/#.*$/, '')) ? 'spell-plain-name' : 'spell-plain-unknown', `${m.id} ${m.name}：${x}`)
        }
        // 法术豁免难度 {{dc:N}} 与属性：8 + 熟练 + 调整值（也可能是固定数，书上有不按这个公式的怪物）
        const text = flat(sc.text)
        const dc = /\{\{dc:(\d+)\}\}/.exec(text)
        const abil = str(sc.ability)
        if (dc && abil in ab) {
          dcChecks++
          const want = 8 + prof + abilityMod(ab[abil])
          if (Number(dc[1]) !== want) add('spell-dc-off', `${m.id} ${m.name}：文字 DC ${dc[1]}，按 8+熟练${prof}+${abil}调整值${abilityMod(ab[abil])} = ${want}`)
        }
        const hasList = lists.length > 0
        if (!hasList && text.length > 40 && /法术/.test(text)) add('spell-list-text-only', `${m.id} ${m.name}：${str(sc.name)}`)
      }
    }
    rec2.stat('c5', 'spellcastingBlocks', blocks)
    rec2.stat('c5', 'spellMentions', mentions)
    rec2.stat('c5', 'dcChecks', dcChecks)
    const NOTE: Record<string, string> = {
      'spell-ref-missing': '施法列表里的引用指向不存在的法术', 'spell-plain-name': '施法列表里的法术是没加链接的纯文字名字（库里有这个法术）', 'spell-plain-unknown': '施法列表里的法术名在库里找不到（译名不同或不是 2014 版法术）',
      'spell-dc-off': '怪物的法术豁免难度和 8+熟练+施法属性调整值不一致（自洽检查；怪物不一定严格按公式）', 'spell-list-text-only': '施法块只有文字、没有结构化的法术列表',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `c5-${k}`, check: 'c5', kind: k === 'spell-dc-off' ? 'source-defect' : 'data-defect', fixSource: k === 'spell-dc-off' ? 'decision' : k === 'spell-plain-name' ? 'normalize' : 'self-structure', entries: ids, expected: k === 'spell-dc-off' ? '怪物自己的数据（自洽）' : '条目库', note: NOTE[k], selfCheck: k === 'spell-dc-off' })
    expect(rec2.settle()).toEqual([])
  })
})
