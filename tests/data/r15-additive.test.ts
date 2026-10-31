import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'
import { loadBefore } from './r15-snapshot'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

/** R15 允许新增的键：顶层的这些；以及 creatureType.swarmSize、spellcasting 块里的这几个键、spells.N.lower。 */
const TOP = new Set(['facets', 'extra', 'attachedItems', 'attachedSpells', 'abilityGrant', 'optionalFeatures', 'tier', 'wondrous', 'abilityCheck', 'seeAlso', 'effects'])
const CAST = new Set(['type', 'displayAs', 'hidden', 'chargesItem', 'footer'])

function allowedNew(path: string[], key: string): boolean {
  if (path.length === 0) return TOP.has(key)
  if (path.length === 1 && path[0] === 'creatureType') return key === 'swarmSize'
  if (path.length === 2 && path[0] === 'spellcasting') return CAST.has(key)
  if (path.length === 4 && path[0] === 'spellcasting' && path[2] === 'spells') return key === 'lower'
  return false
}

/**
 * 书籍章节里按名字引用这 16 份 TCE 变体特性：①「受祝击」有 14 份同名副本，落到哪一份是等价的；
 * ②「原初伴侣」「战技选项」原先找不到目标、只是文字，现在有了目标变成引用。只允许这两种变化：把变体引用还原成显示文字后，新旧必须相同。
 */
const VARIANT_REF = /\{\{ref:feature\.[a-z-]+-(?:blessed-strikes|maneuver-options|primal-companion)\.tce\|([^}]*)\}\}/g
const sameUpToVariant = (a: unknown, b: unknown): boolean => typeof a === 'string' && typeof b === 'string' && a !== b && a.replace(VARIANT_REF, '$1') === b.replace(VARIANT_REF, '$1')

/** 新值必须是旧值的「只增」扩展：原有内容逐字节不变；数组只允许在末尾追加（正文追加段落、效果追加说明）。 */
function violations(oldValue: unknown, newValue: unknown, path: string[], out: string[]): void {
  if (out.length > 5) return
  if (Array.isArray(oldValue)) {
    if (!Array.isArray(newValue) || newValue.length < oldValue.length) { out.push(`${path.join('.')} 数组变短或类型变了`); return }
    oldValue.forEach((item, i) => violations(item, newValue[i], [...path, String(i)], out))
    return
  }
  if (isObj(oldValue)) {
    if (!isObj(newValue)) { out.push(`${path.join('.')} 类型变了`); return }
    for (const [key, item] of Object.entries(oldValue)) violations(item, newValue[key], [...path, key], out)
    for (const key of Object.keys(newValue)) if (!(key in oldValue) && !allowedNew(path, key)) out.push(`${path.join('.')}.${key} 是不允许新增的键`)
    return
  }
  if (sameUpToVariant(oldValue, newValue)) return
  if (oldValue !== newValue) out.push(`${path.join('.')}: ${JSON.stringify(oldValue)?.slice(0, 40)} → ${JSON.stringify(newValue)?.slice(0, 40)}`)
}

/**
 * R15 对照英文版塔莎后补进的 13 份 TCE 可选变体特性（原先被「特性来源须同子职业来源」的规则挡掉）。
 * 新增条目只能是这 13 份；它们所属的子职业只允许 advancement 追加「可选」授予（见下面的 TCE_GRANT_FIX）。
 */
const TCE_VARIANTS_ADDED = [
  ...['arcana', 'death', 'forge', 'grave', 'knowledge', 'life', 'light', 'nature', 'tempest', 'trickery', 'war'].filter((d) => d !== 'life').map((d) => `feature.cleric-${d}-domain-blessed-strikes.tce`),
  'feature.cleric-life-domain-blessed-strikes.tce', 'feature.fighter-battle-master-maneuver-options.tce', 'feature.ranger-beast-master-primal-companion.tce',
]
/** 对照英文版剑湾补进的 6 份图腾武者选项（麋鹿、猛虎各 3、6、14 级）：只新增条目，不改任何已有条目。 */
const SCAG_TOTEM_ADDED = ['elk', 'tiger'].flatMap((n) => ['', '-2', '-3'].map((x) => `feature.barbarian-path-of-the-totem-warrior-${n}.scag${x}`))

/** 全部 16 份 TCE 可选变体特性（13 份新增 + 原有秩序、和平、暮光三个领域的 3 份）。 */
const VARIANT_IDS = new Set([...TCE_VARIANTS_ADDED, 'feature.cleric-order-domain-blessed-strikes.tce', 'feature.cleric-peace-domain-blessed-strikes.tce', 'feature.cleric-twilight-domain-blessed-strikes.tce'])
type Step = { kind?: string; items?: string[]; optional?: unknown }
const steps = (v: unknown): Step[] => (Array.isArray(v) ? (v as Step[]) : [])
const touchesVariant = (adv: unknown): boolean => steps(adv).some((a) => a.optional === 'tce-ocf' && (a.items ?? []).some((id) => VARIANT_IDS.has(id)))
/** 去掉所有「只含变体」的授予、并从其余授予里剔除变体 id 后，新旧两边必须相同（与顺序无关）；被去掉的必须是「可选」授予或旧的必得授予。 */
function variantGrantsOnly(before: unknown, after: unknown): boolean {
  const strip = (list: Step[], dropOptionalOnly: boolean): string[] => list.flatMap((a) => {
    if (a.kind !== 'itemGrant' || !a.items) return [JSON.stringify(a)]
    const items = a.items.filter((id) => !VARIANT_IDS.has(id))
    if (items.length === 0) return []
    if (dropOptionalOnly && a.optional === 'tce-ocf' && items.length === a.items.length) return [JSON.stringify(a)]
    return [JSON.stringify({ ...a, items })]
  }).sort()
  return JSON.stringify(strip(steps(before), false)) === JSON.stringify(strip(steps(after), true))
}

describe('R15 只增不改', () => {
  it('8,853 个条目：id、type、name、nameEn、summary、keywords 不变，data 只增不改', () => {
    const before = loadBefore()
    const now = allEntries()
    expect(now).toHaveLength(8853 + TCE_VARIANTS_ADDED.length + SCAG_TOTEM_ADDED.length)
    const bad: string[] = []
    for (const entry of now) {
      const old = before[entry.id]
      if (!old) { if (!TCE_VARIANTS_ADDED.includes(entry.id) && !SCAG_TOTEM_ADDED.includes(entry.id)) bad.push(`${entry.id} 不在快照里`); continue }
      if (entry.type !== old.type || entry.name !== old.name || entry.nameEn !== old.nameEn || entry.summary !== old.summary) bad.push(`${entry.id} 名称/类型/摘要变了`)
      const out: string[] = []
      if (entry.type === 'subclass' && touchesVariant(entry.data.advancement)) {
        const { advancement: before, ...restOld } = old.data
        const { advancement: after, ...restNew } = entry.data
        violations(restOld, restNew, [], out)
        if (!variantGrantsOnly(before, after)) out.push('advancement：除 TCE 可选变体授予外，原有授予必须原样保留')
      } else violations(old.data, entry.data, [], out)
      if (out.length) bad.push(`${entry.id}: ${out[0]}`)
    }
    expect(bad.slice(0, 10)).toEqual([])
  }, 180_000)
})
