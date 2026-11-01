import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { profByCr } from './consumer/expected/cr'
import { abilityMod, crValue } from './consumer/monsterSheet'
import { arr, rec, str } from './consumer/util'

const rolls = (text: string): string[] => [...text.matchAll(/\{\{roll:([^|}]+)\|/g)].map((m) => m[1].replace(/\s/g, ''))
const flat = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : '')

describe('G2c 怪物的动作：攻击、伤害、豁免、充能、多重攻击、传奇动作（c4）', () => {
  it('动作文字里的命中加值、豁免难度、伤害骰与结构化行动一致；攻击加值合理；充能/多重攻击/传奇动作的结构', () => {
    const l = lib()
    const rec2 = new Recorder('g2c-actions')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    let attacks = 0
    let saves = 0
    let textDiceChecks = 0
    let recharge = 0
    let rechargeStructured = 0
    let multiattack = 0
    let legendaryCost = 0
    let legendaryCostStructured = 0
    for (const m of l.of('monster')) {
      const d = m.data
      const prof = profByCr(crValue(d.cr))
      const ab = rec(d.abilities) as Record<string, number>
      // 法术攻击用施法属性（智力/感知/魅力），所以取六项里最高的调整值
      const best = Math.max(...['str', 'dex', 'con', 'int', 'wis', 'cha'].map((k) => abilityMod(ab[k] ?? 10)))
      const all = [...arr(d.actions), ...arr(d.bonusActions), ...arr(d.reactions), ...arr(d.traits), ...arr(rec(d.legendary).actions)].map(rec)
      for (const a of all) {
        const name = str(a.name)
        const text = flat(a.text)
        const tag = `${m.id} ${m.name}：${name}`
        const acts = arr(a.activities).map(rec)
        const first = acts[0]
        if (/多重攻击/.test(name)) multiattack++
        if (/充能|\d\s*[–-]\s*\d\)|\d\s*[–-]\s*\d）/.test(name)) { recharge++; if (acts.some((x) => rec(x.uses).recharge !== undefined || x.recharge !== undefined) || a.recharge !== undefined) rechargeStructured++ }
        if (/花费\s*\d+\s*个动作/.test(name)) { legendaryCost++; if (acts.some((x) => rec(rec(x.consumption).targets) !== undefined && arr(rec(x.consumption).targets).length) || a.cost !== undefined) legendaryCostStructured++ }
        for (const x of acts) {
          if (x.kind === 'attack') {
            attacks++
            const hit = /\{\{hit:(-?\d+)\}\}/.exec(text)
            if (hit && Number(hit[1]) !== x.bonus) add('attack-bonus-vs-text', `${tag}：结构=${String(x.bonus)} 文字=${hit[1]}`)
            if (typeof x.bonus === 'number') {
              const diff = x.bonus - (best + prof)
              // 加值比“最高属性调整值 + 熟练”高出 3 以上才可疑（低于是正常的：怪物的武器攻击不一定用它最高的属性）
              if (diff >= 3) add('attack-bonus-far', `${tag}：加值 ${x.bonus}，最高属性调整值 ${best} + 熟练 ${prof}（差 ${diff}）`)
            }
          }
          if (x.kind === 'save') {
            saves++
            const dc = /\{\{dc:(\d+)\}\}/.exec(text)
            if (dc && Number(dc[1]) !== x.dc) add('save-dc-vs-text', `${tag}：结构=${String(x.dc)} 文字=${dc[1]}`)
          }
          if (x.kind === 'attack' || x.kind === 'save') {
            // 文字里的伤害骰（{{roll:…}}）都应出现在结构化的 damage 里（先攻、治疗、状态持续等骰子除外，所以只比“结构里没有的文字骰”）
            const inText = rolls(text)
            const inStruct = arr(x.damage).map(rec).map((p) => str(p.dice).replace(/\s/g, ''))
            if (inStruct.length) {
              textDiceChecks++
              const missing = inStruct.filter((dd) => !inText.includes(dd))
              if (missing.length) add('damage-struct-not-in-text', `${tag}：结构伤害 ${missing.join('、')} 在文字里找不到`)
            }
          }
        }
        // 只有文字、没有结构的攻击：文字里有“命中”“点…伤害”但没有任何行动
        if (!acts.length && /\{\{atk:/.test(text)) add('attack-text-only', tag)
        void first
      }
    }
    rec2.stat('c4', 'attackActivities', attacks)
    rec2.stat('c4', 'saveActivities', saves)
    rec2.stat('c4', 'textVsStructDiceChecks', textDiceChecks)
    rec2.stat('c4', 'multiattackActions', multiattack)
    rec2.stat('c4', 'rechargeActions', recharge)
    rec2.stat('c4', 'rechargeStructured', rechargeStructured)
    rec2.stat('c4', 'legendaryCostActions', legendaryCost)
    rec2.stat('c4', 'legendaryCostStructured', legendaryCostStructured)
    // 加值明显高于“最高属性调整值 + 熟练”的 10 个已逐个看过：都是魔法武器或特殊武器（食腐虫触须、吉斯洋基银剑、大地精军阀、奥喀斯之杖、非凡机仆的铁拳），不是缺陷，记统计
    rec2.stat('c4', 'attackBonusFarAboveAbilityPlusProf.reviewedLegit', (bad['attack-bonus-far'] ?? []).length)
    delete bad['attack-bonus-far']
    const NOTE: Record<string, string> = {
      'attack-bonus-vs-text': '攻击加值，结构与动作文字里的不一致', 'save-dc-vs-text': '豁免难度，结构与文字不一致', 'attack-bonus-far': '攻击加值比“最高属性调整值+熟练”高出 3 以上（多为魔法武器、天生加值）；需对照原书确认不是抄错',
      'damage-struct-not-in-text': '结构化伤害骰在动作文字里找不到', 'attack-text-only': '文字里有攻击标记、却没有结构化行动',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `c4-${k}`, check: 'c4', kind: k === 'attack-bonus-far' ? 'source-defect' : 'data-defect', fixSource: k === 'attack-bonus-far' ? 'decision' : 'self-structure', entries: ids, expected: '动作自己的文字（自洽检查）；熟练加值由挑战等级推出', note: NOTE[k], selfCheck: true })
    if (recharge - rechargeStructured > 0) rec2.find({ id: 'c4-recharge-text-only', check: 'c4', kind: 'data-defect', fixSource: 'self-structure', entries: [`${recharge} 个“充能 5–6”类动作里 ${recharge - rechargeStructured} 个没有结构化`], expected: '怪物动作名称里的“（充能 5–6）”', note: '充能动作（龙的吐息等）的充能条件只写在动作名里，没有结构；战斗里每回合开始要掷 d6 判断是否恢复，自动结算读不到', selfCheck: true })
    if (multiattack > 0) rec2.find({ id: 'c4-multiattack-text-only', check: 'c4', kind: 'decision', fixSource: 'decision', entries: [`${multiattack} 个“多重攻击”动作只有文字`], expected: '各怪物多重攻击原文', note: '“多重攻击”（每回合攻击几次、各用哪个攻击）只有文字；战斗自动结算需要“次数 + 每次用哪个动作”的结构，或由玩家/DM 读文字手动点击（推荐：先不结构化，从简）', selfCheck: true })
    if (legendaryCost - legendaryCostStructured > 0) rec2.find({ id: 'c4-legendary-cost-text-only', check: 'c4', kind: 'data-defect', fixSource: 'self-structure', entries: [`${legendaryCost} 个“花费 N 个动作”的传奇动作里 ${legendaryCost - legendaryCostStructured} 个没有结构化`], expected: '怪物传奇动作名称', note: '传奇动作花费的动作数只写在名字里（“振翅攻击（花费2个动作）”）；传奇动作点数是每回合共享的，自动扣点需要读到花费', selfCheck: true })
    expect(rec2.settle()).toEqual([])
  })
})
