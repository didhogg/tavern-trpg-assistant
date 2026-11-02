import type { Entry } from '../../src/schemas/pack'
import type { ConvertedPack } from './convert'

/**
 * D1.2b 去重（执行文档 §6）：只决定新来源的 monster 要不要进包，绝不改核心/已处理条目的非 art、非 supersededBy 字段。
 * A（机制与文字都相同）与 B（只有文字不同）跳过；C 保留并写 variantOf/variantDiff；同名异物按 D 保留、不写 variantOf。
 */
export interface DedupeStats {
  A: number
  B: number
  C: number
  D: number
  sameNameDifferent: number
  bySource: Record<string, { A: number; B: number; C: number; D: number; sameNameDifferent: number }>
}

const SKIP_KEYS = new Set(['src', 'credit', 'lore', 'art', 'tags', 'facets', 'extra', 'variants', 'variantOf', 'variantDiff', 'supersededBy', 'versionGroup', 'playable', 'nameSuffix'])
const ACTION_KEYS = new Set(['traits', 'actions', 'bonusActions', 'reactions', 'legendary', 'mythic'])

function clean(value: unknown, dropText = false): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/\{\{[a-z]+:([^|}]+)\|?([^}]*)\}\}/g, (_m, _id: string, display: string) => display || _id)
      .replace(/[\s\u3000]+/g, ' ')
      .replace(/[，。；：、！？（）【】「」『』]/g, '')
      .trim()
  }
  if (Array.isArray(value)) return value.map((v) => clean(v, dropText))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value).sort()) {
      if (SKIP_KEYS.has(key)) continue
      if (dropText && key === 'text') continue
      out[key] = clean((value as Record<string, unknown>)[key], dropText)
    }
    return out
  }
  return value
}

function mechanism(data: Record<string, unknown>): unknown {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(data)) {
    if (SKIP_KEYS.has(key)) continue
    const value = data[key]
    if (ACTION_KEYS.has(key)) {
      out[key] = Array.isArray(value)
        ? value.map((item) => {
            if (!item || typeof item !== 'object') return clean(item, true)
            const obj = item as Record<string, unknown>
            return clean(Object.fromEntries(Object.entries(obj).filter(([k]) => k !== 'text')), true)
          })
        : clean(value, true)
    } else {
      out[key] = clean(value, true)
    }
  }
  return out
}

const nameOf = (e: Entry): string => (e.nameEn || e.name).toLowerCase().replace(/\s+/g, ' ').trim()
const json = (v: unknown): string => JSON.stringify(v)
const crValue = (e: Entry): number => {
  const cr = (e.data as Record<string, unknown>).cr
  if (typeof cr === 'number') return cr
  if (cr && typeof cr === 'object' && typeof (cr as Record<string, unknown>).value === 'number') return (cr as Record<string, number>).value
  return 0
}
const sizeOf = (e: Entry): string => json((e.data as Record<string, unknown>).size)
const typeOf = (e: Entry): string => json((e.data as Record<string, unknown>).creatureType)

export function dedupeMonsters(packs: ConvertedPack[], corePackIds: Set<string>): DedupeStats {
  const stats: DedupeStats = { A: 0, B: 0, C: 0, D: 0, sameNameDifferent: 0, bySource: {} }
  const seen = new Map<string, Entry[]>()
  const addSeen = (e: Entry): void => {
    const key = nameOf(e)
    seen.set(key, [...(seen.get(key) ?? []), e])
  }
  const stat = (source: string) => (stats.bySource[source] ??= { A: 0, B: 0, C: 0, D: 0, sameNameDifferent: 0 })
  for (const pack of packs) {
    const isCore = corePackIds.has(pack.manifest.id)
    const keep: Entry[] = []
    for (const entry of pack.entries) {
      if (entry.type !== 'monster' || isCore) {
        keep.push(entry)
        if (entry.type === 'monster') addSeen(entry)
        continue
      }
      const candidates = seen.get(nameOf(entry)) ?? []
      if (!candidates.length) {
        stats.D++
        stat(pack.manifest.id).D++
        keep.push(entry)
        addSeen(entry)
        continue
      }
      let best = candidates[0]
      let bestDiff = Number.POSITIVE_INFINITY
      for (const c of candidates) {
        const a = json(clean(c.data))
        const b = json(clean(entry.data))
        const diff = a === b ? 0 : json(mechanism(c.data as Record<string, unknown>)) === json(mechanism(entry.data as Record<string, unknown>)) ? 1 : 2
        if (diff < bestDiff) { best = c; bestDiff = diff }
        if (diff === 0) break
      }
      const same = json(clean(best.data)) === json(clean(entry.data))
      const mechSame = json(mechanism(best.data as Record<string, unknown>)) === json(mechanism(entry.data as Record<string, unknown>))
      if (same) { stats.A++; stat(pack.manifest.id).A++; continue }
      if (mechSame) { stats.B++; stat(pack.manifest.id).B++; continue }
      const different = typeOf(best) !== typeOf(entry) || sizeOf(best) !== sizeOf(entry) || Math.abs(crValue(best) - crValue(entry)) >= 3
      if (different) {
        stats.sameNameDifferent++
        stats.D++
        stat(pack.manifest.id).sameNameDifferent++
        stat(pack.manifest.id).D++
        keep.push(entry)
        addSeen(entry)
        continue
      }
      const a = mechanism(best.data as Record<string, unknown>) as Record<string, unknown>
      const b = mechanism(entry.data as Record<string, unknown>) as Record<string, unknown>
      const diff = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => json(a[k]) !== json(b[k])).sort()
      entry.data = { ...entry.data, variantOf: best.id, variantDiff: diff }
      const targetPack = packs.find((p) => p.entries.some((e) => e.id === best.id))
      if (targetPack && targetPack.manifest.id !== pack.manifest.id) {
        const requires = pack.manifest.relationships.requires
        if (!requires.some((r) => r.id === targetPack.manifest.id)) requires.push({ id: targetPack.manifest.id })
        requires.sort((a, b) => a.id.localeCompare(b.id))
      }
      stats.C++
      stat(pack.manifest.id).C++
      keep.push(entry)
      addSeen(entry)
    }
    pack.entries = keep
  }
  return stats
}
