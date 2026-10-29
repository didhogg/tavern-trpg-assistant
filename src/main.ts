import { getContext, waitForHost } from './host/context'
import { bootApp } from './ui/shell/boot'
import { mountApp } from './ui/shell/mount'

async function boot(): Promise<void> {
  if (window.__trpgAssistantBooted) return
  window.__trpgAssistantBooted = true
  await waitForHost()
  const ctx = getContext()
  const pinia = mountApp(ctx)
  if (pinia) await bootApp(ctx, pinia)
}

boot().catch((error) => {
  window.__trpgAssistantBooted = false
  console.error('[trpg-assistant] 启动失败', error)
})
