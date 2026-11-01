import { describe, expect, it } from 'vitest'
import { readSpellcasting } from './consumer/classSheet'
import { ARTIFICER_CANTRIPS, EK_AT_CANTRIPS, EK_AT_KNOWN, PREP } from './consumer/expected/known'
import { PACT, SLOT_TABLE } from './consumer/expected/slots'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiClasses, hasApi } from './consumer/refApi'
import { arr, rec } from './consumer/util'

const CASTERS: Record<string, string> = { 'class.bard.phb': 'full', 'class.cleric.phb': 'full', 'class.druid.phb': 'full', 'class.sorcerer.phb': 'full', 'class.wizard.phb': 'full', 'class.paladin.phb': 'half', 'class.ranger.phb': 'half', 'class.artificer.tce': 'artificer', 'class.warlock.phb': 'pact', 'subclass.fighter-eldritch-knight.phb': 'third', 'subclass.rogue-arcane-trickster.phb': 'third' }
const canon = (v: unknown): string => JSON.stringify(v, (_k, x: unknown) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x))
const eqArr = (a: number[], b: number[]): boolean => a.length === b.length && a.every((x, i) => x === b[i])

describe('G2a 施法职业：法术位、戏法数、已知法术、准备公式（a4 a5）', () => {
  it('我写的期望表自己先和 5e API 对一遍（SRD 职业），再用来核对数据', () => {
    if (!hasApi()) return
    const api = apiClasses()
    for (const [id, kind] of Object.entries(CASTERS)) {
      const key = id.split('.')[1]
      const lv = api.levels[key]
      if (!lv || kind === 'pact') continue
      for (let i = 0; i < 20; i++) expect(Array.from({ length: 9 }, (_, k) => lv[i].spellcasting?.[`spell_slots_level_${k + 1}`] ?? 0), `${key} ${i + 1} 级`).toEqual(SLOT_TABLE[kind][i])
    }
    const wl = api.levels.warlock
    for (let i = 0; i < 20; i++) {
      const sc = wl[i].spellcasting ?? {}
      const lvl = [1, 2, 3, 4, 5].find((k) => (sc[`spell_slots_level_${k}`] ?? 0) > 0) ?? 0
      expect([sc[`spell_slots_level_${lvl}`], lvl], `魔契师 ${i + 1} 级`).toEqual(PACT[i])
    }
  })

  it('法术位表、戏法数、已知法术数、准备公式与书一致', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-cast')
    const api = hasApi() ? apiClasses() : undefined
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    let checks = 0
    for (const [id, kind] of Object.entries(CASTERS)) {
      const c = l.need(id)
      const sc = readSpellcasting(c)
      if (!sc) { add('missing', id); continue }
      checks++
      if (kind === 'pact') {
        if (sc.pact.length !== 20 || !sc.pact.every((p, i) => p[0] === PACT[i][0] && p[1] === PACT[i][1])) add('slots', id)
      } else if (sc.slots.length !== 20 || !sc.slots.every((s, i) => eqArr(s, SLOT_TABLE[kind][i]))) add('slots', id)
      const key = id.split('.')[1]
      const lv = api?.levels[key]
      const wantCantrips = lv ? lv.map((x) => x.spellcasting?.cantrips_known ?? 0) : id === 'class.artificer.tce' ? ARTIFICER_CANTRIPS : EK_AT_CANTRIPS
      checks++
      const haveCantrips = sc.cantrips.length ? sc.cantrips : Array(20).fill(0) // 数据里没有“戏法数”表 = 没有戏法（圣武士、游侠）
      if (!eqArr(haveCantrips, wantCantrips)) add('cantrips', id)
      const noKnown = kind === 'full' && ['class.cleric.phb', 'class.druid.phb', 'class.wizard.phb'].includes(id)
      if (!noKnown && kind !== 'artificer' && !(kind === 'half' && id === 'class.paladin.phb')) {
        const wantKnown = lv ? lv.map((x) => x.spellcasting?.spells_known ?? 0) : EK_AT_KNOWN
        checks++
        if (!eqArr(sc.known, wantKnown)) add('known', id)
      }
      checks++
      const p = rec(c.data.spellcasting).preparation
      const want = PREP[id]
      if (canon(p ?? null) !== canon(want)) add('prep', id)
    }
    rec2.stat('a4-a5', 'checks', checks)
    const NOTE: Record<string, string> = { slots: '法术位表与书不符', cantrips: '戏法数与书不符', known: '已知法术数与书不符', prep: '准备法术的方式/公式与书不符', missing: '没有施法数据' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a4-${k}`, check: k === 'slots' ? 'a4' : 'a5', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '5e API（SRD 职业逐级表）、PHB 职业表、TCE 奇械师表', note: NOTE[k] })
    // 没有法术位表、却声称有施法的子职业
    const odd = l.of('subclass').filter((s) => { const x = rec(s.data.spellcasting); return typeof x.progression === 'string' && x.progression !== 'none' && arr(x.slotsByLevel).length === 0 && !(s.id in CASTERS) })
    rec2.find({ id: 'a4-progression-without-slots', check: 'a4', kind: 'data-defect', fixSource: 'self-structure', entries: odd.map((s) => `${s.id} progression=${rec(s.data.spellcasting).progression}`), expected: 'PHB 四象武僧（用气点施放元素戏法与法术，不按施法者法术位）、XGE 先祖守护者（没有施法）', note: '子职业带 spellcasting.progression=full，但没有法术位表；人物模块会误判成全施法者。先祖守护者本来就没有施法' })
    expect(rec2.settle()).toEqual([])
  })
})
