// 备选版本与生效版本（D2-P3 整体设计 §2.3、§2.4）。
// 同编号的条目（两个自制包撞编号、自制包写了官方编号）和自己写的房规，都挂在原条目下当"备选"；
// 原件照常生效，用户选了才换。选择分三层：本战役 > 当前规则 > 全局；都没选 = 原件。
// 这里只有纯逻辑：找同编号、按选择定生效版本。条目对象由【库】交来，不改。
import type { EntryRef } from './scopes'

export interface DocIndex {
  docIdLocal: string
  filename: string | null
  /** 下载网址（本地导入的没有）。 */
  url?: string | null
  /** 包声明的来源（_meta.sources[].json）。 */
  sources?: string[]
  /** 作者包头的加入时间：先装的算"原来的"。同一次导入的几个包时间相同（同一毫秒），再按 order。 */
  timeAdded: number
  /** 在作者存储里的先后（作者按加入顺序往后排）。 */
  order: number
  isEditable: boolean
  /** 类别 → 包里每一条的作者编号（原始文件直接算，不经加载器）。 */
  props: Record<string, Array<string | null>>
}

/**
 * 包的稳定标识（P5 B-21）：作者自己判断"是不是同一个包"的规则（utils-brew-base.js `_getBrewId`）——有下载网址用网址，
 * 没有就用声明的来源（小写、排序、' :: ' 连起来）。卸载重装后不变；作者的本地编号 docIdLocal 每次新建都是随机的，不能用来长期记选择。
 */
export function packStableId(pack: { url?: string | null; sources?: string[] }): string | null {
  if (pack.url) return pack.url
  const sources = (pack.sources ?? []).map((s) => s.toLowerCase()).sort()
  return sources.length ? sources.join(' :: ') : null
}

/** 撞编号备选的编号：pack:<包的稳定标识>；包没有稳定标识时退回 doc:<本地编号>。 */
export const packAltId = (stable: string | null, docIdLocal: string): string => (stable ? `pack:${stable}` : `doc:${docIdLocal}`)

export interface Collision {
  prop: string
  hash: string
  /** 原来生效的：官方（official）或先装的那个包。 */
  base: { kind: 'official' } | { kind: 'doc'; docIdLocal: string }
  /** 后来的、挂成备选的包。 */
  others: string[]
}

/** 找同编号：和官方撞的，官方是原件；只在自制之间撞的，先装的是原件。同一个包里自己重复的不算（归作者）。 */
export function findCollisions(official: Record<string, Set<string>>, docs: DocIndex[]): Collision[] {
  const ordered = [...docs].sort((a, b) => a.timeAdded - b.timeAdded || a.order - b.order)
  const seen = new Map<string, string[]>()
  for (const d of ordered) {
    for (const [prop, hashes] of Object.entries(d.props)) {
      for (const h of new Set(hashes)) {
        if (!h) continue
        const k = `${prop}\u0000${h}`
        const list = seen.get(k)
        if (list) list.push(d.docIdLocal)
        else seen.set(k, [d.docIdLocal])
      }
    }
  }
  const out: Collision[] = []
  for (const [k, ids] of seen) {
    const [prop, hash] = k.split('\u0000')
    if (official[prop]?.has(hash)) out.push({ prop, hash, base: { kind: 'official' }, others: ids })
    else if (ids.length > 1) out.push({ prop, hash, base: { kind: 'doc', docIdLocal: ids[0] }, others: ids.slice(1) })
  }
  return out
}

export interface Alternative {
  /** 备选编号：撞编号的用包的稳定标识 pack:<稳定标识>（B-21，重装后不变）；房规用 house:<房规条目编号>。 */
  altId: string
  /** 旧编号（旧版本记下的 doc:<本地编号>）：旧的选择还认得，新选的一律记 altId。 */
  legacyIds?: string[]
  kind: 'collision' | 'houserule'
  /** 来自哪个包（文件名；可编辑自制为 null）。 */
  filename: string | null
  /** 来自哪个包（作者本地编号）；房规没有。En / 中文按包取另一种语言时用。 */
  docIdLocal?: string
  /** 这一条在库里的位置；详情用它读预计算的配图描述。 */
  ref?: EntryRef
  item: unknown
}

export type ChoiceBy = 'campaign' | 'rule' | 'global' | 'default'

export interface Chosen {
  /** 生效的备选编号；'base' = 原件。 */
  altId: string
  by: ChoiceBy
  /** 选过的备选已经不在了（包被删）→ 回到原件，提示用户。 */
  missing: string | null
}

/** 按 本战役 > 当前规则 > 全局 定生效版本；选的备选已不存在就回到原件并标出来。 */
/** 整包选用的键（P5.5 B8-4）：选择表里按原来源记，例如 src:phb → 'pack:phb :: phb_copy2'。和条目编号（数据集|类别|编号）不会撞。 */
export const packChoiceKey = (source: string): string => `src:${source.toLowerCase()}`
export const isPackChoiceKey = (key: string): boolean => key.startsWith('src:')

/**
 * 某一层的选择（P5.5 B8-4）：这一条单独选过的优先；没有就看它所属的书 / 包整包选过的（选的那一份确实有这一条才算，
 * 否则当没选，不报「选过的不在了」）。
 */
export function pickChoice(map: Record<string, string> | undefined, key: string, source: string | null | undefined, alts: Alternative[]): string | undefined {
  if (!map) return undefined
  if (map[key] !== undefined) return map[key]
  if (!source) return undefined
  const pick = map[packChoiceKey(source)]
  return pick !== undefined && (pick === 'base' || alts.some((a) => a.altId === pick)) ? pick : undefined
}

/** 选版本的层的先后（和 chooseVersion 同一个顺序）：本战役 0 → 这个战役的规则 1 → 全局 2；别的规则的层这个战役用不上（-1）。 */
export const levelRank = (rule: string, level: string): number => (level === 'campaign' ? 0 : level === `rule:${rule}` ? 1 : level === 'global' ? 2 : -1)

export function chooseVersion(alts: Alternative[], choices: { campaign?: string; rule?: string; global?: string }): Chosen {
  for (const by of ['campaign', 'rule', 'global'] as const) {
    const pick = choices[by]
    if (pick === undefined) continue
    if (pick === 'base') return { altId: 'base', by, missing: null }
    const hit = alts.find((a) => a.altId === pick || a.legacyIds?.includes(pick))
    if (hit) return { altId: hit.altId, by, missing: null }
    return { altId: 'base', by, missing: pick }
  }
  return { altId: 'base', by: 'default', missing: null }
}

/** 同编号拆行（P5 B-31）：这一行是哪个版本。 */
export interface VariantInfo {
  /** 'base' = 原件（官方或先装的包）；否则是备选编号。 */
  altId: string
  kind: 'base' | 'collision'
  /** 来自哪个包（文件名）；原件为 null。 */
  pack: string | null
  /** 来自哪个包（作者本地编号）；En / 中文按包取另一种语言用：counterpart(ref, { docIdLocal })。 */
  docIdLocal: string | null
  /** 现在在本战役生效的是不是这一行。 */
  effective: boolean
}

/**
 * 同编号拆行（B-31）的行清单：原件一行 + 每个撞编号的包一行（独立条目，各带来源）。房规是同一条的修改，不单独成行。
 * 生效的那一行 effective = true；选了房规时原件那一行算生效（房规改的就是它）。source = 备选对象自己写的来源（没写为 null）。
 */
export function variantsOf(chosenAltId: string, alts: Alternative[]): Array<{ variant: VariantInfo; item: unknown | null; source: string | null }> {
  const collisions = alts.filter((a) => a.kind === 'collision')
  const baseEffective = !collisions.some((a) => a.altId === chosenAltId)
  return [
    { variant: { altId: 'base', kind: 'base', pack: null, docIdLocal: null, effective: baseEffective }, item: null, source: null },
    ...collisions.map((a) => ({
      variant: { altId: a.altId, kind: 'collision' as const, pack: a.filename, docIdLocal: a.docIdLocal ?? null, effective: chosenAltId === a.altId },
      item: a.item, source: (a.item as { source?: string } | null)?.source ?? null,
    })),
  ]
}

/** 一行（带生效版本的对象）拆成多行；baseItem 是原件的对象。 */
export function expandVariants<R extends { item: unknown; source: string | null; version: { altId: string } }>(row: R, baseItem: unknown, alts: Alternative[]): Array<R & { variant: VariantInfo }> {
  return variantsOf(row.version.altId, alts).map((v) => ({
    ...row,
    item: v.variant.kind === 'base' ? (v.variant.effective ? row.item : baseItem) : v.item,
    source: v.source ?? row.source,
    variant: v.variant,
  }))
}
