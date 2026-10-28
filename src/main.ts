import { getContext, waitForHost } from './host/context'
import { mountApp } from './ui/shell/mount'

async function boot(): Promise<void> {
  if (window.__trpgAssistantBooted) return
  window.__trpgAssistantBooted = true
  await waitForHost()
  mountApp(getContext())
}

boot().catch((error) => {
  window.__trpgAssistantBooted = false
  console.error('[trpg-assistant] 启动失败', error)
})
