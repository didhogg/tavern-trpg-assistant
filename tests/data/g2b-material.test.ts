import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { has5etools, raw5e } from './consumer/ref5etools'
import { apiSpells, hasApi } from './consumer/refApi'
import { arr, fold, rec, str } from './consumer/util'

/** 材料成分（b11）：价格（铜币）与是否消耗。独立来源：5etools 原始数据 + 材料文字里的 “XXXgp”（自洽）+ 5e API 的 material 文字（SRD）。 */
const GP = /(\d[\d,]*)\s*(gp|金币)/i

describe('G2b 材料成分（b11）', () => {
  it('写着价值的材料成分：价格与是否消耗', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-material')
    const withM = l.of('spell').filter((s) => rec(s.data.components).m !== undefined)
    rec2.stat('b11', 'spellsWithMaterial', withM.length)
    const valued = withM.filter((s) => GP.test(str(rec(rec(s.data.components).m).text)))
    rec2.stat('b11', 'materialTextMentionsGp', valued.length)
    const noCost = valued.filter((s) => rec(rec(s.data.components).m).cost === undefined)
    const noConsumed = valued.filter((s) => rec(rec(s.data.components).m).consumed === undefined && /耗材|消耗|耗尽|摧毁|消失/.test(str(rec(rec(s.data.components).m).text)))
    rec2.find({ id: 'b11-cost-missing', check: 'b11', kind: 'data-defect', fixSource: 'import-5etools', entries: noCost.map((s) => `${s.id} ${s.name}：${str(rec(rec(s.data.components).m).text).slice(0, 40)}`), expected: '5etools 原始数据 components.m.cost（铜币）；材料文字里的价值', note: '材料写着价值（如 25gp 的银粉），components.m.cost 是空的；背包扣除材料、判断买不买得起都读不到价格', selfCheck: true })
    rec2.find({ id: 'b11-consumed-missing', check: 'b11', kind: 'data-defect', fixSource: 'import-5etools', entries: noConsumed.map((s) => `${s.id} ${s.name}`), expected: '5etools 原始数据 components.m.consume；材料文字（“作为耗材”）', note: '材料文字写着会被消耗，components.m.consumed 是空的', selfCheck: true })
    if (has5etools()) {
      const raw = new Map<string, Record<string, unknown>>()
      for (const f of ['phb', 'xge', 'tce', 'bmt']) for (const sp of arr(rec(raw5e(`spells/spells-${f}.json`)).spell).map(rec)) raw.set(fold(str(sp.ENG_name) || str(sp.name)), sp)
      let cost = 0
      let consume = 0
      let optional = 0
      let mismatch: string[] = []
      for (const s of valued) {
        const m = rec(rec(raw.get(fold(s.nameEn ?? ''))?.components).m)
        if (typeof m.cost === 'number') {
          cost++
          // 原始价格是铜币：与材料文字里的 gp 数核对（自洽）
          const gp = Number(GP.exec(str(rec(rec(s.data.components).m).text))?.[1].replace(/,/g, ''))
          if (Number.isFinite(gp) && m.cost !== gp * 100 && !/每|每个|各|一对|一双|两/.test(str(rec(rec(s.data.components).m).text))) mismatch.push(`${s.id} ${s.name} 原始=${m.cost}cp 文字=${gp}gp`)
        }
        if (m.consume === true) consume++
        if (m.consume === 'optional') optional++
      }
      rec2.stat('b11', 'sourceHasCost', cost)
      rec2.stat('b11', 'sourceConsumes', consume)
      rec2.stat('b11', 'sourceConsumesOptional', optional)
      mismatch = mismatch.slice(0, 50)
      rec2.stat('b11', 'sourceCostVsTextMismatch', mismatch.length)
      if (mismatch.length) rec2.find({ id: 'b11-source-cost-vs-text', check: 'b11', kind: 'source-defect', fixSource: 'decision', entries: mismatch, expected: '材料文字里的价值（PHB 原文）', note: '5etools 的价格与材料文字里的 gp 数不一致（常见于“每个目标一份”“每环一份”这类按单位计价的）；需逐个对照原书' })
    }
    if (hasApi()) {
      const api = new Map(Object.values(apiSpells()).map((a) => [fold(a.name), a]))
      // SRD 材料文字里有 gp 的，数据的材料文字也要有 gp（核对材料文字本身没有丢）
      const lost = valued.filter((s) => { const a = api.get(fold(s.nameEn ?? '')); return a?.material && !GP.test(a.material) })
      rec2.stat('b11', 'srdMaterialWithoutGpButDataHasGp', lost.length)
    }
    expect(valued.length).toBeGreaterThan(50)
    expect(rec2.settle()).toEqual([])
  })
})
