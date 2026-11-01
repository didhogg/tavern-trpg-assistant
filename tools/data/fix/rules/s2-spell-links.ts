import type { Rule } from '../engine'
import { buildSpellIndex, isObject, linkExact } from '../lib/spellLinks'

const LIST_KEYS = ['recharge', 'rest', 'restLong', 'legendary', 'charges'] as const

export const RULE: Rule = {
  name: 's2-spell-links',
  expectCount: 83,
  apply(packs): string[] {
    const index = buildSpellIndex(packs)
    const changed = new Set<string>()
    let occurrences = 0
    let skipped = 0
    for (const pack of packs) for (const entry of pack.entries) {
      if (entry.type !== 'monster') continue
      const data = entry.data as Record<string, unknown>
      if (!Array.isArray(data.spellcasting)) continue
      for (const block of data.spellcasting) {
        if (!isObject(block)) continue
        const arrays: unknown[][] = []
        if (Array.isArray(block.atWill)) arrays.push(block.atWill)
        if (isObject(block.perDay)) for (const value of Object.values(block.perDay)) if (Array.isArray(value)) arrays.push(value)
        if (isObject(block.spells)) for (const level of Object.values(block.spells)) if (isObject(level) && Array.isArray(level.spells)) arrays.push(level.spells)
        for (const key of LIST_KEYS) if (isObject(block[key])) for (const value of Object.values(block[key])) if (Array.isArray(value)) arrays.push(value)
        for (const list of arrays) for (let i = 0; i < list.length; i++) {
          const raw = list[i]
          if (typeof raw !== 'string' || raw.includes('{{ref:')) continue
          const hash = raw.indexOf('#')
          const base = hash >= 0 ? raw.slice(0, hash) : raw
          if (entry.id === 'monster.lich.mm' && base === '马友夫强酸箭') { skipped += 1; continue }
          const linked = linkExact(raw, pack.manifest.id, index)
          if (linked === undefined) continue
          list[i] = linked
          occurrences += 1
          changed.add(entry.id)
        }
      }
    }
    if (occurrences !== 125) throw new Error(`法术名链接应命中 125 处，实际 ${occurrences}`)
    if (skipped !== 1) throw new Error(`巫妖马友夫强酸箭应跳过 1 处，实际 ${skipped}`)
    return [...changed]
  },
}
