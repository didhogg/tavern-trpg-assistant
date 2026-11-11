// 官方数据跟上游新提交（P5 B-28 / T2-T3）：只比较、先在准备版本里下载，成功才切已发布版本。
// 规矩（Q-A 甲）：插件里带的作者程序（vendor）固定在登记表那一版；上游作者程序版本号一致才允许跟。
// P5 T2：更新比较用“已装书 + 已装冒险正文”的计划，不再只比较整套预载；P5 T3：不再提前改全局提交号。
import type { LibraryDatabase } from './db'
import type { BookDirectory } from './directory'
import { fetchFileList, type FetchLike, type FileList } from './fetcher'
import type { FileProvider } from './files'
import { isAdventure, officialPlan, precachePlan, type OfficialPlan } from './plan'
import { CODE_SETS, fileListUrlAt, getSource, mirrorRootsAt, SOURCES, type SourceEntry } from './sources'
import type { LibraryRevisionStore, LibraryView } from './revision'

export type OfficialUpdateStatus = 'up-to-date' | 'available' | 'needs-plugin-upgrade'

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
    const rec = this.opts.directory ? await this.opts.directory.peek(source.codeSet) : null
    const plan = rec && state
      ? officialPlan(list, rec.owners, { sources: state.sources, books: state.books, adventures: state.adventures }, { indexSources: rec.indexSources })
      : { ...precachePlan(list), shared: precachePlan(list), bySource: { files: [], bytes: 0 }, byBook: { files: [], bytes: 0 }, byClass: { files: [], bytes: 0 }, byAdventure: { files: [], bytes: 0 }, sourceIndexes: {}, missing: { sources: [], books: [] } }
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
    const currentPaths = (await view.filePaths(source)).filter((p) => !isAdventure(p))
    const removed = currentPaths.filter((p) => !plan.files.includes(p)).length
    return { setId, status: 'available', current, latest, programVersion: { plugin, upstream }, changed: { changed, added, removed, bytes }, plan }
  }

  /** 更新：启动下载任务；任务在准备版本里下载 / 解析，成功才发布。没有新版 / 不能跟时抛错。 */
  async apply(setId: string): Promise<{ task: string; check: OfficialUpdateCheck }> {
    const check = await this.check(setId)
    if (check.status !== 'available') throw new Error(check.status === 'up-to-date' ? '已经是最新的' : `上游作者程序是 ${check.programVersion.upstream ?? '未知版本'}，插件里是 ${check.programVersion.plugin}，要先升级插件才能跟这次更新`)
    return { task: this.opts.startOfficial(setId, { ...(check.plan ? { plan: check.plan } : {}), commit: check.latest }), check }
  }
}
