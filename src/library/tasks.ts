// 下载任务（D2-P3 整体设计 §2.7；P5 T1 改为可恢复的操作记录）：官方、按本下载冒险正文统一成一种任务。
// 每次修改都开一个准备版本；成功才发布。任务状态和内容状态分开：失败 / 取消 / 重启不会让旧库消失。
import type { LibraryDatabase, OfficialSetState } from './db'
import type { FileProvider } from './files'
import { installedAdventureIds, prepareOfficial, type InstallReport } from './install'
import { failedInstallReport } from './install-report'
import type { AuthorFrame } from './runtime/host'
import type { LogSink } from './logs'
import { getSource } from './sources'
import { LibraryOperations, type OperationHandle } from './operations'
import type { LibraryRevisionStore, LibraryView } from './revision'
import { selectionFor } from './plan'
import type { FileList } from './fetcher'

export type TaskStatus = 'running' | 'paused' | 'done' | 'partial' | 'failed' | 'cancelled' | 'interrupted'

export interface TaskState {
  id: string
  kind: 'official' | 'adventure' | 'precompute'
  set: string
  /** 冒险编号（kind = adventure）。 */
  item: string | null
  status: TaskStatus
  progress: { stage: string; done: number; total: number; item?: string }
  error: string | null
  result: InstallReport | { path: string; parsed: boolean } | unknown | null
  /** 官方数据装完后接着跑的换算段结果（T2）。 */
  convert?: unknown
  convertError?: string
  /** 这次任务用的准备版本 / 操作编号（持久记录）。 */
  revision?: string
}

export interface OfficialTaskOptions {
  /** 更新到的新提交号；不填 = 当前版本。 */
  commit?: string
  /** 选中的来源（书）；不填 = 全部。 */
  books?: string[] | null
  sources?: string[] | null
  /** 已装 / 选中的冒险正文编号；不填 = 沿用当前版本。 */
  adventures?: string[] | null
  /** 这次更新针对的已发布提交与选择。锁内重新计划，不能拿检查结果覆盖清单。 */
  updateFrom?: string
  updateSelection?: import('./official-update').OfficialUpdateSelection
}

export interface TaskOptions {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  operations: LibraryOperations
  files: FileProvider
  /** 开一个只读本地、绑定到指定版本的作者小窗。 */
  openFrame: (codeSet: string, view: LibraryView) => Promise<AuthorFrame>
  /** 拿到修改权后，按已装集合和目标提交生成作者计划。 */
  planOfficial?: (setId: string, opts: import('./plan').SelectionInput & { commit?: string; allSources?: boolean; knownAdventures?: string[]; installedSources?: string[]; signal?: AbortSignal; manifest?: FileList }, view: LibraryView) => Promise<import('./plan').OfficialPlan | null>
  selectUpdate?: (setId: string, commit: string, selection: import('./official-update').OfficialUpdateSelection | undefined, base: LibraryView) => Promise<NonNullable<OfficialSetState['fileOverrides']> | null>
  /** T2：下载任务里的换算段；后端接结算内核，库层只报进度。 */
  precompute?: (setId: string, view: LibraryView, signal: AbortSignal, onProgress: (p: TaskState['progress']) => void) => Promise<unknown>
  onChange?: (t: TaskState) => void
  /** 发布成功后的通知（后端用它关掉旧版本的作者小窗 / 清缓存）。 */
  onPublished?: (view: LibraryView, previous: string) => void
  /** 失败写日志（P5 B-26）。 */
  onLog?: LogSink
  /** 失败安装的完整报告独立保存，体检在当前版本也能看到。 */
  onDiagnostic?: (setId: string, report: InstallReport) => Promise<void>
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

const listKey = (xs: string[] | null | undefined): string => (xs == null ? 'all' : [...new Set(xs)].sort().join(','))
/** 官方任务身份：同一数据集、同一组书/来源/冒险/目标提交才算同一个请求；否则各自排队。 */
export const officialTaskKey = (opts: OfficialTaskOptions): string => [
  `commit=${opts.commit ?? 'current'}`,
  `books=${listKey(opts.books)}`,
  `sources=${listKey(opts.sources)}`,
  `adventures=${listKey(opts.adventures)}`,
  `updateBooks=${listKey(opts.updateSelection?.bookIds)}`,
  `updateAdventures=${listKey(opts.updateSelection?.adventureIds)}`,
].join(';')


interface RunResult { result: TaskState['result']; status?: 'done' | 'partial' | 'cancelled' | 'paused'; revision?: string }

export class DownloadTasks {
  private readonly tasks = new Map<string, { state: TaskState; abort: AbortController; done: Promise<TaskState> }>()
  private readonly handles = new Map<string, OperationHandle>()
  private readonly paused = new Set<string>()
  private readonly officialOpts = new Map<string, OfficialTaskOptions>()
  private seq = 0

  constructor(private readonly opts: TaskOptions) {}

  list(): TaskState[] {
    return [...this.tasks.values()].map((t) => ({ ...t.state }))
  }

  get(id: string): TaskState | null {
    const t = this.tasks.get(id)
    return t ? { ...t.state } : null
  }

  /** 等任务结束（完成、失败或取消）。恢复出来的中断任务直接交回状态。 */
  wait(id: string): Promise<TaskState> {
    const t = this.tasks.get(id)
    if (!t) throw new Error(`没有这个任务：${id}`)
    return t.done
  }

  async cancel(id: string): Promise<void> {
    const task = this.tasks.get(id)
    task?.abort.abort()
    // 已暂停的任务早已停下（没有在跑的流程会把状态改掉）：这里直接标「已取消」，不能再继续（P5 T6）
    if (task && task.state.status === 'paused') {
      task.state.status = 'cancelled'
      this.paused.delete(id)
      this.officialOpts.delete(id)
    }
    await this.opts.operations.cancel(id)
  }

  /** 在文件 / 解析边界暂停；已经完成的下载留在内容表，前缀版本作废。 */
  pause(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task || task.state.status !== 'running' || task.state.kind !== 'official') return false
    this.paused.add(id)
    return true
  }

  /** 继续：用原选择重新排队，已校验文件按内容哈希复用。 */
  async resume(id: string): Promise<string | null> {
    const task = this.tasks.get(id)
    const opts = this.officialOpts.get(id)
    if (!task || task.state.status !== 'paused' || !opts) return null
    return this.startOfficial(task.state.set, opts)
  }

  /** 启动时恢复未完成的操作：未发布的标中断，已经切了指針的照实际版本算完成。 */
  async restore(): Promise<void> {
    await this.opts.operations.restore()
    const ops = (await this.opts.operations.list()).filter((o) => o.status === 'interrupted' || o.status === 'preparing' || o.status === 'publishing')
    for (const op of ops) {
      if (this.tasks.has(op.id)) continue
      const state: TaskState = {
        id: op.id, kind: op.kind === 'official' ? 'official' : op.kind === 'adventure' ? 'adventure' : 'precompute',
        set: op.set, item: op.item, status: op.status === 'done' ? 'done' : 'interrupted',
        progress: { stage: op.stage, done: op.done, total: op.total, ...(op.progressItem ? { item: op.progressItem } : {}) },
        error: op.status === 'done' ? null : op.error ?? '上次修改没有完成，已中断；可以重试',
        result: op.result ?? null, revision: op.revision,
      }
      this.tasks.set(op.id, { state, abort: new AbortController(), done: Promise.resolve({ ...state }) })
    }
  }

  private start(kind: TaskState['kind'], set: string, item: string | null, run: (state: TaskState, signal: AbortSignal) => Promise<RunResult>): string {
    const same = [...this.tasks.values()].find((t) => t.state.status === 'running' && t.state.kind === kind && t.state.set === set && t.state.item === item)
    if (same) return same.state.id
    const id = `task-${++this.seq}-${Date.now().toString(36)}`
    const abort = new AbortController()
    const state: TaskState = { id, kind, set, item, status: 'running', progress: { stage: 'start', done: 0, total: 0 }, error: null, result: null }
    const done = (async () => {
      try {
        const r = await run(state, abort.signal)
        state.result = r.result
        state.revision = r.revision ?? state.revision
        state.status = abort.signal.aborted ? 'cancelled' : r.status ?? 'done'
      } catch (e) {
        const op = await this.opts.operations.get(state.id).catch(() => undefined)
        state.status = abort.signal.aborted || op?.status === 'cancelled' ? 'cancelled' : 'failed'
        state.error = msg(e)
        if (state.status === 'failed') this.opts.onLog?.({ level: 'error', source: set, kind: `task:${kind}`, message: state.error, detail: { item, progress: state.progress } })
      }
      if (state.convertError) this.opts.onLog?.({ level: 'warn', source: set, kind: 'task:convert', message: state.convertError })
      this.opts.onChange?.({ ...state })
      return { ...state }
    })()
    this.tasks.set(id, { state, abort, done })
    return id
  }

  private async progress(state: TaskState, p: TaskState['progress']): Promise<void> {
    state.progress = p
    this.opts.onChange?.({ ...state })
    const handle = this.handles.get(state.id)
    if (handle) await this.opts.operations.progress(handle, p)
  }

  /** 下载并安装一套官方数据（按书 / 全部）。 */
  startOfficial(setId: string, opts: OfficialTaskOptions = {}): string {
    const id = this.start('official', setId, officialTaskKey(opts), (state, signal) => this.install(state, signal, opts))
    this.officialOpts.set(id, opts)
    return id
  }

  /** 冒险正文与它的来源、隐藏依赖按同一份安装计划准备。 */
  startAdventure(setId: string, adventureId: string): string {
    return this.start('adventure', setId, adventureId, (state, signal) => this.install(state, signal, { adventures: [adventureId] }))
  }

  private async install(state: TaskState, signal: AbortSignal, opts: OfficialTaskOptions): Promise<RunResult> {
    const setId = state.set
    const source = getSource(setId)
    const handle = await this.opts.operations.begin({
      id: state.id, kind: state.kind, set: setId, item: state.item, codeSet: source.codeSet, signal,
    })
    this.handles.set(state.id, handle)
    state.revision = handle.target.id
    let report: InstallReport | null = null
    try {
      const base = await handle.base.officialState(setId)
      const target = opts.commit ?? base?.commit ?? await handle.base.commitOf(source)
      let slice: OfficialSetState['fileOverrides']
      if (state.kind === 'adventure' && base?.status !== 'installed') throw new Error(`${setId} 还没安装，先装官方数据`)
      if (opts.updateFrom) {
        if (base?.status !== 'installed') throw new Error('这套资料已卸载，请重新下载')
        if (base.commit === target) {
          await this.opts.operations.abort(handle, new Error('另一项任务已完成同一更新'))
          return { result: null, revision: handle.base.id }
        }
        if (base.commit !== opts.updateFrom) throw new Error('这套资料已经换过版本，请重新检查更新')
        slice = await this.opts.selectUpdate?.(setId, target, opts.updateSelection, handle.base) ?? undefined
      }
      const commit = slice && base ? base.commit : target
      const fileOverrides = slice ? { ...base?.fileOverrides, ...slice } : base?.commit === commit ? base.fileOverrides : undefined
      const baseAdventures = base?.status === 'installed' && base.adventures === null ? await installedAdventureIds(handle.base, setId) : base?.adventures ?? null
      const selection = selectionFor(base && baseAdventures ? { ...base, adventures: baseAdventures } : base, opts)
      if (!base || base.commit !== commit) {
        await this.opts.operations.setTargetOfficial(handle, { [setId]: base ? { ...base, commit } : { commit, status: 'missing', sources: null, books: null, adventures: null } })
      }
      let manifest: FileList | undefined
      if (fileOverrides) {
        manifest = { ...await this.opts.files.fileList(source, handle.target, { signal }) }
        for (const [path, pinned] of Object.entries(fileOverrides)) {
          if (pinned) manifest[path] = pinned
          else delete manifest[path]
        }
      }
      const plan = await this.opts.planOfficial?.(setId, {
        ...(opts.commit ? { commit: opts.commit } : {}), ...(manifest ? { manifest } : {}), signal,
        books: selection.books, sources: selection.sources, adventures: selection.adventures,
        allSources: selection.allSources, knownAdventures: baseAdventures ?? [],
        installedSources: base?.status === 'installed' ? base.sources ?? [] : [],
      }, handle.target)
      if (plan && (plan.missing.sources.length || plan.missing.books.length || (plan.missing.adventures?.length ?? 0))) {
        const miss = [...plan.missing.sources, ...plan.missing.books, ...(plan.missing.adventures ?? [])].join('、')
        throw new Error(`作者目录里找不到这些书 / 来源：${miss}`)
      }
      let sourceIndexes = plan?.sourceIndexes ?? {}
      const sources = plan ? plan.sources : selection.sources
      const books = plan ? plan.books : selection.books
      report = await prepareOfficial({
        source, db: this.opts.db, files: this.opts.files, revisions: this.opts.revisions, operations: this.opts.operations, manifest, fileOverrides,
        openFrame: (view) => this.opts.openFrame(source.codeSet, view), view: handle.target, plan: plan ?? undefined,
        sources, books, adventures: plan ? plan.adventures : selection.adventures,
        setIndexes: async (indexes) => {
          sourceIndexes = indexes
          await this.opts.operations.setTargetIndexes(handle, indexes)
          return handle.target
        },
        signal, onProgress: (p) => { void this.progress(state, p) },
        onCheckpoint: () => (this.paused.has(state.id) ? 'pause' : 'continue'),
      })
      if (report.cancelled) {
        await this.opts.operations.abort(handle, new Error('已取消'), 'cancelled')
        return { result: report, status: 'cancelled', revision: handle.target.id }
      }
      if (report.paused) {
        await this.opts.operations.abort(handle, new Error('已暂停，继续时会复用已下载文件'), 'interrupted')
        return { result: report, status: 'paused', revision: handle.target.id }
      }
      if (!report.publishable) {
        await this.opts.onDiagnostic?.(setId, report)
        throw new Error(report.reasons.join('；'))
      }
      if (opts.updateFrom) report.update = { target, ...(slice && opts.updateSelection ? { selection: opts.updateSelection } : {}) }
      const official: Record<string, OfficialSetState> = {
        [setId]: {
          commit: report.commit, status: 'installed',
          sources, books, adventures: plan ? plan.adventures : selection.adventures,
          plan: { files: report.plan.files, bytes: report.plan.bytes },
          ...(report.dependencyFiles ? { dependencyFiles: report.dependencyFiles } : {}),
          ...(fileOverrides ? { fileOverrides } : {}),
        },
      }
      const published = await this.opts.operations.publish(handle, {
        official, sourceIndexes, result: report,
        status: report.settlementReady ? 'done' : 'partial',
      })
      state.revision = published.id
      await this.opts.db.derived.delete(`audit:last-failed:${setId}`)
      this.opts.onPublished?.(published, handle.base.id)
      if (this.opts.precompute) {
        try { state.convert = await this.opts.precompute(setId, published, signal, (p) => { void this.progress(state, p) }) }
        catch (e) { state.convertError = msg(e) }
      }
      return { result: report, status: report.settlementReady && !state.convertError ? 'done' : 'partial', revision: published.id }
    } catch (e) {
      if (!report) await this.opts.onDiagnostic?.(setId, failedInstallReport(source, e))
      await this.opts.operations.abort(handle, e)
      throw e
    } finally {
      this.handles.delete(state.id)
      this.paused.delete(state.id)
    }
  }

  /** 单独重跑换算（结算内核指纹变了时；界面 P5 再接）。 */
  startPrecompute(setId: string): string {
    return this.start('precompute', setId, null, async (state, signal) => {
      if (!this.opts.precompute) throw new Error('没有接换算后端')
      const view = await this.opts.revisions.published()
      state.revision = view.id
      state.convert = await this.opts.precompute(setId, view, signal, (p) => { void this.progress(state, p) })
      return { result: state.convert, revision: view.id }
    })
  }

}
