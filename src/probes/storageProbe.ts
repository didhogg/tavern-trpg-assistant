import { MODULE_NAME } from '../host/context'
import type { StContext } from '../host/types'
import { guard, setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'storage'
const TITLE = '本地存储与持久性'
const DB_NAME = `${MODULE_NAME}-m0`
const BLOB_BYTES = 4 * 1024 * 1024

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('kv')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function idb<T>(db: IDBDatabase, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = run(db.transaction('kv', mode).objectStore('kv'))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

interface BootRecord {
  count: number
  firstAt: string
  lastAt: string
}

export function createStorageProbe(ctx: StContext): ProbeModule {
  const run = () =>
    guard(ID, TITLE, async () => {
      const db = await openDb()
      const previous = await idb<BootRecord | undefined>(db, 'readonly', (s) => s.get('boot'))
      const now = new Date().toISOString()
      const boot: BootRecord = { count: (previous?.count ?? 0) + 1, firstAt: previous?.firstAt ?? now, lastAt: now }
      await idb(db, 'readwrite', (s) => s.put(boot, 'boot'))

      const hadBlob = !!(await idb(db, 'readonly', (s) => s.get('blob')))
      if (!hadBlob) await idb(db, 'readwrite', (s) => s.put(new Uint8Array(BLOB_BYTES), 'blob'))
      const blob = await idb<Uint8Array | undefined>(db, 'readonly', (s) => s.get('blob'))
      db.close()

      const persisted = (await navigator.storage?.persisted?.()) ?? null
      const estimate = (await navigator.storage?.estimate?.()) ?? null

      const settings = (ctx.extensionSettings[MODULE_NAME] ??= {}) as Record<string, unknown>
      const previousSettingsCount = Number(settings.probeBootCount ?? 0)
      settings.probeBootCount = previousSettingsCount + 1
      ctx.saveSettingsDebounced()

      setResult(ID, TITLE, 'info', `IndexedDB 第 ${boot.count} 次启动读写正常；刷新页面后次数应增加`, {
        idb: { bootCount: boot.count, firstAt: boot.firstAt, blobBytes: blob?.byteLength ?? 0, blobWasAlreadyStored: hadBlob },
        navigatorStorage: { persisted, usage: estimate?.usage, quota: estimate?.quota },
        extensionSettings: { previousBootCount: previousSettingsCount, nowBootCount: previousSettingsCount + 1 },
        localforagePresent: !!window.SillyTavern?.libs?.localforage,
      })
    })
  return {
    id: ID,
    title: TITLE,
    hint: '每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。',
    actions: [{ label: '重新检测', run }],
    start: run,
  }
}
