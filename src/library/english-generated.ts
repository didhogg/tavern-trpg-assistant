// 作者加载器生成的条目（_versions 版本、亚种、魔法变体）不在原始文件里，中文站作者的 getEnglishEntity 只认原始记录，配不到它们。
// 规则：生成条目 = 母条目 + 组内标识。母条目由作者写在生成条目上的出处字段给出（_versionBase_hash；亚种的 _baseName/_baseSource；
// 魔法变体的 baseItem），不写类别清单。中文母条目按已有原始配对换成英文母条目，再在英文那边“同母条目、同来源”的组里找：
//   版本 → 作者 getVersions 的展开顺序（小窗 versionOrder 交来）：母条目的第 i 个版本就是同一个；
//   组里两边都只有一条 → 就是它；
//   版本 / 亚种 → 作者写的英文名（ENG_name）等于英文那条的名字（亚种是 _subraceName）；
//   魔法变体 → 变体模板按作者原始 magicvariant 上的 ENG_name 换成英文模板名，（基础物品, 模板）一对一。
// 解析结果按各自语言的名字排过序，不能按组内位置配。对不上的不配，照实留在没配上里。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者条目没有类型声明。 */
import type { ParsedProp } from './runtime/frame/commands'
import type { EnglishPairs } from './service-types'

type Pairs = EnglishPairs['pairs']

const low = (v: unknown): string => String(v ?? '').toLowerCase()

type Kind = 'version' | 'subrace' | 'variant'

/** 作者写了哪种出处字段，就是哪种生成条目。 */
function kindOf(it: any): Kind | null {
  if (typeof it?._versionBase_hash === 'string') return 'version'
  if (it?._isSubRace && it._baseName) return 'subrace'
  if (it?.genericVariant?.name && typeof it.baseItem === 'string') return 'variant'
  return null
}

/** 母条目在同语言解析结果里的编号；找不到返回 null。 */
function motherHash(it: any, kind: Kind, byNameSource: Map<string, string>): string | null {
  if (kind === 'version') return it._versionBase_hash
  if (kind === 'subrace') return byNameSource.get(`${low(it._baseName)}|${low(it._baseSource ?? it.source)}`) ?? null
  const [name, source] = String(it.baseItem).split('|')
  return byNameSource.get(`${low(name)}|${low(source)}`) ?? null
}

interface Gen { hash: string; kind: Kind; mother: string; ownMother: string; it: any }

/** 类别 → 母条目编号 → 版本编号（作者顺序）。 */
export type VersionOrder = Record<string, Record<string, string[]>>

/** 列出生成条目，母条目换成 mapMother 给的编号（中文那边换成英文母条目）。 */
function generated(list: ParsedProp, mapMother: (hash: string) => string | null): Gen[] {
  // 有亚种的种族，解析结果里只剩合并后的无名亚种（编号与原始母条目相同），所以生成条目也算进来；同名时原始记录优先。
  const byNameSource = new Map<string, string>()
  for (const own of [true, false]) {
    list.items.forEach((it: any, i) => {
      const hash = list.hashes[i]
      if (!kindOf(it) === own && it?.name && hash) byNameSource.set(`${low(it._rawName ?? it.name)}|${low(it.source)}`, hash)
    })
  }
  const out: Gen[] = []
  list.items.forEach((it: any, i) => {
    const kind = kindOf(it)
    const hash = list.hashes[i]
    if (!kind || !hash) return
    const m = motherHash(it, kind, byNameSource)
    const mother = m ? mapMother(m) : null
    if (m && mother) out.push({ hash, kind, mother, ownMother: m, it })
  })
  return out
}

const templateOf = (g: Gen): string => `${low(g.it.genericVariant.name)}|${low(g.it.genericVariant.source)}`

export interface GeneratedPairReport { generated: number; paired: number; kept: number; unmatched: number; noMother: number }

/** 给一类条目补生成条目的配对，直接写进 pairs[prop]。已有原始配对且英文解析结果里真有那条的，保留不动。 */
export function pairGenerated(prop: string, cn: ParsedProp, en: ParsedProp, pairs: Pairs, extra: { templates?: Template[]; versions?: { cn: VersionOrder; en: VersionOrder } } = {}): GeneratedPairReport {
  const templateNames = extra.templates ?? []
  const templates = new Map(templateNames.filter((t) => t.eng).map((t) => [`${low(t.name)}|${low(t.source)}`, `${low(t.eng)}|${low(t.source)}`]))
  const enHashes = new Set(en.hashes.filter((h): h is string => !!h))
  const valid = (h: string): string | null => { const p = pairs[prop]?.[h]?.enHash; return p && enHashes.has(p) ? p : null }
  const enGen = generated(en, (h) => h)
  const report: GeneratedPairReport = { generated: cn.items.filter((it) => kindOf(it)).length, paired: 0, kept: 0, unmatched: 0, noMother: 0 }
  const done = new Set<string>()
  for (const g of generated(cn, () => 'any')) if (valid(g.hash)) { done.add(g.hash); report.kept++ }
  const groupKey = (g: Gen, template: string | null): string => `${g.kind}|${g.mother}|${low(g.it.source)}|${template ?? ''}`
  const enGroups = new Map<string, Gen[]>()
  for (const g of enGen) {
    const k = groupKey(g, g.kind === 'variant' ? templateOf(g) : null)
    enGroups.set(k, [...(enGroups.get(k) ?? []), g])
  }
  const englishName = (e: Gen): string => low(e.kind === 'subrace' ? e.it._subraceName : e.it.name)
  // 两轮：第一轮配母条目是原始记录的；第二轮配母条目本身是生成条目的（例如亚种的版本，母条目是第一轮刚配上的亚种）
  for (let round = 0; round < 2; round++) {
    const cnAll = generated(cn, valid)
    const cnGroups = new Map<string, Gen[]>()
    for (const g of cnAll) {
      const t = g.kind === 'variant' ? templates.get(templateOf(g)) ?? null : null
      if (g.kind === 'variant' && !t) continue
      const k = groupKey(g, t)
      cnGroups.set(k, [...(cnGroups.get(k) ?? []), g])
    }
    for (const [k, cs] of cnGroups) {
      const es = enGroups.get(k) ?? []
      for (const c of cs) {
        if (done.has(c.hash)) continue
        let hit: Gen | undefined
        const cnOrder = c.kind === 'version' ? extra.versions?.cn[prop]?.[c.ownMother] : undefined
        const enOrder = c.kind === 'version' ? extra.versions?.en[prop]?.[c.mother] : undefined
        const at = cnOrder?.indexOf(c.hash) ?? -1
        if (cnOrder && enOrder && cnOrder.length === enOrder.length && at >= 0) hit = es.find((e) => e.hash === enOrder[at])
        if (!hit && cs.length === 1 && es.length === 1) hit = es[0]
        if (!hit) { const m = es.filter((e) => englishName(e) === low(c.it.ENG_name)); if (m.length === 1) hit = m[0] }
        if (!hit) continue
        ;(pairs[prop] ??= {})[c.hash] = { enHash: hit.hash, enSource: hit.it.source ?? null, via: 'generated' }
        done.add(c.hash)
        report.paired++
      }
    }
  }
  report.noMother = report.generated - generated(cn, valid).length
  report.unmatched = report.generated - done.size - report.noMother
  return report
}

type Template = { name: string; eng: string | null; source: string | null }

/** 给配对表补全部生成条目：每类取中英解析结果；有版本的类别向两边小窗要作者展开顺序。 */
export async function addGeneratedPairs(pairs: Pairs, src: {
  parsed: (side: 'cn' | 'en', prop: string) => Promise<ParsedProp | null>
  templates: () => Promise<Template[]>
  versions: (side: 'cn' | 'en', props: string[]) => Promise<VersionOrder>
}): Promise<Record<string, GeneratedPairReport>> {
  const lists: Array<{ prop: string; cn: ParsedProp; en: ParsedProp }> = []
  for (const prop of Object.keys(pairs)) {
    const [cn, en] = await Promise.all([src.parsed('cn', prop), src.parsed('en', prop)])
    if (cn && en && cn.items.some((it) => kindOf(it))) lists.push({ prop, cn, en })
  }
  const versionProps = lists.filter((l) => l.cn.items.some((it) => kindOf(it) === 'version')).map((l) => l.prop)
  const needTemplates = lists.some((l) => l.cn.items.some((it) => kindOf(it) === 'variant'))
  const extra = {
    templates: needTemplates ? await src.templates() : [],
    versions: versionProps.length ? { cn: await src.versions('cn', versionProps), en: await src.versions('en', versionProps) } : { cn: {}, en: {} },
  }
  const out: Record<string, GeneratedPairReport> = {}
  for (const l of lists) out[l.prop] = pairGenerated(l.prop, l.cn, l.en, pairs, extra)
  return out
}
