// P6 建卡的「额外必选项」：官方进阶（dnd5e）列不出来、但作者条目数据里写着的选择——子职业、专长、可选特性。
// 写法登记表（整体设计 §3.4）：作者写法 → 额外必选项，加一种写法 = 加一行；认不出的写法进 unsupported，不静默漏掉。
// 只读作者数据，不写新规则；候选从【库】取（和库页同一份数据）。
import type { EntryRef } from '../../library/scopes'

/** 额外必选项的种类（同时就是库里那一类条目的编号）：建卡界面据此区分「按数据才出现的步骤」。 */
export const EXTRA_KINDS = ['subclass', 'feat', 'optionalfeature'] as const
export type ExtraKind = (typeof EXTRA_KINDS)[number]

export interface BuildExtra {
  kind: ExtraKind
  /** 给玩家看的标题（子职业叫什么、可选特性叫什么）。 */
  title: string
  count: number
  featureType?: string[]
  className?: string
  classSource?: string
}
export interface ExtraWithCandidates extends BuildExtra {
  candidates: Array<{ ref: EntryRef; name: string; source: string | null }>
  /** 候选没按前置条件筛（专长的前置条件检查还没做）。 */
  unfiltered?: boolean
}
export interface ExtrasOf { extras: BuildExtra[]; unsupported: string[] }

type Entry = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any -- 作者条目原样读
interface Rule { prop: string; field: string; of: (entry: Entry, out: ExtrasOf) => void }

/** 种族 feats: [{any: 1}]（任选 N 个专长）。 */
const raceFeats: Rule['of'] = (entry, out) => {
  let count = 0
  for (const f of entry.feats ?? []) { if (typeof f?.any === 'number') count += f.any; else out.unsupported.push(`种族专长写法：${JSON.stringify(f).slice(0, 80)}`) }
  if (count) out.extras.push({ kind: 'feat', title: '专长', count })
}
/** 职业 optionalfeatureProgression: [{name, featureType, progression}]；progression 是 {等级: 数} 或按等级排的数组，只取 1 级。 */
const classOptional: Rule['of'] = (entry, out) => {
  for (const p of entry.optionalfeatureProgression ?? []) {
    const prog = p?.progression
    const count = Array.isArray(prog) ? prog[0] : prog && typeof prog === 'object' ? prog['1'] : undefined
    if (typeof count !== 'number') { out.unsupported.push(`可选特性进度写法：${JSON.stringify(p).slice(0, 80)}`); continue }
    if (count > 0) out.extras.push({ kind: 'optionalfeature', title: String(p.name ?? '可选特性'), count, featureType: [...(p.featureType ?? [])] })
  }
}
/** 职业 1 级特性里带 gainSubclassFeature = 1 级就要选子职业（牧师 1、法师 2、战士 3）。 */
const classSubclass: Rule['of'] = (entry, out) => {
  const gains = (entry.classFeatures ?? []).flat().filter((f: Entry) => f && typeof f === 'object' && f.gainSubclassFeature && Number(f.level) <= 1)
  if (gains.length) out.extras.push({ kind: 'subclass', title: String(entry.subclassTitle ?? '子职业'), count: 1, className: entry.name, classSource: entry.source })
}
export const EXTRA_RULES: Rule[] = [
  { prop: 'race', field: 'feats', of: raceFeats },
  { prop: 'class', field: 'optionalfeatureProgression', of: classOptional },
  { prop: 'class', field: 'classFeatures', of: classSubclass },
]

export function extrasOf(prop: string, entry: Entry): ExtrasOf {
  const out: ExtrasOf = { extras: [], unsupported: [] }
  for (const rule of EXTRA_RULES) if (rule.prop === prop && entry[rule.field] !== undefined) rule.of(entry, out)
  return out
}

interface Row { ref: EntryRef; item: Entry; source?: string | null }
/** 候选：子职业 = 这个职业的子职业；专长 = 全部专长（前置条件没筛）；可选特性 = featureType 对得上的。 */
export async function candidatesOf(extra: BuildExtra, classNames: string[], query: (prop: string) => Promise<Row[]>): Promise<ExtraWithCandidates> {
  const name = (r: Row): string => String(r.item?.name ?? '未知')
  const pack = (rows: Row[]) => rows.map((r) => ({ ref: r.ref, name: name(r), source: r.source ?? null }))
  if (extra.kind === 'subclass') {
    const rows = (await query('subclass')).filter((r) => r.item?.classSource === extra.classSource && classNames.includes(String(r.item?.className)))
    return { ...extra, candidates: pack(rows) }
  }
  if (extra.kind === 'feat') return { ...extra, candidates: pack(await query('feat')), unfiltered: true }
  const types = new Set(extra.featureType ?? [])
  const rows = (await query('optionalfeature')).filter((r) => (r.item?.featureType ?? []).some((t: string) => types.has(t)))
  return { ...extra, candidates: pack(rows) }
}
