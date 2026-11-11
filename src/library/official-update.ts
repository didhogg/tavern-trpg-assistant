// 官方数据跟上游新提交（P5 B-28 / T2-T3）：只比较、先在准备版本里下载，成功才切已发布版本。
// 规矩（Q-A 甲）：插件里带的作者程序（vendor）固定在登记表那一版；上游作者程序版本号一致才允许跟。
// P5 T2：更新比较用“已装书 + 已装冒险正文”的计划，不再只比较整套预载；P5 T3：不再提前改全局提交号。
import type { LibraryDatabase } from './db'
import type { BookDirectory } from './directory'
import { fetchFileList, type FetchLike, type FileList } from './fetcher'
import type { FileProvider } from './files'
import { officialPlan, type OfficialPlan } from './plan'
import { installedAdventureIds } from './install'
import { CODE_SETS, fileListUrlAt, getSource, mirrorRootsAt, SOURCES, type SourceEntry } from './sources'
import type { LibraryRevisionStore, LibraryView } from './revision'

export type OfficialUpdateStatus = 'up-to-date' | 'available' | 'needs-plugin-upgrade'

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
  /** 已经按已装书 / 冒险算好的计划；apply 直接交给下载任务，不再重新解释。 */
  plan?: OfficialPlan
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
  startOfficial: (setId: string, opts?: { plan?: OfficialPlan; commit?: string }) => string
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
    const list = await this.newList(source, latest, view)
    const state = await view.officialState(setId)
    if (!state || state.status !== 'installed') throw new Error(`${setId} 还没安装，不能检查更新`)
    const adventures = state.adventures === null ? await installedAdventureIds(view, setId) : state.adventures
    if (!this.opts.directory) throw new Error('没有接作者书目入口，不能按目标提交检查更新')
    // 更新计划必须用目标提交的作者目录；不能退回当前缓存或整套计划。
    const rec = await this.opts.directory.get(source.codeSet, { commit: latest })
    if (rec.errors.books || !rec.books.length) throw new Error(rec.errors.books ?? `作者书目（目标提交 ${latest.slice(0, 7)}）为空或取不到`)
    if (rec.errors.adventures && adventures.length) throw new Error(rec.errors.adventures)
    const plan = officialPlan(list, rec.owners, { sources: state.sources, books: state.books, adventures }, { indexSources: rec.indexSources, codeSet: source.codeSet, knownAdventures: adventures })
    if (plan.missing.sources.length || plan.missing.books.length || (plan.missing.adventures?.length ?? 0)) {
      throw new Error(`目标提交的作者目录缺少：${[...plan.missing.sources, ...plan.missing.books, ...(plan.missing.adventures ?? [])].join('、')}`)
    }
    let changed = 0
    let added = 0
    let bytes = 0
    for (const p of plan.files) {
      const expected = list[p]
      if (!expected) continue
      const had = await view.fileSha(source, p)
      if (had === null) { added++; bytes += expected.size }
      else if (had !== expected.sha) { changed++; bytes += expected.size }
    }
    // 旧版本里实际存在的预载文件，在新计划里不需要了 = 要移除（冒险正文不在预载里，另算）
    const currentPaths = await view.filePaths(source)
    const removedPaths = currentPaths.filter((p) => !plan.files.includes(p))
    const objects = new Map<string, OfficialUpdateObject>()
    let shared = false
    const addObject = (path: string, field: 'added' | 'changed' | 'removed', size: number): void => {
      const owner = rec.owners[path]
      if (!owner || (owner.kind !== 'book' && owner.kind !== 'adventure')) { shared = true; return }
      const key = `${owner.kind}:${owner.id}`
      const row = objects.get(key) ?? { kind: owner.kind, id: owner.id, source: owner.source ?? null, name: '', added: 0, changed: 0, removed: 0, bytes: 0, shared: false }
      row[field]++
      if (field !== 'removed') row.bytes += size
      objects.set(key, row)
    }
    for (const path of plan.files) {
      const expected = list[path]
      if (!expected) continue
      const had = await view.fileSha(source, path)
      if (had === null) addObject(path, 'added', expected.size)
      else if (had !== expected.sha) addObject(path, 'changed', expected.size)
    }
    for (const path of removedPaths) addObject(path, 'removed', list[path]?.size ?? 0)
    for (const row of objects.values()) {
      const book = row.kind === 'book' ? rec.books.find((b) => String(b.id) === row.id) : rec.adventures.find((a) => String(a.id) === row.id)
      row.name = String((book as { name?: unknown } | undefined)?.name ?? row.id)
      row.shared = shared
    }
    return { setId, status: 'available', current, latest, programVersion: { plugin, upstream }, changed: { changed, added, removed: removedPaths.length, bytes }, objects: [...objects.values()], plan }
  }

  /** 更新：启动下载任务；任务在准备版本里下载 / 解析，成功才发布。没有新版 / 不能跟时抛错。
   *  给了 bookIds / adventureIds 时只允许独立更新；共享文件或未选对象也有变化就要求整批更新。 */
  async apply(setId: string, opts: { bookIds?: string[]; adventureIds?: string[] } = {}): Promise<{ task: string; check: OfficialUpdateCheck }> {
    const check = await this.check(setId)
    if (check.status !== 'available') throw new Error(check.status === 'up-to-date' ? '已经是最新的' : `上游作者程序是 ${check.programVersion.upstream ?? '未知版本'}，插件里是 ${check.programVersion.plugin}，要先升级插件才能跟这次更新`)
    const selectedBooks = new Set(opts.bookIds ?? [])
    const selectedAdventures = new Set(opts.adventureIds ?? [])
    const selecting = selectedBooks.size > 0 || selectedAdventures.size > 0
    if (selecting) {
      const selected = (o: OfficialUpdateObject): boolean => o.kind === 'book' ? selectedBooks.has(o.id) : selectedAdventures.has(o.id)
      const changed = (check.objects ?? []).filter((o) => selected(o) && (o.added || o.changed || o.removed || o.shared))
      const outside = (check.objects ?? []).filter((o) => !selected(o) && (o.added || o.changed || o.removed))
      if ((check.objects ?? []).some((o) => selected(o) && o.shared)) throw new Error('这次变化牵连共用文件，不能只更新选中的书 / 冒险；请按整批更新')
      if (outside.length) throw new Error(`未选中的对象也有变化（${outside.map((o) => o.name || o.id).join('、')}），请按整批更新`)
      if (!changed.length) throw new Error('选中的书 / 冒险没有可更新变化')
    }
    return { task: this.opts.startOfficial(setId, { ...(check.plan ? { plan: check.plan } : {}), commit: check.latest }), check }
  }
}
