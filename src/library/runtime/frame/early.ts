// 小窗里最先运行（在作者脚本之前），做三件事（D2-P2 B1 设计 §7 A）：
// ① 隔离：小窗里的 localStorage / sessionStorage 换成只在内存里的，作者程序不会写进酒馆自己的浏览器存储；
// ② 取数出口：作者一定义 DataUtil，就照作者自己的 PatchLoadJson 写法换掉 loadJSON / loadRawJSON，
//    小窗目录下的相对路径（data/…、search/…）改成向插件要原文；其他地址仍走作者原来的出口；
// ③ 存储口子：作者一定义 StorageUtil，就照作者自己的 StorageUtilMemory 写法换掉 _getAsyncStorage，
//    作者的异步存储（自制包、屏蔽表等）改存插件的库数据库。
// 这是普通脚本（不是模块），不能 import；传话格式与 ../protocol.ts 保持一致。包在函数里，不在作者的全局环境里多出变量。
;(() => {
  const CHANNEL = 'trpg-library'
  const g = globalThis as Record<string, unknown>

  const errors: string[] = []
  g.__trpgFrameErrors = errors
  addEventListener('error', (e) => {
    errors.push(`${e.message} @ ${e.filename}:${e.lineno}`)
  })
  addEventListener('unhandledrejection', (e) => {
    const reason = e.reason as { stack?: string } | undefined
    errors.push(`unhandledrejection: ${reason?.stack ?? String(e.reason)}`)
  })

  // ① 隔离
  function memoryStorage(): Storage {
    const map = new Map<string, string>()
    return {
      get length() { return map.size },
      key: (i: number) => [...map.keys()][i] ?? null,
      getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
      setItem: (k: string, v: string) => { map.set(String(k), String(v)) },
      removeItem: (k: string) => { map.delete(String(k)) },
      clear: () => map.clear(),
    }
  }
  for (const name of ['localStorage', 'sessionStorage']) {
    const storage = memoryStorage()
    Object.defineProperty(window, name, { configurable: true, get: () => storage })
  }

  // 传话
  let nextId = 1
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
  addEventListener('message', (event) => {
    const d = event.data as { channel?: string; type?: string; id?: number; ok?: boolean; value?: unknown; error?: string } | null
    if (event.source !== parent || !d || d.channel !== CHANNEL || d.type !== 'response') return
    const p = pending.get(d.id!)
    if (!p) return
    pending.delete(d.id!)
    if (d.ok) p.resolve(d.value)
    else p.reject(new Error(d.error))
  })
  function request(body: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      parent.postMessage({ channel: CHANNEL, type: 'request', id, ...body }, location.origin)
    })
  }

  // 作者在定义某个全局对象的那一刻，交给 patch 处理
  function onDefine(name: string, patch: (value: Record<string, unknown>) => void): void {
    let value: unknown
    Object.defineProperty(globalThis, name, {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: (v: unknown) => {
        value = v
        if (v) patch(v as Record<string, unknown>)
      },
    })
  }

  // ② 取数出口
  const frameDir = new URL('.', location.href)
  function sitePath(url: string): string | null {
    const u = new URL(url, frameDir)
    if (u.origin !== frameDir.origin || !u.pathname.startsWith(frameDir.pathname)) return null
    return decodeURIComponent(u.pathname.slice(frameDir.pathname.length))
  }
  const texts = new Map<string, Promise<string>>()
  function siteText(path: string): Promise<string> {
    let p = texts.get(path)
    if (!p) {
      p = request({ op: 'file', path }).then((text) => {
        if (typeof text !== 'string') throw new Error(`文件不存在：${path}`)
        return text
      })
      p.catch(() => texts.delete(path))
      texts.set(path, p)
    }
    return p
  }
  type Loader = (url: string, ...rest: unknown[]) => Promise<unknown>
  onDefine('DataUtil', (D) => {
    const originalJson = (D.loadJSON as Loader).bind(D)
    const originalRaw = (D.loadRawJSON as Loader).bind(D)
    const merged = new Map<string, Promise<unknown>>()
    D.loadJSON = (url: string, ...rest: unknown[]) => {
      const path = sitePath(url)
      if (path === null) return originalJson(url, ...rest)
      let p = merged.get(url)
      if (!p) {
        p = (async () => {
          const data = JSON.parse(await siteText(path))
          await (D.pDoMetaMerge as (u: string, d: unknown, o: unknown) => Promise<unknown>)(url, data, { isSkipMetaMergeCache: true })
          return data
        })()
        p.catch(() => merged.delete(url))
        merged.set(url, p)
      }
      return p
    }
    D.loadRawJSON = async (url: string, ...rest: unknown[]) => {
      const path = sitePath(url)
      if (path === null) return originalRaw(url, ...rest)
      return JSON.parse(await siteText(path))
    }
  })

  // ③ 存储口子
  const kvStorage = {
    getItem: (key: string) => request({ op: 'kv-get', key }),
    setItem: (key: string, value: unknown) => request({ op: 'kv-set', key, value }),
    removeItem: (key: string) => request({ op: 'kv-remove', key }),
  }
  onDefine('StorageUtil', (S) => {
    S._getAsyncStorage = async () => kvStorage
  })
})()
