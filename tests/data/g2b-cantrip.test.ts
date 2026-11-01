import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiSpells, hasApi } from './consumer/refApi'
import { arr, fold, rec } from './consumer/util'

const flat = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : '')

describe('G2b 戏法成长（b9）', () => {
  it('SRD 戏法逐等级伤害与 5e API 一致；写着 5/11/17 级成长的戏法都有结构', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-cantrip')
    const cantrips = l.of('spell').filter((s) => s.data.level === 0)
    const scaled = cantrips.filter((s) => s.data.cantripScaling !== undefined)
    rec2.stat('b9', 'cantrips', cantrips.length)
    rec2.stat('b9', 'withScaling', scaled.length)
    if (hasApi()) {
      const api = new Map(Object.values(apiSpells()).map((a) => [fold(a.name), a]))
      const bad: string[] = []
      let compared = 0
      for (const s of cantrips) {
        const a = api.get(fold(s.nameEn ?? ''))
        const want = a?.damage?.find((d) => d.damage_at_character_level)?.damage_at_character_level
        if (!want || a?.index === 'eldritch-blast') continue // API 把魔能爆写成各级都是 1d10，实际是射线数增加
        const sc = arr(Array.isArray(s.data.cantripScaling) ? s.data.cantripScaling : [s.data.cantripScaling]).map(rec)[0]
        compared++
        const got = rec(sc?.scaling) as Record<string, string>
        for (const lv of ['1', '5', '11', '17']) if (got[lv] !== want[lv]) { bad.push(`${s.id} ${s.name} ${lv}级 数据=${got[lv] ?? '无'} API=${want[lv]}`); break }
      }
      rec2.stat('b9', 'comparedWithApi', compared)
      if (bad.length) rec2.find({ id: 'b9-cantrip-vs-api', check: 'b9', kind: 'data-defect', fixSource: 'self-structure', entries: bad, expected: '5e API damage_at_character_level（SRD 戏法）；PHB 原文', note: '戏法逐等级伤害与 API 不一致（魔能爆 API 自己写成每级都是 1d10，实际是射线数增加，不在此列）' })
    }
    // 文字里写着“5 级 / 11 级 / 17 级”的戏法，应当有成长结构
    const textual = cantrips.filter((s) => s.data.cantripScaling === undefined && /5\s*级/.test(flat(s.data.text) + flat(s.data.higherLevel)) && /11\s*级/.test(flat(s.data.text) + flat(s.data.higherLevel)) && /17\s*级/.test(flat(s.data.text) + flat(s.data.higherLevel)))
    if (textual.length) rec2.find({ id: 'b9-cantrip-scaling-missing', check: 'b9', kind: 'data-defect', fixSource: 'self-structure', entries: textual.map((s) => `${s.id} ${s.name}`), expected: '各戏法原文（5、11、17 级成长）', note: '文字写着 5/11/17 级成长，数据没有 cantripScaling（魔能爆是射线数 1/2/3/4 道，不是骰数）', selfCheck: true })
    expect(rec2.settle()).toEqual([])
  })
})
