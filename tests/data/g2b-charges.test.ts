import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { has5etools, raw5e } from './consumer/ref5etools'
import { arr, fold, rec, str } from './consumer/util'

/** 魔法物品充能（b7 / 资源与休息）：最大充能、恢复时机、恢复量；独立来源 5etools 原始物品数据。 */
describe('G2b 魔法物品充能', () => {
  it('充能物品的最大充能、恢复时机、恢复量与原始数据一致', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-charges')
    const items = l.of('item').filter((r) => r.data.charges !== undefined)
    rec2.stat('b7', 'itemsWithCharges', items.length)
    // 条目文字写明"充能耗尽就毁掉／变回普通物品"的，本来就不恢复，没有 recharge 是对的（防护圣甲虫、光彩夺目宝石、纯善／至恶护符；Foundry 开源数据对这几件同样没有恢复）
    const consumedAway = (r: { data: Record<string, unknown> }): boolean => /(最后一发充能|充能(?:耗尽|用尽)|耗尽(?:了)?(?:所有)?充能)[^。]{0,40}(摧毁|毁灭|化为|消散|变为|变回|溶解|碎裂)/.test(JSON.stringify(r.data.text ?? ''))
    const noRecharge = items.filter((r) => r.data.category !== 'family' && !rec(r.data.charges).recharge && !consumedAway(r))
    rec2.stat('b7', 'withoutRecharge', noRecharge.length)
    if (has5etools()) {
      const raw = new Map<string, Record<string, unknown>[]>()
      for (const f of ['items.json', 'items-base.json']) for (const it of arr(rec(raw5e(`${f}`)).item).map(rec)) {
        const k = fold(str(it.ENG_name) || str(it.name))
        raw.set(k, [...(raw.get(k) ?? []), it])
      }
      const bad: Record<string, string[]> = {}
      let compared = 0
      for (const r of items) {
        const cands = raw.get(fold(r.nameEn ?? '')) ?? []
        const src = cands.find((c) => c.charges !== undefined)
        if (!src) continue
        compared++
        const c = rec(r.data.charges)
        const label = `${r.id} ${r.name}`
        if (src.charges !== c.max) (bad['max'] ??= []).push(`${label} 数据=${String(c.max)} 原始=${String(src.charges)}`)
        const rr = str(src.recharge)
        if (rr && rr !== str(c.recharge) && !(rr === 'restLong' && c.recharge === 'long')) (bad['recharge'] ??= []).push(`${label} 数据=${str(c.recharge) || '无'} 原始=${rr}`)
        const amt = str(src.rechargeAmount).replace(/\{@dice ([^}]+)\}/g, '$1').replace(/\|.*$/, '')
        if (amt && !c.rechargeAmount) (bad['amount-missing'] ??= []).push(`${label} 原始=${amt}`)
      }
      rec2.stat('b7', 'comparedWithSource', compared)
      const NOTE: Record<string, string> = { max: '最大充能与原始数据不同', recharge: '恢复时机与原始数据不同（原始有黄昏、午夜等，数据只有黎明）', 'amount-missing': '原始数据有“黎明恢复 XdY”的恢复量，数据里 charges.rechargeAmount（字段已有）是空的；活动页“过一天”无法自动恢复充能' }
      for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `b7-charges-${k}`, check: 'b7', kind: 'data-defect', fixSource: 'import-5etools', entries: ids, expected: '5etools 原始物品数据（charges / recharge / rechargeAmount）', note: NOTE[k] })
    }
    // 全部充能物品：条目文字里写着“黎明恢复 XdY 点充能”的（自洽检查，覆盖原始数据里按名字对不上的那部分）
    const flat = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : '')
    const inText = items.filter((r) => !rec(r.data.charges).rechargeAmount && /(黎明|拂晓|黄昏|午夜)[^。]{0,24}(恢复|重获|回复)[^。]{0,12}(\d*d\d+|\d+点)/.test(flat(r.data.text)))
    rec2.stat('b7', 'amountInTextButNotInData', inText.length)
    if (inText.length) rec2.find({ id: 'b7-charges-amount-in-text', check: 'b7', kind: 'data-defect', fixSource: 'import-5etools', entries: inText.map((r) => `${r.id} ${r.name}`), expected: '条目自己的文字（自洽检查）与 5etools rechargeAmount', note: '文字写着每天恢复多少点充能，charges.rechargeAmount 是空的；字段已存在，填上即可', selfCheck: true })
    rec2.find({ id: 'b7-charges-no-recharge', check: 'b7', kind: 'data-defect', fixSource: 'self-structure', entries: noRecharge.map((r) => `${r.id} ${r.name}`), expected: 'DMG 各物品原文', note: '有充能但没有恢复时机（其中如星辰法袍、防护圣甲虫等书上就是“用完即止/不恢复”，需对照原书逐个确认）' })
    expect(rec2.settle()).toEqual([])
  })
})
