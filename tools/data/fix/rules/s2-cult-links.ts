import type { Rule } from '../engine'
import { buildSpellIndex, linkPrefix } from '../lib/spellLinks'

const CULTS = new Set([
  'cult.cult-of-baalzebul.mtf',
  'cult.cult-of-fierna.mtf',
  'cult.cult-of-geryon.mtf',
  'cult.cult-of-glasya.mtf',
  'cult.cult-of-levistus.mtf',
  'cult.cult-of-mammon.mtf',
  'cult.cult-of-zariel.mtf',
])

export const RULE: Rule = {
  name: 's2-cult-links',
  expectCount: 7,
  apply(packs): string[] {
    const index = buildSpellIndex(packs)
    const changed: string[] = []
    let links = 0
    for (const pack of packs) for (const entry of pack.entries) {
      if (!CULTS.has(entry.id)) continue
      const data = entry.data as Record<string, unknown>
      const value = data.signatureSpells
      if (typeof value !== 'string') throw new Error(`${entry.id} 缺 signatureSpells`)
      const parts = value.split(/([,，、])/)
      for (let i = 0; i < parts.length; i += 2) {
        const part = parts[i]
        if (part.includes('{{ref:')) continue
        const match = /^(\s*)(.*?)(\s*)$/.exec(part)
        if (!match) continue
        const linked = linkPrefix(match[2], pack.manifest.id, index)
        if (linked === undefined) continue
        parts[i] = `${match[1]}${linked}${match[3]}`
        links += 1
      }
      const next = parts.join('')
      if (next !== value) { data.signatureSpells = next; changed.push(entry.id) }
    }
    if (links !== 8) throw new Error(`教派招牌法术应补 8 处链接，实际 ${links}`)
    return changed
  },
}
