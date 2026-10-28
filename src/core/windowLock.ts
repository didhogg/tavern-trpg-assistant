import { uuid } from './ids'

interface LockMessage {
  type: 'hello' | 'here'
  id: string
  startedAt: number
}

/** 同一浏览器中只允许一个窗口写入：后打开的窗口进入只读（U2 §3.16）。 */
export class WindowLock {
  private channel: BroadcastChannel | null = null
  private readonly listeners = new Set<(readOnly: boolean) => void>()
  private _readOnly = false

  private readonly startedAt: number

  constructor(
    private readonly name = 'tavern-trpg-assistant-lock',
    now: () => number = Date.now,
    private readonly id: string = uuid(),
  ) {
    this.startedAt = now()
  }

  get readOnly(): boolean {
    return this._readOnly
  }

  onChange(listener: (readOnly: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  start(): void {
    if (typeof BroadcastChannel === 'undefined' || this.channel) return
    this.channel = new BroadcastChannel(this.name)
    this.channel.onmessage = (event: MessageEvent<LockMessage>) => this.receive(event.data)
    this.send('hello')
  }

  stop(): void {
    this.channel?.close()
    this.channel = null
  }

  private send(type: LockMessage['type']): void {
    this.channel?.postMessage({ type, id: this.id, startedAt: this.startedAt } satisfies LockMessage)
  }

  /** 先开始的窗口（startedAt 小，相同时按 id）拥有写入权。 */
  private receive(msg: LockMessage): void {
    if (!msg || msg.id === this.id) return
    const otherFirst = msg.startedAt < this.startedAt || (msg.startedAt === this.startedAt && msg.id < this.id)
    if (otherFirst && !this._readOnly) {
      this._readOnly = true
      for (const l of this.listeners) l(true)
    }
    if (msg.type === 'hello') this.send('here')
  }
}
