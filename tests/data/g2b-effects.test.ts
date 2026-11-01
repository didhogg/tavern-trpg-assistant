import { describe, expect, it } from 'vitest'
import { effectListSchema } from '../../src/rules/dnd5e2014/data/effects'
import { parseFormula, type FormulaAst } from '../../src/rules/dnd5e2014/data/formula'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str } from './consumer/util'

const STAT_FIELDS: Record<string, string[]> = { ac: ['amount'], speed: ['amount'], hpMax: ['perLevel', 'flat'], skill: ['amount'], damageBonus: ['amount'], attackBonus: ['amount'], saveDcBonus: ['amount'], spellAttackBonus: ['amount'], passive: ['bonus'] }
/** 条件状态、疾病的 `amount: 0` 是“速度变为 0”，不是占位 */
const SPEED_ZERO_OK = new Set(['condition', 'status', 'disease'])

function variables(ast: FormulaAst, out: Set<string>): void {
  if (ast.kind === 'variable') out.add(ast.name)
  else if (ast.kind === 'unary') variables(ast.value, out)
  else if (ast.kind === 'binary') { variables(ast.left, out); variables(ast.right, out) }
  else if (ast.kind === 'call') ast.args.forEach((a) => variables(a, out))
}
const SUPPORTED = /^(level|prof|cr|(str|dex|con|int|wis|cha)\.mod|scale\.[a-z0-9-]+|class\.[a-z0-9.-]+\.level)$/

describe('G2b 效果 effects（b2）', () => {
  it('效果合法；数值占位；条件可读；公式可算；说明文字里的派生数值', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-effects')
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    const scaleIds = new Set<string>()
    for (const r of l.rows) for (const a of arr(r.data.advancement).map(rec)) if (a.kind === 'scaleValue') scaleIds.add(str(a.id))
    let effects = 0
    let formulas = 0
    for (const r of l.rows) {
      const list = arr(r.data.effects).map(rec)
      if (list.length) {
        effects += list.length
        if (!effectListSchema.safeParse(r.data.effects).success) add('invalid', r.id)
      }
      for (const e of list) {
        const k = str(e.kind)
        for (const f of STAT_FIELDS[k] ?? []) if (e[f] === 0 && !(SPEED_ZERO_OK.has(r.type) && k === 'speed')) add('zero-placeholder', `${r.id} ${r.name}（${k}.${f}）`)
        for (const c of [...arr(rec(e.when).all), ...arr(rec(e.when).any)].map(rec)) if (Object.keys(c).length === 1 && 'text' in c) add('when-text', `${r.id} ${r.name}：${str(c.text)}`)
      }
      // 公式：效果里的 formula、perLevel/flat/amount 字符串，次数池的 max
      const strings: string[] = []
      for (const e of list) for (const f of ['formula', 'amount', 'perLevel', 'flat', 'bonus']) if (typeof e[f] === 'string') strings.push(e[f] as string)
      const u = rec(r.data.uses)
      if (typeof u.max === 'string') strings.push(u.max)
      for (const s of strings) {
        formulas++
        const p = parseFormula(s)
        if (!p.ok) { add('formula-unparsable', `${r.id} ${r.name}：${s}`); continue }
        const vars = new Set<string>()
        variables(p.ast, vars)
        for (const v of vars) {
          if (!SUPPORTED.test(v)) add('formula-unsupported-variable', `${r.id} ${r.name}：${s}（${v}）`)
          else if (v.startsWith('scale.') && !scaleIds.has(v.slice(6))) add('formula-scale-undefined', `${r.id} ${r.name}：${s}`)
        }
      }
    }
    rec2.stat('b2', 'effects', effects)
    rec2.stat('b2', 'formulas', formulas)
    rec2.stat('b2', 'scaleValues', scaleIds.size)
    // 说明文字（note）里的 Foundry 字段：分成“影响派生数值或暴击的”和“注法增强”
    const notes = l.rows.flatMap((r) => arr(r.data.effects).map(rec).filter((e) => e.kind === 'note' && str(e.text).startsWith('Foundry')).map((e) => ({ r, text: str(e.text) })))
    rec2.stat('b2', 'foundryNotes', notes.length)
    const derived = notes.filter((n) => /attributes\.ac\.calc|senses\.darkvision|senses\.special|attributes\.init|initiativeAdv|bonuses\.save|bonuses\.check|CriticalDamageDice|CriticalThreshold|armor\.magicalBonus/.test(n.text))
    const infusion = notes.filter((n) => /^Foundry 效果未映射：(name|system\.(properties|attunement|uses|magicalBonus|range))/.test(n.text))
    const companion = notes.filter((n) => /^Foundry 效果：(游侠|奇械师|德鲁伊)的领导力/.test(n.text))
    rec2.stat('b2', 'foundryNotes.derived', new Set(derived.map((n) => n.r.id)).size)
    rec2.stat('b2', 'foundryNotes.infusion', new Set(infusion.map((n) => n.r.id)).size)
    rec2.stat('b2', 'foundryNotes.companion', new Set(companion.map((n) => n.r.id)).size)
    const NOTE: Record<string, string> = {
      invalid: '效果不符合效果格式', 'zero-placeholder': '效果的数值是 0，其实是占位（Foundry 的公式没有解析出来）：亚种/专长/特性的速度加成、护甲加值、生命上限加成、技能加值等书上有具体数字',
      'when-text': '效果的触发条件只有文字（如“狂暴中”“未穿护甲”），程序判断不了', 'formula-unparsable': '公式解析失败', 'formula-unsupported-variable': '公式用到了公式引擎不认识的变量', 'formula-scale-undefined': '公式引用了不存在的成长数值',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `b2-${k}`, check: 'b2', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: k === 'zero-placeholder' ? '各特性/专长/物品原文（书上有具体数值）' : '公式引擎与格式定义', note: NOTE[k] })
    if (derived.length) rec2.find({ id: 'b2-derived-in-note', check: 'b2', kind: 'data-defect', fixSource: 'self-structure', entries: [...new Set(derived.map((n) => `${n.r.id} ${n.r.name}：${n.text.slice(0, 40)}`))], expected: '各特性原文', note: '影响派生数值的效果被留在说明文字里：龙脉术士的龙族韧性（AC 13+敏捷）、蜥蜴人的天生护甲、魔鬼视界/石之符文（黑暗视觉）、兔人的敏捷先攻、寒霜符文（力量/体质豁免与检定）、野蛮人的残暴重击（暴击额外骰）、冠军的强化重击（暴击范围）、觉知头盔（先攻优势）' })
    if (infusion.length) rec2.find({ id: 'b2-infusion-notes', check: 'b2', kind: 'decision', fixSource: 'decision', entries: [...new Set(infusion.map((n) => `${n.r.id} ${n.r.name}`))], expected: 'TCE 奇械师注法（Infusions）原文', note: '奇械师注法对物品的改动（改名、加属性、加次数、加魔法加值）只留了 Foundry 字段的说明文字；注法属于“给物品加东西”的独立系统，是否结构化由驾驶员决定（人物卡的奇械师可先用文字）' })
    if (companion.length) rec2.find({ id: 'b2-companion-boost', check: 'b2', kind: 'decision', fixSource: 'decision', entries: [...new Set(companion.map((n) => `${n.r.id} ${n.r.name}`))], expected: 'TCE 游侠/奇械师/德鲁伊的同伴条目原文', note: '同伴（野兽伙伴、钢铁守卫等）随主人职业等级变强的数值只在说明文字里；需要的话在 G2c（怪物与战斗）统一设计' })
    expect(rec2.settle()).toEqual([])
  })
})
