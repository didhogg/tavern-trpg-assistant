import { describe, expect, it } from 'vitest'
import { asiLevels, englishOf, readGrants, readProficiencies, readSpellcasting } from './consumer/classSheet'
import { CLASS_EXPECT } from './consumer/expected/classes'
import { ASI_BASE, ASI_EXTRA, MC_EXPECT } from './consumer/expected/multiclass'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiClasses, hasApi } from './consumer/refApi'
import { arr, fold, rec, sameSet, str } from './consumer/util'

const rows = (c: { data: Record<string, unknown> }): Array<{ level: number; values: string[] }> => arr(rec(c.data.table).rows).map((r) => ({ level: Number(rec(r).level), values: arr(rec(r).values).map(String) }))
const cols = (c: { data: Record<string, unknown> }): string[] => arr(rec(c.data.table).cols).map(String)
const dice = (o: unknown): string => `${rec(o).dice_count}d${rec(o).dice_value}`

describe('G2a 职业表各列（a6）', () => {
  it('每列 20 级都有值；职业专属列与 5e API 一致；法术列与施法数据一致', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-table')
    const api = hasApi() ? apiClasses() : undefined
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    let checks = 0
    const SPECIFIC: Record<string, (s: Record<string, unknown>) => string> = {
      狂暴次数: (s) => (Number(s.rage_count) >= 9999 ? '无限制' : String(s.rage_count)),
      狂暴伤害: (s) => `+${s.rage_damage_bonus}`,
      武艺: (s) => dice(s.martial_arts),
      气点: (s) => String(s.ki_points),
      无甲移动: (s) => (Number(s.unarmored_movement) ? `+${s.unarmored_movement}尺` : '—'),
      偷袭: (s) => dice(s.sneak_attack),
      术法点: (s) => String(s.sorcery_points),
    }
    for (const id of Object.keys(CLASS_EXPECT)) {
      const c = l.need(id)
      const r = rows(c)
      const names = cols(c)
      checks++
      if (names.length && (r.length !== 20 || r.some((x, i) => x.level !== i + 1 || x.values.length !== names.length || x.values.some((v) => v.trim() === '')))) add('cells', id)
      const key = id.split('.')[1]
      const lv = api?.levels[key]
      names.forEach((n, ci) => {
        const f = SPECIFIC[n]
        if (f && lv) { checks++; if (!r.every((x, i) => x.values[ci] === f(rec(lv[i].class_specific)))) add(`col-${n}`, id) }
      })
      // 法术相关列与同一条目的施法数据自洽
      const sc = readSpellcasting(c)
      if (sc) {
        names.forEach((n, ci) => {
          const m = /^每环法术位·(\d)环$/.exec(n)
          const vals = r.map((x) => x.values[ci])
          if (m && sc.slots.length) { checks++; if (!vals.every((v, i) => Number(v) === sc.slots[i][Number(m[1]) - 1])) add('slotCols', id) }
          if (n === '已知戏法') { checks++; if (!vals.every((v, i) => Number(v) === sc.cantrips[i])) add('cantripCol', id) }
          if (n === '已知法术') { checks++; if (!vals.every((v, i) => Number(v) === sc.known[i])) add('knownCol', id) }
        })
      }
    }
    // 魔契师的“法术位环阶”列写法不统一（有的“1环”，有的“5th”）
    const wl = rows(l.need('class.warlock.phb'))
    const ci = cols(l.need('class.warlock.phb')).indexOf('法术位环阶')
    const forms = new Set(wl.map((x) => (/^\d环$/.test(x.values[ci]) ? 'N环' : x.values[ci].replace(/\d/, 'N'))))
    rec2.stat('a6', 'checks', checks)
    rec2.stat('a6', 'warlock.slotLevel.forms', forms.size)
    if (forms.size > 1) rec2.find({ id: 'a6-warlock-slot-level-format', check: 'a6', kind: 'data-defect', fixSource: 'normalize', entries: ['class.warlock.phb'], expected: 'PHB 魔契师职业表（统一写“N 环”）', note: `魔契师职业表“法术位环阶”列的写法不统一：${[...forms].join('、')}` })
    const NOTE: Record<string, string> = { cells: '职业表缺行或有空格子', slotCols: '职业表的法术位列与施法数据不一致', cantripCol: '职业表的戏法列与施法数据不一致', knownCol: '职业表的已知法术列与施法数据不一致' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a6-${k}`, check: 'a6', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: k.startsWith('col-') ? '5e API 逐级表（class_specific）' : '职业表自洽（施法数据）', note: NOTE[k] ?? `职业表“${k.slice(4)}”列与 5e API 不一致`, selfCheck: !k.startsWith('col-') })
    expect(rec2.settle()).toEqual([])
  })
})

describe('G2a 属性值提升、兼职、逐级授予（a7 a8 a9）', () => {
  it('属性值提升等级与书一致', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-asi')
    const bad: string[] = []
    for (const id of Object.keys(CLASS_EXPECT)) {
      const want = [...ASI_BASE, ...(ASI_EXTRA[id] ?? [])].sort((a, b) => a - b)
      if (!sameSet(asiLevels(l, l.need(id)).map(String), want.map(String))) bad.push(id)
    }
    rec2.stat('a7', 'classes', Object.keys(CLASS_EXPECT).length)
    if (bad.length) rec2.find({ id: 'a7-asi', check: 'a7', kind: 'data-defect', fixSource: 'self-structure', entries: bad, expected: 'PHB 各职业表（4/8/12/16/19；战士另 6、14；游荡者另 10）', note: '属性值提升等级与书不符' })
    if (hasApi()) {
      const api = apiClasses()
      for (const id of Object.keys(CLASS_EXPECT)) {
        const lv = api.levels[id.split('.')[1]]
        if (!lv) continue
        const want = lv.flatMap((x, i) => (x.ability_score_bonuses > (i ? lv[i - 1].ability_score_bonuses : 0) ? [x.level] : []))
        expect(want, `${id} 的 ASI 等级与 5e API`).toEqual([...ASI_BASE, ...(ASI_EXTRA[id] ?? [])].sort((a, b) => a - b))
      }
    }
    expect(rec2.settle()).toEqual([])
  })

  it('兼职先决条件与兼职获得的熟练', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-multiclass')
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    for (const [id, x] of Object.entries(MC_EXPECT)) {
      const c = l.need(id)
      const mc = rec(c.data.multiclass)
      const req = rec(mc.requires)
      // 读法：all 里每一项都要满足；一项里写了多个属性时，按“全部要满足”读（没有别的约定）
      const reqs = arr(req.all).map(rec)
      const flat = reqs.flatMap((r) => Object.entries(rec(r.ability)).map(([a, n]) => [a, Number(n)] as [string, number]))
      const readAll = JSON.stringify([...flat].sort())
      const wantAll = JSON.stringify([...x.reqAll, ...x.reqAny].sort())
      if (x.reqAny.length === 0 ? readAll !== wantAll : !(flat.length === x.reqAny.length)) add('requires', id)
      else if (x.reqAny.length) { // 战士：书上是“或”，数据把两项写在一个对象里，没有约定它表示“或”
        if (reqs.length === 1 && Object.keys(rec(reqs[0].ability)).length === 2 && !('any' in req)) add('requires-or', id)
      }
      const p = readProficiencies(c, mc.proficiencies ?? {})
      const sk = rec(rec(mc.proficiencies).skills)
      if (!sameSet(p.armor, x.armor)) add('armor', id)
      if (!sameSet(p.weaponCats, x.weaponCats)) add('weaponCats', id)
      if (!sameSet(p.weaponIds.map((i) => englishOf(l, i)), x.weaponNames.map(fold))) add('weaponNames', id)
      if (Number(sk.choose ?? 0) !== x.skillChoose) add('skills', id)
      if (!sameSet(p.toolIds.map((i) => englishOf(l, i)), x.toolsFixed.map(fold))) add('toolsFixed', id)
      if ((p.toolProse.length > 0) !== x.toolsProse) add('toolsProse', id)
    }
    rec2.stat('a8', 'classes', Object.keys(MC_EXPECT).length)
    const NOTE: Record<string, string> = {
      requires: '兼职先决条件与书不符', 'requires-or': '战士兼职要求“力量 13 或 敏捷 13”写成了一个对象里的两个属性，没有约定它表示“或”；人物模块按“且”读会错判',
      armor: '兼职获得的护甲熟练与书不符', weaponCats: '兼职获得的武器类别熟练与书不符', weaponNames: '兼职获得的具名武器熟练与书不符', skills: '兼职获得的技能数与书不符', toolsFixed: '兼职获得的固定工具熟练与书不符', toolsProse: '兼职获得的工具（吟游诗人的一种乐器）只能是文字或缺失',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a8-${k}`, check: 'a8', kind: 'data-defect', fixSource: k === 'requires-or' ? 'decision' : 'self-structure', entries: ids, expected: 'PHB 第 6 章“兼职”（先决条件表、兼职熟练表）、TCE 奇械师', note: NOTE[k] })
    expect(rec2.settle()).toEqual([])
  })

  it('逐级授予：编号都存在；每级特性数与 5e API 一致', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-grants')
    const missing: string[] = []
    let n = 0
    for (const c of [...l.of('class'), ...l.of('subclass'), ...l.of('race'), ...l.of('subrace'), ...l.of('background'), ...l.of('feat')]) for (const g of readGrants(c)) for (const i of g.items) { n++; if (!l.get(i)) missing.push(`${c.id} → ${i}`) }
    rec2.stat('a9', 'grantedItems', n)
    if (missing.length) rec2.find({ id: 'a9-missing', check: 'a9', kind: 'data-defect', fixSource: 'self-structure', entries: missing, expected: '条目库', note: '授予的条目编号在库里不存在' })
    const mismatch: string[] = []
    if (hasApi()) {
      const api = apiClasses()
      for (const id of Object.keys(CLASS_EXPECT)) {
        const lv = api.levels[id.split('.')[1]]
        if (!lv) continue
        const grants = readGrants(l.need(id)).filter((g) => !g.optional)
        for (let i = 0; i < 20; i++) {
          const have = grants.filter((g) => g.level === i + 1).reduce((a, g) => a + g.items.length, 0)
          const want = (lv[i].features ?? []).length
          if (have !== want) mismatch.push(`${id} ${i + 1}级 数据${have} / API${want}`)
        }
      }
    }
    // 逐条对照过原书：下面 7 处全是两边“拆特性”的粒度不同，内容没有缺。
    // 牧师 1/3/5/7/9 级、圣武士 3 级：API 把“领域法术/誓言法术”单列成特性，数据里它们在子职业的 expandedSpells；
    // 游侠 6 级：数据把“宿敌”“天生探索者”两项增加合并成一个特性。
    const GRANULARITY = new Set(['class.cleric.phb 1级', 'class.cleric.phb 3级', 'class.cleric.phb 5级', 'class.cleric.phb 7级', 'class.cleric.phb 9级', 'class.paladin.phb 3级', 'class.ranger.phb 6级'])
    const unexplained = mismatch.filter((m) => !GRANULARITY.has(m.replace(/ 数据.*$/, '')))
    rec2.stat('a9', 'levelMismatch.explained', mismatch.length - unexplained.length)
    rec2.stat('a9', 'levelMismatch.unexplained', unexplained.length)
    if (unexplained.length) rec2.find({ id: 'a9-level-count', check: 'a9', kind: 'data-defect', fixSource: 'self-structure', entries: unexplained, expected: '5e API 各级特性列表（SRD 职业）', note: '某级授予的特性数与 5e API 不同，且不是已核对过的粒度差异' })
    expect(rec2.settle()).toEqual([])
    void str
  })
})
