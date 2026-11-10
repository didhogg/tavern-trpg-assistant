// 官方数据跟上游新提交（P5 B-28，驾驶员 2026-11-10 定：独立于插件升级、自动跟进；用户在书架点【拉取更新】时才取更新信息）。
// 规矩（Q-A 甲）：插件里带的作者程序（vendor）固定在登记表那一版。上游作者程序的版本号（package.json 的 version）跟它一致，
// 新提交只是数据变了，才允许跟；版本号变了 = 作者改了程序，旧程序可能读不对新数据 → 提示"要升级插件才能跟这次更新"，不更新。
// 更新只重下变了的文件：未变的文件（指纹相同）直接改标新提交，不重下；之后沿用原来的下载 / 解析流程（installOfficial，已有文件按指纹复用）。
import type { LibraryDatabase } from './db'
import { fetchFileList, type FetchLike, type FileList } from './fetcher'
import type { FileProvider } from './files'
import { precachePlan } from './plan'
import { CODE_SETS, commitOf, fileListUrlAt, getSource, mirrorRootsAt, setCommitOverride, SOURCES, type SourceEntry } from './sources'

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
}

/** 登记表里的版本 "2.39.0-cn.3" → 作者程序版本 "2.39.0"（后缀是中文数据的修订号，不是程序版本）。 */
export const programVersionOf = (version: string): string => version.split('-')[0]

/** 启动时：按安装记录恢复数据提交号（更新过的数据不是登记表那个提交）。 */
export async function hydrateCommits(db: LibraryDatabase): Promise<void> {
  for (const source of SOURCES.filter((s) => s.kind === 'official')) {
    const rec = await db.sets.get(source.id)
    const commit = rec && typeof rec.commit === 'string' ? rec.commit : null
    setCommitOverride(source.codeSet, commit)
  }
}

export interface OfficialUpdatesOptions {
  db: LibraryDatabase
  files: FileProvider
  fetchImpl?: FetchLike
  /** 下载任务入口（tasks.startOfficial）；返回任务编号。 */
  startOfficial: (setId: string) => string
}

export class OfficialUpdates {
  private readonly fetchImpl: FetchLike

  constructor(private readonly opts: OfficialUpdatesOptions) {
    this.fetchImpl = opts.fetchImpl ?? ((url) => fetch(url))
  }

  /** 上游默认分支的最新提交（GitHub API；取不到抛错，由界面显示原因）。 */
  private async latestCommit(source: SourceEntry): Promise<string> {
    const url = `https://api.github.com/repos/${CODE_SETS[source.codeSet].repo}/commits/HEAD`
    const res = await this.fetchImpl(url)
    if (!res.ok) throw new Error(`取上游最新提交失败：HTTP ${res.status} ${url}`)
    const sha = ((await res.json()) as { sha?: unknown }).sha
    if (typeof sha !== 'string' || !sha) throw new Error(`上游最新提交的返回里没有 sha：${url}`)
    return sha
  }

  /** 上游那个提交的作者程序版本号：package.json 的 version，按登记的镜像顺序取。 */
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

  private async newList(source: SourceEntry, commit: string): Promise<FileList> {
    const key = `filelist:${source.id}@${commit}`
    const saved = await this.opts.db.derived.get(key)
    if (saved) return saved.value as FileList
    const list = await fetchFileList(fileListUrlAt(source, commit), this.fetchImpl)
    await this.opts.db.derived.put({ key, fingerprint: commit, value: list, savedAt: Date.now() })
    return list
  }

  /** 只比较、不改任何已装的东西：有没有新版、能不能跟、要重下多少。 */
  async check(setId: string): Promise<OfficialUpdateCheck> {
    const source = getSource(setId)
    if (source.kind !== 'official') throw new Error(`${setId} 不是官方数据集`)
    await this.opts.files.whenReady() // 等启动时恢复数据提交号
    const current = commitOf(source)
    const plugin = programVersionOf(CODE_SETS[source.codeSet].version)
    const latest = await this.latestCommit(source)
    if (latest === current) return { setId, status: 'up-to-date', current, latest, programVersion: { plugin, upstream: plugin } }
    const upstream = await this.upstreamProgramVersion(source, latest)
    if (upstream !== plugin) return { setId, status: 'needs-plugin-upgrade', current, latest, programVersion: { plugin, upstream } }
    const list = await this.newList(source, latest)
    const local = new Map((await this.opts.db.files.where('source').equals(source.id).toArray()).map((f) => [f.path, f.gitSha]))
    const plan = precachePlan(list).files
    let changed = 0
    let added = 0
    let bytes = 0
    for (const p of plan) {
      const had = local.get(p)
      if (had === undefined) added++
      else if (had !== list[p].sha) changed++
      else continue
      bytes += list[p].size
    }
    const removed = [...local.keys()].filter((p) => !(p in list)).length
    return { setId, status: 'available', current, latest, programVersion: { plugin, upstream }, changed: { changed, added, removed, bytes } }
  }

  /**
   * 更新：先把没变的文件改标新提交（不重下），再把数据提交号切到新的，最后走原来的下载 / 解析流程（只会下变了的和新增的）。
   * 返回下载任务编号（进度、取消、完成都走下载任务）。没有新版 / 不能跟时抛错。
   */
  async apply(setId: string): Promise<{ task: string; check: OfficialUpdateCheck }> {
    const check = await this.check(setId)
    if (check.status !== 'available') throw new Error(check.status === 'up-to-date' ? '已经是最新的' : `上游作者程序是 ${check.programVersion.upstream ?? '未知版本'}，插件里是 ${check.programVersion.plugin}，要先升级插件才能跟这次更新`)
    const source = getSource(setId)
    const list = await this.newList(source, check.latest)
    await this.opts.db.files.where('source').equals(source.id).modify((f) => {
      if (list[f.path]?.sha === f.gitSha) f.commit = check.latest
    })
    setCommitOverride(source.codeSet, check.latest)
    return { task: this.opts.startOfficial(setId), check }
  }
}
