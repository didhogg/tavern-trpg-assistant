import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CLASS_EXPECT } from './consumer/expected/classes'
import { SLOT_TABLE, PACT } from './consumer/expected/slots'
import { asiLevels, englishOf, readEquipment, readGrants, readProficiencies, readSpellcasting, resolveItemName } from './consumer/classSheet'
import { Recorder } from './consumer/findings'
import { expandToken } from './consumer/expand'
import { lib } from './consumer/load'
import { fold, sameSet, sorted } from './consumer/util'

describe('G2a 职业：熟练、技能、起始装备（a1 a2 a3）', () => {
  it('与 PHB、TCE 逐项对照', () => {
    const l = lib()
    const rec = new Recorder('g2a-class-basic')
    const wrong = new Map<string, string[]>()
    const add = (key: string, id: string): void => { wrong.set(key, [...(wrong.get(key) ?? []), id]) }
    let checks = 0
    for (const [id, x] of Object.entries(CLASS_EXPECT)) {
      const c = l.need(id)
      const prof = readProficiencies(c)
      const eq = (key: string, ok: boolean): void => { checks++; if (!ok) add(key, id) }
      eq('hitDie', c.data.hitDie === x.die)
      eq('saves', sameSet(arr2(c.data.saves), x.saves))
      eq('armor', sameSet(prof.armor, x.armor))
      eq('weaponCats', sameSet(prof.weaponCats, x.weaponCats))
      eq('weaponNames', sameSet(prof.weaponIds.map((i) => englishOf(l, i)), x.weaponNames.map(fold)))
      eq('toolsFixed', sameSet(prof.toolIds.map((i) => englishOf(l, i)), x.toolsFixed.map(fold)))
      eq('toolsProse', (prof.toolProse.length > 0) === x.toolsChoiceProse)
      eq('skillChoose', prof.skillChoose === x.skillChoose)
      eq('skillFrom', x.skillFrom === 'any' ? prof.skillFrom.length === 18 : sameSet(prof.skillFrom, x.skillFrom))
      eq('subclassLevel', c.data.subclassLevel === x.subclassLevel)
      const eqp = readEquipment(c, 'startingEquipment')
      const choices = eqp.filter((b) => b.kind === 'choice').map((b) => b.options.length)
      const fixed = eqp.filter((b) => b.kind === 'fixed').reduce((n, b) => n + b.options[0].length, 0)
      eq('equipChoices', JSON.stringify(choices) === JSON.stringify(x.equipChoices))
      eq('equipFixed', fixed === x.equipFixed)
    }
    rec.stat('a1-a3', 'checks', checks)
    // 书上本来就是“自选…”的工具熟练（吟游诗人 3 种乐器、武僧 1 种工匠工具或乐器、奇械师 1 种工匠工具）：数据里只能是文字，读不成结构
    // 有结构（toolChoose）的不再算“只有文字”
    const prose = Object.keys(CLASS_EXPECT).filter((id) => { const p = readProficiencies(l.need(id)); return p.toolProse.length > 0 && !p.toolChoose })
    rec.find({ id: 'a2-tool-choice-prose', check: 'a2', kind: 'decision', fixSource: 'decision', entries: prose, expected: 'PHB 吟游诗人/武僧、TCE 奇械师的熟练项', note: '“自选 N 种乐器/工匠工具”这类工具选择只有文字，没有结构（类别 + 数量）；是否给它加结构由驾驶员决定' })
    const NOTE: Record<string, string> = {
      weaponCats: '武器熟练的类别与书不符',
      weaponNames: '具名武器熟练与书不符',
      toolsProse: '工具熟练里“自选…”只能是文字（吟游诗人、武僧、奇械师）',
      equipChoices: '起始装备二选一/三选一的选项数少于书上的（“任意简易/军用武器”“其它乐器”“法器”等类别选项整条丢失）',
      equipFixed: '起始装备固定给的物品比书上少（如圣徽、德鲁伊法器、任意简易武器）',
    }
    for (const [key, ids] of wrong) {
      const fixSource = key === 'weaponCats' ? 'decision' : key === 'toolsProse' ? 'self-structure' : 'self-structure'
      const kind = key === 'weaponCats' ? 'source-defect' : 'data-defect'
      rec.find({ id: `a1-${key}`, check: key.startsWith('equip') ? 'a3' : 'a1', kind, fixSource, entries: ids, expected: key === 'weaponCats' ? 'TCE 英文版第 2 章（奇械师只有简易武器；火器熟练是条件性的）' : 'PHB 各职业“装备/熟练项”小节、TCE 第 2 章', note: NOTE[key] ?? key })
    }
    expect(rec.settle()).toEqual([])
  })

  it('a3 起始装备（职业与背景）里的物品名：对得上条目的比例，对不上的逐项分类', () => {
    const l = lib()
    const rec = new Recorder('g2a-equip-names')
    let total = 0
    const unresolved: Array<{ name: string; where: string }> = []
    for (const [type, field] of [['class', 'startingEquipment'], ['background', 'equipment']] as const) {
      for (const r of l.of(type)) {
        for (const b of readEquipment(r, field)) for (const opts of b.options) for (const o of opts) {
          // 类别记号（任意简易武器、法器……）必须能展开成至少一件物品；不认识的记号 expandToken 会直接抛错
          if (o.category) expect(expandToken(l, o.category).values.length, `${r.id} 的类别记号 ${o.category}`).toBeGreaterThan(0)
          if (!o.name) continue
          total++
          // 带条目 id 的：id 必须是真实的物品；没带的才按名字找（没有 id = 自由文字物品）
          if (o.id !== undefined ? l.get(o.id)?.type !== 'item' : !resolveItemName(l, o.name)) unresolved.push({ name: o.name, where: r.id })
        }
      }
    }
    rec.stat('a3', 'items', total)
    rec.stat('a3', 'unresolved', unresolved.length)
    rec.stat('a3', 'unresolved.distinct', new Set(unresolved.map((u) => u.name)).size)
    // 人工核对（对照物品库逐个看过）：这些名字书上就是一件真实的普通物品，只是译名或写法不同，属于漏配
    const MISSED: Record<string, string> = { 纸张: '纸(每张)', 折叠的羊皮纸: '羊皮纸(每张)', 羽毛笔: '墨水笔', 一瓶黑色墨水: '墨水(1盎司/瓶)' }
    // 基础物品存在，但书上写的是带描述的版本（作弊骰子、标记过的扑克牌、虚构公爵的印章戒指）
    const DESCRIBED: Record<string, string> = { 虚构公爵的印章戒指: '玺戒', 一组作弊骰子: '骰子组', 一副标记过的扑克牌: '整副纸牌' }
    for (const itemName of [...Object.values(MISSED), ...Object.values(DESCRIBED)]) expect(l.of('item').some((r) => r.name === itemName), `物品库里没有 ${itemName}`).toBe(true)
    const pick = (m: Record<string, string>): string[] => unresolved.filter((u) => u.name in m).map((u) => `${u.where} ${u.name}`)
    const rest = unresolved.filter((u) => !(u.name in MISSED) && !(u.name in DESCRIBED))
    rec.find({ id: 'a3-missed-match', check: 'a3', kind: 'data-defect', fixSource: 'normalize', entries: pick(MISSED), expected: 'PHB 装备章物品表（纸、羊皮纸、墨水笔、墨水）', note: '起始装备里的物品书上就是物品库里的一件普通物品，只是名字对不上（漏配），应补条目编号' })
    rec.find({ id: 'a3-described', check: 'a3', kind: 'data-defect', fixSource: 'self-structure', entries: pick(DESCRIBED), expected: 'PHB 背景章（骗子、贵族）', note: '基础物品存在（骰子组、整副纸牌、玺戒），书上写的是带描述的版本；建议补条目编号并保留描述文字' })
    rec.find({ id: 'a3-free-text', check: 'a3', kind: 'data-defect', fixSource: 'self-structure', entries: rest.map((u) => `${u.where} ${u.name}`), expected: 'PHB、SCAG 背景章（信物、信件、地图、纹身、熏香、祭袍、经轮等描述性物品）', note: '物品库里没有对应物品，书上本来就是描述性文字；约定为“自由文字物品”，需加 free 标记' })
    expect(rec.settle()).toEqual([])
  })
})

function arr2(v: unknown): string[] { return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [] }
void join; void readFileSync; void sorted; void readGrants; void readSpellcasting; void asiLevels; void SLOT_TABLE; void PACT
