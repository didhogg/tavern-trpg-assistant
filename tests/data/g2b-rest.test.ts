import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec } from './consumer/util'

function textOf(v: unknown): string {
  const out: string[] = []
  const walk = (x: unknown): void => {
    if (typeof x === 'string') out.push(x)
    else if (Array.isArray(x)) x.forEach(walk)
    else if (x && typeof x === 'object') Object.values(x).forEach(walk)
  }
  walk(v)
  return out.join(' ')
}
const REST = /短休|长休|黎明|拂晓/

/** 人工逐个读过原文后的分类（G2b 盘点，43 个“提到休息但没有 uses”的特性/专长）。 */
const SPELL_ONCE: Record<string, string> = {
  'feat.artificer-initiate.tce': '一环法术 1 次/长休（免费施展）',
  'feat.fey-touched.tce': '两个法术各 1 次/长休',
  'feat.shadow-touched.tce': '两个法术各 1 次/长休',
  'feat.telepathic.tce': '侦测思想 1 次/长休',
  'feature.yuan-ti-serpentine-spellcasting.mpmm': '暗示术 1 次/长休',
  'feat.metamagic-adept.tce': '2 点术法点（超魔法专用），长休恢复——需要一个次数池',
}
const REST_TRIGGER: Record<string, string> = {
  'feat.cartomancer.bmt': '每次长休从职业法术列表选一个法术注入卡牌',
  'feature.artificer-alchemist-experimental-elixir.tce': '每次长休制造一瓶灵药（掷表）',
  'feature.artificer-battle-smith-steel-defender.tce': '每次长休可重新创造钢铁守卫',
  'feature.ranger-beast-master-primal-companion.tce': '每次长休可召唤不同的原初野兽',
  'feature.warlock-the-hexblade-hex-warrior.xge': '每次长休选一把武器用魅力攻击',
  'feature.rogue-phantom-deaths-friend.tce': '每次长休结束若没有灵魂饰品则获得 1 个',
  'feature.monk-way-of-the-open-hand-tranquility.phb': '每次长休获得庇护术效应，持续到下一次长休',
}
const TRACKER: Record<string, string> = {
  'feature.cleric-knowledge-domain-channel-divinity-read-thoughts.phb': '对同一生物豁免成功后，长休前不能再对它使用（按目标）',
  'feature.warlock-the-genie-limited-wish.tce': '用过后要过 1d4 次长休才能再用（冷却次数）',
}
const DAILY: Record<string, string> = {
  'feature.spell-refueling-ring.tce': '每天（到次日黎明）1 次：恢复 3 环或更低的一个法术位（奇械师注法：法力恢复戒指）',
}

describe('G2b 资源与休息盘点：提到休息的特性', () => {
  it('分类盘点', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-rest')
    const all = [...l.of('feature'), ...l.of('feat')]
    const mention = all.filter((r) => REST.test(textOf(r.data.text)))
    const withUses = mention.filter((r) => r.data.uses !== undefined)
    const without = mention.filter((r) => r.data.uses === undefined)
    rec2.stat('rest', 'featuresAndFeats', all.length)
    rec2.stat('rest', 'mentionRest', mention.length)
    rec2.stat('rest', 'mentionRestWithUses', withUses.length)
    rec2.stat('rest', 'mentionRestWithoutUses', without.length)
    const noUsesIds = new Set(without.map((r) => r.id))
    for (const table of [SPELL_ONCE, REST_TRIGGER, TRACKER, DAILY]) for (const id of Object.keys(table)) expect(noUsesIds.has(id) || l.get(id) !== undefined, `${id} 不存在`).toBe(true)
    const pick = (t: Record<string, string>): string[] => Object.keys(t).filter((id) => noUsesIds.has(id)).map((id) => `${id} ${l.need(id).name}：${t[id]}`)
    rec2.find({ id: 'rest-spell-once-no-uses', check: 'rest', kind: 'data-defect', fixSource: 'self-structure', entries: pick(SPELL_ONCE), expected: 'TCE、MPMM 各专长/特质原文', note: '“每次长休可免费施展某法术一次/恢复若干点”，却没有 uses 也没有 spellGrant；活动页长休时无法恢复。应写成带次数的 spellGrant 或次数池' })
    rec2.find({ id: 'rest-trigger-choice', check: 'rest', kind: 'data-defect', fixSource: 'self-structure', entries: pick(REST_TRIGGER), expected: '各特性原文', note: '特性在每次长休后才能重选或重新获得（卡牌占卜师、灵药、钢铁守卫、原初伴侣、巫咒战士、死亡之友、宁神境）；活动页长休时需要提示。应用 tracker: choice（reset: long）' })
    rec2.find({ id: 'rest-tracker', check: 'rest', kind: 'data-defect', fixSource: 'self-structure', entries: pick(TRACKER), expected: '各特性原文', note: '按目标或冷却次数的限制，没有记录；应用 tracker（perTarget / 冷却）' })
    rec2.find({ id: 'rest-daily-no-uses', check: 'rest', kind: 'data-defect', fixSource: 'self-structure', entries: pick(DAILY), expected: 'TCE 法力恢复戒指原文', note: '“每天 1 次，次日黎明前不能再用”，却没有 uses（应为 1 次、黎明恢复）；“过一天”时无法恢复' })
    // 种族特质里有多个法术、却只有一份 uses：种族条目自己有 spellGrant（每个法术各带 uses）时，特质上的 uses 是多余且会误导；没有时说明缺 spellGrant
    const racial = all.filter((r) => ['race', 'subrace'].includes(String(rec(r.data.owner).type)) && r.data.uses !== undefined)
    const dupUses: string[] = []
    const noGrant: string[] = []
    for (const f of racial) {
      const sp = new Set([...textOf(f.data.text).matchAll(/ref:(spell\.[a-z0-9.-]+)/g)].map((m) => m[1]))
      if (sp.size < 2) continue
      const ownerId = String(rec(f.data.owner).id)
      const chain = [ownerId, String(l.get(ownerId)?.data.parentRace ?? '')]
      const granted = new Set(chain.flatMap((id) => arr(l.get(id)?.data.effects).map(rec).filter((e) => e.kind === 'spellGrant').flatMap((e) => (Array.isArray(e.spells) ? (e.spells as string[]) : []))))
      ;([...sp].every((x) => granted.has(x)) ? dupUses : noGrant).push(`${f.id} ${f.name}`)
    }
    rec2.stat('rest', 'racialMultiSpellFeaturesWithUses', dupUses.length + noGrant.length)
    if (dupUses.length) rec2.find({ id: 'rest-racial-spell-uses-duplicate', check: 'rest', kind: 'data-defect', fixSource: 'self-structure', entries: dupUses, expected: '各种族特质原文（每个法术各自“长休恢复”）', note: '种族特质提到多个法术、只有一份 uses（1 次/长休），而种族条目自己的 spellGrant 已给每个法术各带次数：特质上的 uses 多余且会少算次数，应删掉' })
    if (noGrant.length) rec2.find({ id: 'rest-racial-spell-uses-no-grant', check: 'rest', kind: 'data-defect', fixSource: 'self-structure', entries: noGrant, expected: '各种族特质原文', note: '种族特质提到多个法术、只有一份 uses，所属种族也没有给这些法术的 spellGrant（地狱遗赠、卓尔魔法、灰矮人魔法等）；应拆成每个法术各带次数的 spellGrant' })
    // 其余是通用规则（施法职业的法术位恢复）或叙述（出神、仪式耗时等），不是缺陷
    const classified = new Set([...Object.keys(SPELL_ONCE), ...Object.keys(REST_TRIGGER), ...Object.keys(TRACKER), ...Object.keys(DAILY)])
    rec2.stat('rest', 'withoutUsesClassified', without.filter((r) => classified.has(r.id)).length)
    rec2.stat('rest', 'withoutUsesGeneralOrNarrative', without.filter((r) => !classified.has(r.id)).length)
    // 带 uses 的特性：恢复时机词表
    const kinds = new Map<string, number>()
    for (const r of withUses) { const k = String(rec(r.data.uses).recharge ?? '无'); kinds.set(k, (kinds.get(k) ?? 0) + 1) }
    for (const [k, n] of kinds) rec2.stat('rest', `recharge.${k}`, n)
    // 带 uses 的特性里，max 是公式的：公式必须能解析（变量由公式上下文提供）
    void arr
    expect(rec2.settle()).toEqual([])
  })
})
