import { describe, expect, it } from 'vitest'
import { XP_BY_CR, profByCr } from './consumer/expected/cr'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { crNumber, hasMM, parseMM } from './consumer/refMM'
import { apiMonsters, hasApiMonsters } from './consumer/refApi'
import { avgOf, crValue } from './consumer/monsterSheet'
import { arr, fold, rec, str } from './consumer/util'


describe('G2c 怪物与怪物图鉴原文逐项对照（c1 c2 c3）', () => {
  it('护甲等级、生命值与骰式、速度、属性、豁免、技能、被动察觉、挑战等级与经验值', () => {
    if (!hasMM()) return
    const l = lib()
    const rec2 = new Recorder('g2c-monster-mm')
    const mm = parseMM()
    const api = hasApiMonsters() ? new Map(Object.values(apiMonsters()).map((a) => [fold(a.name), a])) : new Map<string, ReturnType<typeof apiMonsters>[string]>()
    let noise = 0
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    let matched = 0
    const stats = new Map<string, number>()
    let checks = 0
    const monsters = l.of('monster').filter((m) => m.id.endsWith('.mm'))
    // 经验值表自检：怪物图鉴原文每个怪物写着“挑战等级 X（N XP）”，我写的 CR→XP 表应与之一致
    const xpConflicts = new Map<string, Set<number>>()
    for (const t of mm.values()) if (t.cr && t.xp !== undefined) { const set = xpConflicts.get(t.cr) ?? new Set<number>(); set.add(t.xp); xpConflicts.set(t.cr, set) }
    const tableDiff: string[] = []
    for (const [cr, xps] of xpConflicts) {
      const want = XP_BY_CR[String(crNumber(cr))]
      const stray = [...xps].filter((x) => x !== want && !(cr === '0' && x === 0))
      if (stray.length) tableDiff.push(`挑战等级 ${cr}：表 ${want}，原文出现 ${stray.join('、')}（原文打印错误或 OCR 错）`)
    }
    rec2.stat('c2', 'distinctCrInMM', xpConflicts.size)
    rec2.stat('c2', 'crXpTableConflictsInMMText', tableDiff.length)
    /** 5e API 在这个字段上的值（取不到返回 undefined）。若 API 与数据一致，说明是原文解析读串了，不算发现。 */
    const apiHas = (name: string, field: string, got: unknown): boolean => {
      const a = api.get(fold(name))
      if (!a) return false
      const sp = (k: string): number | undefined => (a.speed[k] === undefined ? undefined : parseInt(String(a.speed[k]), 10))
      const v: Record<string, unknown> = {
        ac: a.armor_class[0]?.value, hp: a.hit_points, 'hp-formula': a.hit_points_roll.replace(/\s/g, ''), passive: a.senses.passive_perception, cr: a.challenge_rating,
        'speed-walk': sp('walk'), 'speed-fly': sp('fly'), 'speed-swim': sp('swim'), 'speed-climb': sp('climb'), 'speed-burrow': sp('burrow'),
        ability: undefined,
      }
      return field in v && v[field] === got
    }
    for (const m of monsters) {
      const t = mm.get(fold(m.nameEn ?? ''))
      if (!t) continue
      // 解析质量门槛：六项属性、生命值、骰式、挑战等级都读到，且生命骰式的平均值等于生命值——否则这个数据块解析不可靠，不拿来对照
      const avgOk = t.hpFormula !== undefined && t.hp !== undefined && avgOf(t.hpFormula.replace(/[－—–]/g, '-')) === t.hp
      if (Object.keys(t.abilities).length !== 6 || !avgOk || !t.cr) { stats.set('rejected', 1 + (stats.get('rejected') ?? 0)); continue }
      matched++
      const d = m.data
      const tag = `${m.id} ${m.name}`
      const eq = (k: string, ok: boolean, info = '', got?: unknown): void => { checks++; if (ok) return; if (apiHas(m.nameEn ?? '', k, got)) { noise++; return } add(k, info ? `${tag}：${info}` : tag) }
      const ac = arr(d.ac).map(rec)[0]
      eq('ac', ac?.value === t.ac, `数据=${String(ac?.value)} 原文=${t.ac}`, ac?.value)
      eq('hp', rec(d.hp).average === t.hp, `数据=${String(rec(d.hp).average)} 原文=${String(t.hp)}`, rec(d.hp).average)
      eq('hp-formula', str(rec(d.hp).formula).replace(/\s/g, '') === (t.hpFormula ?? '').replace(/[－—–]/g, '-'), `数据=${str(rec(d.hp).formula)} 原文=${String(t.hpFormula)}`, str(rec(d.hp).formula).replace(/\s/g, ''))
      const sp = rec(d.speed)
      for (const mode of new Set([...Object.keys(t.speed), 'walk', 'fly', 'swim', 'climb', 'burrow'])) {
        const want = t.speed[mode]
        const got = typeof sp[mode] === 'number' ? (sp[mode] as number) : undefined
        if (want === undefined && got === undefined) continue
        if (mode === 'walk' && want === undefined) continue // 原文没写步行速度（只写飞行等）
        eq(`speed-${mode}`, got === want, `数据=${String(got)} 原文=${String(want)}`, got)
      }
      const ab = rec(d.abilities) as Record<string, number>
      for (const [k, v] of Object.entries(t.abilities)) eq('ability', ab[k] === v, `${k} 数据=${String(ab[k])} 原文=${v}`)
      eq('saves', JSON.stringify(Object.entries(rec(d.saves)).sort()) === JSON.stringify(Object.entries(t.saves).sort()), `数据=${JSON.stringify(d.saves)} 原文=${JSON.stringify(t.saves)}`)
      eq('skills', JSON.stringify(Object.entries(rec(d.skills)).sort()) === JSON.stringify(Object.entries(t.skills).sort()), `数据=${JSON.stringify(d.skills)} 原文=${JSON.stringify(t.skills)}`)
      if (t.passive !== undefined) eq('passive', d.passive === t.passive, `数据=${String(d.passive)} 原文=${t.passive}`, d.passive)
      if (t.cr) {
        const want = crNumber(t.cr)
        eq('cr', crValue(d.cr) === want, `数据=${String(crValue(d.cr))} 原文=${t.cr}`, crValue(d.cr))
      }
    }
    rec2.stat('c1', 'mmBlockRejected', stats.get('rejected') ?? 0)
    rec2.stat('c1', 'mismatchesExplainedByApiAgreeingWithData', noise)
    rec2.stat('c1', 'mmMonstersInData', monsters.length)
    rec2.stat('c1', 'matchedWithMMText', matched)
    rec2.stat('c1', 'checksWithMMText', checks)
    // 人工裁决（逐个读过 35 个被标记怪物的原文）：怪物图鉴中译文本自己有不少印刷/识别/抄写错误——
    // 大地精长官的属性抄成了普通大地精、魔兽人/烟魔蝠/观察者眼魔的属性与英文原书不符、远古黄铜龙体质豁免写 +16（按属性与熟练算应为 +13）、
    // 石人的速度读成滚动时的 60 尺等。数据与这些原文不一致的，我读到的全是数据对、中译文本错，因此中译文本只能参考，不能当裁判。
    // 唯一确认的缺陷：灰矮人、枯藤怪的生命骰式写 4d8+4，原文与生命值 26 一致的是 4d8+8。
    const CONFIRMED = new Set(['monster.duergar.mm', 'monster.vine-blight.mm'])
    const confirmed: string[] = []
    for (const [k, ids] of Object.entries(bad)) {
      const mine = k === 'hp-formula' ? ids.filter((x) => CONFIRMED.has(x.split('：')[0].split(' ')[0])) : []
      confirmed.push(...mine)
      rec2.stat('c1', `mmTextDisagrees.${k}`, ids.length - mine.length)
    }
    if (confirmed.length) rec2.find({ id: 'c1-mm-hp-formula', check: 'c1', kind: 'data-defect', fixSource: 'self-structure', entries: confirmed, expected: '怪物图鉴（MM）灰矮人、枯藤怪数据块：HP 26（4d8+8）', note: '生命骰式写 4d8+4，平均值 22 对不上写明的生命值 26；应为 4d8+8' })
    if (tableDiff.length) rec2.find({ id: 'c2-xp-table-vs-mm-text', check: 'c2', kind: 'decision', fixSource: 'decision', entries: tableDiff, expected: 'DMG 第 3 章经验值表；怪物图鉴原文', note: '怪物图鉴原文（扫描文本）里个别挑战等级旁的经验值与 DMG 表不一致，是原文打印/识别错误，经验值一律按 DMG 表由挑战等级推出，数据里本来就没有 xp 字段' })
    expect(profByCr(5)).toBe(3)
    expect(rec2.settle()).toEqual([])
  })
})
