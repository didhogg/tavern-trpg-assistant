// 取件员：按源登记表的地址顺序下载一个文件，用 GitHub 目录树里的指纹核对（D2-P2 B1 设计 §3.2、§11 第 1 层）。
import { sha1 } from '@noble/hashes/legacy.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

export type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; arrayBuffer(): Promise<ArrayBuffer>; json(): Promise<unknown> }>

/** 断网有时不会立即报错。限制一次请求（包括读完响应）的等待，保留镜像切换。 */
async function withRequestDeadline<T>(outer: AbortSignal | undefined, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  outer?.throwIfAborted()
  const request = new AbortController()
  const forward = (): void => request.abort(outer?.reason)
  outer?.addEventListener('abort', forward, { once: true })
  const timer = setTimeout(() => request.abort(new DOMException('网络请求超过 30 秒', 'TimeoutError')), 30_000)
  try {
    return await run(request.signal)
  } finally {
    clearTimeout(timer)
    outer?.removeEventListener('abort', forward)
  }
}

/** Git 给文件算指纹的办法：sha1("blob <字节数>\0" + 内容)。和 GitHub 目录树里的 sha 直接可比。 */
export function gitBlobSha(bytes: Uint8Array): string {
  const header = utf8ToBytes(`blob ${bytes.length}\0`)
  const all = new Uint8Array(header.length + bytes.length)
  all.set(header)
  all.set(bytes, header.length)
  return bytesToHex(sha1(all))
}

export interface Expected {
  sha: string
  size: number
}

export interface Fetched {
  bytes: Uint8Array
  url: string
  gitSha: string
  /** 换过的地址和原因（用于体检）。 */
  skipped: Array<{ url: string; reason: string }>
}

/** 依次试每个地址；有指纹就核对，对不上换下一个；全部失败才报错。 */
export async function fetchVerified(roots: string[], path: string, expected: Expected | undefined, fetchImpl: FetchLike = fetch, signal?: AbortSignal): Promise<Fetched> {
  const skipped: Fetched['skipped'] = []
  for (const root of roots) {
    const url = `${root}${path}`
    try {
      const bytes = await withRequestDeadline(signal, async (requestSignal) => {
        const res = await fetchImpl(url, { signal: requestSignal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return new Uint8Array(await res.arrayBuffer())
      })
      const gitSha = gitBlobSha(bytes)
      if (expected && gitSha !== expected.sha) {
        skipped.push({ url, reason: `指纹不符：${gitSha} ≠ ${expected.sha}` })
        continue
      }
      return { bytes, url, gitSha, skipped }
    } catch (error) {
      if (signal?.aborted) throw error
      skipped.push({ url, reason: error instanceof Error ? error.message : String(error) })
    }
  }
  throw new Error(`所有地址都取不到 ${path}：${skipped.map((s) => `${s.url}（${s.reason}）`).join('；')}`)
}

export type FileList = Record<string, Expected>

/** GitHub 目录树（锁定版本）→ 路径 → {指纹, 大小}。这是镜像比对的标准答案。 */
export async function fetchFileList(url: string, fetchImpl: FetchLike = fetch, signal?: AbortSignal): Promise<FileList> {
  const body = await withRequestDeadline(signal, async (requestSignal) => {
    const res = await fetchImpl(url, { signal: requestSignal })
    if (!res.ok) throw new Error(`取文件清单失败：HTTP ${res.status} ${url}`)
    return await res.json() as { truncated?: boolean; tree?: Array<{ path: string; type: string; sha: string; size?: number }> }
  })
  if (body.truncated) throw new Error(`文件清单被截断：${url}`)
  const out: FileList = {}
  for (const it of body.tree ?? []) if (it.type === 'blob') out[it.path] = { sha: it.sha, size: it.size ?? 0 }
  return out
}
