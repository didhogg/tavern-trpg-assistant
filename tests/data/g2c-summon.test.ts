import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str } from './consumer/util'

const flat = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : '')

describe('G2c 召唤与同伴（c13，并入 G2b 决定 3：同伴随主人等级变强）', () => {
  it('召唤物与同伴的属性依赖法术环级、主人职业等级或熟练加值，数据里只有占位', () => {
    const l = lib()
    const rec2 = new Recorder('g2c-summon')
    const M = l.of('monster')
    const bySpell = M.filter((m) => rec(m.data.extra).summonedBySpell !== undefined)
    const byClass = M.filter((m) => rec(m.data.extra).summonedByClass !== undefined)
    const hpSpecial = M.filter((m) => rec(m.data.hp).special !== undefined)
    rec2.stat('c13', 'summonedBySpell', bySpell.length)
    rec2.stat('c13', 'companionsByClass', byClass.length)
    rec2.stat('c13', 'hpSpecial', hpSpecial.length)
    // 占位：生命值平均 0 + 文字公式；护甲等级 value 10 + from 里的公式文字；文字里的变量 summonSpellLevel / PB
    const placeholderHp = [...bySpell, ...byClass].filter((m) => rec(m.data.hp).average === 0)
    const placeholderAc = [...bySpell, ...byClass].filter((m) => arr(m.data.ac).map(rec).some((a) => /法术环阶|法术等级|PB|你的|等级/.test(str(a.from))))
    const varInText = [...bySpell, ...byClass].filter((m) => /summonSpellLevel|\bPB\b/.test(flat([m.data.actions, m.data.traits, m.data.bonusActions, m.data.reactions])))
    rec2.stat('c13', 'placeholderHp', placeholderHp.length)
    rec2.stat('c13', 'placeholderAc', placeholderAc.length)
    rec2.stat('c13', 'variableInText', varInText.length)
    // 结构化的攻击伤害是某一环的快照：文字里是“1d8 + 3 + summonSpellLevel”，结构里只剩 1d8+3，附加的第二种伤害（如 1d6 力场）也丢了
    const lost: string[] = []
    for (const m of varInText) for (const a of arr(m.data.actions).map(rec)) {
      const t = flat(a.text)
      const act = arr(a.activities).map(rec).find((x) => x.kind === 'attack')
      if (!act) continue
      if (/summonSpellLevel|PB/.test(t) || arr(act.damage).length < (t.match(/\d+d\d+/g) ?? []).length) lost.push(`${m.id} ${m.name}：${str(a.name)}`)
    }
    rec2.stat('c13', 'attacksWithLostScaling', lost.length)
    rec2.find({ id: 'c13-summon-placeholder', check: 'c13', kind: 'data-defect', fixSource: 'self-structure', entries: [...bySpell, ...byClass].map((m) => `${m.id} ${m.name}（${rec(m.data.extra).summonedBySpell ?? rec(m.data.extra).summonedByClass}）`), expected: 'TCE 召唤类法术与同伴原文（PHB 游侠兽伙伴、奇械师钢铁守卫等）', note: '召唤物/同伴的护甲等级、生命值、攻击加值和伤害随法术环级、主人职业等级或熟练加值变化；数据里只有占位（生命值平均 0 + 文字公式、护甲等级 10 + 文字“11+法术等级”）：召唤时无法算出这只生物的数值。需要结构化成公式（如 ac: "11 + spell.level"、hp: "40 + 10*(spell.level-4)"），公式引擎要认识 spell.level 变量' })
    rec2.find({ id: 'c13-summon-attack-snapshot', check: 'c13', kind: 'data-defect', fixSource: 'self-structure', entries: lost, expected: 'TCE 召唤物动作原文', note: '攻击的结构化伤害是某一环的快照（丢了 “+ summonSpellLevel” 与第二种伤害），文字里才有完整公式' })
    rec2.find({ id: 'c13-hp-special-other', check: 'c13', kind: 'data-defect', fixSource: 'self-structure', entries: hpSpecial.filter((m) => !bySpell.includes(m) && !byClass.includes(m)).map((m) => `${m.id} ${m.name}：${str(rec(m.data.hp).special)}`), expected: 'PHB 活化物件表、BMT、MM', note: '生命值只有 special 文字、average 为 0：活化物件的各体型固定生命值（微型 20 … 巨型 80）、牌组守卫的按等级生命等；固定数字的应直接写 average' })
    expect(rec2.settle()).toEqual([])
  })
})
