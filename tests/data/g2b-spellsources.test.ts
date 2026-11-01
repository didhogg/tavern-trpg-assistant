import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiClasses, hasApi } from './consumer/refApi'
import { arr, rec, str, strs } from './consumer/util'

/** 施法的其他规则（b12–b14）：反应法术触发、仪式施法方式、法术来源（专长、物品、卷轴）、灵活施法表。 */
describe('G2b 施法的其他规则（b12 b13 b14）', () => {
  it('反应触发条件、仪式施法方式、灵活施法转换表、法术卷轴难度表', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-spellsources')
    // b12 反应法术都有触发条件
    const reaction = l.of('spell').filter((s) => arr(s.data.castTime).map(rec).some((c) => c.unit === 'reaction'))
    rec2.stat('b12', 'reactionSpells', reaction.length)
    const noCond = reaction.filter((s) => !arr(s.data.castTime).map(rec).some((c) => c.unit === 'reaction' && typeof c.condition === 'string'))
    if (noCond.length) rec2.find({ id: 'b12-reaction-condition', check: 'b12', kind: 'data-defect', fixSource: 'self-structure', entries: noCond.map((s) => s.id), expected: 'PHB 各反应法术“施法时间”', note: '反应施法缺触发条件' })
    // b13 仪式施法：谁能仪式施法、从哪里（PHB 第 3 章各职业“仪式施法”）
    const RITUAL: Record<string, string | undefined> = { 'class.bard.phb': 'known', 'class.cleric.phb': 'prepared', 'class.druid.phb': 'prepared', 'class.wizard.phb': 'book', 'class.sorcerer.phb': undefined, 'class.warlock.phb': undefined, 'class.paladin.phb': undefined, 'class.ranger.phb': undefined, 'class.artificer.tce': 'prepared' }
    const badRitual = Object.entries(RITUAL).filter(([id, want]) => rec(l.need(id).data.spellcasting).ritual !== want).map(([id]) => id)
    if (badRitual.length) rec2.find({ id: 'b13-ritual', check: 'b13', kind: 'data-defect', fixSource: 'self-structure', entries: badRitual, expected: 'PHB 第 3 章各职业“仪式施法”、TCE 奇械师', note: '仪式施法方式与书不符（诗人：已知；牧师/德鲁伊/奇械师：已准备；法师：法术书；其余不能）' })
    // 灵活施法“生成法术位”表：1–5 环分别花 2/3/5/6/7 点（PHB 术士）；与 5e API 一致
    const tbl = rec(l.need('table.flexible-casting.phb').data)
    const rows = arr(tbl.rows).map(rec).map((r) => arr(r.cells).map(String))
    const want = [['1环', '2'], ['2环', '3'], ['3环', '5'], ['4环', '6'], ['5环', '7']]
    rec2.stat('b13', 'flexibleCastingRows', rows.length)
    if (JSON.stringify(rows) !== JSON.stringify(want)) rec2.find({ id: 'b13-flexible-casting', check: 'b13', kind: 'data-defect', fixSource: 'self-structure', entries: ['table.flexible-casting.phb'], expected: 'PHB 术士“灵活施法”表；5e API creating_spell_slots', note: '术法点生成法术位表与书不符' })
    if (hasApi()) {
      const api = apiClasses().levels.sorcerer[19].class_specific as Record<string, Array<{ spell_slot_level: number; sorcery_point_cost: number }>>
      expect(api.creating_spell_slots.map((x) => [`${x.spell_slot_level}环`, String(x.sorcery_point_cost)])).toEqual(want)
    }
    // b14 法术卷轴：DMG 的法术卷轴表（戏法 13/+5；1 环 13/+5；2 环 13/+5；3–4 环 15/+7；5–6 环 17/+9；7–8 环 18/+10；9 环 19/+11）
    const scroll = rec(l.need('table.dmg-p139-r1').data)
    const srows = arr(scroll.rows).map(rec).map((r) => arr(r.cells).map((c) => String(c).trim()))
    const DC = ['13', '13', '13', '15', '15', '17', '17', '18', '18', '19']
    const ATK = ['+5', '+5', '+5', '+7', '+7', '+9', '+9', '+10', '+10', '+11']
    const wrongNums = srows.flatMap((r, i) => (r[2] !== DC[i] || r[3] !== ATK[i] ? [`${r[0]}：${r[2]}/${r[3]} 应为 ${DC[i]}/${ATK[i]}`] : []))
    rec2.stat('b14', 'scrollTableRows', srows.length)
    if (wrongNums.length) rec2.find({ id: 'b14-scroll-numbers', check: 'b14', kind: 'data-defect', fixSource: 'self-structure', entries: wrongNums, expected: 'DMG 法术卷轴表', note: '法术卷轴的豁免 DC / 攻击加值与书不符' })
    const badWords = srows.flatMap((r) => [...(r[1] === '通用语' ? [`${r[0]} 稀有度写成“通用语”（应为“普通”）`] : []), ...(/^\dth$/.test(r[0]) ? [`${r[0]} 环阶写成英文序数（应为“N环”）`] : [])])
    if (badWords.length) rec2.find({ id: 'b14-scroll-labels', check: 'b14', kind: 'data-defect', fixSource: 'normalize', entries: badWords, expected: 'DMG 法术卷轴表', note: '法术卷轴表里把稀有度 Common 译成“通用语”（那是语言），环阶有的写成 6th/7th/8th' })
    // 物品附带法术：编号都是法术；充能表的键是数字
    const items = l.of('item').filter((r) => r.data.attachedSpells !== undefined)
    rec2.stat('b14', 'itemsWithAttachedSpells', items.length)
    const KEYS = new Set(['charges', 'daily', 'limited', 'ability', 'will', 'other', 'rest', 'restLong', 'recharge', 'resource', 'ritual', 'spells'])
    const badItem: string[] = []
    let atLevel = 0
    for (const r of items) {
      const a = rec(r.data.attachedSpells)
      for (const k of Object.keys(a)) if (!KEYS.has(k)) badItem.push(`${r.id}：未登记的写法 ${k}`)
      const ids: string[] = []
      // 写法 `spell.fireball.phb#5` 表示“以 5 环施放”（物品里的固定环级）；编号部分去掉 #N 再检查
      const walk = (v: unknown): void => { if (typeof v === 'string' && v.startsWith('spell.')) { ids.push(v.replace(/#\d+$/, '')); if (/#\d+$/.test(v)) atLevel++ } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk) }
      walk(a)
      for (const id of ids) if (l.get(id)?.type !== 'spell') badItem.push(`${r.id} → ${id}`)
      for (const k of Object.keys(rec(a.charges))) if (!/^\d+$/.test(k)) badItem.push(`${r.id}：充能表的键 ${k} 不是数字`)
    }
    rec2.stat('b14', 'attachedSpellsCastAtFixedLevel', atLevel)
    if (badItem.length) rec2.find({ id: 'b14-attached-spells', check: 'b14', kind: 'data-defect', fixSource: 'self-structure', entries: badItem, expected: '条目库与格式', note: '物品附带法术的编号不是法术，或写法没登记', selfCheck: true })
    // 专长给法术但要玩家选的部分没有结构（魔法学徒：选职业，2 个戏法 + 1 个 1 环法术……）
    const FEAT_CHOICE = ['feat.magic-initiate.phb', 'feat.ritual-caster.phb', 'feat.spell-sniper.phb', 'feat.artificer-initiate.tce', 'feat.fey-touched.tce', 'feat.shadow-touched.tce']
    const noPool = FEAT_CHOICE.filter((id) => l.get(id) && !arr(l.need(id).data.advancement).map(rec).some((a) => arr(a.choices).length > 0 || a.kind === 'itemChoice'))
    rec2.find({ id: 'b14-feat-spell-choice', check: 'b14', kind: 'data-defect', fixSource: 'self-structure', entries: noPool.map((id) => `${id} ${l.need(id).name}`), expected: 'PHB、TCE 各专长原文', note: '专长要玩家“选职业、选 2 个戏法和 1 个法术”（或选一个学派的 1 环法术），数据里没有选项池：建卡时无法弹出选择。需要一种“从某职业法术表选 N 个某环法术”的选项池写法' })
    void str; void strs
    expect(rec2.settle()).toEqual([])
  })
})
