// T2 补：改自制 / 房规后的补换算放后台，不卡住保存；跑着的时候又改了，跑完再来一遍（连续改合并成一次）。
// 换算钥匙不含自制包版本（cache.ts），所以补换算只会真正换新的或改过的条目，其余都是命中。
// P5.5：改完先等一会儿没有新改动再开始（quietMs），连着存几条只跑一次；跑的时候抢主线程，别和保存撞上。
export class PrecomputeQueue {
  private running: Promise<void> | null = null
  private readonly pending = new Set<string>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private waiting: Promise<void> | null = null
  private release: (() => void) | null = null
  /** 最近一次跑完的结果（或出错原因）。 */
  last: unknown = null

  constructor(private readonly run: (codeSet: string) => Promise<unknown>, private readonly quietMs = 0) {}

  trigger(codeSet: string): void {
    this.pending.add(codeSet)
    if (this.running) return // 跑着的这一轮做完会接着做
    if (this.timer) clearTimeout(this.timer)
    this.waiting ??= new Promise((r) => { this.release = r })
    this.timer = setTimeout(() => {
      this.timer = null
      const done = this.release
      this.release = null
      this.waiting = null
      this.running = this.loop().finally(() => { this.running = null })
      done?.()
    }, this.quietMs)
  }

  /** 等后台补换算全部跑完（含还在等安静的那一段；测试、诊断用）。 */
  async settled(): Promise<unknown> {
    while (this.waiting || this.running) {
      if (this.waiting) await this.waiting
      if (this.running) await this.running
    }
    return this.last
  }

  private async loop(): Promise<void> {
    while (this.pending.size) {
      const [codeSet] = this.pending
      this.pending.delete(codeSet)
      try {
        this.last = await this.run(codeSet)
      } catch (e) {
        this.last = { codeSet, error: e instanceof Error ? e.message : String(e) }
      }
    }
  }
}
