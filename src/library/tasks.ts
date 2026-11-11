// 下载任务（D2-P3 整体设计 §2.7；P5 T1 改为可恢复的操作记录）：官方、按本下载冒险正文统一成一种任务。
// 每次修改都开一个准备版本；成功才发布。任务状态和内容状态分开：失败 / 取消 / 重启不会让旧库消失。
import type { LibraryDatabase, OfficialSetState } from './db'
import type { FileProvider } from './files'
import { installedAdventureIds, parsedKey, prepareOfficial, type InstallReport } from './install'
import type { AuthorFrame } from './runtime/host'
import type { LogSink } from './logs'
import { getSource } from './sources'
import { LibraryOperations, type OperationHandle } from './operations'
import type { LibraryRevisionStore, LibraryView } from './revision'
import { selectionFor } from './plan'

export type TaskStatus = 'running' | 'done' | 'partial' | 'failed' | 'cancelled' | 'interrupted'

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
  /** 已有按书计划（估算 / 更新共用）；不给就整套预载。 */
  plan?: import('./plan').OfficialPlan
}

export interface TaskOptions {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  operations: LibraryOperations
  files: FileProvider
  /** 开一个只读本地、绑定到指定版本的作者小窗。 */
  openFrame: (codeSet: string, view: LibraryView) => Promise<AuthorFrame>
  /** 按书计划：任务没拿到现成计划、但给了 books / sources 时，由后端用作者目录生成。 */
  planOfficial?: (setId: string, opts: { books?: string[] | null; sources?: string[] | null; adventures?: string[] | null; allSources?: boolean }, view: LibraryView) => Promise<import('./plan').OfficialPlan | null>
  /** T2：下载任务里的换算段；后端接结算内核，库层只报进度。 */
  precompute?: (setId: string, view: LibraryView, signal: AbortSignal, onProgress: (p: TaskState['progress']) => void) => Promise<unknown>
  onChange?: (t: TaskState) => void
  /** 发布成功后的通知（后端用它关掉旧版本的作者小窗 / 清缓存）。 */
  onPublished?: (view: LibraryView) => void
  /** 失败写日志（P5 B-26）。 */
  onLog?: LogSink
  /** 失败安装的完整报告独立保存，体检在当前版本也能看到。 */
  onDiagnostic?: (setId: string, report: InstallReport) => Promise<void>
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

interface RunResult { result: TaskState['result']; status?: 'done' | 'partial' | 'cancelled'; revision?: string }

export class DownloadTasks {
  private readonly tasks = new Map<string, { state: TaskState; abort: AbortController; done: Promise<TaskState> }>()
  private readonly handles = new Map<string, OperationHandle>()
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
    this.tasks.get(id)?.abort.abort()
    await this.opts.operations.cancel(id)
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
    const source = getSource(setId)
    return this.start('official', setId, null, async (state, signal) => {
      const handle = await this.opts.operations.begin({
        id: state.id, kind: 'official', set: setId, codeSet: source.codeSet, sourceIndexes: opts.plan?.sourceIndexes, signal,
      })
      this.handles.set(state.id, handle)
      state.revision = handle.target.id
      try {
        const base = await handle.target.officialState(setId)
        const baseAdventures = base?.status === 'installed' && base.adventures === null ? await installedAdventureIds(handle.target, setId) : base?.adventures ?? null
        const selection = selectionFor(base, { ...opts, adventures: baseAdventures })
        const plan = opts.plan ?? await this.opts.planOfficial?.(setId, {
          books: selection.books, sources: selection.sources, adventures: selection.adventures,
          allSources: selection.allSources,
        }, handle.target)
        if (plan && (plan.missing.sources.length || plan.missing.books.length)) {
          const miss = [...plan.missing.sources, ...plan.missing.books].join('、')
          await this.opts.operations.abort(handle, new Error(`作者目录里找不到这些书 / 来源：${miss}`))
          throw new Error(`作者目录里找不到这些书 / 来源：${miss}`)
        }
        const commit = opts.commit ?? base?.commit ?? await handle.target.commitOf(source)
        if (plan) await this.opts.operations.setTargetIndexes(handle, plan.sourceIndexes)
        if (!base || base.commit !== commit) {
          await this.opts.operations.setTargetOfficial(handle, { [setId]: base ? { ...base, commit } : { commit, status: 'missing', sources: null, books: null, adventures: null } })
        }
        const sources = plan ? plan.sources : selection.sources
        const books = plan ? plan.books : selection.books
        const report = await prepareOfficial({
          source, db: this.opts.db, files: this.opts.files, revisions: this.opts.revisions, operations: this.opts.operations,
          openFrame: (view) => this.opts.openFrame(source.codeSet, view), view: handle.target, plan: plan ?? undefined,
          sources, books, adventures: selection.adventures,
          signal, onProgress: (p) => { void this.progress(state, p) },
        })
        if (report.cancelled) {
          await this.opts.operations.abort(handle, new Error('已取消'), 'cancelled')
          return { result: report, status: 'cancelled', revision: handle.target.id }
        }
        if (!report.publishable) {
          await this.opts.onDiagnostic?.(setId, report)
          await this.opts.operations.abort(handle, new Error(report.reasons.join('；')))
          throw new Error(report.reasons.join('；'))
        }
        const official: Record<string, OfficialSetState> = {
          [setId]: {
            commit: report.commit, status: 'installed',
            sources, books, adventures: plan ? plan.adventures : selection.adventures,
            plan: { files: report.plan.files, bytes: report.plan.bytes },
          },
        }
        const published = await this.opts.operations.publish(handle, {
          official, sourceIndexes: plan?.sourceIndexes ?? {}, result: report,
          status: report.settlementReady ? 'done' : 'partial',
        })
        state.revision = published.id
        await this.opts.db.derived.delete(`audit:last-failed:${setId}`)
        this.opts.onPublished?.(published)
        if (this.opts.precompute) {
          try { state.convert = await this.opts.precompute(setId, published, signal, (p) => { void this.progress(state, p) }) }
          catch (e) { state.convertError = msg(e) }
        }
        return { result: report, status: report.settlementReady && !state.convertError ? 'done' : 'partial', revision: published.id }
      } catch (e) {
        await this.opts.operations.abort(handle, e)
        throw e
      } finally {
        this.handles.delete(state.id)
      }
    })
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

  /** 按本下载一本冒险的正文（作者离线规则：冒险正文按需取），成功才发布。 */
  startAdventure(setId: string, adventureId: string): string {
    const source = getSource(setId)
    return this.start('adventure', setId, adventureId, async (state, signal) => {
      const handle = await this.opts.operations.begin({ id: state.id, kind: 'adventure', set: setId, item: adventureId, codeSet: source.codeSet, signal })
      this.handles.set(state.id, handle)
      state.revision = handle.target.id
      const view = handle.target
      try {
        const base = await view.officialState(setId)
        if (base?.status !== 'installed') throw new Error(`${setId} 还没安装，先装官方数据`)
        const frame = await this.opts.openFrame(source.codeSet, view)
        try {
          const loader = (await frame.call('loaders')).find((l) => l.kind === 'corpus' && l.props.includes('adventureData'))
          if (!loader?.index || !loader.page) throw new Error('作者加载器登记表里没有冒险')
          const prop = loader.props[0]
          const it = (await frame.call('corpusList', loader.index, prop, loader.page)).find((a) => a.id === adventureId)
          if (!it) throw new Error(`作者冒险书目里没有：${adventureId}`)
          const path = await frame.call('corpusFile', prop, adventureId)
          await this.progress(state, { stage: 'download', done: 0, total: 1, item: path })
          if (signal.aborted) {
            await this.opts.operations.abort(handle, new Error('已取消'), 'cancelled')
            return { result: null, status: 'cancelled', revision: view.id }
          }
          const text = await this.opts.files.get(source, path, { allowNetwork: true, view })
          if (text === null) throw new Error(`锁定版本的文件清单里没有这本冒险的正文：${path}`)
          await this.progress(state, { stage: 'parse', done: 1, total: 1, item: adventureId })
          const value = await frame.call('parseCorpus', loader.page, it.source, it.hash)
          await view.derivedPut(parsedKey(setId, prop, adventureId), await view.commitOf(source), value)
          const adventures = base.adventures === null ? null : [...new Set([...(base.adventures ?? []), adventureId])]
          const published = await this.opts.operations.publish(handle, {
            official: { [setId]: { ...base, adventures } }, result: { path, parsed: true },
          })
          state.revision = published.id
          this.opts.onPublished?.(published)
          return { result: { path, parsed: true }, revision: published.id }
        } finally {
          frame.close()
        }
      } catch (e) {
        await this.opts.operations.abort(handle, e)
        throw e
      } finally {
        this.handles.delete(state.id)
      }
    })
  }
}
