import type { RawData } from './extract/load'

const toText = (v: unknown): unknown => {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(toText)
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    if (typeof o.entry === 'string') return o.entry
    return Object.fromEntries(Object.entries(o).map(([k, x]) => [k, toText(x)]))
  }
  return v
}

const walkAtk = (v: unknown): unknown => {
  if (typeof v === 'string') return v.replace(/@atk m\b/g, '@atk mw').replace(/@atk r\b/g, '@atk rw')
  if (Array.isArray(v)) return v.map(walkAtk)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walkAtk(x)]))
  return v
}

/** 只修新来源的 5etools 写法，避免影响核心 11 包的输出。 */
export function normalizeNewMonsters(data: RawData, coreSources: Set<string>): void {
  for (const m of data.monsters) {
    if (coreSources.has(String(m.source))) continue
    for (const key of ['trait', 'action', 'bonus', 'reaction', 'legendary', 'mythic']) if (Array.isArray(m[key])) m[key] = walkAtk(m[key])
    if (Array.isArray(m.spellcasting)) m.spellcasting = m.spellcasting.map((s) => toText(s))
  }
}
