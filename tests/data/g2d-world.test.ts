import { describe, expect, it } from 'vitest'
import { SRD_PACK_ID, CORE_BOOKS as BOOKS } from '../../tools/data/config/books'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, refsIn, str, strs } from './consumer/util'
import { manifestOf } from './g1-snapshot'

describe('G2d 神祇、奖励、教派、背景描述补丁、修改版与包格式（d7 d8 d9 d11）', () => {
  it('神祇领域对应牧师子职业；神祇的扩展来源能找到', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-deity')
    const deities = l.of('deity')
    const cleric = l.of('subclass').filter((s) => s.data.classId === 'class.cleric.phb')
    const domainOf = (name: string): string => name.replace(/领域$/, '')
    const domains = new Set(deities.flatMap((d) => strs(d.data.domains)))
    rec2.stat('d7', 'deities', deities.length)
    rec2.stat('d7', 'distinctDomains', domains.size)
    rec2.stat('d7', 'clericSubclasses', cleric.length)
    const noSubclass = [...domains].filter((d) => !cleric.some((s) => domainOf(s.name) === d))
    const noDeity = cleric.filter((s) => !domains.has(domainOf(s.name)))
    rec2.stat('d7', 'domainsWithoutClericSubclass', noSubclass.length)
    rec2.stat('d7', 'clericSubclassesWithoutDeity', noDeity.length)
    const noDomain = deities.filter((d) => !strs(d.data.domains).length)
    // customExtensionOf: “名字|万神殿|书”
    const byKey = new Set(deities.map((d) => `${d.name}|${str(d.data.pantheon)}|${str(rec(d.data.src).book)}`))
    const ext = deities.filter((d) => d.data.customExtensionOf !== undefined)
    const unresolved = ext.filter((d) => !byKey.has(str(d.data.customExtensionOf)))
    rec2.stat('d7', 'deitiesWithExtension', ext.length)
    if (noSubclass.length) rec2.find({ id: 'd7-domain-without-subclass', check: 'd7', kind: 'data-defect', fixSource: 'self-structure', entries: noSubclass, expected: 'PHB、SCAG、XGE、TCE、DMG 牧师领域', note: '神祇的领域在牧师子职业里找不到对应领域' })
    if (noDomain.length) rec2.find({ id: 'd7-deity-without-domain', check: 'd7', kind: 'source-defect', fixSource: 'decision', entries: noDomain.map((d) => `${d.id} ${d.name}`), expected: 'SCAG、MTF 神祇表', note: '神祇没有领域（书上该神祇没有给领域）' })
    if (unresolved.length) rec2.find({ id: 'd7-extension-unresolved', check: 'd7', kind: 'data-defect', fixSource: 'self-structure', entries: unresolved.map((d) => `${d.id} ${d.name}：${str(d.data.customExtensionOf)}`), expected: '条目库', note: '神祇的“扩展自某神祇”指向的神祇在库里找不到（写法是“名字|万神殿|书”，没有结构化引用）' })
    rec2.find({ id: 'd7-domain-by-name', check: 'd7', kind: 'decision', fixSource: 'decision', entries: [`${domains.size} 个领域名全部能按“领域名 + 领域”对上牧师子职业，但对应关系是靠名字，没有编号`], expected: 'PHB 牧师（领域）、SCAG 神祇表', note: '神祇的领域是中文名（“知识”“战争”），牧师选神、选领域要按名字匹配；推荐：读取器按“领域名 + 领域”匹配即可，不加编号（14 个领域名固定）' })

    const rewards = l.of('reward')
    const cults = l.of('cult')
    rec2.stat('d8', 'rewards', rewards.length)
    rec2.stat('d8', 'cults', cults.length)
    const badSpell: string[] = []
    let grants = 0
    for (const r of rewards) for (const g of arr(r.data.spellGrants).map(rec)) { grants++; if (l.get(str(g.spell))?.type !== 'spell') badSpell.push(`${r.id} → ${str(g.spell)}`) }
    rec2.stat('d8', 'spellGrants', grants)
    const entryText = rewards.filter((r) => r.data.abilityEntry !== undefined)
    rec2.stat('d8', 'abilityEntryTextOnly', entryText.length)
    const sigPlain: string[] = []
    let sigSpells = 0
    for (const c of cults) {
      const s = str(c.data.signatureSpells)
      if (!s) continue
      const parts = s.split(/[,，]\s*/).filter(Boolean)
      sigSpells += parts.length
      const unlinked = parts.filter((p) => refsIn(p).length === 0)
      if (unlinked.length) sigPlain.push(`${c.id} ${c.name}：${unlinked.join('、')}`)
    }
    rec2.stat('d8', 'cultSignatureSpellMentions', sigSpells)
    if (badSpell.length) rec2.find({ id: 'd8-reward-spell-missing', check: 'd8', kind: 'data-defect', fixSource: 'self-structure', entries: badSpell, expected: '条目库', note: '奖励授予的法术不存在' })
    if (entryText.length) rec2.find({ id: 'd8-reward-ability-text', check: 'd8', kind: 'decision', fixSource: 'decision', entries: entryText.map((r) => `${r.id} ${r.name}：${JSON.stringify(r.data.abilityEntry).slice(0, 40)}`), expected: 'DMG 第 7 章 恩赐与护符', note: '奖励的属性提升只有文字（“力量或感知属性，或两者都获得最多+4的加值”），没有结构；8 个，推荐：不做，玩家看文字手动加' })
    if (sigPlain.length) rec2.find({ id: 'd8-cult-spells-plain', check: 'd8', kind: 'data-defect', fixSource: 'normalize', entries: sigPlain, expected: 'MPMM 魔王教派', note: '教派的招牌法术是一整段文字，部分法术没加链接' })
    expect(rec2.settle()).toEqual([])
  })

  it('背景描述补丁（d9）、修改版与包格式（d11）', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-lore')
    const lore = l.of('lore')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    const perTarget = new Map<string, number>()
    for (const r of lore) {
      const t = str(r.data.target)
      perTarget.set(t, (perTarget.get(t) ?? 0) + 1)
      const target = l.get(t)
      if (!target) add('lore-target-missing', `${r.id} → ${t}`)
      else if (!arr(r.data.lore).length && !arr(r.data.variants).length) add('lore-empty', r.id)
      else if (target.pack !== r.pack && !l.packOrder.includes(r.pack)) add('lore-pack', r.id)
    }
    rec2.stat('d9', 'lorePatches', lore.length)
    const types = new Map<string, number>()
    for (const r of lore) { const tt = l.get(str(r.data.target))?.type ?? '?'; types.set(tt, (types.get(tt) ?? 0) + 1) }
    for (const [k, n] of types) rec2.stat('d9', `target.${k}`, n)
    const multi = [...perTarget].filter(([, n]) => n > 1)
    rec2.stat('d9', 'targetsWithMultiplePatches', multi.length)
    // 补丁所在的包必须依赖目标所在的包（或就是同一个包），否则目标没装时补丁挂空
    const reqs = new Map(l.packOrder.map((p) => [p, new Set<string>()]))
    for (const id of l.packOrder) for (const r of manifestOf(id).requires) reqs.get(id)!.add(r)
    const closure = (id: string, seen = new Set<string>()): Set<string> => { for (const r of reqs.get(id) ?? []) if (!seen.has(r)) { seen.add(r); closure(r, seen) } return seen }
    for (const r of lore) { const t = l.get(str(r.data.target)); if (t && t.pack !== r.pack && !closure(r.pack).has(t.pack) && t.pack !== SRD_PACK_ID) add('lore-dependency', `${r.id}（${r.pack}）→ ${t.id}（${t.pack}）没有依赖关系`) }
    const NOTE: Record<string, string> = { 'lore-target-missing': '补丁的目标条目不存在', 'lore-empty': '补丁没有内容', 'lore-pack': '补丁所在的包不在已读到的包里', 'lore-dependency': '补丁所在的包没有依赖目标所在的包' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `d9-${k}`, check: 'd9', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '包格式说明 §3.2', note: NOTE[k], selfCheck: true })
    // d11 修改版（override）与包格式代际
    const overrides = l.rows.filter((r) => rec(r.data).override !== undefined)
    rec2.stat('d11', 'overrideEntries', overrides.length)
    const packs = [SRD_PACK_ID, ...BOOKS.map((b) => b.packId)]
    const versions = packs.map((p) => manifestOf(p).dataVersion)
    rec2.stat('d11', 'packs', packs.length)
    rec2.stat('d11', 'packsWithDataVersion3', versions.filter((v) => v === 3).length)
    rec2.find({ id: 'd11-no-override-or-old-sample', check: 'd11', kind: 'decision', fixSource: 'decision', entries: ['官方 11 个包都是 dataVersion 3，没有一个修改版（override）条目，也没有老格式（dataVersion < 3）的真实样例包'], expected: '包格式说明 §1、§3.3', note: '读取器对修改版和老格式包的读法只能按规则写、没有真实数据可测；这两种路径由 G1 的安装测试（g1-install）覆盖；人物模块读取时按 §3.3 处理：先取用户启用的修改版，没有则取原版。推荐：不新增数据，这条记为已知限制' })
    expect(rec2.settle()).toEqual([])
  })
})
