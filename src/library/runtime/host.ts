// 插件这一侧：开一个隐藏小窗让作者程序原样运行，并回答小窗的要求（D2-P2 B1 设计 §7 A）。
import { CHANNEL, isFrameMessage, type FrameReady, type FrameRequest, type FrameResponse } from './protocol'

/** 小窗要东西时插件怎么回答。文件不存在回答 null。 */
export interface FrameHandlers {
  file(path: string): Promise<string | null>
  kvGet(key: string): Promise<unknown>
  kvSet(key: string, value: unknown): Promise<void>
  kvRemove(key: string): Promise<void>
}

export interface AuthorFrame {
  codeSet: string
  frame: HTMLIFrameElement
  ready: FrameReady
  /** 小窗报过的要求处理失败（例如所有下载地址都取不到）。 */
  failures: string[]
  close(): void
}

export interface StartOptions {
  codeSet: string
  /** 插件根目录（vendor/、dist/ 所在处）。 */
  pluginRoot: URL
  container: HTMLElement
  handlers: FrameHandlers
  timeoutMs?: number
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
  }
}

export function startAuthorFrame({ codeSet, pluginRoot, container, handlers, timeoutMs = 60_000 }: StartOptions): Promise<AuthorFrame> {
  const frame = document.createElement('iframe')
  frame.dataset.trpgAuthorFrame = codeSet
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none'
  const url = frameUrl(pluginRoot, codeSet)
  const failures: string[] = []
  function onRequest(event: MessageEvent): void {
    if (event.source !== frame.contentWindow || !isFrameMessage(event.data) || event.data.type !== 'request') return
    const req = event.data
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
  addEventListener('message', onRequest)
  const close = (): void => {
    removeEventListener('message', onRequest)
    frame.remove()
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      removeEventListener('message', onReady)
      close()
      reject(new Error(`作者小窗 ${codeSet} 在 ${timeoutMs}ms 内没有就绪`))
    }, timeoutMs)
    function onReady(event: MessageEvent): void {
      if (event.source !== frame.contentWindow || !isFrameMessage(event.data) || event.data.type !== 'ready') return
      clearTimeout(timer)
      removeEventListener('message', onReady)
      resolve({ codeSet, frame, ready: event.data, failures, close })
    }
    addEventListener('message', onReady)
    frame.src = url.href
    container.append(frame)
  })
}
