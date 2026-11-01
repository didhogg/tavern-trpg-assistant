import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { foundryUses, hasFoundry } from './consumer/refFoundry'
import { arr, fold, rec, str } from './consumer/util'

function textOf(blocks: unknown): string {
  const out: string[] = []
  const walk = (v: unknown): void => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(blocks)
  return out.join('\n')
}

describe('G2a 使用次数 uses 审计（a18）', () => {
  it('uses 的恢复时机与条目自己的文字一致（自洽检查）', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-uses-text')
    const withUses = [...l.of('feature'), ...l.of('feat')].filter((r) => r.data.uses !== undefined)
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    // 人工核对（逐个读过条目文字）：这些 uses 是合理的，不算问题
    // 奥术回想“每日一次”；幸运 3 点/长休；招牌法术 2 个/短休或长休；荒野形态与龙裔吐息武器本身就是次数池；
    // 传播鼓舞“次数等于魅力调整值，长休恢复”；活化表演每长休 1 次（另可用 3 环以上法术位重置）
    const LEGIT = new Set(['feature.wizard-arcane-recovery.phb', 'feat.lucky.phb', 'feature.wizard-signature-spells.phb', 'feature.druid-wild-shape.phb', 'feature.bard-college-of-eloquence-infectious-inspiration.tce', 'feature.bard-college-of-creation-animating-performance.tce'])
    // 人工核对结论：消耗另一个特性的次数池（自己不该再有一份 uses）
    const CONSUMES = new Set(['feat.dragon-fear.xge', 'feature.bard-college-of-eloquence-unsettling-words.tce', 'feature.bard-college-of-glamour-mantle-of-inspiration.xge', 'feature.bard-college-of-lore-cutting-words.phb', 'feature.bard-college-of-lore-peerless-skill.phb', 'feature.bard-college-of-swords-defensive-flourish.xge', 'feature.bard-college-of-swords-mobile-flourish.xge', 'feature.bard-college-of-swords-slashing-flourish.xge', 'feature.bard-college-of-whispers-psychic-blades.xge', 'feature.druid-circle-of-spores-symbiotic-entity.tce', 'feature.druid-circle-of-stars-starry-form.tce', 'feature.druid-circle-of-the-moon-elemental-wild-shape.phb', 'feature.druid-circle-of-wildfire-summon-wildfire-spirit.tce', 'feature.druid-wild-companion.tce'])
    // 人工核对结论：给另一个池恢复次数（激励之源、先发激励、有箭无患、不懈）
    const RESTORES = new Set(['feature.bard-font-of-inspiration.phb', 'feature.bard-superior-inspiration.phb', 'feature.fighter-arcane-archer-ever-ready-shot.xge', 'feature.fighter-samurai-tireless-spirit.xge'])
    // 人工核对结论：特殊资源（灵魂饰品：上限等于熟练加值，靠生物死亡获得），G2b 盘点时定写法
    const SPECIAL = new Set(['feature.rogue-phantom-tokens-of-the-departed.tce'])
    // 人工核对结论：本身没有次数限制（剑舞大师：使用剑舞时可以不消耗诗人激励，改掷 d6）
    const NO_LIMIT = new Set(['feature.bard-college-of-swords-masters-flourish.xge'])
    // 文字规则初筛：写着“消耗/花费某某的使用次数”
    const CONSUMES_OTHER = /(消耗|花费|使用)[^。]{0,22}(诗人激励|吟游激励|荒野形态|荒野形特性态|荒野变形|吐息武器|能力使用次数|斗战之魂|奥术射击)/
    for (const r of withUses) {
      // 龙裔各色“吐息武器”特性本身就是那个次数池（短休或长休恢复 1 次）
      if (LEGIT.has(r.id) || /breath-weapon/.test(r.id)) continue
      const u = rec(r.data.uses)
      const t = textOf(r.data.text)
      const mentionsLong = /长休/.test(t)
      const mentionsShort = /短休/.test(t)
      const label = `${r.id} ${r.name}`
      if (NO_LIMIT.has(r.id)) { add('no-support-in-text', label); continue }
      if (CONSUMES.has(r.id)) { add('consumes-other-pool', label); continue }
      if (RESTORES.has(r.id)) { add('restores-other-pool', label); continue }
      if (SPECIAL.has(r.id)) { add('special-resource', label); continue }
      // 初筛命中、但还没人工核对过的：单独列出，提醒核对
      if (CONSUMES_OTHER.test(t) || /重获一次使用次数|获得一次使用次数/.test(t)) { add('unreviewed-pool-mention', label); continue }
      if (u.recharge === 'long' && !mentionsLong) add('no-support-in-text', label)
      else if (u.recharge === 'shortOrLong' && !mentionsShort) add('no-support-in-text', label)
      else if (u.recharge === undefined || u.recharge === null) add('no-recharge', label)
    }
    rec2.stat('a18', 'entriesWithUses', withUses.length)
    const NOTE: Record<string, string> = { 'consumes-other-pool': '特性消耗的是另一个特性的次数池（诗人激励、荒野形态、吐息武器），自己又有一份 uses，会重复计数；应删 uses、加 consumes', 'restores-other-pool': '特性是给另一个池恢复次数（激励之源、先发激励、有箭无患、不懈），却被写成自己的 uses；应删 uses、加 restores', 'special-resource': '特殊资源（灵魂饰品：上限等于熟练加值，靠生物死亡获得），不是“每长休几次”', 'unreviewed-pool-mention': '文字提到别的池的次数，但还没人工核对', 'no-support-in-text': 'uses 的恢复时机在条目文字里找不到依据（已逐个读过文字：额外攻击、怒不畏死、狂醉乱舞、妖精漫游者魔法、剑舞大师等本身没有次数限制）', 'no-recharge': 'uses 没有恢复时机' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a18-${k}`, check: 'a18', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '条目自己的文字（自洽检查）；已人工逐个核对', note: NOTE[k], selfCheck: true })
    expect(rec2.settle()).toEqual([])
  })

  it('与 Foundry dnd5e 的 SRD 特性逐个对照（次数上限与恢复时机）', () => {
    if (!hasFoundry()) return
    const l = lib()
    const rec2 = new Recorder('g2a-uses-foundry')
    const fo = foundryUses()
    const byName = new Map<string, typeof l.rows>()
    for (const r of [...l.of('feature'), ...l.of('feat')]) {
      const k = fold(r.nameEn ?? '')
      byName.set(k, [...(byName.get(k) ?? []), r])
    }
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    let compared = 0
    // 人工核对结论：合理（Foundry 没写，但 PHB 原文确有次数）、需裁定（原文是递增难度/按目标计的限制，不是简单次数）
    const OK_EXTRA = new Set(['feat.lucky.phb', 'feature.wizard-signature-spells.phb'])
    const NEEDS_RULING = new Set(['feature.barbarian-relentless-rage.phb', 'feature.chains-of-carceri.phb'])
    for (const f of fo) {
      const rows = byName.get(fold(f.name))
      if (!rows?.length) continue
      compared++
      const label = `${f.name} ← ${rows.map((r) => r.id).join(' / ')}`
      const withUses = rows.filter((r) => r.data.uses !== undefined)
      if (!withUses.length) { add('missing-uses', label); continue }
      const okRecharge = withUses.some((r) => {
        const rc = str(rec(r.data.uses).recharge)
        if (f.periods.includes('lr') && !f.periods.includes('sr')) return rc === 'long'
        if (f.periods.includes('sr')) return rc === 'short' || rc === 'shortOrLong'
        return rc === 'special' || f.periods.length === 0
      })
      if (!okRecharge) add('recharge-differs', `${label} 数据=${withUses.map((r) => str(rec(r.data.uses).recharge)).join('/')} Foundry=${f.periods.join(',') || '无'}`)
      const num = /^\d+$/.test(f.max ?? '') ? Number(f.max) : undefined
      // 引导神力的次数随等级变（1/2/3），Foundry 用成长值，数据按等级拆成多个条目，不比
      if (num !== undefined && f.name !== 'Channel Divinity' && !withUses.some((r) => rec(r.data.uses).max === num)) add('max-differs', `${label} 数据=${withUses.map((r) => JSON.stringify(rec(r.data.uses).max)).join('/')} Foundry=${f.max}`)
    }
    // 数据有 uses、Foundry 同名特性却没有 uses（可能是误判的“宽松规则”）
    const foNames = new Map(fo.map((f) => [fold(f.name), f]))
    const allFoundryNames = new Set(foundryAllNames())
    const extra: string[] = []
    const ruling: string[] = []
    for (const r of l.of('feature')) {
      if (r.data.uses === undefined) continue
      const k = fold(r.nameEn ?? '')
      if (!(allFoundryNames.has(k) && !foNames.has(k)) || OK_EXTRA.has(r.id)) continue
      ;(NEEDS_RULING.has(r.id) ? ruling : extra).push(`${r.id} ${r.name}`)
    }
    rec2.stat('a18', 'foundryWithUses', fo.length)
    rec2.stat('a18', 'comparedByName', compared)
    const NOTE: Record<string, string> = { 'missing-uses': 'Foundry 的 SRD 特性有使用次数，数据里同名特性没有 uses', 'recharge-differs': '恢复时机与 Foundry 不同', 'max-differs': '次数上限与 Foundry 不同' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a18-foundry-${k}`, check: 'a18', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: 'Foundry dnd5e SRD 特性（并需对照 PHB 原文确认）', note: NOTE[k] })
    if (ruling.length) rec2.find({ id: 'a18-needs-ruling', check: 'a18', kind: 'decision', fixSource: 'decision', entries: ruling, expected: 'PHB 原文（坚韧狂暴：DC 递增，休息后重置；卡瑟利之链：对同一生物长休后才能再用）', note: '这两个特性的限制不是“每长休几次”：用 uses 表示会失真，需裁定写法' })
    if (extra.length) rec2.find({ id: 'a18-foundry-extra-uses', check: 'a18', kind: 'data-defect', fixSource: 'self-structure', entries: extra, expected: 'Foundry dnd5e SRD 特性（同名特性没有使用次数）；需对照 PHB 原文确认', note: '数据给了使用次数，Foundry 的同名特性没有，且已人工读过条目文字：这些特性本身没有次数限制，或消耗别的特性的次数池（额外攻击、书之魔契、术法复苏、地狱遗赠〔两个法术各一次却只有一份 uses〕、邪魔体魄、激励之源等）' })
    expect(rec2.settle()).toEqual([])
    void arr
  })
})

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
function foundryAllNames(): string[] {
  const root = join(process.cwd(), 'reference', 'dnd5e-6.1.x（开源VTT）', 'packs', '_source')
  const out: string[] = []
  const walk = (d: string): void => {
    for (const n of readdirSync(d)) {
      const p = join(d, n)
      if (statSync(p).isDirectory()) walk(p)
      else if (n.endsWith('.yml') && !n.startsWith('_')) { const m = /^name:\s*(.+)$/m.exec(readFileSync(p, 'utf8')); if (m) out.push(fold(m[1].replace(/^['"]|['"]$/g, ''))) }
    }
  }
  for (const f of ['classfeatures', 'races', 'subclasses']) if (existsSync(join(root, f))) walk(join(root, f))
  return out
}
