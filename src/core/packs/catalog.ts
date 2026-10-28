import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import { compareVersions } from '../semver'
import { FORMAT_VERSION } from '../../schemas/common'
import { catalogSchema, type Catalog, type CatalogPack, type InstalledPack } from '../../schemas/pack'
import type { PackService } from './installer'
import { verifyDownload } from './recognize'

const CATALOG_TTL = 3_600_000
const CATALOG_TIMEOUT = 10_000

type FetchFn = typeof fetch

function networkError(prefix: string, error: unknown): TrpgError {
  if ((error as { name?: string } | null)?.name === 'AbortError') return new TrpgError('E_CANCELLED', '已取消')
  return new TrpgError('E_NETWORK', `${prefix}：网络不可用`)
}

function httpError(prefix: string, status: number): TrpgError {
  return new TrpgError('E_HTTP', status === 404 ? `${prefix}：文件不存在（404）` : `${prefix}：服务器返回 ${status}`, { status })
}

/** 读取数据仓库目录（10 秒超时；成功结果缓存 1 小时，force 时忽略缓存）。 */
export async function fetchCatalog(opts: { url: string; db?: TrpgDatabase; fetchFn?: FetchFn; now?: () => number; force?: boolean; timeoutMs?: number }): Promise<Catalog> {
  const now = opts.now ?? Date.now
  if (opts.db && !opts.force) {
    const cached = await opts.db.getMeta<{ url: string; fetchedAt: number; catalog: Catalog }>('catalogCache')
    if (cached && cached.url === opts.url && now() - cached.fetchedAt < CATALOG_TTL) return cached.catalog
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? CATALOG_TIMEOUT)
  let response: Response
  try {
    response = await (opts.fetchFn ?? fetch)(opts.url, { signal: controller.signal })
  } catch (error) {
    if ((error as { name?: string } | null)?.name === 'AbortError') throw new TrpgError('E_NETWORK', '连不上数据仓库：等待超时')
    throw networkError('连不上数据仓库', error)
  } finally {
    clearTimeout(timer)
  }
  if (!response.ok) throw httpError('连不上数据仓库', response.status)
  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    throw new TrpgError('E_BAD_CONTENT', '数据仓库目录格式不正确')
  }
  const parsed = catalogSchema.safeParse(raw)
  if (!parsed.success) throw new TrpgError('E_BAD_CONTENT', '数据仓库目录格式不正确')
  if (parsed.data.formatVersion > FORMAT_VERSION) throw new TrpgError('E_NEWER_FORMAT', '数据仓库目录由更新版本创建，请先更新扩展')
  if (opts.db) await opts.db.setMeta('catalogCache', { url: opts.url, fetchedAt: now(), catalog: parsed.data })
  return parsed.data
}

/** 下载单个内容包文件，边读边报进度，完成后校验大小与校验值。 */
export async function downloadPack(pack: CatalogPack, opts: { catalogUrl: string; fetchFn?: FetchFn; signal?: AbortSignal; onProgress?: (received: number, total: number) => void }): Promise<Uint8Array> {
  const url = new URL(pack.url, opts.catalogUrl).toString()
  let response: Response
  try {
    response = await (opts.fetchFn ?? fetch)(url, { signal: opts.signal })
  } catch (error) {
    throw networkError('下载失败', error)
  }
  if (!response.ok) throw httpError('下载失败', response.status)
  const total = pack.byteSize
  const chunks: Uint8Array[] = []
  let received = 0
  try {
    if (response.body) {
      const reader = response.body.getReader()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        opts.onProgress?.(received, total)
      }
    } else {
      const all = new Uint8Array(await response.arrayBuffer())
      chunks.push(all)
      received = all.length
      opts.onProgress?.(received, total)
    }
  } catch (error) {
    if ((error as { name?: string } | null)?.name === 'AbortError') throw new TrpgError('E_CANCELLED', '已取消')
    throw new TrpgError('E_NETWORK', '下载失败：网络中断')
  }
  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  verifyDownload(bytes, { byteSize: pack.byteSize, sha256: pack.sha256 })
  return bytes
}

/** 把下载好的文件交给安装器（同 id 直接覆盖）；文件内容必须与目录条目一致。 */
export async function installDownloaded(packs: PackService, bytes: Uint8Array, entry: CatalogPack): Promise<InstalledPack> {
  const rec = packs.recognize(bytes)
  if (rec.type !== 'pack' || rec.manifest.id !== entry.id || rec.manifest.version !== entry.version) {
    throw new TrpgError('E_BAD_CONTENT', '文件内容损坏：下载的文件与目录说明不一致')
  }
  return packs.install(rec, { source: 'download' })
}

/** 目录中比已安装版本更高的内容包（内置包随扩展更新，不在此列）。 */
export function findUpdates(installed: InstalledPack[], catalog: Catalog): CatalogPack[] {
  return catalog.packs.filter((c) => {
    const have = installed.find((p) => p.id === c.id)
    return !!have && have.source !== 'builtin' && compareVersions(c.version, have.version) > 0
  })
}

/** 目录中尚未安装的内容包（限定规则）。 */
export function findDownloadable(installed: InstalledPack[], catalog: Catalog, ruleId: string): CatalogPack[] {
  return catalog.packs.filter((c) => c.ruleId === ruleId && !installed.some((p) => p.id === c.id))
}
