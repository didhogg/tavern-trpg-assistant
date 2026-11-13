// 小窗里最先运行（在作者脚本之前），做三件事（D2-P2 B1 设计 §7 A）：
// ① 隔离：小窗里的 localStorage / sessionStorage 换成插件管的，作者程序不会写进酒馆自己的浏览器存储（localStorage 存进插件库）；
// ② 取数出口：作者一定义 DataUtil，就照作者自己的 PatchLoadJson 写法换掉 loadJSON / loadRawJSON，
//    小窗目录下的相对路径（data/…、search/…）改成向插件要原文；其他地址仍走作者原来的出口；
// ③ 存储口子：作者一定义 StorageUtil，就照作者自己的 StorageUtilMemory 写法换掉 _getAsyncStorage，
//    作者的异步存储（自制包、屏蔽表等）改存插件的库数据库。
// 这是普通脚本（不是模块），不能 import；传话格式与 ../protocol.ts 保持一致。包在函数里，不在作者的全局环境里多出变量。
;(() => {
  const CHANNEL = 'trpg-library'
  const FRAME = new URLSearchParams(location.search).get('frame') ?? ''
  const g = globalThis as Record<string, unknown>

  const errors: string[] = []
  g.__trpgFrameErrors = errors
  // 只记写盘失败（storageFlush 用）；作者其他报错（例如断网时后台取索引失败）不算写盘失败
  const storageErrors: string[] = []
  addEventListener('error', (e) => {
    errors.push(`${e.message} @ ${e.filename}:${e.lineno}`)
  })
  addEventListener('unhandledrejection', (e) => {
    const reason = e.reason as { stack?: string } | undefined
    errors.push(`unhandledrejection: ${reason?.stack ?? String(e.reason)}`)
  })

  // ① 隔离：localStorage 换成内存版，内容从插件来、写入存回插件（作者的同步存储存着已装自制包清单、搜索设置等）；
  //    sessionStorage 只在内存。iframe 的 name 带着上次存下的内容（../protocol.ts LOCAL_SNAPSHOT_PREFIX）。
  const LOCAL_PREFIX = 'trpg-local:'
  let localInit: Record<string, string> = {}
  if (window.name.startsWith(LOCAL_PREFIX)) {
    localInit = JSON.parse(window.name.slice(LOCAL_PREFIX.length)) as Record<string, string>
    window.name = ''
  }
  function memoryStorage(init: Record<string, string>, persist: boolean): Storage {
    const map = new Map<string, string>(Object.entries(init))
    const save = (body: Record<string, unknown>): void => {
      if (persist) request(body).catch((e: unknown) => { const m = `同步存储没存进插件：${String(e)}`; errors.push(m); storageErrors.push(m) })
    }
    return {
      get length() { return map.size },
      key: (i: number) => [...map.keys()][i] ?? null,
      getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
      setItem: (k: string, v: string) => {
        map.set(String(k), String(v))
        save({ op: 'local-set', key: String(k), value: String(v) })
      },
      removeItem: (k: string) => {
        map.delete(String(k))
        save({ op: 'local-remove', key: String(k) })
      },
      clear: () => {
        for (const k of map.keys()) save({ op: 'local-remove', key: k })
        map.clear()
      },
    }
  }
  const storages = { localStorage: memoryStorage(localInit, true), sessionStorage: memoryStorage({}, false) }
  for (const [name, storage] of Object.entries(storages)) {
    Object.defineProperty(window, name, { configurable: true, get: () => storage })
  }

  // 传话
  let nextId = 1
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
  const pendingWrites = new Set<Promise<unknown>>()
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
    const p = new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      parent.postMessage({ channel: CHANNEL, type: 'request', frame: FRAME, id, ...body }, location.origin)
    })
    // 同步存储的写入是“发出去就算”的；发布前要等它们真的落库（P5 T1）
    if (body.op === 'local-set' || body.op === 'local-remove' || body.op === 'kv-set' || body.op === 'kv-remove') {
      pendingWrites.add(p)
      p.then(() => pendingWrites.delete(p), (e: unknown) => {
        pendingWrites.delete(p)
        if (body.op === 'kv-set' || body.op === 'kv-remove') storageErrors.push(`作者存储没存进插件：${String(e)}`)
      })
    }
    return p
  }
  g.__trpgStorageFlush = async (): Promise<string[]> => {
    await Promise.allSettled([...pendingWrites])
    return [...storageErrors]
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
  // 小窗启动以来作者请求过的网站文件（P5.5 B8-3：复制成我的只从作者实际读的数据文件里取）
  const sitePaths = new Set<string>()
  g.__trpgSitePaths = sitePaths
  function siteText(path: string): Promise<string> {
    sitePaths.add(path)
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
