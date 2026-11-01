import { describe, expect, it } from 'vitest'
import { parseDice } from '../../src/rules/dice'
import { activitySchema } from '../../src/rules/dnd5e2014/data/activities'
import { parseFormula } from '../../src/rules/dnd5e2014/data/formula'
import { DAMAGE, ABILITIES } from './consumer/codes'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str } from './consumer/util'

/** 行动 activities（b4）与法术攻击/豁免难度（b10）：每个骰式项目自己的掷骰器读得了；伤害类型、豁免属性、难度写法、消耗对象都合法。 */
describe('G2b 行动（b4 b10）', () => {
  it('3,000 多条行动：骰式、伤害类型、豁免、难度、消耗', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-actions')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    const kinds: Record<string, number> = {}
    let total = 0
    let dice = 0
    // 行动可能嵌在怪物的动作、特质里：递归找出所有名为 activities 的数组
    const found = (v: unknown, out: Array<Record<string, unknown>>): Array<Record<string, unknown>> => {
      if (Array.isArray(v)) v.forEach((x) => found(x, out))
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (k === 'activities' && Array.isArray(x)) out.push(...x.map(rec)); else found(x, out) }
      return out
    }
    for (const r of l.rows) {
      for (const a of found(r.data, [])) {
        total++
        kinds[str(a.kind)] = (kinds[str(a.kind)] ?? 0) + 1
        const tag = `${r.id} ${str(a.name)}`
        if (!activitySchema.safeParse(a).success) add('invalid', tag)
        const parts = [...arr(a.damage), ...arr(a.parts)].map(rec)
        for (const p of parts) {
          dice++
          const d = str(p.dice)
          const res = parseDice(d)
          if (!res.ok) add('dice-unparsable', `${tag}：${d}`)
          if (!DAMAGE.includes(str(p.type))) add('damage-type', `${tag}：${str(p.type)}`)
        }
        if (a.kind === 'heal') {
          dice++
          const f = str(a.formula)
          // 治疗公式可以是骰式、公式，或两者混合（1d10+class.fighter.level）：把变量换成数字后，纯公式用公式引擎、含骰子的用掷骰器
          const plain = f.replace(/[A-Za-z_][A-Za-z0-9_-]*(\.[A-Za-z0-9_-]+)+/g, '3')
          const ok = /\d*d\d+/i.test(plain) ? parseDice(plain.replace(/\s+/g, '')).ok : parseFormula(plain).ok
          if (!ok) add('heal-formula', `${tag}：${f}`)
        }
        if (a.kind === 'save') {
          if (!ABILITIES.includes(str(a.ability))) add('save-ability', tag)
          if (typeof a.dc === 'string' && a.dc !== 'spell') { const p = parseFormula(a.dc); if (!p.ok) add('dc-formula', `${tag}：${a.dc}`) }
        }
        for (const t of arr(rec(a.consumption).targets).map(rec)) {
          const target = str(t.target)
          if (str(t.type) === 'resource' && target && !l.get(target)) add('consumption-target-missing', `${tag} → ${target}`)
        }
      }
    }
    rec2.stat('b4', 'activities', total)
    rec2.stat('b4', 'damageOrHealDice', dice)
    for (const [k, n] of Object.entries(kinds)) rec2.stat('b4', `kind.${k}`, n)
    // 法术攻击与豁免难度（b10）：法术的豁免动作难度写“spell”（按施法者），攻击动作的种类合法
    const spells = l.of('spell')
    let saves = 0
    let attacks = 0
    // 法术的豁免难度：写“spell”（按施法者）或固定数字（书上有固定难度的法术，如地震术 DC 20）
    for (const s of spells) for (const a of found(s.data, [])) {
      if (a.kind === 'save') { saves++; if (a.dc !== 'spell' && !Number.isInteger(a.dc)) add('spell-dc-form', `${s.id} ${str(a.name)}：${String(a.dc)}`) }
      if (a.kind === 'attack') { attacks++; if (!['ms', 'rs'].includes(str(a.attackKind))) add('spell-attack-kind', `${s.id} ${str(a.name)}：${str(a.attackKind)}`) }
    }
    rec2.stat('b10', 'spellSaveActivities', saves)
    rec2.stat('b10', 'spellAttackActivities', attacks)
    const NOTE: Record<string, string> = { invalid: '行动不符合行动格式', 'dice-unparsable': '骰式项目的掷骰器读不了', 'damage-type': '伤害类型不合法', 'heal-formula': '治疗骰式项目的掷骰器读不了（带“+ 调整值”之类的文字，应改成骰式加公式变量）', 'save-ability': '豁免属性不合法', 'dc-formula': '豁免难度的公式解析失败', 'consumption-target-missing': '行动消耗的资源是中文名字（卓越骰、奥术射击等），不是特性编号，指向不到资源池；应改成 consumes: { pool: 特性编号 }', 'spell-dc-form': '法术的豁免难度既不是“按施法者”也不是固定数字', 'spell-attack-kind': '法术攻击的种类不是法术攻击' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `b4-${k}`, check: k.startsWith('spell') ? 'b10' : 'b4', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '项目自己的掷骰器与格式定义', note: NOTE[k], selfCheck: true })
    expect(rec2.settle()).toEqual([])
  })
})
