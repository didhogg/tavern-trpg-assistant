import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import { BOOKS, BOOK_SOURCES } from '../config/books'
import { NPC_RACES } from '../config/npcRaces'

const SOURCE_LIKE = /^[A-Z][A-Za-z0-9]{1,8}$/
const SOURCE_2024 = new Set(['XPHB', 'XDMG', 'XMM'])

export interface ReprintTarget {
  name: string
  source: string
}

export interface DeferredReprint {
  entry: string
  source: string
  target: string
}

export interface VersionStats {
  superseded: number
  unresolvedReprints: Array<{ entry: string; target: string }>
  deferredReprints: DeferredReprint[]
  npcRaces: string[]
  nameSuffixed: Array<{ id: string; name: string; suffix: string }>
  featureNameGroups: number
  versionGroups: Array<{ group: string; hasBase: boolean; members: number }>
  fromVariantRules: number
  unresolvedVariantRules: Array<{ entry: string; target: string }>
}

/** `reprintedAs` 的一项：字符串 "名称|书" 或 { uid: "名称|书", tag }；子职业等是 "名称|职业|…|书"。 */
export function reprintTargets(raw: Record<string, unknown>): Array<{ name: string; sources: string[] }> {
  const list = Array.isArray(raw.reprintedAs) ? raw.reprintedAs : []
  const out: Array<{ name: string; sources: string[] }> = []
  for (const item of list) {
    const uid = typeof item === 'string' ? item : item && typeof item === 'object' ? String((item as Record<string, unknown>).uid ?? '') : ''
    const parts = uid.split('|')
    if (!parts[0]) continue
    out.push({ name: parts[0], sources: parts.slice(1).filter((p) => SOURCE_LIKE.test(p)) })
  }
  return out
}

const TARGET_TYPES: Record<string, string[]> = { subrace: ['subrace', 'race'] }

const layerOf = (source: string): number => BOOKS.find((b) => b.source === source)?.layer ?? 0

/** 给旧版条目写 supersededBy（只指向收录范围内的书）；目标是 D1.2b 的书的记入 deferredReprints。 */
export function resolveSupersededBy(planned: PlannedEntry[], converted: Map<string, Entry>, stats: VersionStats): void {
  const byKey = new Map<string, PlannedEntry[]>()
  for (const e of planned) {
    const key = `${e.type}|${e.source}|${e.name}`
    byKey.set(key, [...(byKey.get(key) ?? []), e])
  }
  for (const entry of planned) {
    const built = converted.get(entry.id)
    if (!built || entry.type === 'feature' || entry.type === 'lore') continue
    const inRange: Array<{ id: string; source: string; target: string }> = []
    for (const target of reprintTargets(entry.raw)) {
      for (const source of target.sources) {
        const label = `${target.name}|${source}`
        if (BOOK_SOURCES.has(source)) {
          const hit = (TARGET_TYPES[entry.type] ?? [entry.type]).flatMap((type) => byKey.get(`${type}|${source}|${target.name}`) ?? [])[0]
          if (hit) inRange.push({ id: hit.id, source, target: label })
          else stats.unresolvedReprints.push({ entry: entry.id, target: label })
        } else if (!SOURCE_2024.has(source)) {
          stats.deferredReprints.push({ entry: entry.id, source, target: label })
        }
      }
    }
    if (!inRange.length) continue
    inRange.sort((a, b) => layerOf(b.source) - layerOf(a.source))
    ;(built.data as Record<string, unknown>).supersededBy = inRange[0].id
    stats.superseded++
  }
}

/** DMG 282 页的 16 个 NPC 种族：playable = false。 */
export function markNpcRaces(planned: PlannedEntry[], converted: Map<string, Entry>, stats: VersionStats): void {
  for (const entry of planned) {
    if (entry.type !== 'race' || entry.source !== 'DMG' || !NPC_RACES.has(String(entry.raw.ENG_name))) continue
    const built = converted.get(entry.id)
    if (!built) continue
    ;(built.data as Record<string, unknown>).playable = false
    stats.npcRaces.push(entry.id)
  }
}

const PAREN = /[（(]([^）)]+)[）)]\s*$/

/** 同类型同书同名（特性除外）的条目加后缀区分：魔法变体名里的括号内容优先，其余按顺序「（2）」。在建引用索引之前调用。 */
export function disambiguateNames(planned: PlannedEntry[], stats: VersionStats): void {
  const groups = new Map<string, PlannedEntry[]>()
  for (const e of planned) {
    if (e.type === 'feature' || e.type === 'lore' || e.raw._family === true || e.raw._deityConflict === true) continue
    const key = `${e.type}|${e.source}|${e.name}`
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  const features = new Map<string, number>()
  for (const e of planned) if (e.type === 'feature') features.set(`${e.source}|${e.name}`, (features.get(`${e.source}|${e.name}`) ?? 0) + 1)
  stats.featureNameGroups = [...features.values()].filter((n) => n > 1).length
  const rename = (e: PlannedEntry, suffix: string, suffixEn: string): void => {
    e.name = `${e.name}（${suffix}）`
    e.nameEn = e.nameEn ? `${e.nameEn} (${suffixEn || suffix})` : e.nameEn
    e.context.nameSuffix = suffix
    stats.nameSuffixed.push({ id: e.id, name: e.name, suffix })
  }
  for (const list of groups.values()) {
    if (list.length < 2) continue
    const rest: PlannedEntry[] = []
    for (const e of list) {
      const variant = e.raw._variant as Record<string, unknown> | undefined
      const zh = PAREN.exec(String(variant?.name ?? ''))?.[1]
      if (zh) rename(e, zh, PAREN.exec(String(variant?.ENG_name ?? ''))?.[1] ?? '')
      else rest.push(e)
    }
    for (const [i, e] of [...rest.slice(1)].sort((a, b) => a.id.localeCompare(b.id)).entries()) rename(e, String(i + 2), String(i + 2))
  }
}

/** 动作（来源 action）的 fromVariant 指向可选规则（变体规则）条目："名称" 或 "名称|书"。 */
export function resolveFromVariant(planned: PlannedEntry[], converted: Map<string, Entry>, stats: VersionStats): void {
  const rules = new Map<string, PlannedEntry>()
  for (const e of planned) if (e.type === 'rule') rules.set(`${e.source}|${e.name}`, e)
  for (const entry of planned) {
    if (entry.type !== 'rule' || typeof entry.raw.fromVariant !== 'string') continue
    const [name, source] = entry.raw.fromVariant.split('|')
    const target = rules.get(`${source || entry.source}|${name}`)
    const built = converted.get(entry.id)
    if (target && built) {
      ;(built.data as Record<string, unknown>).fromVariantRule = target.id
      stats.fromVariantRules++
    } else stats.unresolvedVariantRules.push({ entry: entry.id, target: entry.raw.fromVariant })
  }
}

/** 备选版本（来源 _versions）与基础条目同属一个 versionGroup（组 id = 基础条目 id；基础条目没有对应条目时取版本里排序最前的 id）。 */
export function assignVersionGroups(planned: PlannedEntry[], converted: Map<string, Entry>, stats: VersionStats): void {
  const baseByKey = new Map(planned.map((e) => [`${e.type}|${e.source}|${String(e.raw.ENG_name)}`, e]))
  const groups = new Map<string, PlannedEntry[]>()
  for (const entry of planned) {
    const of = entry.raw._versionOf as { ENG_name?: string; source?: string } | undefined
    if (!of) continue
    const key = `${entry.type}|${of.source}|${of.ENG_name}`
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  for (const [key, members] of groups) {
    const base = baseByKey.get(key)
    const group = base?.id ?? members.map((m) => m.id).sort()[0]
    for (const entry of [...(base ? [base] : []), ...members]) {
      const built = converted.get(entry.id)
      if (built) (built.data as Record<string, unknown>).versionGroup = group
    }
    stats.versionGroups.push({ group, hasBase: !!base, members: members.length })
  }
}

export function emptyVersionStats(): VersionStats {
  return { superseded: 0, unresolvedReprints: [], deferredReprints: [], npcRaces: [], nameSuffixed: [], featureNameGroups: 0, versionGroups: [], fromVariantRules: 0, unresolvedVariantRules: [] }
}
