import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { hasPhbText, phbSpellLists } from './consumer/phbLists'
import { has5etools, raw5e } from './consumer/ref5etools'
import { arr, fold, rec, str, strs } from './consumer/util'

const CN: Record<string, string> = { 吟游诗人: 'bard', 牧师: 'cleric', 德鲁伊: 'druid', 圣武士: 'paladin', 游侠: 'ranger', 术士: 'sorcerer', 魔契师: 'warlock', 法师: 'wizard', 奇械师: 'artificer' }

describe('G2a 职业法术表（a16b）', () => {
  it('PHB 原文的各职业法术列表与数据里法术的“职业”一致', () => {
    if (!hasPhbText()) return
    const l = lib()
    const rec2 = new Recorder('g2a-spelllist')
    const lists = phbSpellLists()
    const spellsByName = new Map(l.of('spell').filter((s) => s.id.endsWith('.phb')).map((s) => [fold(s.nameEn ?? ''), s]))
    const want = new Map<string, Set<string>>()
    const notFound: string[] = []
    for (const [cls, byLevel] of Object.entries(lists)) for (const [lv, names] of Object.entries(byLevel)) for (const n of names) {
      const sp = spellsByName.get(n)
      if (!sp) { notFound.push(`${cls} ${lv}环 ${n}`); continue }
      if (!want.has(sp.id)) want.set(sp.id, new Set())
      want.get(sp.id)!.add(cls)
    }
    rec2.stat('a16b', 'phbListedSpells', want.size)
    rec2.stat('a16b', 'phbEntries', Object.values(lists).reduce((a, v) => a + Object.values(v).reduce((b, x) => b + x.length, 0), 0))
    rec2.stat('a16b', 'phbEntriesNotInLibrary', notFound.length)
    const PHB_CLASSES = Object.values(CN).filter((c) => c !== 'artificer')
    const missing: string[] = []
    const extra: string[] = []
    for (const sp of l.of('spell').filter((s) => s.id.endsWith('.phb'))) {
      const have = new Set(strs(sp.data.classes).filter((c) => c.endsWith('.phb') || c.endsWith('.tce')).map((c) => c.split('.')[1]).filter((c) => PHB_CLASSES.includes(c)))
      const exp = want.get(sp.id) ?? new Set<string>()
      for (const c of exp) if (!have.has(c)) missing.push(`${sp.id} 缺 ${c}`)
      for (const c of have) if (!exp.has(c)) extra.push(`${sp.id} 多 ${c}`)
    }
    if (notFound.length) rec2.find({ id: 'a16b-phb-not-in-library', check: 'a16b', kind: 'data-defect', fixSource: 'self-structure', entries: notFound, expected: 'PHB 第 11 章各职业法术列表', note: 'PHB 列表里的法术在库里按英文名找不到' })
    if (missing.length) rec2.find({ id: 'a16b-class-missing', check: 'a16b', kind: 'data-defect', fixSource: 'import-5etools', entries: missing, expected: 'PHB 第 11 章各职业法术列表', note: '法术的职业里缺了 PHB 列表上的职业' })
    // 多出来的：区分“塔莎等书的可选扩展列表”和“凭空多的”
    let variantKeys = new Set<string>()
    if (has5etools()) {
      const lookup = rec(raw5e('generated/gendata-spell-source-lookup.json'))
      const byCn = new Map(l.of('spell').map((s) => [s.name, s.id]))
      variantKeys = new Set()
      for (const bucket of Object.values(lookup)) for (const [cnName, info] of Object.entries(rec(bucket))) {
        const id = byCn.get(cnName)
        if (!id) continue
        for (const book of Object.values(rec(rec(info).classVariant))) for (const cn of Object.keys(rec(book))) if (CN[cn]) variantKeys.add(`${id} 多 ${CN[cn]}`)
      }
    }
    const optional = extra.filter((e) => variantKeys.has(e))
    const odd = extra.filter((e) => !variantKeys.has(e))
    rec2.stat('a16b', 'extraTotal', extra.length)
    rec2.stat('a16b', 'extraFromOptionalLists', optional.length)
    if (optional.length) rec2.find({ id: 'a16b-optional-baked-in', check: 'a16b', kind: 'data-defect', fixSource: 'self-structure', entries: optional, expected: '5etools 原始数据 classVariant（塔莎、福图等书的可选扩展法术列表）', note: '可选扩展列表（塔莎的“扩展法术列表”等）被直接写进了 PHB 法术的职业里，核心列表与可选扩展混在一起；应改为由扩展书用 joins 的 as:"spell" 登记' })
    if (odd.length) rec2.find({ id: 'a16b-class-extra-unexplained', check: 'a16b', kind: 'data-defect', fixSource: 'import-5etools', entries: odd, expected: 'PHB 第 11 章各职业法术列表', note: '法术的职业里有 PHB 列表上没有、也不属于可选扩展列表的职业（例如星界投影被写成武僧法术）' })
    expect(rec2.settle()).toEqual([])
    void arr; void str
  })

  it('奇械师的完整法术表（TCE）：数据里只有一小部分', () => {
    if (!has5etools()) return
    const l = lib()
    const rec2 = new Recorder('g2a-artificer-list')
    const lookup = rec(raw5e('generated/gendata-spell-source-lookup.json'))
    const byCn = new Map(l.of('spell').map((s) => [s.name, s]))
    const want: string[] = []
    const notInLib: string[] = []
    for (const bucket of Object.values(lookup)) for (const [cnName, info] of Object.entries(rec(bucket))) {
      if (!rec(rec(rec(info).class).TCE)['奇械师']) continue
      const sp = byCn.get(cnName)
      if (sp) want.push(sp.id)
      else notInLib.push(cnName)
    }
    const have = new Set(l.of('spell').filter((s) => strs(s.data.classes).includes('class.artificer.tce')).map((s) => s.id))
    rec2.stat('a16b', 'artificerListInSource', want.length + notInLib.length)
    rec2.stat('a16b', 'artificerListFoundInLibrary', want.length)
    rec2.stat('a16b', 'artificerSpellsInData', have.size)
    const lacking = want.filter((id) => !have.has(id))
    if (lacking.length) rec2.find({ id: 'a16b-artificer-short', check: 'a16b', kind: 'data-defect', fixSource: 'import-5etools', entries: lacking, expected: '5etools 生成数据 gendata-spell-source-lookup（TCE 奇械师法术表）；TCE 第 2 章奇械师法术列表', note: '奇械师的法术表缺大半：PHB 的法术包不能指向塔莎里的奇械师，所以只留下塔莎自己的 7 个；应由奇械师条目自己列出全部法术' })
    if (notInLib.length) rec2.find({ id: 'a16b-artificer-source-not-in-library', check: 'a16b', kind: 'decision', fixSource: 'decision', entries: notInLib, expected: '5etools 奇械师列表', note: '奇械师列表里的法术出自我们没收录的书（或名字对不上），库里没有' })
    expect(rec2.settle()).toEqual([])
  })
})
