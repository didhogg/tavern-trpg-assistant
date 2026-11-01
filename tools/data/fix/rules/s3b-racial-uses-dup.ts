import type { Rule } from '../engine'

export const RULE: Rule = {
  name: 's3b-racial-uses-dup',
  expectCount: 27,
  apply(packs, ctx): string[] {
    const changed: string[] = []
    for (const pack of packs) for (const entry of pack.entries) {
      if (entry.type !== 'feature') continue
      const data = entry.data as Record<string, unknown>
      if (!data.uses || !data.owner) continue
      const uses = data.uses as { max?: unknown }
      if (typeof uses.max !== 'number') continue
      const spellRefs = (JSON.stringify(data.text ?? '').match(/\{\{ref:spell\./g) ?? []).length
      if (spellRefs < 2) continue
      const owner = data.owner as { id?: unknown; type?: unknown }
      if (typeof owner.id !== 'string' || (owner.type !== 'race' && owner.type !== 'subrace')) continue
      const ownerEntry = ctx.entries.get(owner.id)
      if (!ownerEntry) continue
      const effects = ownerEntry.data.effects
      if (!Array.isArray(effects)) continue
      const grants = effects.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x) && x.kind === 'spellGrant' && x.mode === 'innate')
      if (grants.length < 2 || grants.some((x) => !x.uses)) continue
      delete data.uses
      changed.push(entry.id)
    }
    if (changed.length !== 27) throw new Error(`应删 27 个特质 uses，实际 ${changed.length}`)
    return changed
  },
}
