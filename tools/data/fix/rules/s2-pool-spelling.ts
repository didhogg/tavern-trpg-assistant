import type { Rule } from '../engine'

const CANON: Record<string, string> = {
  'tool:disguise-kit': 'tool:disguise kit',
  'tool:poisoners-kit': "tool:poisoner's kit",
  'tool:smiths-tools': "tool:smith's tools",
  'skill:animal-handling': 'skill:animal handling',
  'tool:brewers-supplies': "tool:brewer's supplies",
  'tool:musical instrument': 'tool:anyMusicalInstrument',
  'tool:gaming set': 'tool:anyGamingSet',
}

function rewrite(value: unknown, hit: { changed: boolean }): unknown {
  if (typeof value === 'string') {
    const next = CANON[value]
    if (next === undefined) return value
    hit.changed = true
    return next
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = rewrite(value[i], hit)
    return value
  }
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>
    for (const key of Object.keys(rec)) rec[key] = rewrite(rec[key], hit)
  }
  return value
}

export const RULE: Rule = {
  name: 's2-pool-spelling',
  expectCount: 11,
  apply(packs): string[] {
    const changed = new Set<string>()
    for (const pack of packs) for (const entry of pack.entries) {
      const data = entry.data as Record<string, unknown>
      if (!('advancement' in data)) continue
      const hit = { changed: false }
      data.advancement = rewrite(data.advancement, hit)
      if (hit.changed) changed.add(entry.id)
    }
    return [...changed]
  },
}
