import type { ConvertContext } from './context'
import type { PlannedEntry } from './plan'
import { CLASS_RITUAL, CLASS_SCALE_COLUMNS, CLASS_SPELLBOOK, EXTRA_SCALES, THIRD_CASTER_SLOTS } from '../config/classRules'
import { str } from './common'

const ABILITIES = new Set(['str', 'dex', 'con', 'int', 'wis', 'cha'])

export interface SpellcastingRule {
  ability: string
  progression: 'full' | 'half' | 'third' | 'pact'
  preparation?: { mode: 'prepared' | 'known' | 'spellbook'; formula?: { ability: string; level: 'full' | 'half' | 'none'; min: number } }
  cantripsKnown?: number[]
  spellsKnown?: number[]
  slotsByLevel?: Array<{ level: number; slots: number[] } | { level: number; pact: { count: number; level: number } }>
  ritual?: 'book' | 'known' | 'prepared' | 'none'
  spellbook?: { start: number; perLevel: number }
  invocationsKnown?: number[]
  infusionsKnown?: number[]
  infusionsActive?: number[]
}

function progressionOf(value: string): 'full' | 'half' | 'third' | 'pact' {
  if (value === 'pact') return 'pact'
  if (value === '1/3') return 'third'
  if (value === '1/2' || value === 'artificer') return 'half'
  return 'full'
}

function number(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value.trim())) return Number(value)
  return undefined
}

function dice(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const cell = value as Record<string, unknown>
  if (cell.type !== 'dice' || !Array.isArray(cell.toRoll)) return undefined
  const parts = cell.toRoll.map((item) => {
    const d = item as Record<string, unknown>
    return `${Number(d.number ?? 1)}d${Number(d.faces ?? 0)}`
  })
  return parts.length ? parts.join('+') : undefined
}

function scaleCell(value: unknown): number | string | undefined {
  const n = number(value)
  if (n !== undefined) return n
  const d = dice(value)
  if (d) return d
  if (value && typeof value === 'object') {
    const cell = value as Record<string, unknown>
    if (cell.type === 'bonus' || cell.type === 'bonusSpeed') return Number(cell.value ?? 0)
  }
  if (typeof value === 'string') {
    if (value.includes('无限制')) return 999
    const n2 = number(value.replace(/^\+/, ''))
    if (n2 !== undefined) return n2
  }
  return undefined
}

function rowsOf(group: Record<string, unknown>): unknown[][] | undefined {
  const rows = group.rowsSpellProgression ?? group.rows
  if (!Array.isArray(rows) || rows.length !== 20) return undefined
  return rows as unknown[][]
}

function groups(raw: Record<string, unknown>): Array<Record<string, unknown>> {
  return Array.isArray(raw.classTableGroups) ? (raw.classTableGroups as Array<Record<string, unknown>>) : []
}

function slotsOf(raw: Record<string, unknown>, progression: 'full' | 'half' | 'third' | 'pact'): Array<{ level: number; slots: number[] } | { level: number; pact: { count: number; level: number } }> | undefined {
  if (progression === 'pact') {
    const group = groups(raw).find((g) => (Array.isArray(g.colLabels) ? g.colLabels.map(String).some((l) => l.includes('法术位环阶')) : false))
    if (!group) return undefined
    const labels = (group.colLabels as unknown[]).map(String)
    const countIndex = labels.findIndex((l) => l.includes('法术位') && !l.includes('环阶') && !l.includes('已知'))
    const levelIndex = labels.findIndex((l) => l.includes('法术位环阶'))
    const rows = rowsOf(group)
    if (!rows || countIndex < 0 || levelIndex < 0) return undefined
    return rows.map((row, i) => {
      const count = number(row[countIndex]) ?? 0
      const levelText = String(row[levelIndex] ?? '')
      const match = /level=(\d)/.exec(levelText) ?? /(\d)\s*环/.exec(levelText)
      return { level: i + 1, pact: { count, level: Number(match?.[1] ?? 1) } }
    })
  }
  const group = groups(raw).find((g) => {
    const rows = rowsOf(g)
    if (!rows) return false
    const labels = Array.isArray(g.colLabels) ? g.colLabels.map(String) : []
    return labels.some((l) => /1st|1环|1 环/.test(l)) || String(g.title ?? '').includes('法术位')
  })
  if (!group) {
    if (progression === 'third') return THIRD_CASTER_SLOTS.map((slots, i) => ({ level: i + 1, slots: [...slots, 0, 0, 0, 0, 0] }))
    return undefined
  }
  const rows = rowsOf(group)!
  return rows.map((row, i) => ({ level: i + 1, slots: [...row.map((v) => number(v) ?? 0), ...Array(9).fill(0)].slice(0, 9) }))
}

function numberList(raw: Record<string, unknown>, key: string): number[] | undefined {
  const list = raw[key]
  return Array.isArray(list) && list.length === 20 && list.every((v) => number(v) !== undefined) ? list.map((v) => Number(v)) : undefined
}

function namedColumn(raw: Record<string, unknown>, needle: string): { group: Record<string, unknown>; index: number; rows: unknown[][] } | undefined {
  for (const group of groups(raw)) {
    const labels = Array.isArray(group.colLabels) ? group.colLabels.map(String) : []
    const index = labels.findIndex((l) => l.includes(needle))
    const rows = rowsOf(group)
    if (index >= 0 && rows) return { group, index, rows }
  }
  return undefined
}

export function spellcastingOf(raw: Record<string, unknown>, isSubclass: boolean): SpellcastingRule | undefined {
  const ability = str(raw.spellcastingAbility)
  const progression = progressionOf(str(raw.casterProgression))
  if (!ABILITIES.has(ability)) return undefined
  const slots = slotsOf(raw, progression)
  const prepared = str(raw.preparedSpells)
  const preparation: SpellcastingRule['preparation'] = isSubclass
    ? { mode: 'known' }
    : prepared
      ? { mode: CLASS_SPELLBOOK[`${str(raw.name)}|${str(raw.source)}`] ? 'spellbook' : 'prepared', formula: { ability, level: /\/\s*2/.test(prepared) ? 'half' : 'full', min: 1 } }
      : { mode: 'known' }
  const cantrips = numberList(raw, 'cantripProgression')
  const known = numberList(raw, 'spellsKnownProgression')
  const invocations = namedColumn(raw, '已知祈唤')
  const infusionsKnown = namedColumn(raw, '已知注法')
  const infusionsActive = namedColumn(raw, '注法数量')
  const result: SpellcastingRule = {
    ability,
    progression,
    ...(preparation ? { preparation } : {}),
    ...(cantrips ? { cantripsKnown: cantrips } : {}),
    ...(known ? { spellsKnown: known } : {}),
    ...(slots ? { slotsByLevel: slots } : {}),
  }
  const key = `${str(raw.name)}|${str(raw.source)}`
  const ritual = CLASS_RITUAL[key]
  if (ritual) result.ritual = ritual
  const book = CLASS_SPELLBOOK[key]
  if (book) result.spellbook = book
  if (invocations) result.invocationsKnown = invocations.rows.map((row) => number(row[invocations.index]) ?? 0)
  if (infusionsKnown) result.infusionsKnown = infusionsKnown.rows.map((row) => number(row[infusionsKnown.index]) ?? 0)
  if (infusionsActive) result.infusionsActive = infusionsActive.rows.map((row) => number(row[infusionsActive.index]) ?? 0)
  return result
}

function scaleFromRows(raw: Record<string, unknown>, columns: Record<string, { id: string; label: string; type: 'number' | 'dice' | 'distance' }>): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  for (const group of groups(raw)) {
    const labels = Array.isArray(group.colLabels) ? group.colLabels.map(String) : []
    const rows = rowsOf(group)
    if (!rows) continue
    for (let index = 0; index < labels.length; index++) {
      const column = Object.entries(columns).find(([label]) => labels[index].includes(label))?.[1]
      if (!column) continue
      const scale: Record<string, number | string> = {}
      let last: number | string | undefined
      for (let level = 1; level <= 20; level++) {
        const value = scaleCell(rows[level - 1]?.[index])
        if (value === undefined) continue
        if (level === 1 || value !== last) scale[String(level)] = value
        last = value
      }
      if (Object.keys(scale).length) out.push({ kind: 'scaleValue', id: column.id, label: column.label, type: column.type, scale })
    }
  }
  return out
}

export function scaleValuesOf(raw: Record<string, unknown>): Array<Record<string, unknown>> {
  const key = `${str(raw.name)}|${str(raw.source)}`
  const out = scaleFromRows(raw, CLASS_SCALE_COLUMNS[key] ?? {})
  for (const extra of EXTRA_SCALES[key] ?? []) out.push({ kind: 'scaleValue', id: extra.id, label: extra.label, type: extra.type, scale: extra.scale })
  return out
}

export function advancementExtras(raw: Record<string, unknown>): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  const optional = raw.optionalfeatureProgression
  if (Array.isArray(optional)) {
    for (const item of optional) {
      const rec = item as Record<string, unknown>
      const progression = rec.progression
      if (Array.isArray(progression)) {
        progression.forEach((count, index) => {
          if (Number(count) > 0) out.push({ kind: 'itemChoice', level: index + 1, count: Number(count), featureType: (Array.isArray(rec.featureType) ? rec.featureType : []).map(String).join('、') || str(rec.name), optionKind: (Array.isArray(rec.featureType) ? rec.featureType : []).map(String) })
        })
      } else if (progression && typeof progression === 'object') {
        for (const [level, count] of Object.entries(progression as Record<string, unknown>)) {
          if (Number(count) > 0) out.push({ kind: 'itemChoice', level: Number(level), count: Number(count), featureType: (Array.isArray(rec.featureType) ? rec.featureType : []).map(String).join('、') || str(rec.name), optionKind: (Array.isArray(rec.featureType) ? rec.featureType : []).map(String) })
        }
      }
    }
  }
  return out
}

export function foundryScaleValues(ctx: ConvertContext, entry: PlannedEntry): Array<Record<string, unknown>> {
  if (entry.type === 'subclass') {
    const match = ctx.foundrySubclasses?.find((x) => str(x.name) === str(entry.raw.name) && str(x.source) === str(entry.raw.source) && str(x.className) === str(entry.raw.className))
    return foundryAdvancement(match)
  }
  if (entry.type === 'class') {
    const match = ctx.foundryClasses?.find((x) => str(x.name) === str(entry.raw.name) && str(x.source) === str(entry.raw.source))
    return foundryAdvancement(match)
  }
  return []
}

function foundryAdvancement(raw: Record<string, unknown> | undefined): Array<Record<string, unknown>> {
  if (!raw || !Array.isArray(raw.advancement)) return []
  const out: Array<Record<string, unknown>> = []
  for (const item of raw.advancement) {
    const rec = item as Record<string, unknown>
    if (rec.type !== 'ScaleValue' || !rec.configuration || typeof rec.configuration !== 'object') continue
    const configuration = rec.configuration as Record<string, unknown>
    const id = str(configuration.identifier) === 'superiority' ? 'superiority-dice' : str(configuration.identifier)
    if (!id) continue
    const type = str(configuration.type) || 'number'
    if (type !== 'number' && type !== 'dice' && type !== 'distance') continue
    const scale: Record<string, number | string> = {}
    const source = configuration.scale
    if (source && typeof source === 'object') {
      for (const [level, value] of Object.entries(source as Record<string, unknown>)) {
        if (value && typeof value === 'object') {
          const rec2 = value as Record<string, unknown>
          if (typeof rec2.value === 'number') scale[level] = rec2.value
          else if (typeof rec2.faces === 'number') scale[level] = `${Number(rec2.number ?? 1)}d${rec2.faces}`
        }
      }
    }
    if (Object.keys(scale).length) out.push({ kind: 'scaleValue', id, label: str(rec.title) || id, type, scale })
  }
  return out
}
