import { describe, expect, it } from 'vitest'
import { readGrants } from './consumer/classSheet'
import { CLASS_EXPECT } from './consumer/expected/classes'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { cleanSpellName, has5etools, rawSubclasses } from './consumer/ref5etools'
import { arr, rec, str, strs } from './consumer/util'

describe('G2a 子职业（a10）', () => {
  it('授予的第一级与职业的“子职业等级”一致；选择池的选项都存在；扩展法术都是存在的法术', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-subclass')
    const levelBad: string[] = []
    const poolBad: string[] = []
    const spellBad: string[] = []
    let spells = 0
    for (const s of l.of('subclass')) {
      const cls = str(s.data.classId)
      const first = Math.min(...readGrants(s).filter((g) => !g.optional).map((g) => g.level))
      if (CLASS_EXPECT[cls] && first !== CLASS_EXPECT[cls].subclassLevel) levelBad.push(`${s.id} 第一级授予 ${first}，职业子职业等级 ${CLASS_EXPECT[cls].subclassLevel}`)
      for (const a of arr(s.data.advancement).map(rec)) if (a.kind === 'itemChoice') {
        const pool = strs(a.pool)
        if (!pool.length || pool.some((i) => !l.get(i)) || Number(a.count) > pool.length) poolBad.push(s.id)
      }
      for (const e of arr(s.data.expandedSpells).map(rec)) for (const sp of strs(e.spells)) { spells++; if (l.get(sp)?.type !== 'spell') spellBad.push(`${s.id} → ${sp}`) }
    }
    rec2.stat('a10', 'subclasses', l.of('subclass').length)
    rec2.stat('a10', 'expandedSpells', spells)
    if (levelBad.length) rec2.find({ id: 'a10-first-level', check: 'a10', kind: 'data-defect', fixSource: 'self-structure', entries: levelBad, expected: 'PHB 各职业“子职业”小节', note: '子职业第一次授予特性的等级与职业的子职业等级不符' })
    if (poolBad.length) rec2.find({ id: 'a10-pool', check: 'a10', kind: 'data-defect', fixSource: 'self-structure', entries: poolBad, expected: '条目库', note: '选择池为空、含不存在的条目，或选择数超过池大小' })
    if (spellBad.length) rec2.find({ id: 'a10-expanded-not-spell', check: 'a10', kind: 'data-defect', fixSource: 'self-structure', entries: spellBad, expected: '条目库', note: '扩展法术指向不存在的法术' })
    expect(rec2.settle()).toEqual([])
  })

  it('领域法术、誓言法术、扩展法术与 5etools 原始数据逐级对照', () => {
    if (!has5etools()) return
    const l = lib()
    const rec2 = new Recorder('g2a-subclass-spells')
    const raw = rawSubclasses().filter((r) => !r.copy && Object.keys(r.spellsByLevel).length)
    const short: string[] = []
    const inLib: string[] = []
    const notInLib: string[] = []
    const libNames = new Set(l.of('spell').map((x) => x.name.replace(/[术\s/]/g, '')))
    let compared = 0
    for (const r of raw) {
      const mine = l.of('subclass').find((s) => s.name === r.name && str(rec(s.data.src).book) === r.source)
      if (!mine) continue
      compared++
      // 数据里每一级的法术名（用条目名比较）；原始数据的层级有的写成 s1…s5（魔契师：法术环级），去掉前缀；重复项去重
      const key = (n: string): string => n.replace(/[术\s/]/g, '')
      const have: Record<string, Set<string>> = {}
      for (const e of arr(mine.data.expandedSpells).map(rec)) {
        const set = (have[String(e.level)] ??= new Set<string>())
        for (const sp of strs(e.spells)) set.add(key(l.get(sp)?.name ?? sp))
      }
      const want: Record<string, Set<string>> = {}
      for (const [lv, names] of Object.entries(r.spellsByLevel)) for (const n of names) (want[lv.replace(/^s/, '')] ??= new Set<string>()).add(cleanSpellName(n))
      for (const [lv, names] of Object.entries(want)) {
        const miss = [...names].filter((n) => !have[lv]?.has(key(n)))
        for (const n of miss) (libNames.has(key(n)) ? inLib : notInLib).push(`${mine.id} ${lv}级 ${n}`)
        if (miss.length) short.push(`${mine.id} ${lv}级 缺：${miss.join('、')}`)
      }
    }
    rec2.stat('a10', 'comparedSubclasses', compared)
    rec2.stat('a10', 'shortLevels', short.length)
    rec2.stat('a10', 'missingSpellsExistingInLibrary', inLib.length)
    rec2.stat('a10', 'missingSpellsNotInLibrary', notInLib.length)
    if (short.length) rec2.find({ id: 'a10-expanded-short', check: 'a10', kind: 'data-defect', fixSource: 'import-5etools', entries: short, expected: '5etools 原始数据 additionalSpells（领域/誓言/扩展法术，与 PHB 每级 2 个一致）', note: '某级扩展法术比原始数据少：缺的法术在库里都有条目（见统计 missingSpellsExistingInLibrary），是转换时没挂上；影响领域法术、誓言法术、魔契师扩展法术表' })
    expect(rec2.settle()).toEqual([])
  })
})
