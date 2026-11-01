import type { Lib, Row } from './load'
import { arr, rec } from './util'

const hasGrantUses = (r: Row): boolean => arr(r.data.effects).map(rec).some((e) => e.kind === 'spellGrant' && e.uses !== undefined)

/**
 * 免费法术的次数已经写在自己的（或所属种族/亚种的）`spellGrant.uses` 上，就算“有结构”：
 * 特性/特质本身不要求再带一份 `uses`（再带一份会重复计数）。休息盘点用这个口径（只对点名的特性）。
 */
export function usesViaGrant(l: Lib, row: Row): boolean {
  const ownerId = rec(row.data.owner).id
  const owner = typeof ownerId === 'string' ? l.get(ownerId) : undefined
  return hasGrantUses(row) || (owner !== undefined && hasGrantUses(owner))
}

const textRefs = (v: unknown): Set<string> => new Set([...JSON.stringify(v ?? '').matchAll(/ref:(spell\.[a-z0-9.-]+)/g)].map((m) => m[1]))

/**
 * 严口径：种族/亚种的特质，正文提到至少 2 个法术，且这些法术全都由所属种族（或其母种族）的 `spellGrant` 赠予、
 * 其中至少一个赠予带 `uses`（戏法随意施展，本来就没有次数）。这类特质的次数由种族承担
 * （3b-4 删掉了特质上多余的 `uses`），不算“缺次数”，也不算“纯文字”。
 * 判据与休息盘点里 `rest-racial-spell-uses-duplicate` 一致，另加“至少一个带 uses”防止删光结构。
 */
export function usesCarriedByRace(l: Lib, row: Row): boolean {
  const owner = rec(row.data.owner)
  if (!['race', 'subrace'].includes(String(owner.type))) return false
  const spells = textRefs(row.data.text)
  if (spells.size < 2) return false
  const ownerId = String(owner.id)
  const chain = [ownerId, String(l.get(ownerId)?.data.parentRace ?? '')]
  const grants = chain.flatMap((id) => arr(l.get(id)?.data.effects).map(rec).filter((e) => e.kind === 'spellGrant'))
  const granted = new Set(grants.flatMap((e) => (Array.isArray(e.spells) ? (e.spells as string[]) : [])))
  return [...spells].every((x) => granted.has(x)) && grants.some((e) => e.uses !== undefined)
}

const OWNER_FIELDS: Record<string, string[]> = { 熟练: ['proficiencies'], 抗性免疫: ['resist', 'immune', 'conditionImmune'], 速度: ['speed'], 感官: ['darkvision', 'senses'], 属性值: ['abilityBonus'] }
const filled = (v: unknown): boolean => v !== undefined && v !== null && v !== 0 && !(Array.isArray(v) && !v.length) && !(typeof v === 'object' && !Array.isArray(v) && !Object.keys(v as object).length)

/**
 * 种族／亚种的特质，它影响的派生数值（熟练、抗性、速度、黑暗视觉、属性加值）已经写在所属种族（或母种族）自己的结构化字段上：
 * 特质只是书上的文字说明，不是缺陷。分诊时不算"纯文字 A 类"。tags 是分诊给出的类别词。
 */
export function ownerAlreadyStructured(l: Lib, row: Row, tags: string[]): boolean {
  const owner = rec(row.data.owner)
  if (!['race', 'subrace'].includes(String(owner.type))) return false
  const own = l.get(String(owner.id))
  const parent = own?.data.parentRace ? l.get(String(own.data.parentRace)) : undefined
  const fields = tags.flatMap((t) => OWNER_FIELDS[t] ?? [])
  return fields.length > 0 && fields.some((f) => filled(own?.data[f]) || filled(parent?.data[f]))
}
