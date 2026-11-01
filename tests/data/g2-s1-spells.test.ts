import { describe, expect, it } from 'vitest'
import { lib } from './consumer/load'
import { apiSpells, hasApi } from './consumer/refApi'
import { arr, fold, rec, str } from './consumer/util'

/** G2.5 第 1 站：从 5etools 导入的法术字段（升环、攻击类型、材料价格/消耗），用 5e API（SRD 法术）独立核对——不是用 5etools 核对 5etools。 */
describe('G2.5 第 1 站：法术导入与 5e API 一致', () => {
  const l = lib()
  const api = hasApi() ? Object.values(apiSpells()) : []
  const byName = new Map(api.map((a) => [fold(a.name), a]))
  const spells = l.of('spell')

  it('升环：每环的骰式与 API 的 damage_at_slot_level / heal_at_slot_level 逐环一致', () => {
    if (!api.length) return
    let compared = 0
    const wrong: string[] = []
    for (const s of spells) {
      const a = byName.get(fold(s.nameEn ?? ''))
      const ups = arr(s.data.upcast).map(rec)
      if (!a || !ups.length) continue
      for (const u of ups) {
        if (u.kind !== 'damage' && u.kind !== 'heal') continue
        const inc = /^(\d+)d(\d+)$/.exec(str(u.dice))
        const tables = u.kind === 'heal' ? [a.heal_at_slot_level] : (a.damage ?? []).filter((d) => !u.type || d.damage_type?.index === u.type).map((d) => d.damage_at_slot_level)
        for (const t of tables) {
          if (!t || !inc) continue
          const slots = Object.keys(t).map(Number).sort((x, y) => x - y)
          const first = /^(\d+)d(\d+)/.exec(t[String(slots[0])] ?? '')
          if (!first || first[2] !== inc[2]) continue
          const fits = (up: Record<string, unknown>): boolean => {
            const i2 = /^(\d+)d(\d+)$/.exec(str(up.dice))
            const st = typeof up.step === 'number' ? up.step : 1
            if (!i2 || i2[2] !== first[2]) return false
            return slots.every((slot) => { const want = `${Number(first[1]) + Number(i2[1]) * Math.floor((slot - slots[0]) / st)}d${i2[2]}`; const got = t[String(slot)] ?? ''; return got === want || got.startsWith(`${want} `) || got.split(' OR ').includes(want) })
          }
          compared++
          if (!ups.filter((x) => x.kind === u.kind).some(fits)) wrong.push(`${s.id}：没有任何升环项与 API 这一张表逐环一致`)
        }
      }
    }
    expect(compared).toBeGreaterThan(20)
    expect(wrong).toEqual([])
  })

  it('升环：note 一定带 auto:false 和原文；不会半结构化半文字', () => {
    for (const s of spells) {
      const ups = arr(s.data.upcast).map(rec)
      if (!ups.length) continue
      const notes = ups.filter((u) => u.kind === 'note')
      if (notes.length) {
        expect(ups.length, `${s.id}：note 不能和自动项混在一起`).toBe(1)
        expect(notes[0].auto).toBe(false)
        expect(str(notes[0].text), s.id).toBe(str(s.data.higherLevel))
      }
      expect(s.data.higherLevel, `${s.id}：有 upcast 就要保留 higherLevel 文字`).toBeDefined()
    }
  })

  it('攻击类型 attack：与 API 的 attack_type 一致；API 没有的不能有', () => {
    if (!api.length) return
    const wrong: string[] = []
    let n = 0
    for (const s of spells) {
      const a = byName.get(fold(s.nameEn ?? ''))
      if (!a) continue
      n++
      const want = a.attack_type === 'melee' ? 'ms' : a.attack_type === 'ranged' ? 'rs' : undefined
      if (s.data.attack === want) continue
      // API 漏标的（保护性结界、烈焰刀、灼热射线、驱散善恶……）：数据有 attack 时，法术自己的正文必须写着对应的“近战/远程法术攻击”
      const text = JSON.stringify(s.data.text)
      const ok = want === undefined && ((s.data.attack === 'ms' && /近战法术攻击/.test(text)) || (s.data.attack === 'rs' && /远程法术攻击/.test(text)))
      if (!ok) wrong.push(`${s.id}：数据 ${String(s.data.attack)}，API ${String(a.attack_type)}`)
    }
    expect(n).toBeGreaterThan(100)
    expect(wrong).toEqual([])
    expect(spells.filter((s) => s.data.attack !== undefined).length).toBeGreaterThan(30)
  })

  it('材料价格 cost（铜币）与 API 材料文字里的 gp 数一致', () => {
    if (!api.length) return
    const wrong: string[] = []
    let n = 0
    for (const s of spells) {
      const a = byName.get(fold(s.nameEn ?? ''))
      const gp = [...(a?.material ?? '').matchAll(/([\d,]+)\s*gp/gi)].map((m) => Number(m[1].replace(/,/g, '')))
      // “每枚 50 gp 的戒指（两枚）”这类按件计价的，API 文字里的数不是总价，不比
      if (!a || gp.length !== 1 || /\beach\b/i.test(a.material ?? '')) continue
      n++
      const cost = rec(rec(s.data.components).m).cost
      if (cost !== gp[0] * 100) wrong.push(`${s.id}：数据 ${String(cost)}，API ${gp[0]} gp`)
    }
    expect(n).toBeGreaterThan(8)
    expect(wrong).toEqual([])
  })

  it('材料消耗 consumed：写了 consumed 就必有材料文字；cost 是非负整数', () => {
    for (const s of spells) {
      const m = rec(rec(s.data.components).m)
      if (m.consumed !== undefined) expect(str(m.text).length, s.id).toBeGreaterThan(0)
      if (m.cost !== undefined) expect(Number.isInteger(m.cost) && (m.cost as number) >= 0, s.id).toBe(true)
    }
  })
})
