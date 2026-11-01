import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiSpells, hasApi, type ApiSpell } from './consumer/refApi'
import { arr, fold, rec, str, strs } from './consumer/util'

const lowestSlot = (m: Record<string, string> | undefined): string | undefined => (m ? m[Object.keys(m).sort((a, b) => Number(a) - Number(b))[0]] : undefined)
const norm = (s: string): string => s.replace(/\s+/g, '').toLowerCase()

function castKey(a: ApiSpell): string {
  const m = /^(\d+) (bonus action|reaction|action|minute|hour)s?/.exec(a.casting_time)
  if (!m) return `?${a.casting_time}`
  return `${m[1]} ${m[2] === 'bonus action' ? 'bonus' : m[2]}`
}
function durKey(a: ApiSpell): string {
  const d = a.duration
  if (/^instantaneous/i.test(d)) return 'instant'
  if (/until dispelled/i.test(d)) return 'permanent'
  if (/^special/i.test(d)) return 'special'
  if (/\b24 hours\b/i.test(d)) return '1 day'
  const m = /(\d+) (round|minute|hour|day)s?/i.exec(d)
  return m ? `${m[1]} ${m[2].toLowerCase()}` : `?${d}`
}
function rangeKey(a: ApiSpell): string {
  const r = a.range
  if (/^special/i.test(r)) return 'special'
  if (/^self/i.test(r)) return 'self'
  if (/^touch/i.test(r)) return 'touch'
  if (/^sight/i.test(r)) return 'sight'
  if (/^unlimited/i.test(r)) return 'unlimited'
  const m = /^(\d+) (feet|mile)s?/i.exec(r)
  return m ? `${m[1]} ${m[2].toLowerCase() === 'mile' ? 'miles' : 'feet'}` : `?${r}`
}
/** API 的区域类型 → 数据里可能的写法 */
const AREA_TYPES: Record<string, string[]> = { sphere: ['radius', 'sphere', 'hemisphere'], cylinder: ['radius', 'cylinder'], cone: ['cone'], line: ['line'], cube: ['cube'] }
const SHAPES = ['cone', 'radius', 'line', 'cube', 'sphere', 'hemisphere']

describe('G2a 法术本身：SRD 法术与 5e API 逐项对照（a16）', () => {
  it('环级、学派、施法时间、射程、成分、持续时间、专注、仪式、职业、伤害、豁免', () => {
    if (!hasApi()) return
    const l = lib()
    const rec2 = new Recorder('g2a-spell')
    const api = apiSpells()
    const byName = new Map(l.of('spell').map((r) => [fold(r.nameEn ?? ''), r]))
    // SRD 把带人名的法术改了名（Acid Arrow = Melf's Acid Arrow 等）：数据名字以 SRD 名字结尾时视为同一个
    const ALIAS: Record<string, string> = { 'Arcane Hand': "Bigby's Hand", 'Arcane Sword': "Mordenkainen's Sword", "Arcanist's Magic Aura": "Nystul's Magic Aura" }
    const find = (n: string) => byName.get(fold(ALIAS[n] ?? n)) ?? [...byName].find(([k]) => k.endsWith(fold(n)) && k.length - fold(n).length <= 16)?.[1]
    const bad: Record<string, string[]> = {}
    const add = (k: string, id: string): void => { (bad[k] ??= []).push(id) }
    const missing: string[] = []
    let checks = 0
    for (const a of Object.values(api)) {
      const row = find(a.name)
      if (!row) { missing.push(a.name); continue }
      const d = row.data
      const tag = `${row.id}（${a.name}）`
      const eq = (k: string, ok: boolean, info = ''): void => { checks++; if (!ok) add(k, info ? `${tag} ${info}` : tag) }
      eq('level', d.level === a.level)
      // API 对这三个法术用了 2024 版的学派；PHB 中译原文（回生术=死灵，群体疗伤术、群体医疗术=塑能）与数据一致
      if (!['revivify', 'mass-cure-wounds', 'mass-heal'].includes(a.index)) eq('school', d.school === a.school.index, `数据=${str(d.school)} SRD=${a.school.index}`)
      eq('ritual', d.ritual === a.ritual)
      const dur = arr(d.duration).map(rec)
      eq('concentration', dur.some((x) => x.concentration === true) === a.concentration)
      const comp = rec(d.components)
      eq('components', (comp.v === true) === a.components.includes('V') && (comp.s === true) === a.components.includes('S') && (comp.m !== undefined) === a.components.includes('M'))
      const ct = rec(arr(d.castTime)[0])
      eq('castTime', `${ct.n} ${ct.unit}` === castKey(a))
      const dk = rec(dur[0])
      const rawDur = dk.type === 'timed' ? `${dk.amount} ${dk.unit}` : str(dk.type)
      const dataDur = rawDur === '24 hour' ? '1 day' : rawDur
      eq('duration', dataDur === durKey(a), `数据=${dataDur} SRD=${a.duration}`)
      const rg = rec(d.range)
      const isShape = SHAPES.includes(str(rg.type))
      const dataRange = rg.type === 'special' ? 'special' : isShape ? 'self' : rg.unit === 'self' || rg.unit === 'touch' || rg.unit === 'sight' || rg.unit === 'unlimited' ? str(rg.unit) : `${rg.amount} ${rg.unit}`
      eq('range', dataRange === rangeKey(a), `数据=${dataRange} SRD=${a.range}`)
      // 区域（球形、锥形等）：SRD 有而数据没有结构化的形状 → 区域缺失；有但大小/形状不符 → 区域不符。（API 对“自身半径”类法术常漏写区域，API 没写的不比）
      if (a.area_of_effect) {
        if (!isShape) add('area-missing', `${tag} SRD=${a.area_of_effect.type} ${a.area_of_effect.size}`)
        else eq('area', (AREA_TYPES[a.area_of_effect.type] ?? []).includes(str(rg.type)) && rg.amount === a.area_of_effect.size, `数据=${str(rg.type)} ${rg.amount} SRD=${a.area_of_effect.type} ${a.area_of_effect.size}`)
      }
      // 伤害：骰式和类型（法术位最低环 / 角色最低等级的值；API 写 “3d4 + 3” 这种逐箭值的不比骰式）
      // 伤害：API 里每种伤害类型都要出现在数据里，且（取法术位最低环/角色最低等级的值，逐箭值“3d4 + 3”不比）骰式一致
      for (const ad of (a.damage ?? []).filter((x) => x.damage_type)) {
        const dd = arr(d.damage).map(rec).find((x) => x.type === ad.damage_type?.index)
        eq('damage-type', dd !== undefined, `SRD 有 ${ad.damage_type?.index}`)
        const first = lowestSlot(ad.damage_at_slot_level) ?? lowestSlot(ad.damage_at_character_level)
        if (dd && first && !/\+/.test(first)) eq('damage-dice', norm(str(dd.dice)) === norm(first), `数据=${str(dd.dice)} SRD=${first}`)
      }
      if (a.dc) eq('save', strs(d.save).includes(a.dc.dc_type.index))
      // 攻击：数据里法术攻击写在 activities 里（kind=attack），没有单独的 attack 字段
      const atk = arr(d.activities).map(rec).find((x) => x.kind === 'attack')
      // 只查“SRD 有攻击、数据没有”这个方向（API 自己漏了烈焰刃、灼热射线、驱逐善恶的攻击）
      // 忠诚护卫犬的咬击是护卫犬自己的攻击，不是法术攻击，API 标成近战法术攻击不准确
      if (a.attack_type && a.index !== 'mordenkainens-faithful-hound' && a.name !== 'Faithful Hound') eq('attack', atk !== undefined, `数据=${atk ? str(atk.attackKind) : '无'} SRD=${a.attack_type}`)
    }
    rec2.stat('a16', 'srdSpells', Object.keys(api).length)
    rec2.stat('a16', 'matched', Object.keys(api).length - missing.length)
    rec2.stat('a16', 'checks', checks)
    const NOTE: Record<string, string> = { level: '环级不符', school: '学派不符', ritual: '仪式标记不符', concentration: '专注标记不符', components: '成分（V/S/M）不符', castTime: '施法时间不符', duration: '持续时间不符', range: '射程不符', 'damage-type': '伤害类型不符', 'damage-dice': '伤害骰式不符', save: '豁免属性不符', area: '区域形状或大小不符', 'area-missing': '数据里没有结构化的区域（球形/柱形/锥形等的大小只在文字里）', attack: '攻击类型不符' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `a16-${k}`, check: 'a16', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '5e API（SRD 法术，对应 PHB 第 11 章）', note: NOTE[k] ?? k })
    if (missing.length) rec2.find({ id: 'a16-missing', check: 'a16', kind: 'data-defect', fixSource: 'self-structure', entries: missing, expected: '5e API 法术目录', note: 'SRD 法术在库里找不到' })
    expect(rec2.settle()).toEqual([])
  })
})
