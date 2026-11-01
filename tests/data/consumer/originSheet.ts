import { expandPool } from './expand'
import type { Lib, Row } from './load'
import { arr, rec, ShapeError, shape, str, strs, uniq } from './util'

/** 种族（含亚种合并）、背景、专长的读取器。亚种读法：属性加值相加；体型、速度取亚种；黑暗视觉取较大者；语言、熟练取并集。 */
export interface RaceSheet {
  abilities: Record<string, number>
  abilityChoose?: [number, number]
  size: string[]
  walk: number
  speeds: Record<string, number>
  darkvision: number
  langFixed: string[]
  langChoose: number
  skillsFixed: string[]
  skillChoose: number
  weaponsFixed: string[]
  armorFixed: string[]
  toolsFixed: string[]
  toolChoose: number
}

function oneRace(r: Row): RaceSheet {
  const d = r.data
  const ab = rec(d.abilityBonus)
  const out: RaceSheet = { abilities: {}, size: strs(d.size), walk: 0, speeds: {}, darkvision: 0, langFixed: [], langChoose: 0, skillsFixed: [], skillChoose: 0, weaponsFixed: [], armorFixed: [], toolsFixed: [], toolChoose: 0 }
  for (const [k, v] of Object.entries(rec(ab.fixed))) out.abilities[k] = Number(v)
  if (ab.choose !== undefined) { const c = rec(ab.choose); shape(typeof c.amount === 'number' && typeof c.count === 'number', `${r.id} 自选属性加值形状不对`); out.abilityChoose = [c.amount, c.count] }
  for (const [k, v] of Object.entries(rec(d.speed))) { if (typeof v === 'number') out.speeds[k] = v; else shape(typeof v === 'boolean', `${r.id} 速度 ${k} 形状不对`) }
  out.walk = out.speeds.walk ?? 0
  for (const s of arr(d.senses).map(rec)) if (s.type === 'darkvision') out.darkvision = Math.max(out.darkvision, Number(s.range))
  const lang = rec(d.languages)
  out.langFixed = strs(lang.fixed)
  out.langChoose = typeof lang.choose === 'number' ? lang.choose : Number(rec(lang.choose).count ?? 0)
  const p = rec(d.proficiencies)
  const group = (k: string): Record<string, unknown> => rec(p[k])
  out.skillsFixed = strs(group('skills').fixed)
  out.skillChoose = Number(rec(rec(group('skills').choose)).count ?? 0)
  out.weaponsFixed = strs(group('weapons').fixed)
  out.armorFixed = strs(group('armor').fixed)
  out.toolsFixed = strs(group('tools').fixed)
  out.toolChoose = Number(rec(rec(group('tools').choose)).count ?? 0)
  return out
}

export function readRace(l: Lib, id: string, subraceId?: string): RaceSheet {
  const base = oneRace(l.need(id))
  if (!subraceId) return base
  const sub = l.need(subraceId)
  shape(str(sub.data.parentRace) === id, `${subraceId} 的 parentRace 不是 ${id}`)
  const s = oneRace(sub)
  const abilities = { ...base.abilities }
  for (const [k, v] of Object.entries(s.abilities)) abilities[k] = (abilities[k] ?? 0) + v
  return {
    abilities,
    abilityChoose: s.abilityChoose ?? base.abilityChoose,
    size: s.size.length ? s.size : base.size,
    walk: s.walk || base.walk,
    speeds: { ...base.speeds, ...s.speeds },
    darkvision: Math.max(base.darkvision, s.darkvision),
    langFixed: uniq([...base.langFixed, ...s.langFixed]),
    langChoose: Math.max(base.langChoose, s.langChoose),
    skillsFixed: uniq([...base.skillsFixed, ...s.skillsFixed]),
    skillChoose: base.skillChoose + s.skillChoose,
    weaponsFixed: uniq([...base.weaponsFixed, ...s.weaponsFixed]),
    armorFixed: uniq([...base.armorFixed, ...s.armorFixed]),
    toolsFixed: uniq([...base.toolsFixed, ...s.toolsFixed]),
    toolChoose: base.toolChoose + s.toolChoose,
  }
}

/** 背景与种族等的 trait 授予：grants 是固定给的记号，choices 是“从池里选 N 个”。展开成具体值。 */
export interface TraitReading { fixed: string[]; choices: Array<{ count: number; values: string[]; ambiguous?: string }> }
export function readTraits(l: Lib, row: Row): TraitReading {
  const out: TraitReading = { fixed: [], choices: [] }
  for (const a of arr(row.data.advancement).map(rec)) {
    if (a.kind !== 'trait') continue
    for (const g of strs(a.grants)) out.fixed.push(...expandPool(l, [g]).values)
    for (const c of arr(a.choices).map(rec)) {
      if (typeof c.count !== 'number') throw new ShapeError(`${row.id} 选项的 count 不是数字`)
      const e = expandPool(l, strs(c.pool))
      out.choices.push({ count: c.count, values: e.values, ambiguous: e.ambiguous })
    }
  }
  return out
}
