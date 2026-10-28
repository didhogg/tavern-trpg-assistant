import { MODULE_NAME, waitForTauriTavern } from '../host/context'
import { guard, setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'tauri'
const TITLE = 'TauriTavern 扩展接口'
const NAMESPACE = `${MODULE_NAME}-m0`
const LAYOUT_KIT_URL = '/scripts/tauritavern/layout-kit.js'
const HANDLE_GETTERS = ['current', 'getCurrent', 'active', 'handle', 'currentChat']

type Dict = Record<string, unknown>

function describe(value: unknown, depth: number): unknown {
  if (typeof value === 'function') return 'function'
  if (value === null || typeof value !== 'object') return typeof value
  if (depth <= 0) return 'object'
  const out: Dict = {}
  for (const key of Object.keys(value as Dict)) out[key] = describe((value as Dict)[key], depth - 1)
  return out
}

async function attempt(label: string, fn: () => unknown): Promise<unknown> {
  try {
    return { ok: true, value: await fn() }
  } catch (error) {
    console.error(`[trpg-assistant] ${label} 调用失败`, error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function findHandle(chat: Dict): Promise<{ handle: Dict | null; via: string | null }> {
  if (typeof chat.searchMessages === 'function' || chat.store) return { handle: chat, via: 'api.chat 本身' }
  for (const name of HANDLE_GETTERS) {
    const candidate = chat[name]
    if (typeof candidate === 'function') {
      const result = await attempt(`api.chat.${name}()`, () => (candidate as () => unknown).call(chat))
      const value = (result as { ok: boolean; value?: unknown }).value
      if ((result as { ok: boolean }).ok && value && typeof value === 'object') return { handle: value as Dict, via: `api.chat.${name}()` }
    } else if (candidate && typeof candidate === 'object') {
      return { handle: candidate as Dict, via: `api.chat.${name}` }
    }
  }
  return { handle: null, via: null }
}

export function createTauriProbe(): ProbeModule {
  const run = () =>
    guard(ID, TITLE, async () => {
      if (!window.__TAURITAVERN__) {
        setResult(ID, TITLE, 'info', '不是 TauriTavern，跳过（扩展将使用酒馆通用能力）')
        return
      }
      const host = await waitForTauriTavern()
      const api = (host?.api ?? {}) as Dict
      const chat = (api.chat ?? {}) as Dict
      const detail: Dict = { apiShape: describe(api, 3) }

      const layoutKit = await attempt('layout-kit 导入', () =>
        import(/* @vite-ignore */ LAYOUT_KIT_URL).then((m: Dict) => Object.keys(m)),
      )
      detail.layoutKitExports = layoutKit

      const { handle, via } = await findHandle(chat)
      detail.handleVia = via
      if (handle) {
        const h = handle as Dict & {
          searchMessages?: (a: unknown) => Promise<unknown>
          locate?: { findLastMessage?: (a: unknown) => Promise<unknown> }
          store?: Dict & {
            setJson?: (a: unknown) => Promise<unknown>
            getJson?: (a: unknown) => Promise<unknown>
            listKeys?: (a: unknown) => Promise<unknown>
            deleteJson?: (a: unknown) => Promise<unknown>
          }
          metadata?: { get?: () => Promise<unknown> }
        }
        detail.handleShape = describe(handle, 2)
        if (h.searchMessages) detail.searchMessages = await attempt('searchMessages', () => h.searchMessages!({ query: '你', limit: 3 }))
        const findLast = h.locate?.findLastMessage
        if (findLast) detail.findLastMessage = await attempt('findLastMessage', () => findLast.call(h.locate, { role: 'user', scanLimit: 50 }))
        if (h.store?.setJson && h.store.getJson) {
          const value = { at: new Date().toISOString() }
          detail.storeSet = await attempt('store.setJson', () => h.store!.setJson!({ namespace: NAMESPACE, key: 'probe', value }))
          detail.storeGet = await attempt('store.getJson', () => h.store!.getJson!({ namespace: NAMESPACE, key: 'probe' }))
          if (h.store.listKeys) detail.storeKeys = await attempt('store.listKeys', () => h.store!.listKeys!({ namespace: NAMESPACE }))
          if (h.store.deleteJson) detail.storeDelete = await attempt('store.deleteJson', () => h.store!.deleteJson!({ namespace: NAMESPACE, key: 'probe' }))
        }
        if (h.metadata?.get) detail.metadata = await attempt('metadata.get', () => h.metadata!.get!())
      }
      setResult(
        ID,
        TITLE,
        'info',
        handle ? `找到 handle（${via}）；各接口调用结果见详情` : '没有找到获取 handle 的方式；接口结构见详情',
        detail,
      )
    })
  return {
    id: ID,
    title: TITLE,
    hint: '仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。',
    actions: [{ label: '重新检测', run }],
    start: run,
  }
}
