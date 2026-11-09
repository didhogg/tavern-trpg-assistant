// 首次启动后台预取（P4 补后端，驾驶员批准做法 P）：插件第一次启动、界面可用之后，悄悄把向导和下载大小预估要用的
// 书目、冒险目录、各套官方数据的文件清单取回来存进本地库（和向导里取到的缓存完全一样，BookDirectory / FileProvider 原有的缓存），
// 用户第一次点"开始一场新的冒险"时就不用再等。缓存还在就什么都不做；联网失败静默跳过（只记日志），下次启动再试。
// 只在缓存缺失时取：官方数据版本升级（锁定提交号变）或本地库被清掉后自然补取；"更新时重新拉取"留给 P5 库页的一键更新。
import type { BookDirectory } from './directory'
import type { FileProvider } from './files'
import { SOURCES, getSource } from './sources'

export interface PrefetchReport {
  /** 整个跳过的原因（离线、自动化环境等）；null = 照常做了。 */
  skipped: string | null
  /** 这次联网取到的东西。 */
  fetched: string[]
  /** 本来就在缓存里的。 */
  cached: string[]
  errors: string[]
}

export interface PrefetchDeps {
  files: FileProvider
  directory: BookDirectory
  /** 要预取书目的语言（作者程序套名）；文件清单每套官方数据都取（下载大小预估要中英两份）。 */
  codeSets: string[]
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

export class CatalogPrefetch {
  private running: Promise<PrefetchReport> | null = null

  constructor(private readonly deps: PrefetchDeps) {}

  /** 同时只跑一次；跑完可以再调（缓存都在时很快返回）。 */
  run(): Promise<PrefetchReport> {
    this.running ??= this.once().finally(() => { this.running = null })
    return this.running
  }

  private async once(): Promise<PrefetchReport> {
    const report: PrefetchReport = { skipped: null, fetched: [], cached: [], errors: [] }
    for (const codeSet of this.deps.codeSets) {
      const label = `书目（${codeSet}）`
      try {
        if (await this.deps.directory.peek(codeSet)) { report.cached.push(label); continue }
        const rec = await this.deps.directory.get(codeSet)
        // 书目和冒险目录任何一个没取到都不会写缓存（directory.ts），下次启动再试
        if (rec.errors.books || rec.errors.adventures) report.errors.push(rec.errors.books ?? (rec.errors.adventures as string))
        else report.fetched.push(label)
      } catch (e) { report.errors.push(`${label}：${msg(e)}`) }
    }
    for (const source of SOURCES.filter((s) => s.kind === 'official')) {
      const label = `文件清单（${source.id}）`
      try {
        if (await this.deps.files.cachedFileList(source)) { report.cached.push(label); continue }
        await this.deps.files.fileList(source)
        report.fetched.push(label)
      } catch (e) { report.errors.push(`${label}：${msg(e)}`) }
    }
    return report
  }
}

/** 要不要预取：真实用户的浏览器里联网时做；自动化测试浏览器（navigator.webdriver）默认不做，免得改变既有测试里"没有联网请求"之类的判断；
 *  测试要验证预取本身时用 __TRPG_PREFETCH__ = true 强制开，= false 强制关。 */
export function prefetchAllowed(g: { __TRPG_PREFETCH__?: boolean; navigator?: { webdriver?: boolean; onLine?: boolean } } = globalThis as never): boolean {
  if (g.__TRPG_PREFETCH__ !== undefined) return g.__TRPG_PREFETCH__
  return !g.navigator?.webdriver && g.navigator?.onLine !== false
}

/** 界面可用后过几秒在后台做一次；返回取消函数（插件卸载时调用）。不阻塞启动，失败只记日志。 */
export function scheduleCatalogPrefetch(prefetch: CatalogPrefetch, { delayMs = 3000, allowed = prefetchAllowed() }: { delayMs?: number; allowed?: boolean } = {}): () => void {
  if (!allowed) return () => undefined
  const timer = setTimeout(() => {
    void prefetch.run().then((r) => {
      if (r.fetched.length || r.errors.length) console.info('[trpg-assistant] 书目预取', { 取到: r.fetched, 已有: r.cached.length, 失败: r.errors })
    }, (e: unknown) => console.warn('[trpg-assistant] 书目预取出错', e))
  }, delayMs)
  return () => clearTimeout(timer)
}

/** 默认预取哪些语言的书目：P4 向导固定中文；P5 数据条目页加语言切换时改读设置。 */
export const DEFAULT_PREFETCH_CODE_SETS = [getSource('cn-official').codeSet]
