import { waitForTauriTavern } from '../host/context'
import type { StContext } from '../host/types'
import { guard, setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'env'
const TITLE = '宿主与设备环境'

function safeAreaTop(): string {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)'
  document.body.appendChild(probe)
  const value = getComputedStyle(probe).paddingTop
  probe.remove()
  return value
}

export async function collectEnv(ctx: StContext): Promise<Record<string, unknown>> {
  let tauri: Record<string, unknown> = { present: false }
  if (window.__TAURITAVERN__) {
    try {
      const host = await waitForTauriTavern()
      tauri = { present: true, ready: true, apiKeys: Object.keys(host?.api ?? {}) }
    } catch (error) {
      console.error('[trpg-assistant] TauriTavern 就绪等待失败', error)
      tauri = { present: true, ready: false, error: String(error) }
    }
  }
  return {
    userAgent: navigator.userAgent,
    viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    safeAreaTop: safeAreaTop(),
    contextKeys: Object.keys(ctx).sort(),
    libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
    hasSetExtensionPrompt: typeof ctx.setExtensionPrompt === 'function',
    hasPromptEnums: !!ctx.extension_prompt_types,
    eventTypeCount: Object.keys(ctx.event_types ?? {}).length,
    tauri,
  }
}

export function createEnvProbe(ctx: StContext): ProbeModule {
  const run = () =>
    guard(ID, TITLE, async () => {
      const env = await collectEnv(ctx)
      const tauri = env.tauri as { present: boolean }
      setResult(ID, TITLE, 'info', tauri.present ? '检测到 TauriTavern 宿主' : '未检测到 TauriTavern（普通 SillyTavern）', env)
    })
  return { id: ID, title: TITLE, hint: '自动检测。', actions: [{ label: '重新检测', run }], start: run }
}
