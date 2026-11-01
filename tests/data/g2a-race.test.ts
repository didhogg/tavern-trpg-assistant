import { describe, expect, it } from 'vitest'
import { RACE_EXPECT } from './consumer/expected/races'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { englishOf } from './consumer/classSheet'
import { readRace, readTraits } from './consumer/originSheet'
import { SKILLS_ALL, ABILITIES } from './consumer/codes'
import { fold, rec, sameSet, arr, str } from './consumer/util'

describe('G2a 种族与亚种（a12）', () => {
  it('PHB 种族与亚种合并后与书一致', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-race')
    const bad: Record<string, string[]> = {}
    const add = (k: string, key: string): void => { (bad[k] ??= []).push(key.replace('|', ' + ').replace(/ \+ $/, '')) }
    let checks = 0
    for (const [key, x] of Object.entries(RACE_EXPECT)) {
      const [rid, sid] = key.split('|')
      const got = readRace(l, rid, sid || undefined)
      const eq = (name: string, ok: boolean): void => { checks++; if (!ok) add(name, key) }
      const abKeys = Object.keys({ ...x.abilities, ...got.abilities })
      eq('abilities', abKeys.every((k) => (x.abilities[k] ?? 0) === (got.abilities[k] ?? 0)))
      eq('abilityChoose', JSON.stringify(x.abilityChoose ?? null) === JSON.stringify(got.abilityChoose ?? null))
      eq('size', got.size.length === 1 && got.size[0] === x.size)
      eq('walk', got.walk === x.walk)
      eq('darkvision', got.darkvision === x.darkvision)
      eq('langFixed', sameSet(got.langFixed, x.langFixed))
      eq('langChoose', got.langChoose === x.langChoose)
      eq('skillsFixed', sameSet(got.skillsFixed, x.skillsFixed ?? []))
      eq('skillChoose', got.skillChoose === (x.skillChoose ?? 0))
      eq('weaponsFixed', sameSet(got.weaponsFixed.map(fold), (x.weaponsFixed ?? []).map(fold)))
      eq('armorFixed', sameSet(got.armorFixed, x.armorFixed ?? []))
      eq('toolsFixed', sameSet(got.toolsFixed.map(fold), (x.toolsFixed ?? []).map(fold)))
      eq('toolChoose', got.toolChoose === (x.toolChoose ?? 0))
    }
    rec2.stat('a12', 'checks', checks)
    const NOTE: Record<string, string> = { abilities: '变体人类是“替换”人类的属性加值（两项自选 +1，没有其他加值），而不是叠加；数据里没有表达“替换”，读取器按“亚种加到种族上”读就会读成 全属性 +1 再加两项自选', size: '亚种的体型与书不符（侏儒、半身人的亚种写成了中型，而种族是小型；读取器按“亚种覆盖种族”读就会读错）' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a12-${k}`, check: 'a12', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: 'PHB 第 2 章种族（逐项）', note: NOTE[k] ?? `种族“${k}”与书不符` })
    expect(rec2.settle()).toEqual([])
    void englishOf
  })

  it('全部种族与亚种：编号、代码、结构合法（自洽检查）', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-race-all')
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    const rows = [...l.of('race'), ...l.of('subrace')]
    for (const r of rows) {
      const d = r.data
      if (r.type === 'race' && strs0(d.size).length === 0) add('size-missing', r.id)
      if (Object.keys(rec(d.speed)).length === 0) add('speed-missing', r.id)
      for (const k of Object.keys(rec(rec(d.abilityBonus).fixed))) if (!ABILITIES.includes(k)) add('ability-code', r.id)
      for (const t of arr(d.traits)) if (!l.get(str(t))) add('trait-missing', r.id)
      if (r.type === 'subrace' && !l.get(str(d.parentRace))) add('parent-missing', r.id)
      for (const s of strs0(rec(rec(d.proficiencies).skills).fixed)) if (!SKILLS_ALL.includes(s)) add('skill-code', r.id)
      // 任选展开：种族的 advancement.trait 里的记号都能展开（形状不认识会抛错）
      const t = readTraits(l, r)
      if (t.choices.some((c) => c.values.length === 0 && !c.ambiguous)) add('choice-empty', r.id)
      for (const c of arr(d.advancement).map(rec)) void c
    }
    rec2.stat('a12', 'rows', rows.length)
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a12-all-${k}`, check: 'a12', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '条目库与代码表', note: `种族/亚种自洽检查：${k}` , selfCheck: true })
    expect(rec2.settle()).toEqual([])
  })
})

function strs0(v: unknown): string[] { return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [] }
