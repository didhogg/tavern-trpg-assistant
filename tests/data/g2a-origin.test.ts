import { describe, expect, it } from 'vitest'
import { englishOf } from './consumer/classSheet'
import { SKILLS_ALL } from './consumer/codes'
import { BG_EXPECT, FEAT_EXPECT } from './consumer/expected/origins'
import { expandToken } from './consumer/expand'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { readTraits } from './consumer/originSheet'
import { arr, fold, rec, sameSet, str, strs } from './consumer/util'

describe('G2a 背景（a13）', () => {
  it('PHB 背景的技能、工具、语言与书一致；每个背景的特征表存在', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-background')
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    let checks = 0
    for (const [id, x] of Object.entries(BG_EXPECT)) {
      const b = l.need(id)
      const p = rec(b.data.proficiencies)
      const sk = rec(p.skills), tl = rec(p.tools), lg = rec(p.languages)
      const eq = (k: string, ok: boolean): void => { checks++; if (!ok) add(k, id) }
      eq('skills', sameSet(strs(sk.fixed), x.skills))
      const fixedTools = strs(tl.fixed).map((t) => expandToken(l, `tool:${t}`).values[0])
      eq('toolsFixed', sameSet(fixedTools, x.toolsFixed.map((t) => expandToken(l, `tool:${t}`).values[0])))
      const from = strs(rec(tl.choose).from)
      eq('toolChoose', x.toolChoose ? from.length === 1 && sameSet(expandToken(l, `tool:${from[0]}`).values, expandToken(l, `tool:${x.toolChoose}`).values) && rec(tl.choose).count === 1 : tl.choose === undefined)
      eq('langChoose', Number(rec(lg.choose).count ?? 0) === x.langChoose)
      // 同一份数据里的两种写法要自洽：proficiencies 与 advancement.trait 的固定技能一致
      const grants = readTraits(l, b).fixed.filter((v) => SKILLS_ALL.includes(v))
      eq('grants-vs-proficiencies', sameSet(grants, x.skills))
      // 特征表：4 张基础表（特点 d8、理念/牵挂/缺陷 d6）存在，行数符合
      const tables = arr(b.data.characteristics).map(rec)
      for (const t of tables) {
        const row = l.get(str(t.table))
        if (!row) { add('table-missing', id); continue }
        const n = arr(row.data.rows).length
        const label = str(t.label)
        const want = /特点$/.test(label) ? 8 : /理念$|牵挂$|缺陷$/.test(label) ? 6 : 0
        checks++
        if (want && n !== want) add('table-rows', id)
      }
      void englishOf; void fold
    }
    rec2.stat('a13', 'checks', checks)
    const NOTE: Record<string, string> = { skills: '背景技能与书不符', toolsFixed: '背景固定工具与书不符', toolChoose: '背景自选工具与书不符', langChoose: '背景自选语言数与书不符', 'grants-vs-proficiencies': '背景的 proficiencies 与 advancement 两种写法不一致', 'table-missing': '特征表不存在', 'table-rows': '特征表行数与书不符（特点 d8、理念/牵挂/缺陷 d6）' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a13-${k}`, check: 'a13', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: 'PHB 第 4 章背景', note: NOTE[k] ?? k })
    // 全部背景：没有特征表、也不是自定义背景的（剑湾背景只写了“使用某某背景的特征表”文字）
    // 借用别的背景的特征表（characteristicsFrom）也算有；借用的必须是真实存在、且自己有表的背景
    const brokenFrom = l.of('background').filter((b) => b.data.characteristicsFrom !== undefined && (l.get(str(b.data.characteristicsFrom))?.type !== 'background' || arr(l.get(str(b.data.characteristicsFrom))?.data.characteristics).length === 0))
    if (brokenFrom.length) rec2.find({ id: 'a13-from-broken', check: 'a13', kind: 'data-defect', fixSource: 'self-structure', entries: brokenFrom.map((b) => `${b.id} ${b.name}`), expected: 'SCAG 第 4 章各背景“使用某某背景的特征表”', note: 'characteristicsFrom 指向的背景不存在，或那个背景自己没有特征表' })
    const noTables = l.of('background').filter((b) => arr(b.data.characteristics).length === 0 && b.data.characteristicsFrom === undefined && b.id !== 'background.custom-background.phb')
    rec2.stat('a13', 'backgrounds', l.of('background').length)
    rec2.find({ id: 'a13-no-characteristics', check: 'a13', kind: 'source-defect', fixSource: 'self-structure', entries: noTables.map((b) => b.id), expected: 'SCAG 第 4 章（城市守卫等写“使用士兵背景的特征表”，其余背景有自己的表）、BMT', note: '这些背景没有结构化的特征表引用：多数在书上就是一句话“使用玩家手册某背景的特征表”（只有文字，读不出指向哪几张表）' })
    expect(rec2.settle()).toEqual([])
  })
})

describe('G2a 专长（a14）', () => {
  it('PHB 专长的前置条件、属性提升与书一致；全部前置条件都能被程序读', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-feat')
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    const canon = (v: unknown): string => JSON.stringify(v ?? null, (_k, x: unknown) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x))
    const phb = l.of('feat').filter((f) => f.id.endsWith('.phb'))
    for (const f of phb) {
      const x = FEAT_EXPECT[f.id] ?? {}
      if (canon(x.requires) !== canon(f.data.requires)) add('requires', f.id)
      const inc = arr(f.data.abilityIncrease).map(rec)
      const got = inc.length === 0 ? undefined : inc[0].choose !== undefined ? { choose: strs(inc[0].from) } : { fixed: [str(inc[0].ability), Number(inc[0].amount)] }
      const want = x.asi
      const gotChoose = (got as { choose?: string[] } | undefined)?.choose
      if (want?.choose ? !(gotChoose && sameSet(gotChoose, want.choose)) : canon(want ?? null) !== canon(got ?? null)) add('asi', f.id)
    }
    rec2.stat('a14', 'phbFeats', phb.length)
    rec2.stat('a14', 'feats', l.of('feat').length)
    // 程序读不了的前置条件：只有 text 的
    const unreadable = l.of('feat').filter((f) => [...arr(rec(f.data.requires).all), ...arr(rec(f.data.requires).any)].map(rec).some((q) => Object.keys(q).length === 1 && 'text' in q)).map((f) => f.id)
    // 一项里写了多个属性的前置（不知道是“且”还是“或”）
    const ambiguous = l.of('feat').filter((f) => [...arr(rec(f.data.requires).all), ...arr(rec(f.data.requires).any)].map(rec).some((q) => Object.keys(rec(q.ability)).length > 1)).map((f) => f.id)
    if (unreadable.length) rec2.find({ id: 'a14-requires-text', check: 'a14', kind: 'data-defect', fixSource: 'self-structure', entries: unreadable, expected: '5etools 原始前置条件（种族列表）、XGE 专长小节', note: '种族前置只写成纯文字“race.xxx 或 race.yyy”，程序读不出；应写成 race 列表放进 any' })
    if (ambiguous.length) rec2.find({ id: 'a14-ability-ambiguous', check: 'a14', kind: 'decision', fixSource: 'decision', entries: ambiguous, expected: '各专长原文', note: '一项前置里写了多个属性（如力量 13 与敏捷 13），没有约定是“且”还是“或”' })
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a14-phb-${k}`, check: 'a14', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: 'PHB 第 6 章专长', note: k === 'requires' ? 'PHB 专长的前置条件与书不符' : 'PHB 专长的属性提升与书不符' })
    expect(rec2.settle()).toEqual([])
  })
})
