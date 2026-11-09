// T2 补：改自制 / 房规后的补换算放后台，不卡住保存；跑着的时候又改了，跑完再来一遍（连续改合并成一次）。
// 换算钥匙不含自制包版本（cache.ts），所以补换算只会真正换新的或改过的条目，其余都是命中。
export class PrecomputeQueue {
  private running: Promise<void> | null = null
  private readonly pending = new Set<string>()
  /** 最近一次跑完的结果（或出错原因）。 */
  last: unknown = null

  constructor(private readonly run: (codeSet: string) => Promise<unknown>) {}

  trigger(codeSet: string): void {
    this.pending.add(codeSet)
    if (!this.running) this.running = this.loop().finally(() => { this.running = null })
  }

  /** 等后台补换算全部跑完（测试、诊断用）。 */
  async settled(): Promise<unknown> {
    while (this.running) await this.running
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
