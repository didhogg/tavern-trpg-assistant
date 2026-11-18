// 小窗取模块文件的唯一改道处：KernelInput.moduleRoots 登记了「这个模块的程序在别的文件夹」（本机私人完整版，input.ts），
// 小窗里所有按 modules/<编号>/… 取的文件（作者模板、作者数据、程序本身）先到登记的文件夹取，那里没有（例如我们自己加的语言包）
// 再取插件自带的同名文件。不改作者代码、不逐个文件登记。
/* eslint-disable @typescript-eslint/no-explicit-any -- 浏览器原生 fetch 签名。 */
const g = globalThis as any

/** 按登记改道：命中登记的模块文件夹交回新地址，否则 null。 */
export function moduleUrl(roots: Record<string, string> | undefined, url: URL): URL | null {
  if (!roots) return null
  const frameDir = new URL('.', location.href)
  if (url.origin !== frameDir.origin || !url.pathname.startsWith(frameDir.pathname)) return null
  const rel = decodeURIComponent(url.pathname.slice(frameDir.pathname.length))
  for (const [id, root] of Object.entries(roots)) {
    const base = `modules/${id}/`
    if (rel.startsWith(base)) return new URL(root + rel.slice(base.length) + url.search, frameDir)
  }
  return null
}

/** 小窗启动时装一次（main.ts boot）：之后官方客户端和作者程序的 fetch 都按登记改道。 */
export function redirectModuleFiles(roots: Record<string, string> | undefined): void {
  if (!roots || !Object.keys(roots).length) return
  const original: typeof fetch = g.fetch.bind(g)
  g.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const to = moduleUrl(roots, new URL(raw, location.href))
    if (!to) return original(input, init)
    const moved = await original(input instanceof Request ? new Request(to, input) : to, init)
    return moved.status === 404 ? original(input, init) : moved
  }
}
