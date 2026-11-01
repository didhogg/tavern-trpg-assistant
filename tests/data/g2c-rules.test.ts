import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str } from './consumer/util'

/** 规则速查（c11）：PHB 第 9 章战斗里的动作、掩护、休息、坠落等是否都能找到；动作类规则有没有行动结构；怪物重印旧版（c8）。 */
const ACTIONS: Record<string, string> = { attack: '攻击', 'cast-a-spell': '施展法术', dash: '疾走', disengage: '撤离', dodge: '闪避', help: '协助', hide: '躲藏', ready: '准备', search: '搜索', 'use-an-object': '使用物件', grapple: '擒抱', shove: '推撞', 'opportunity-attack': '借机攻击' }
const QUICKREF = ['cover', 'resting', 'falling', 'suffocating', 'hiding']

describe('G2c 规则速查与版本标记（c11 c8）', () => {
  it('战斗动作、速查条目齐全；怪物重印版本标记的目标存在且无环', () => {
    const l = lib()
    const rec2 = new Recorder('g2c-rules')
    const missing: string[] = []
    const noAct: string[] = []
    for (const [id, name] of Object.entries(ACTIONS)) {
      const r = l.get(`rule.${id}.phb`)
      if (!r) { missing.push(`rule.${id}.phb ${name}`); continue }
      if (!arr(r.data.activities).length) noAct.push(`${r.id} ${r.name}`)
    }
    for (const q of QUICKREF) if (!l.get(`rule.quickref-${q}.phb`) && !l.get(`rule.quickref-${q}.xge`)) missing.push(`rule.quickref-${q}`)
    // 闪避、准备在规则里是否存在（书上是 6 个标准动作之一）
    rec2.stat('c11', 'rules', l.of('rule').length)
    rec2.stat('c11', 'actionRules', l.of('rule').filter((r) => r.data.category === 'action').length)
    rec2.stat('c11', 'quickrefRules', l.of('rule').filter((r) => r.data.category === 'quickref').length)
    rec2.stat('c11', 'rulesWithActivities', l.of('rule').filter((r) => arr(r.data.activities).length > 0).length)
    if (missing.length) rec2.find({ id: 'c11-rule-missing', check: 'c11', kind: 'data-defect', fixSource: 'self-structure', entries: missing, expected: 'PHB 第 9 章（战斗）动作列表与速查', note: '战斗动作或速查条目在库里找不到' })
    rec2.find({ id: 'c11-rule-action-text-only', check: 'c11', kind: 'decision', fixSource: 'decision', entries: noAct, expected: 'PHB 第 9 章', note: '攻击、施展法术、借机攻击、使用物件这类动作规则没有行动结构（疾走、撤离、协助、躲藏、搜索、擒抱、推撞有）：战斗里的“动作栏”按钮要靠它们；缺的只是文字速查，推荐保持文字（从简）' })
    // c8 版本标记
    const sup = l.rows.filter((r) => r.data.supersededBy !== undefined)
    rec2.stat('c8', 'supersededBy', sup.length)
    rec2.stat('c8', 'versionGroup', l.rows.filter((r) => r.data.versionGroup !== undefined).length)
    const missingTarget = sup.filter((r) => !l.get(str(r.data.supersededBy)))
    const cycles = sup.filter((r) => rec(l.get(str(r.data.supersededBy))?.data).supersededBy === r.id)
    const selfRef = sup.filter((r) => r.data.supersededBy === r.id)
    // 跨类型是合理的重印：MPMM 把 MTF 的亚种改成独立种族（subrace → race）、把魔鬼恩赐并进魔王教派（reward → cult）；其他跨类型才算问题
    const OK_CROSS = new Set(['subrace>race', 'reward>cult'])
    const crossType = sup.filter((r) => { const t = l.get(str(r.data.supersededBy)); return t && t.type !== r.type && !OK_CROSS.has(`${r.type}>${t.type}`) })
    // 链：A→B→C，选择器默认隐藏旧版时要走到最终版本
    const chain = sup.filter((r) => l.get(str(r.data.supersededBy))?.data.supersededBy !== undefined)
    rec2.stat('c8', 'chainedSupersession', chain.length)
    if (missingTarget.length) rec2.find({ id: 'c8-target-missing', check: 'c8', kind: 'data-defect', fixSource: 'self-structure', entries: missingTarget.map((r) => r.id), expected: '条目库', note: '重印旧版的“新版”条目不存在' })
    if (cycles.length || selfRef.length) rec2.find({ id: 'c8-cycle', check: 'c8', kind: 'data-defect', fixSource: 'self-structure', entries: [...cycles, ...selfRef].map((r) => r.id), expected: '条目库', note: '重印版本标记成环或指向自己' })
    if (crossType.length) rec2.find({ id: 'c8-cross-type', check: 'c8', kind: 'data-defect', fixSource: 'self-structure', entries: crossType.map((r) => r.id), expected: '条目库', note: '重印旧版指向了不同类型的条目' })
    expect(rec2.settle()).toEqual([])
  })
})
