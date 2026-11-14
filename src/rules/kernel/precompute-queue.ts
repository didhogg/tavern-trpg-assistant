// T2 补：改自制 / 房规后的补换算放后台，不卡住保存；跑着的时候又改了，跑完再来一遍（连续改合并成一次）。
// 换算钥匙不含自制包版本（cache.ts），所以补换算只会真正换新的或改过的条目，其余都是命中。
// P5.5：改完先等一会儿没有新改动再开始（quietMs），连着存几条只跑一次；跑的时候抢主线程，别和保存撞上。
// 性能支线（2026-11-14）：装 / 更新官方资料后的完整换算也走这里（mode = full），不再放在下载任务里等：
//   - 还有下载任务在跑（hold）就继续等，中英一批都装完、安静下来才开始，同一批只跑一轮；
//   - 跑的时候又开始装资料（interrupt）：停下这一轮（已写的缓存保留），装完从没换的接着换。
import type { PrecomputeMode } from './precompute'

export interface PrecomputeQueueState {
  /** 正在跑哪一套（没在跑 = null）。 */
  running: { codeSet: string; mode: PrecomputeMode } | null
  /** 排着队的（含在等下载任务结束、等安静的）。 */
  pending: Array<{ codeSet: string; mode: PrecomputeMode }>
  /** 最近一次跑完的结果（或出错原因）。 */
  last: unknown
}

export class PrecomputeQueue {
  private running: Promise<void> | null = null
  private readonly pending = new Map<string, PrecomputeMode>()
  private current: { codeSet: string; mode: PrecomputeMode; abort: AbortController } | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private waiting: Promise<void> | null = null
  private release: (() => void) | null = null
  /** 最近一次跑完的结果（或出错原因）。 */
  last: unknown = null

  /**
   * @param run 换一套（codeSet）；signal 用来在又开始装资料时停下。
   * @param hold 现在要不要先别跑（还有下载任务在跑）；为真时每隔 quietMs 再看一次。
   */
  constructor(
    private readonly run: (codeSet: string, mode: PrecomputeMode, signal: AbortSignal) => Promise<unknown>,
    private readonly quietMs = 0,
    private readonly hold: () => boolean = () => false,
  ) {}

  /** 排一轮；同一套已在排队时取范围大的（full 盖过 changed）。 */
  trigger(codeSet: string, mode: PrecomputeMode = 'changed'): void {
    if (this.pending.get(codeSet) !== 'full') this.pending.set(codeSet, mode)
    if (this.running) return // 跑着的这一轮做完会接着做
    this.arm()
  }

  /** 又开始装资料了：停下正在跑的这一轮，把它放回队里（已写的缓存保留，下次从没换的接着换）。 */
  interrupt(): void {
    const c = this.current
    if (!c) return
    if (this.pending.get(c.codeSet) !== 'full') this.pending.set(c.codeSet, c.mode)
    c.abort.abort()
  }

  state(): PrecomputeQueueState {
    return {
      running: this.current ? { codeSet: this.current.codeSet, mode: this.current.mode } : null,
      pending: [...this.pending].map(([codeSet, mode]) => ({ codeSet, mode })),
      last: this.last,
    }
  }

  /** 等后台换算全部跑完（含还在等安静、等下载任务的那一段；测试、诊断用）。 */
  async settled(): Promise<unknown> {
    while (this.waiting || this.running) {
      if (this.waiting) await this.waiting
      if (this.running) await this.running
    }
    return this.last
  }

  private arm(): void {
    if (this.timer) clearTimeout(this.timer)
    this.waiting ??= new Promise((r) => { this.release = r })
    this.timer = setTimeout(() => {
      this.timer = null
      if (this.hold()) { this.arm(); return }
      const done = this.release
      this.release = null
      this.waiting = null
      this.running = this.loop().finally(() => {
        this.running = null
        if (this.pending.size) this.arm() // 中途让出（又在装资料）：装完再接着
      })
      done?.()
    }, this.quietMs)
  }

  private async loop(): Promise<void> {
    while (this.pending.size && !this.hold()) {
      const [[codeSet, mode]] = this.pending
      this.pending.delete(codeSet)
      const abort = new AbortController()
      this.current = { codeSet, mode, abort }
      try {
        this.last = await this.run(codeSet, mode, abort.signal)
      } catch (e) {
        this.last = { codeSet, mode, error: e instanceof Error ? e.message : String(e) }
      } finally {
        this.current = null
      }
    }
  }
}
