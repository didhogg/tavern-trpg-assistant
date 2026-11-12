// 官方数据下载计划：照抄作者离线设计（node/build-sw.mjs，中英两站同一套规则）。
//   预载（第 56、57、59 行）："data/*.json"、"data/**/!(adventure)/*.json"、"search/*.json"
//   按需（第 87 行）：        "data/adventure/**/*.json"（冒险正文，用到哪本取哪本）
// P5 T2：按书安装不是另写书单；用作者目录/index 给出的“来源 → 文件”映射把预载文件分成
//   共用 / 某来源 / 某本书正文 / 职业文件，再由用户选的书筛。共享文件原样保留，不重打包。
import type { FileList } from './fetcher'
import type { OfficialSetState } from './db'
import type { SourceFiles } from './runtime/frame/directory-commands'

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
  missing: { sources: string[]; books: string[]; adventures?: string[] }
  /** 这份计划最终应该登记的来源 / 书 / 冒险集合；null = 不限制（全部 / 旧整套）。 */
  sources: string[] | null
  books: string[] | null
  adventures: string[] | null
  /** 已装但目标目录移除的冒险；任务应把正文移除，而不是要求补文件。 */
  removedAdventures?: string[]
  /** 作者目录，用于从实际下载的原件追补隐藏依赖。 */
  sourceFiles?: SourceFiles
}

export interface PlanOptions {
  /** 全部安装（不按书筛）。 */
  all?: boolean
  /** 来源文件全部要（旧整套安装），但书正文仍按 books 筛。 */
  allSources?: boolean
  /** 书正文全部要。 */
  allBooks?: boolean
  /** 已经在本地装过的冒险；用于区分“新选但作者没有”和“上游移除了已装冒险”。 */
  knownAdventures?: string[]
  /**
   * 这一套里已经装着的来源（状态里记的）。其中没有专属文件的（Generic、基础包等，混在共用文件里，共用文件总会一起装）
   * 不算「缺」；拼错 / 从没装过的来源照样报缺（P5 T6：单本卸载后再下载 / 检查更新被误拒的回归）。
   */
  installedSources?: string[]
  /** 这套作者程序（cn / en）；索引过滤按资料集 + 路径存，避免中英互相覆盖。 */
  codeSet?: string
  /** 作者来源索引文件：路径 → 索引里出现的全部来源。 */
  indexSources?: Record<string, string[]>
  sourceFiles?: SourceFiles
}


export interface SelectionInput { books?: string[] | null; sources?: string[] | null; adventures?: string[] | null }

/** 补装保留既有书 / 来源；旧整套（null）继续表示不限制。 */
export function selectionFor(base: OfficialSetState | null, opts: SelectionInput): { books: string[] | null; sources: string[] | null; adventures: string[] | null; allSources: boolean } {
  const installed = base?.status === 'installed'
  const baseBooks = installed ? base.books : null
  const baseSources = installed ? base.sources : null
  const books = installed && baseBooks === null ? null : unionSelection(baseBooks, opts.books)
  const sources = installed && baseSources === null ? null : unionSelection(baseSources, opts.sources)
  const adventures = unionSelection(installed ? base.adventures : null, opts.adventures)
  return { books, sources, adventures, allSources: installed && baseSources === null }
}

export const fullPlan = (full: Plan, codeSet?: string): OfficialPlan => ({
  ...full, shared: { ...full }, bySource: empty(), byBook: empty(), byClass: empty(), byAdventure: empty(),
  sourceIndexes: { [codeSet ? `${codeSet}|*` : '*']: null }, missing: { sources: [], books: [] }, sources: null, books: null, adventures: null,
})

export function unionSelection(current: string[] | null | undefined, add: string[] | null | undefined): string[] | null {
  if (current == null) return add == null ? null : [...new Set(add)].sort()
  if (add == null) return [...new Set(current)].sort()
  return [...new Set([...current, ...add])].sort()
}

const empty = (): Plan => ({ files: [], bytes: 0 })
const add = (plan: Plan, path: string, size: number): void => { plan.files.push(path); plan.bytes += size }

/**
 * 按书 / 来源生成计划；文件归属由作者目录与 index 决定，不手写。
 * 共用文件与职业文件总是要（作者设计如此；共享文件可能含其他书的数据，但不标成已装）。
 */
export function officialPlan(list: FileList, owners: Record<string, PlanOwner>, input: PlanInput = {}, opts: PlanOptions = {}): OfficialPlan {
  const all = opts.all === true || (input.sources == null && input.books == null)
  const allSources = opts.allSources === true || all
  const allBooks = opts.allBooks === true || all
  const books = input.books ? new Set(input.books) : null
  let sources = input.sources ? new Set(input.sources) : null
  if (!allSources && books) {
    sources ??= new Set<string>()
    for (const owner of Object.values(owners)) if (owner.kind === 'book' && books.has(owner.id)) sources.add(owner.source)
  }
  const adventures = input.adventures ? new Set(input.adventures) : null
  const adventureSources = new Set(Object.entries(owners).flatMap(([path, owner]) =>
    owner.kind === 'adventure' && adventures?.has(owner.id) && list[path] ? [owner.source] : []))
  if (sources) for (const source of adventureSources) sources.add(source)
  const out: OfficialPlan = {
    ...empty(), shared: empty(), bySource: empty(), byBook: empty(), byClass: empty(), byAdventure: empty(),
    sourceIndexes: {}, missing: { sources: [], books: [] },
    sources: allSources ? null : [...(sources ?? [])].sort(), books: allBooks ? null : [...(books ?? [])].sort(),
    adventures: adventures ? [...adventures].sort() : null,
    ...(opts.sourceFiles ? { sourceFiles: opts.sourceFiles } : {}),
  }
  if (!allSources && !sources) sources = new Set<string>()
  const seenSource = new Set(adventureSources)
  const seenBook = new Set<string>()
  for (const path of Object.keys(list).filter(isPrecache).sort()) {
    const size = list[path].size
    const owner = owners[path]
    if (!owner) { add(out.shared, path, size); add(out, path, size); continue }
    if (owner.kind === 'class') { add(out.byClass, path, size); add(out, path, size); continue }
    if (owner.kind === 'source') {
      const hit = allSources || owner.sources.some((s) => sources?.has(s))
      if (!hit) continue
      for (const s of owner.sources) if (allSources || sources?.has(s)) seenSource.add(s)
      add(out.bySource, path, size); add(out, path, size); continue
    }
    if (owner.kind === 'book') {
      if (!(allBooks || books?.has(owner.id))) continue
      seenBook.add(owner.id)
      seenSource.add(owner.source)
      add(out.byBook, path, size); add(out, path, size); continue
    }
    // 冒险正文不在 precache 里；由 directory 的 adventureFiles 单独加
  }
  const keyOf = (path: string): string => (opts.codeSet ? `${opts.codeSet}|${path}` : path)
  for (const [path, allowed] of Object.entries(opts.indexSources ?? {})) {
    out.sourceIndexes[keyOf(path)] = allSources ? null : allowed.filter((s) => sources?.has(s) ?? false)
  }
  if (allSources && !Object.keys(opts.indexSources ?? {}).length) out.sourceIndexes[keyOf('*')] = null
  const installed = new Set((opts.installedSources ?? []).map((s) => s.toLowerCase()))
  if (!allSources && sources) for (const s of sources) if (!seenSource.has(s) && !installed.has(s.toLowerCase())) out.missing.sources.push(s)
  if (!allBooks && books) for (const b of books) if (!seenBook.has(b)) out.missing.books.push(b)
  // 冒险正文：只加选中的（计划外，但执行 / 估算共用这一份）
  const seenAdventure = new Set<string>()
  const removedAdventures: string[] = []
  if (adventures) {
    const known = new Set(opts.knownAdventures ?? [])
    for (const [path, owner] of Object.entries(owners)) {
      if (owner.kind !== 'adventure' || !adventures.has(owner.id)) continue
      seenAdventure.add(owner.id)
      const expected = list[path]
      if (!expected) {
        if (known.has(owner.id)) removedAdventures.push(owner.id)
        else (out.missing.adventures ??= []).push(owner.id)
        continue
      }
      add(out.byAdventure, path, expected.size)
      add(out, path, expected.size)
    }
    for (const id of adventures) if (!seenAdventure.has(id)) {
      if (known.has(id)) removedAdventures.push(id)
      else (out.missing.adventures ??= []).push(id)
    }
  }
  if (removedAdventures.length) out.removedAdventures = [...new Set(removedAdventures)].sort()
  if (adventures) out.adventures = [...adventures].filter((id) => !out.removedAdventures?.includes(id) && !out.missing.adventures?.includes(id)).sort()
  return out
}
