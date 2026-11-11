// 官方数据下载计划：照抄作者离线设计（node/build-sw.mjs，中英两站同一套规则）。
//   预载（第 56、57、59 行）："data/*.json"、"data/**/!(adventure)/*.json"、"search/*.json"
//   按需（第 87 行）：        "data/adventure/**/*.json"（冒险正文，用到哪本取哪本）
// P5 T2：按书安装不是另写书单；用作者目录/index 给出的“来源 → 文件”映射把预载文件分成
//   共用 / 某来源 / 某本书正文 / 职业文件，再由用户选的书筛。共享文件原样保留，不重打包。
import type { FileList } from './fetcher'

const isJson = (p: string): boolean => p.endsWith('.json')
const parentDir = (p: string): string => p.split('/').at(-2) ?? ''

/** 作者"预载"规则：data 根下的 json；data 下任意子目录里、直接上级目录不叫 adventure 的 json；search 根下的 json。 */
export function isPrecache(path: string): boolean {
  if (!isJson(path)) return false
  const parts = path.split('/')
  if (parts[0] === 'search') return parts.length === 2
  if (parts[0] !== 'data') return false
  if (parts.length === 2) return true
  return parentDir(path) !== 'adventure'
}

/** 作者"按需"规则：data/adventure/ 下的 json。 */
export function isAdventure(path: string): boolean {
  return isJson(path) && path.startsWith('data/adventure/')
}

export interface Plan {
  files: string[]
  bytes: number
}

export function precachePlan(list: FileList): Plan {
  const files = Object.keys(list).filter(isPrecache).sort()
  return { files, bytes: files.reduce((n, p) => n + list[p].size, 0) }
}

export function adventurePlan(list: FileList, fileName: string): Plan {
  const files = Object.keys(list).filter((p) => isAdventure(p) && p.split('/').at(-1) === fileName)
  return { files, bytes: files.reduce((n, p) => n + list[p].size, 0) }
}

/** 一个文件属于谁：某来源、某本书正文、某本冒险正文、作者按职业拆的共用文件，或真正的共用文件。 */
export type PlanOwner =
  | { kind: 'source'; sources: string[] }
  | { kind: 'book'; id: string; source: string }
  | { kind: 'adventure'; id: string; source: string }
  | { kind: 'class' }

export interface PlanInput {
  /** 用户选中的来源（书 / 数据集的来源缩写）；不填 = 全部。 */
  sources?: string[] | null
  /** 用户选中的书正文编号；不填 = 全部。 */
  books?: string[] | null
  /** 已装 / 选中的冒险正文编号；不填 = 全部。 */
  adventures?: string[] | null
}

export interface OfficialPlan extends Plan {
  /** 共用文件（索引、单文件类别、搜索索引等）。 */
  shared: Plan
  /** 按来源拆的文件。 */
  bySource: Plan
  /** 书正文。 */
  byBook: Plan
  /** 作者按职业拆的文件（不按来源拆，装了任何书都要）。 */
  byClass: Plan
  /** 选中的冒险正文（另计，不在预载里）。 */
  byAdventure: Plan
  /** 读上下文里要过滤的来源索引文件：路径 → 允许的来源（null = 不过滤）。 */
  sourceIndexes: Record<string, string[] | null>
  /** 用户选了、但作者目录里找不到对应文件的来源 / 书。 */
  missing: { sources: string[]; books: string[] }
}

export interface PlanOptions {
  /** 全部安装（不按书筛）。 */
  all?: boolean
  /** 作者来源索引文件：路径 → 索引里出现的全部来源。 */
  indexSources?: Record<string, string[]>
}

const empty = (): Plan => ({ files: [], bytes: 0 })
const add = (plan: Plan, path: string, size: number): void => { plan.files.push(path); plan.bytes += size }

/**
 * 按书 / 来源生成计划；文件归属由作者目录与 index 决定，不手写。
 * 共用文件与职业文件总是要（作者设计如此；共享文件可能含其他书的数据，但不标成已装）。
 */
export function officialPlan(list: FileList, owners: Record<string, PlanOwner>, input: PlanInput = {}, opts: PlanOptions = {}): OfficialPlan {
  const all = opts.all === true || (input.sources == null && input.books == null)
  const books = input.books ? new Set(input.books) : null
  let sources = input.sources ? new Set(input.sources) : null
  if (!sources && books) {
    sources = new Set<string>()
    for (const owner of Object.values(owners)) if (owner.kind === 'book' && books.has(owner.id)) sources.add(owner.source)
  }
  const adventures = input.adventures ? new Set(input.adventures) : null
  const out: OfficialPlan = {
    ...empty(), shared: empty(), bySource: empty(), byBook: empty(), byClass: empty(), byAdventure: empty(),
    sourceIndexes: {}, missing: { sources: [], books: [] },
  }
  if (!all && !sources) sources = new Set<string>()
  const seenSource = new Set<string>()
  const seenBook = new Set<string>()
  for (const path of Object.keys(list).filter(isPrecache).sort()) {
    const size = list[path].size
    const owner = owners[path]
    if (!owner) { add(out.shared, path, size); add(out, path, size); continue }
    if (owner.kind === 'class') { add(out.byClass, path, size); add(out, path, size); continue }
    if (owner.kind === 'source') {
      const hit = all || owner.sources.some((s) => sources?.has(s))
      if (!hit) continue
      for (const s of owner.sources) if (all || sources?.has(s)) seenSource.add(s)
      add(out.bySource, path, size); add(out, path, size); continue
    }
    if (owner.kind === 'book') {
      if (!(all || books?.has(owner.id))) continue
      seenBook.add(owner.id)
      add(out.byBook, path, size); add(out, path, size); continue
    }
    // 冒险正文不在 precache 里；由 directory 的 adventureFiles 单独加
  }
  for (const [path, allowed] of Object.entries(opts.indexSources ?? {})) {
    out.sourceIndexes[path] = all ? null : allowed.filter((s) => sources?.has(s) ?? false)
  }
  if (!all) {
    if (sources) for (const s of sources) if (!seenSource.has(s)) out.missing.sources.push(s)
    if (books) for (const b of books) if (!seenBook.has(b)) out.missing.books.push(b)
  }
  // 冒险正文：只加选中的（计划外，但执行 / 估算共用这一份）
  if (adventures) {
    for (const [path, owner] of Object.entries(owners)) {
      if (owner.kind !== 'adventure' || !adventures.has(owner.id)) continue
      add(out.byAdventure, path, list[path].size)
      add(out, path, list[path].size)
    }
  }
  return out
}
