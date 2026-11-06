// 插件这一侧：开一个隐藏小窗，让作者程序在里面原样运行（D2-P2 B1 设计 §7 A）。
import { isFrameMessage, type FrameReady } from './protocol'

export interface AuthorFrame {
  codeSet: string
  frame: HTMLIFrameElement
  ready: FrameReady
}

export interface StartOptions {
  codeSet: string
  /** 插件根目录（vendor/、dist/ 所在处）。 */
  pluginRoot: URL
  container: HTMLElement
  timeoutMs?: number
}

export function frameUrl(pluginRoot: URL, codeSet: string): URL {
  return new URL(`vendor/${codeSet}/frame.html`, pluginRoot)
}

export function startAuthorFrame({ codeSet, pluginRoot, container, timeoutMs = 60_000 }: StartOptions): Promise<AuthorFrame> {
  const frame = document.createElement('iframe')
  frame.dataset.trpgAuthorFrame = codeSet
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none'
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      removeEventListener('message', onMessage)
      frame.remove()
      reject(new Error(`作者小窗 ${codeSet} 在 ${timeoutMs}ms 内没有就绪`))
    }, timeoutMs)
    function onMessage(event: MessageEvent): void {
      if (event.source !== frame.contentWindow || !isFrameMessage(event.data) || event.data.type !== 'ready') return
      clearTimeout(timer)
      removeEventListener('message', onMessage)
      resolve({ codeSet, frame, ready: event.data })
    }
    addEventListener('message', onMessage)
    frame.src = frameUrl(pluginRoot, codeSet).href
    container.append(frame)
  })
}
