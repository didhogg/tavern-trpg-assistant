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

const stripTags = (v: string): string => v.replace(/\{@(\w+) ([^}|]+)(?:\|([^}]+))?\}/g, (_m, _tag: string, a: string, b?: string) => b || a)

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
    if (m.hp && typeof m.hp === 'object') {
      const hp = m.hp as Record<string, unknown>
      if (typeof hp.special === 'string') hp.special = stripTags(hp.special)
      if (typeof hp.formula === 'string' && /^\d+d1$/.test(hp.formula)) hp.formula = hp.formula.replace(/d1$/, '')
    }
    if (Array.isArray(m.spellcasting)) m.spellcasting = m.spellcasting.map((s) => {
      const out = toText(s) as Record<string, unknown>
      if (out && typeof out === 'object' && typeof out.ability === 'string' && !['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(out.ability)) {
        const text = JSON.stringify(out.headerEntries ?? '')
        out.ability = text.includes('魅力') ? 'cha' : text.includes('智力') ? 'int' : text.includes('感知') ? 'wis' : text.includes('体质') ? 'con' : text.includes('敏捷') ? 'dex' : text.includes('力量') ? 'str' : 'cha'
      }
      return out
    })
  }
}
