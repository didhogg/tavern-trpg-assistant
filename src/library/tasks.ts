// 下载任务（D2-P3 整体设计 §2.7，补 B3 §5 的缺口）：下载官方、按本下载冒险正文，统一成一种任务，能查进度、能取消。
// 官方走已有的 installOfficial；冒险正文照作者离线规则按需下载（plan.ts isAdventure），文件名用作者加载器的拼法，
// 下载后用作者的单本入口解析，和安装时解析书正文一样存进库。
import type { LibraryDatabase } from './db'
import type { FileProvider } from './files'
import { installOfficial, parsedKey, type InstallReport } from './install'
import type { AuthorFrame } from './runtime/host'
import { getSource } from './sources'

export type TaskStatus = 'running' | 'done' | 'failed' | 'cancelled'

export interface TaskState {
  id: string
  kind: 'official' | 'adventure'
  set: string
  /** 冒险编号（kind = adventure）。 */
  item: string | null
  status: TaskStatus
  progress: { stage: string; done: number; total: number; item?: string }
  error: string | null
  result: InstallReport | { path: string; parsed: boolean } | null
}

export interface TaskOptions {
  db: LibraryDatabase
  files: FileProvider
  /** 开一个只读本地的作者小窗。 */
  openFrame: (codeSet: string) => Promise<AuthorFrame>
  onChange?: (t: TaskState) => void
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

export class DownloadTasks {
  private readonly tasks = new Map<string, { state: TaskState; abort: AbortController; done: Promise<TaskState> }>()
  private seq = 0

  constructor(private readonly opts: TaskOptions) {}

  list(): TaskState[] {
    return [...this.tasks.values()].map((t) => ({ ...t.state }))
  }

  get(id: string): TaskState | null {
    const t = this.tasks.get(id)
    return t ? { ...t.state } : null
  }

  /** 等任务结束（完成、失败或取消）。 */
  wait(id: string): Promise<TaskState> {
    const t = this.tasks.get(id)
    if (!t) throw new Error(`没有这个任务：${id}`)
    return t.done
  }

  cancel(id: string): void {
    this.tasks.get(id)?.abort.abort()
  }

  private start(kind: TaskState['kind'], set: string, item: string | null, run: (state: TaskState, signal: AbortSignal) => Promise<TaskState['result']>): string {
    const same = [...this.tasks.values()].find((t) => t.state.status === 'running' && t.state.kind === kind && t.state.set === set && t.state.item === item)
    if (same) return same.state.id
    const id = `task-${++this.seq}`
    const abort = new AbortController()
    const state: TaskState = { id, kind, set, item, status: 'running', progress: { stage: 'start', done: 0, total: 0 }, error: null, result: null }
    const done = (async () => {
      try {
        state.result = await run(state, abort.signal)
        state.status = abort.signal.aborted ? 'cancelled' : 'done'
      } catch (e) {
        state.status = abort.signal.aborted ? 'cancelled' : 'failed'
        state.error = msg(e)
      }
      this.opts.onChange?.({ ...state })
      return { ...state }
    })()
    this.tasks.set(id, { state, abort, done })
    return id
  }

  private progress(state: TaskState, p: TaskState['progress']): void {
    state.progress = p
    this.opts.onChange?.({ ...state })
  }

  /** 下载并安装一套官方数据（已下载的文件跳过 = 续传）。 */
  startOfficial(setId: string): string {
    const source = getSource(setId)
    return this.start('official', setId, null, async (state, signal) => {
      const r = await installOfficial({ source, db: this.opts.db, files: this.opts.files, openFrame: () => this.opts.openFrame(source.codeSet), signal, onProgress: (p) => this.progress(state, p) })
      if (!r.cancelled && r.download.failed.length) throw new Error(`有 ${r.download.failed.length} 个文件没下载下来：${r.download.failed[0].path}`)
      return r
    })
  }

  /** 按本下载一本冒险的正文（作者离线规则：冒险正文按需取），下载后解析存进库。 */
  startAdventure(setId: string, adventureId: string): string {
    const source = getSource(setId)
    return this.start('adventure', setId, adventureId, async (state, signal) => {
      if ((await this.opts.db.sets.get(setId))?.status !== 'installed') throw new Error(`${setId} 还没安装，先装官方数据`)
      const frame = await this.opts.openFrame(source.codeSet)
      try {
        const loader = (await frame.call('loaders')).find((l) => l.kind === 'corpus' && l.props.includes('adventureData'))
        if (!loader?.index || !loader.page) throw new Error('作者加载器登记表里没有冒险')
        const prop = loader.props[0]
        const it = (await frame.call('corpusList', loader.index, prop, loader.page)).find((a) => a.id === adventureId)
        if (!it) throw new Error(`作者冒险书目里没有：${adventureId}`)
        const path = await frame.call('corpusFile', prop, adventureId)
        this.progress(state, { stage: 'download', done: 0, total: 1, item: path })
        if (signal.aborted) return null
        const text = await this.opts.files.get(source, path, { allowNetwork: true })
        if (text === null) throw new Error(`锁定版本的文件清单里没有这本冒险的正文：${path}`)
        if (signal.aborted) return { path, parsed: false }
        this.progress(state, { stage: 'parse', done: 1, total: 1, item: adventureId })
        const value = await frame.call('parseCorpus', loader.page, it.source, it.hash)
        await this.opts.db.derived.put({ key: parsedKey(setId, prop, adventureId), fingerprint: (await this.opts.db.sets.get(setId))?.commit as string, value, savedAt: Date.now() })
        return { path, parsed: true }
      } finally {
        frame.close()
      }
    })
  }
}
