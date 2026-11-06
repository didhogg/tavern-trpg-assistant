// 小窗里最先运行：在作者脚本之前开始记录报错，供就绪回报使用。
// 这是普通脚本（不是模块），包在函数里，避免在作者的全局环境里多出变量。
;(() => {
  const errors: string[] = []
  ;(globalThis as { __trpgFrameErrors?: string[] }).__trpgFrameErrors = errors
  addEventListener('error', (e) => {
    errors.push(`${e.message} @ ${e.filename}:${e.lineno}`)
  })
  addEventListener('unhandledrejection', (e) => {
    const reason = e.reason as { stack?: string } | undefined
    errors.push(`unhandledrejection: ${reason?.stack ?? String(e.reason)}`)
  })
})()
