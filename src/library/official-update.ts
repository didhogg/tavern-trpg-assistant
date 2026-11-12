// 官方数据跟上游新提交（P5 B-28 / T2-T3）：只比较、先在准备版本里下载，成功才切已发布版本。
// 规矩（Q-A 甲）：插件里带的作者程序（vendor）固定在登记表那一版；上游作者程序版本号一致才允许跟。
// P5 T2：更新比较用“已装书 + 已装冒险正文”的计划，不再只比较整套预载；P5 T3：不再提前改全局提交号。
import type { LibraryDatabase, OfficialSetState } from './db'
import type { BookDirectory } from './directory'
import { fetchFileList, type FetchLike, type FileList } from './fetcher'
import type { FileProvider } from './files'
import { isAdventure, isPrecache, officialPlan } from './plan'
import { installedAdventureIds } from './install'
import { CODE_SETS, fileListUrlAt, getSource, mirrorRootsAt, SOURCES, type SourceEntry } from './sources'
import type { LibraryRevisionStore, LibraryView } from './revision'
import type { OfficialTaskOptions } from './tasks'

export type OfficialUpdateStatus = 'up-to-date' | 'available' | 'needs-plugin-upgrade'
export interface OfficialUpdateSelection { bookIds?: string[]; adventureIds?: string[] }
type FileOverrides = NonNullable<OfficialSetState['fileOverrides']>

export class OfficialUpdateBatchRequired extends Error {}
export class OfficialUpdateCurrent extends Error {
  constructor(message: string, readonly selection?: OfficialUpdateSelection) { super(message) }
}

export interface OfficialUpdateObject {
  kind: 'book' | 'adventure'
  id: string
  source: string | null
  name: string
  added: number
  changed: number
  removed: number
  bytes: number
  shared: boolean
}

export interface OfficialUpdateCheck {
  setId: string
  status: OfficialUpdateStatus
  current: string
  /** 上游最新提交；up-to-date 时等于 current。 */
  latest: string
  /** 作者程序版本：插件里带的 / 上游最新提交的（取不到为 null）。 */
  programVersion: { plugin: string; upstream: string | null }
  /** 只有 available 才有：要重下 / 新增 / 删掉的文件数与要下载的字节数。 */
  changed?: { changed: number; added: number; removed: number; bytes: number }
  /** 本次受影响的已装书 / 冒险；共用文件变化时 shared=true，界面据此说明牵连范围。 */
  objects?: OfficialUpdateObject[]
  /** 有变化的共用文件需要与这套资料一起发布。 */
  shared?: boolean
}

/** 登记表里的版本 "2.39.0-cn.3" → 作者程序版本 "2.39.0"（后缀是中文数据的修订号，不是程序版本）。 */
export const programVersionOf = (version: string): string => version.split('-')[0]

/** 兼容旧调用：启动时把安装记录里的提交号恢复成全局值（只有旧的单版本测试再用）。 */
export async function hydrateCommits(db: LibraryDatabase): Promise<void> {
  const { setCommitOverride } = await import('./sources')
  for (const source of SOURCES.filter((s) => s.kind === 'official')) {
    const rec = await db.sets.get(source.id)
    const commit = rec && typeof rec.commit === 'string' ? rec.commit : null
    setCommitOverride(source.codeSet, commit)
  }
}

export interface OfficialUpdatesOptions {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  files: FileProvider
  directory?: BookDirectory
  fetchImpl?: FetchLike
  /** 下载任务入口（tasks.startOfficial）；返回任务编号。 */
  startOfficial: (setId: string, opts?: OfficialTaskOptions) => string
}

export class OfficialUpdates {
  private readonly fetchImpl: FetchLike

  constructor(private readonly opts: OfficialUpdatesOptions) {
    this.fetchImpl = opts.fetchImpl ?? ((url) => fetch(url))
  }

  private async latestCommit(source: SourceEntry): Promise<string> {
    const url = `https://api.github.com/repos/${CODE_SETS[source.codeSet].repo}/commits/HEAD`
    const res = await this.fetchImpl(url)
    if (!res.ok) throw new Error(`取上游最新提交失败：HTTP ${res.status} ${url}`)
    const sha = ((await res.json()) as { sha?: unknown }).sha
    if (typeof sha !== 'string' || !sha) throw new Error(`上游最新提交的返回里没有 sha：${url}`)
    return sha
  }

  private async upstreamProgramVersion(source: SourceEntry, commit: string): Promise<string | null> {
    for (const root of mirrorRootsAt(source, commit)) {
      try {
        const res = await this.fetchImpl(`${root}package.json`)
        if (!res.ok) continue
        const v = ((await res.json()) as { version?: unknown }).version
        if (typeof v === 'string') return v
      } catch {
        continue // 这个镜像不通，试下一个
      }
    }
    return null
  }

  private async newList(source: SourceEntry, commit: string, view: LibraryView): Promise<FileList> {
    const key = `filelist:${source.id}@${commit}`
    const saved = await view.derivedGet(key)
    if (saved) return saved.value as FileList
    const list = await fetchFileList(fileListUrlAt(source, commit), this.fetchImpl)
    await view.derivedPut(key, commit, list)
    return list
  }

  /** 只比较、不改任何已装的东西：有没有新版、能不能跟、要重下多少。 */
  async check(setId: string): Promise<OfficialUpdateCheck> {
    const source = getSource(setId)
    if (source.kind !== 'official') throw new Error(`${setId} 不是官方数据集`)
    await this.opts.files.whenReady()
    const view = await this.opts.revisions.published()
    const current = await view.commitOf(source)
    const plugin = programVersionOf(CODE_SETS[source.codeSet].version)
    const latest = await this.latestCommit(source)
    if (latest === current) return { setId, status: 'up-to-date', current, latest, programVersion: { plugin, upstream: plugin } }
    const upstream = await this.upstreamProgramVersion(source, latest)
    if (upstream !== plugin) return { setId, status: 'needs-plugin-upgrade', current, latest, programVersion: { plugin, upstream } }
    const { summary } = await this.compare(source, latest, view)
    return { setId, status: 'available', current, latest, programVersion: { plugin, upstream }, ...summary }
  }

  private async compare(source: SourceEntry, latest: string, view: LibraryView) {
    const setId = source.id
    const list = await this.newList(source, latest, view)
    const state = await view.officialState(setId)
    if (!state || state.status !== 'installed') throw new Error(`${setId} 还没安装，不能检查更新`)
    const adventures = state.adventures === null ? await installedAdventureIds(view, setId) : state.adventures
    if (!this.opts.directory) throw new Error('没有接作者书目入口，不能按目标提交检查更新')
    // 更新计划必须用目标提交的作者目录；不能退回当前缓存或整套计划。
    const rec = await this.opts.directory.get(source.codeSet, { commit: latest })
    if (rec.errors.books || !rec.books.length) throw new Error(rec.errors.books ?? `作者书目（目标提交 ${latest.slice(0, 7)}）为空或取不到`)
    if (rec.errors.adventures && adventures.length) throw new Error(rec.errors.adventures)
    const plan = officialPlan(list, rec.owners, { sources: state.sources, books: state.books, adventures }, { indexSources: rec.indexSources, codeSet: source.codeSet, knownAdventures: adventures, installedSources: state.sources ?? [] })
    if (plan.missing.sources.length || plan.missing.books.length || (plan.missing.adventures?.length ?? 0)) {
      throw new Error(`目标提交的作者目录缺少：${[...plan.missing.sources, ...plan.missing.books, ...(plan.missing.adventures ?? [])].join('、')}`)
    }
    const wanted = new Set([...plan.files, ...(state.dependencyFiles ?? []).filter((p) => list[p])])
    const old = rec.commit === state.commit ? rec :
      await this.opts.directory.peek(source.codeSet, { commit: state.commit }) ?? await this.opts.directory.get(source.codeSet, { commit: state.commit })
    const visible = state.sources && new Set(state.sources.map((s) => s.toLowerCase()))
    const plannedSources = new Set(plan.bySource.files.flatMap((p) => {
      const owner = rec.owners[p]
      return owner?.kind === 'source' ? owner.sources.map((s) => s.toLowerCase()) : []
    }))
    const installedObjects = [
      ...[...old.books, ...rec.books].filter((b) => state.books === null || state.books.includes(String(b.id))).map((b) => ({ kind: 'book' as const, id: String(b.id), source: String(b.source), name: String(b.name ?? b.id) })),
      ...[...old.adventures, ...rec.adventures].filter((a) => adventures.includes(String(a.id)) || (visible ?? plannedSources).has(String(a.source).toLowerCase())).map((a) => ({ kind: 'adventure' as const, id: String(a.id), source: String(a.source), name: String(a.name ?? a.id) })),
    ]
    const blank = (entry: Pick<OfficialUpdateObject, 'kind' | 'id' | 'source' | 'name'>): OfficialUpdateObject => ({ ...entry, added: 0, changed: 0, removed: 0, bytes: 0, shared: false })
    const objects = new Map<string, OfficialUpdateObject>(installedObjects.map((entry) => [`${entry.kind}:${entry.id}`, blank(entry)]))
    const actual = { added: 0, changed: 0, removed: 0, bytes: 0 }
    const files = new Map<string, Set<OfficialUpdateObject>>()
    let shared = false
    const addObject = (path: string, field: 'added' | 'changed' | 'removed', size: number): void => {
      actual[field]++
      actual.bytes += size
      const owner = rec.owners[path] ?? old.owners[path]
      if (!owner || owner.kind === 'class') { shared = true; return }
      const owners = new Set<OfficialUpdateObject>()
      files.set(path, owners)
      if (owner.kind === 'source') {
        for (const source of owner.sources) {
          if (visible && !visible.has(source.toLowerCase())) { shared = true; continue }
          const rows = [...objects.values()].filter((r) => r.source?.toLowerCase() === source.toLowerCase())
          if (!rows.length) {
            const row = blank({ kind: 'book', id: source, source, name: rec.sources[source]?.full ?? source })
            rows.push(row)
            objects.set(`book:${source}`, row)
          }
          for (const row of rows) owners.add(row)
        }
      } else {
        const row = objects.get(`${owner.kind}:${owner.id}`)
        if (row) owners.add(row)
      }
      if (owners.size > 1) shared = true
      for (const row of owners) { row[field]++; row.bytes += size }
    }
    for (const path of wanted) {
      const expected = list[path]
      if (!expected) continue
      const had = await view.fileSha(source, path)
      if (had === null) addObject(path, 'added', expected.size)
      else if (had !== expected.sha) addObject(path, 'changed', expected.size)
    }
    for (const path of await view.filePaths(source)) {
      if (wanted.has(path) || list[path]) continue
      if (!isPrecache(path) && !isAdventure(path)) continue
      const owner = old.owners[path]
      if (owner?.kind === 'book' && state.books && !state.books.includes(owner.id)) continue
      if (owner?.kind === 'adventure' && !adventures.includes(owner.id)) continue
      if (owner?.kind === 'source' && visible && !owner.sources.some((s) => visible.has(s.toLowerCase())) && !state.dependencyFiles?.includes(path)) continue
      addObject(path, 'removed', 0)
    }
    return { list, files, summary: { changed: actual, objects: [...objects.values()].filter((row) => shared || hasChange(row)).map((row) => ({ ...row, shared })), shared } }
  }

  /** 共用文件必须整批更新；独立变化只更新选中书 / 冒险。 */
  async apply(setId: string, opts: OfficialUpdateSelection = {}): Promise<{ task: string; check: OfficialUpdateCheck }> {
    const check = await this.check(setId)
    if (check.status === 'up-to-date') throw new OfficialUpdateCurrent('已经是最新的')
    if (check.status !== 'available') throw new Error(`上游作者程序是 ${check.programVersion.upstream ?? '未知版本'}，插件里是 ${check.programVersion.plugin}，要先升级插件才能跟这次更新`)
    assertUpdateSelection(check, opts)
    const updateSelection = opts.bookIds?.length || opts.adventureIds?.length ? opts : undefined
    return { task: this.opts.startOfficial(setId, { commit: check.latest, updateFrom: check.current, ...(updateSelection ? { updateSelection } : {}) }), check }
  }

  /** 锁内按实际已装文件重算选中路径。有其他独立变化时保持基础提交，只固定选中的新文件。 */
  async planSelection(setId: string, commit: string, opts: OfficialUpdateSelection | undefined, base: LibraryView): Promise<FileOverrides | null> {
    const source = getSource(setId)
    const state = await base.officialState(setId)
    const pinnedElsewhere = Object.values(state?.fileOverrides ?? {}).some((file) => file && file.commit !== commit)
    if (pinnedElsewhere && await this.latestCommit(source) !== commit) throw new Error('部分书已更新到别的提交，请重新检查更新')
    if (!opts) return null
    const { summary, list, files } = await this.compare(source, commit, base)
    assertUpdateSelection(summary, opts)
    if (!summary.objects.some((o) => !selectedBy(o, opts))) return null
    return Object.fromEntries([...files].filter(([, owners]) => [...owners].some((o) => selectedBy(o, opts)))
      .map(([path]) => [path, list[path] ? { ...list[path], commit } : null]))
  }
}

const hasChange = (o: OfficialUpdateObject): boolean => !!(o.added || o.changed || o.removed)
const selectedBy = (o: OfficialUpdateObject, opts: OfficialUpdateSelection): boolean =>
  !!(o.kind === 'book' ? opts.bookIds?.includes(o.id) : opts.adventureIds?.includes(o.id))

function assertUpdateSelection(check: Pick<OfficialUpdateCheck, 'shared' | 'objects'>, opts: OfficialUpdateSelection): void {
  if (!opts.bookIds?.length && !opts.adventureIds?.length) return
  if (check.shared) throw new OfficialUpdateBatchRequired('这次变化牵连共用文件，不能只更新选中的书 / 冒险；请按整批更新')
  if (!(check.objects ?? []).some((o) => hasChange(o) && selectedBy(o, opts))) throw new OfficialUpdateCurrent('选中的书 / 冒险已经是最新的', opts)
}
