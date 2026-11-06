import { TrpgError, type ErrorCode } from '../errors'
import type { Settings } from '../../schemas/campaign'
import { MANIFEST_KIND, SUPPORTED_MANIFEST_FORMAT, buildSourceIndex, manifestSchema, reconcileManifest, type SourceIndex, type SourceManifest } from './manifest'

/** 当前数据源指针（T4）。只回答"数据从哪来"，不拉取、不读取、不展开条目（那是 P2 库后端）。 */
export interface SourceNotice { code: ErrorCode; message: string }

export type ActiveSource =
  | { mode: 'legacy'; notice?: SourceNotice }
  | { mode: 'upstream'; manifest: SourceManifest; index: SourceIndex; from: 'primary' | 'fallback' }

type FetchFn = typeof fetch
type PointerSettings = Pick<Settings, 'dataSource' | 'sourceManifestUrl' | 'sourceManifestFallbackUrl'>

const DEFAULT_TIMEOUT = 30_000

async function fetchManifest(url: string, fetchFn: FetchFn, timeoutMs: number): Promise<SourceManifest> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response
  try {
    response = await fetchFn(url, { signal: controller.signal, cache: 'no-cache' })
  } catch (error) {
    const timedOut = (error as { name?: string } | null)?.name === 'AbortError'
    throw new TrpgError('E_SOURCE_UNAVAILABLE', timedOut ? '连不上源清单：等待超时' : '连不上源清单：网络不可用')
  } finally {
    clearTimeout(timer)
  }
  if (!response.ok) throw new TrpgError('E_SOURCE_UNAVAILABLE', `连不上源清单：服务器返回 ${response.status}`, { status: response.status })
  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    throw new TrpgError('E_SOURCE_MANIFEST_BAD', '源清单格式不正确：不是 JSON')
  }
  const head = raw as { kind?: unknown; formatVersion?: unknown } | null
  if (head?.kind !== MANIFEST_KIND) throw new TrpgError('E_SOURCE_MANIFEST_BAD', '源清单格式不正确：不是 5etools 源清单')
  if (typeof head.formatVersion === 'number' && head.formatVersion > SUPPORTED_MANIFEST_FORMAT) throw new TrpgError('E_NEWER_FORMAT', '源清单由更新版本创建，请先更新扩展')
  const parsed = manifestSchema.safeParse(raw)
  if (!parsed.success) throw new TrpgError('E_SOURCE_MANIFEST_BAD', '源清单格式不正确：缺少必要字段', { issues: parsed.error.issues.slice(0, 5).map((i) => i.path.join('.')) })
  const issues = reconcileManifest(parsed.data)
  if (issues.length) throw new TrpgError('E_SOURCE_MANIFEST_BAD', `源清单账目对不上：${issues[0]}`, { issues })
  return parsed.data
}

/**
 * 解析当前数据源。永不抛错：
 * - 设置为旧库：直接返回旧库，不联网；
 * - 设置为上游：读主地址，失败再读备用地址；仍失败（含未配置、格式不对、账目对不上）就退回旧库并带上提示，调用方负责显示。
 * 旧库的目录、包与条目在这里完全不被读取或改动。
 */
export async function resolveDataSource(settings: PointerSettings, opts: { fetchFn?: FetchFn; timeoutMs?: number } = {}): Promise<ActiveSource> {
  if (settings.dataSource !== 'upstream') return { mode: 'legacy' }
  const urls = [settings.sourceManifestUrl, settings.sourceManifestFallbackUrl].filter((u) => u.trim())
  if (!urls.length) return { mode: 'legacy', notice: { code: 'E_SOURCE_NOT_CONFIGURED', message: '还没有配置源清单地址，已使用旧数据仓库' } }
  const fetchFn = opts.fetchFn ?? fetch
  let last: unknown
  for (const [i, url] of urls.entries()) {
    try {
      const manifest = await fetchManifest(url, fetchFn, opts.timeoutMs ?? DEFAULT_TIMEOUT)
      return { mode: 'upstream', manifest, index: buildSourceIndex(manifest), from: i === 0 && settings.sourceManifestUrl.trim() ? 'primary' : 'fallback' }
    } catch (error) {
      console.error('[数据源] 读取源清单失败', url, error)
      last = error
    }
  }
  const e = last instanceof TrpgError ? last : new TrpgError('E_SOURCE_UNAVAILABLE', '读取源清单失败')
  return { mode: 'legacy', notice: { code: e.code, message: `${e.message}，已使用旧数据仓库` } }
}
