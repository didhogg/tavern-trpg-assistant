import type { EventHandler, StContext, TauriTavernHost } from './types'

declare global {
  interface Window {
    SillyTavern?: { getContext: () => StContext; libs?: Record<string, unknown> }
    __TAURITAVERN__?: TauriTavernHost
    __TAURITAVERN_MAIN_READY__?: Promise<unknown>
    __trpgAssistantBooted?: boolean
  }
}

export const MODULE_NAME = 'tavern-trpg-assistant'

export function getContext(): StContext {
  const st = window.SillyTavern
  if (!st?.getContext) throw new Error('SillyTavern 宿主未就绪')
  return st.getContext()
}

export function getTextarea(): HTMLTextAreaElement | null {
  return document.getElementById('send_textarea') as HTMLTextAreaElement | null
}

/** 酒馆界面与全局对象都就绪后 resolve；超时 reject。 */
export function waitForHost(timeoutMs = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const isReady = () => !!window.SillyTavern?.getContext && !!getTextarea()
    if (isReady()) {
      resolve()
      return
    }
    const observer = new MutationObserver(() => {
      if (!isReady()) return
      window.clearTimeout(timer)
      observer.disconnect()
      resolve()
    })
    const timer = window.setTimeout(() => {
      observer.disconnect()
      reject(new Error('等待酒馆界面超时'))
    }, timeoutMs)
    observer.observe(document.documentElement, { childList: true, subtree: true })
  })
}

/** TauriTavern 宿主存在时等待其 ready；否则返回 null。 */
export async function waitForTauriTavern(timeoutMs = 5000): Promise<TauriTavernHost | null> {
  const host = window.__TAURITAVERN__
  if (!host) return null
  const ready = host.ready ?? window.__TAURITAVERN_MAIN_READY__
  if (ready) {
    await Promise.race([
      ready,
      new Promise((_, reject) => window.setTimeout(() => reject(new Error('TauriTavern ready 超时')), timeoutMs)),
    ])
  }
  return host
}

export function eventName(ctx: StContext, key: string, fallback: string): string {
  return ctx.event_types?.[key] ?? fallback
}

/** 订阅酒馆事件，返回取消订阅函数。 */
export function onEvent(ctx: StContext, name: string, handler: EventHandler): () => void {
  ctx.eventSource.on(name, handler)
  return () => {
    const remove = ctx.eventSource.removeListener ?? ctx.eventSource.off
    remove?.call(ctx.eventSource, name, handler)
  }
}

/** 通过原生 setter 写入输入框并触发 input 事件，使酒馆的监听感知到变化。 */
export function setTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  if (!setter) throw new Error('无法获取输入框 value 写入器')
  setter.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}
