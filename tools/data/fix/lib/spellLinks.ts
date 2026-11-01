import type { ConvertedPack } from '../../convert'

export interface SpellTarget { id: string; pack: string }
export interface SpellIndex {
  byName: Map<string, SpellTarget[]>
  allowed: Map<string, Set<string>>
}

const SRD = 'dnd5e2014-srd'
const PRIORITY = new Map([[SRD, 0], ['dnd5e2014-phb', 1]])

function isObj(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function allowedPacks(packs: ConvertedPack[]): Map<string, Set<string>> {
  const requires = new Map(packs.map((pack) => [pack.manifest.id, pack.manifest.relationships.requires.map((row) => row.id)]))
  const out = new Map<string, Set<string>>()
  for (const pack of packs) {
    const seen = new Set<string>([pack.manifest.id, SRD])
    const queue = [pack.manifest.id]
    while (queue.length) {
      const current = queue.shift()!
      for (const next of requires.get(current) ?? []) {
        if (seen.has(next)) continue
        seen.add(next)
        queue.push(next)
      }
    }
    out.set(pack.manifest.id, seen)
  }
  return out
}

export function buildSpellIndex(packs: ConvertedPack[]): SpellIndex {
  const byName = new Map<string, SpellTarget[]>()
  for (const pack of packs) for (const entry of pack.entries) {
    if (entry.type !== 'spell') continue
    const list = byName.get(entry.name) ?? []
    list.push({ id: entry.id, pack: pack.manifest.id })
    byName.set(entry.name, list)
  }
  return { byName, allowed: allowedPacks(packs) }
}

export function pickSpell(index: SpellIndex, name: string, pack: string): SpellTarget | undefined {
  const candidates = index.byName.get(name)
  if (!candidates?.length) return undefined
  const allowed = index.allowed.get(pack)
  if (!allowed) throw new Error(`没有包 ${pack} 的依赖信息`)
  const usable = candidates.filter((row) => allowed.has(row.pack))
  if (!usable.length) throw new Error(`法术「${name}」没有可向下链接的候选（${pack}）`)
  const sorted = [...usable].sort((a, b) => (PRIORITY.get(a.pack) ?? 9) - (PRIORITY.get(b.pack) ?? 9) || a.id.localeCompare(b.id))
  const best = PRIORITY.get(sorted[0].pack) ?? 9
  const tied = sorted.filter((row) => (PRIORITY.get(row.pack) ?? 9) === best)
  if (tied.length !== 1) throw new Error(`法术「${name}」在 ${pack} 下有多个同优先级候选：${tied.map((row) => row.id).join('、')}`)
  return tied[0]
}

export function linkExact(raw: string, pack: string, index: SpellIndex): string | undefined {
  if (raw.includes('{{ref:')) return undefined
  const hash = raw.indexOf('#')
  const base = hash >= 0 ? raw.slice(0, hash) : raw
  const target = pickSpell(index, base, pack)
  if (!target) return undefined
  return `{{ref:${target.id}|${base}}}${hash >= 0 ? raw.slice(hash) : ''}`
}

export function linkPrefix(raw: string, pack: string, index: SpellIndex): string | undefined {
  if (raw.includes('{{ref:')) return undefined
  const names = [...index.byName.keys()].filter((name) => raw.startsWith(name)).sort((a, b) => b.length - a.length)
  for (const name of names) {
    const target = pickSpell(index, name, pack)
    if (target) return `{{ref:${target.id}|${name}}}${raw.slice(name.length)}`
  }
  return undefined
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return isObj(value)
}
