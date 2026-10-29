import { TrpgError } from './errors'

export type OpState = 'waiting' | 'running'

export interface QueueOp<T> {
  /** 同一个 id 排队中或运行中时，再次提交返回同一个结果（防止连点）。 */
  id: string
  label: string
  run: (signal: AbortSignal) => Promise<T>
}

interface Entry {
  label: string
  state: OpState
  controller: AbortController
  promise: Promise<unknown>
}

/**
 * 库操作队列（L1 §3.4）：安装、下载、卸载、启停等在同一个队列里依次执行。
 * 排队中的操作状态为 waiting（界面显示「等待中」）；取消排队中的操作不会执行它。
 */
export class OpQueue {
  private tail: Promise<unknown> = Promise.resolve()
  private readonly entries = new Map<string, Entry>()
  private readonly listeners = new Set<() => void>()

  enqueue<T>(op: QueueOp<T>): Promise<T> {
    const existing = this.entries.get(op.id)
    if (existing) return existing.promise as Promise<T>
    const controller = new AbortController()
    const entry: Entry = { label: op.label, state: 'waiting', controller, promise: Promise.resolve() }
    const run = async (): Promise<T> => {
      if (controller.signal.aborted) throw new TrpgError('E_CANCELLED', '已取消')
      entry.state = 'running'
      this.emit()
      return op.run(controller.signal)
    }
    const promise = this.tail.then(run, run).finally(() => {
      this.entries.delete(op.id)
      this.emit()
    })
    entry.promise = promise
    this.entries.set(op.id, entry)
    this.tail = promise.catch(() => undefined)
    this.emit()
    return promise
  }

  /** 取消：排队中的不会执行；运行中的收到中止信号。 */
  cancel(id: string): boolean {
    const entry = this.entries.get(id)
    if (!entry) return false
    entry.controller.abort()
    return true
  }

  state(id: string): OpState | undefined {
    return this.entries.get(id)?.state
  }

  snapshot(): Array<{ id: string; label: string; state: OpState }> {
    return [...this.entries].map(([id, e]) => ({ id, label: e.label, state: e.state }))
  }

  get busy(): boolean {
    return this.entries.size > 0
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    for (const listener of this.listeners) listener()
  }
}
