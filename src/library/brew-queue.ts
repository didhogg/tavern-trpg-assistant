// P5.5 U2 自制的后台解析队列：编辑只写原文就发布（service-brew.ts writeAuthor），这里在停手 quietMs 之后批量跑一次解析
// （作者同法：全部自制合并解析 + 同编号的另一版单独取；没变的包按指纹复用，alternatives.ts）。
// - 等待中又有编辑：重新计时，连着改只跑一次；
// - 正在跑的时候又要编辑：先取消这一轮、等它放开修改锁（yield），编辑写完再重新排队；
// - 跑失败（例如缺依赖）：不发布，脏标记留着，last 记原因，下次编辑或手动再触发时重试。
export class BrewParseQueue {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>()
  private readonly running = new Map<string, { abort: AbortController; done: Promise<void> }>()
  private readonly waiters = new Map<string, Array<() => void>>()
  /** 最近一次的结果（或出错原因），按资料集。 */
  readonly last = new Map<string, unknown>()

  constructor(private readonly run: (codeSet: string, signal: AbortSignal) => Promise<unknown>, private readonly quietMs = 5000) {}

  /** 编辑写完原文：停手 quietMs 之后解析一次（已在等的重新计时）。 */
  trigger(codeSet: string): void {
    const t = this.timers.get(codeSet)
    if (t) clearTimeout(t)
    this.timers.set(codeSet, setTimeout(() => { this.timers.delete(codeSet); this.start(codeSet) }, this.quietMs))
  }

  /** 要编辑了：正在跑的解析先取消，等它停下（放开修改锁）。等待中的计时不动（编辑写完会重新计时）。 */
  async yield(codeSet: string): Promise<void> {
    const cur = this.running.get(codeSet)
    if (!cur) return
    cur.abort.abort(new DOMException('有新的编辑，后台解析先停下', 'AbortError'))
    await cur.done
    // 重新排队（编辑写完会重新计时；编辑失败也不会把脏的包丢着不管）
    this.trigger(codeSet)
  }

  /** 这一套是否在等或在跑（界面「更新中」）。 */
  busy(codeSet: string): boolean {
    return this.timers.has(codeSet) || this.running.has(codeSet)
  }

  /** 等这一套（不给就是全部）的后台解析都结束（测试、诊断用）。 */
  async settled(codeSet?: string): Promise<void> {
    const pending = (): string[] => [...new Set([...this.timers.keys(), ...this.running.keys()])].filter((c) => !codeSet || c === codeSet)
    while (pending().length) {
      await Promise.all(pending().map((c) => new Promise<void>((resolve) => { (this.waiters.get(c) ?? this.waiters.set(c, []).get(c)!).push(resolve) })))
    }
  }

  private start(codeSet: string): void {
    if (this.running.has(codeSet)) return
    const abort = new AbortController()
    const done = (async () => {
      try {
        this.last.set(codeSet, await this.run(codeSet, abort.signal))
      } catch (e) {
        this.last.set(codeSet, { codeSet, error: e instanceof Error ? e.message : String(e), aborted: abort.signal.aborted })
      } finally {
        this.running.delete(codeSet)
        if (!this.timers.has(codeSet)) { for (const w of this.waiters.get(codeSet) ?? []) w(); this.waiters.delete(codeSet) }
      }
    })()
    this.running.set(codeSet, { abort, done })
  }
}
