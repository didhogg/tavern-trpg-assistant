// 分段计时（驾驶员 11-25 评测：反馈超过 1 秒要量清等在哪一段）：lap(名字) 记从上一段到现在，done() 交回各段 + 总计（毫秒）。
// 只用来写调试日志 / 交给调用方，不影响结果。
export function stopwatch() {
  const t0 = performance.now()
  let t = t0
  const ms: Record<string, number> = {}
  return {
    lap(name: string): void { const now = performance.now(); ms[name] = Math.round(now - t); t = now },
    done(extra: Record<string, number> = {}): Record<string, number> { return { ...ms, ...extra, total: Math.round(performance.now() - t0) } },
  }
}
