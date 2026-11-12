// 插件这一侧：开一个隐藏小窗让作者程序原样运行，并回答小窗的要求（D2-P2 B1 设计 §7 A）。
import type { CommandName, COMMANDS } from './frame/commands'
import { CHANNEL, FRAME_PARAM, LOCAL_SNAPSHOT_PREFIX, isFrameMessage, type FrameCall, type FrameMessage, type FrameReady, type FrameRequest, type FrameResponse } from './protocol'

/** 小窗要东西时插件怎么回答。文件不存在回答 null。 */
export interface FrameHandlers {
  file(path: string): Promise<string | null>
  kvGet(key: string): Promise<unknown>
  kvSet(key: string, value: unknown): Promise<void>
  kvRemove(key: string): Promise<void>
  /** 作者同步存储（localStorage）上次存下的全部内容；开小窗前取出交给小窗。 */
  localSnapshot(): Promise<Record<string, string>>
  localSet(key: string, value: string): Promise<void>
  localRemove(key: string): Promise<void>
}

export interface AuthorFrame {
  codeSet: string
  frame: HTMLIFrameElement
  ready: FrameReady
  /** 小窗报过的要求处理失败（例如所有下载地址都取不到）。 */
  failures: string[]
  /** 叫小窗里的作者程序做一件事（frame/commands.ts），结果原样交回。 */
  call<K extends CommandName>(fn: K, ...args: Parameters<(typeof COMMANDS)[K]>): Promise<Awaited<ReturnType<(typeof COMMANDS)[K]>>>
  close(): void
}

export interface StartOptions {
  codeSet: string
  /** 插件根目录（vendor/、dist/ 所在处）。 */
  pluginRoot: URL
  container: HTMLElement
  handlers: FrameHandlers
  timeoutMs?: number
  signal?: AbortSignal
}

export function frameUrl(pluginRoot: URL, codeSet: string): URL {
  return new URL(`vendor/${codeSet}/frame.html`, pluginRoot)
}

async function answer(handlers: FrameHandlers, req: FrameRequest): Promise<unknown> {
  switch (req.op) {
    case 'file': return handlers.file(req.path)
    case 'kv-get': return handlers.kvGet(req.key)
    case 'kv-set': return handlers.kvSet(req.key, req.value)
    case 'kv-remove': return handlers.kvRemove(req.key)
    case 'local-set': return handlers.localSet(req.key, req.value)
    case 'local-remove': return handlers.localRemove(req.key)
  }
}

export async function startAuthorFrame({ codeSet, pluginRoot, container, handlers, timeoutMs = 60_000, signal }: StartOptions): Promise<AuthorFrame> {
  signal?.throwIfAborted()
  const frame = document.createElement('iframe')
  // 作者同步存储上次的内容经 name 交给小窗（小窗里 early.ts 在作者脚本之前读出，读完清掉 name）
  frame.name = LOCAL_SNAPSHOT_PREFIX + JSON.stringify(await handlers.localSnapshot())
  signal?.throwIfAborted()
  frame.dataset.trpgAuthorFrame = codeSet
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none'
  const url = frameUrl(pluginRoot, codeSet)
  const token = `${codeSet}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  url.searchParams.set(FRAME_PARAM, token)
  /** 认消息：同站点、带着这个小窗的暗号（不靠 event.source，见 protocol.ts 说明）。 */
  const fromThisFrame = (event: MessageEvent): FrameMessage | null =>
    event.origin === url.origin && isFrameMessage(event.data) && 'frame' in event.data && event.data.frame === token ? event.data : null
  const failures: string[] = []
  function onRequest(event: MessageEvent): void {
    const m = fromThisFrame(event)
    if (!m || m.type !== 'request') return
    const req = m
    const reply = (body: Omit<FrameResponse, 'channel' | 'type' | 'id'>): void => {
      frame.contentWindow?.postMessage({ channel: CHANNEL, type: 'response', id: req.id, ...body } satisfies FrameResponse, url.origin)
    }
    answer(handlers, req).then(
      (value) => reply({ ok: true, value: value ?? null }),
      (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        failures.push(`${req.op} ${'path' in req ? req.path : 'key' in req ? req.key : ''}：${message}`)
        console.error('[trpg-library] 小窗要求处理失败', req, error)
        reply({ ok: false, error: message })
      },
    )
  }
  let nextCall = 1
  const calls = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
  function onResult(event: MessageEvent): void {
    const m = fromThisFrame(event)
    if (!m || m.type !== 'result') return
    const r = m
    const p = calls.get(r.id)
    if (!p) return
    calls.delete(r.id)
    if (r.ok) p.resolve(r.value)
    else p.reject(new Error(r.error))
  }
  addEventListener('message', onRequest)
  addEventListener('message', onResult)
  let closed = false
  let cleanup = (): void => undefined
  const close = (): void => {
    if (closed) return
    closed = true
    cleanup()
    removeEventListener('message', onRequest)
    removeEventListener('message', onResult)
    for (const p of calls.values()) p.reject(new Error(`作者小窗 ${codeSet} 已关闭`))
    calls.clear()
    frame.remove()
  }
  const call = ((fn: string, ...args: unknown[]) => new Promise<unknown>((resolve, reject) => {
    if (closed) { reject(new Error(`作者小窗 ${codeSet} 已关闭`)); return }
    const id = nextCall++
    calls.set(id, { resolve, reject })
    frame.contentWindow?.postMessage({ channel: CHANNEL, type: 'call', id, fn, args } satisfies FrameCall, url.origin)
  })) as AuthorFrame['call']
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      removeEventListener('message', onReady)
      close()
      reject(new Error(`作者小窗 ${codeSet} 在 ${timeoutMs}ms 内没有就绪`))
    }, timeoutMs)
    function onReady(event: MessageEvent): void {
      const m = fromThisFrame(event)
      if (!m || m.type !== 'ready') return
      clearTimeout(timer)
      removeEventListener('message', onReady)
      resolve({ codeSet, frame, ready: m, failures, call, close })
    }
    const onAbort = (): void => { close(); reject(signal?.reason) }
    cleanup = () => {
      clearTimeout(timer)
      removeEventListener('message', onReady)
      signal?.removeEventListener('abort', onAbort)
    }
    addEventListener('message', onReady)
    signal?.addEventListener('abort', onAbort, { once: true })
    frame.src = url.href
    container.append(frame)
  })
}
