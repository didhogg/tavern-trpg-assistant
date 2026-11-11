// 自制包的依赖（作者 _meta.dependencies / includes / otherSources 与 _copy 的来源）是否有提供者。
// 删除预览（removal-impact）和包体检（管理页「缺哪些依赖」）共用这里，判断只有一套（P5 T6 后2）。
// 实测（P5 T6）：作者读取时依赖缺了，依赖它的整个包会被静默跳过（条目全部消失）；补回依赖后自动恢复。
import type { BrewPack, BrewRequirement } from './brew-packs'

/** 包声明的依赖：新包有 requires；旧包（或测试替身）用作者 _meta 的声明补齐。 */
export function requirementsOf(p: BrewPack): BrewRequirement[] {
  if (p.requires?.length) return p.requires
  const out: BrewRequirement[] = []
  for (const kind of ['dependencies', 'includes'] as const) {
    for (const [prop, list] of Object.entries((p[kind] ?? {}) as Record<string, unknown>)) {
      for (const source of Array.isArray(list) ? list : []) out.push({ kind: kind === 'dependencies' ? 'dependency' : 'include', prop, source: String(source) })
    }
  }
  for (const [prop, list] of Object.entries((p as { otherSources?: Record<string, Record<string, unknown>> }).otherSources ?? {})) {
    for (const source of Object.keys(list ?? {})) out.push({ kind: 'otherSource', prop, source })
  }
  return out
}

const sourcesOf = (p: BrewPack): string[] => p.sources.map((s) => s.toLowerCase())

/** 这条依赖现在有没有提供者：已装的官方来源（小写），或别的自制包提供同来源、同类别（给了编号就要有这条）。 */
export function canProvide(req: BrewRequirement, official: Set<string>, packs: BrewPack[]): boolean {
  const src = req.source.toLowerCase()
  if (official.has(src)) return true
  return packs.some((p) => {
    if (!sourcesOf(p).includes(src)) return false
    if (req.hash) return (p.hashes[req.prop] ?? []).includes(req.hash)
    return (p.props[req.prop] ?? 0) > 0 || (p.hashes[req.prop]?.length ?? 0) > 0
  })
}

export interface MissingDependency {
  /** 缺的来源（作者的来源标识）。 */
  source: string
  /** 用到它的类别（去重）。 */
  props: string[]
  /** official = 已知的官方来源（下载对应的书）；brew = 到作者自制仓库按来源找包。 */
  kind: 'official' | 'brew'
}

/**
 * 一个已装包现在缺哪些依赖（按来源合并）。自己提供的来源不算；
 * isOfficialSource：这个来源是不是官方书目里的来源（决定去下载官方书还是自制包）。
 */
export function missingDependencies(pack: BrewPack, official: Set<string>, packs: BrewPack[], isOfficialSource: (source: string) => boolean): MissingDependency[] {
  const own = new Set(sourcesOf(pack))
  const others = packs.filter((p) => p.docIdLocal !== pack.docIdLocal)
  const out = new Map<string, MissingDependency>()
  for (const req of requirementsOf(pack)) {
    const src = req.source.toLowerCase()
    if (own.has(src) || canProvide(req, official, others)) continue
    const hit = out.get(src) ?? { source: req.source, props: [], kind: isOfficialSource(req.source) ? 'official' as const : 'brew' as const }
    if (!hit.props.includes(req.prop)) hit.props.push(req.prop)
    out.set(src, hit)
  }
  return [...out.values()]
}
