// 【库】的数据接口：核心部分（开作者小窗、类别、查询、详情、搜索、按书开关）在 service-core.ts；
// 这里加上自制（作者包管理器在对应那套程序的小窗里）和体检。P5.5 收尾按单文件 400 行拆开，行为不变。
import type { BrewParseReport } from './brew'
import { brewAddUrl, brewDelete, brewImport, brewInstallSources, brewPull, mutateAuthor, prepareBrewDelete, writeAuthor, type BrewContext, type BrewProgress } from './service-brew'
import type { HealthReport } from './health'
import { englishCoverageOf, healthOf, officialInstalledOf, storedOf, warmEnglishPairsOf, type HealthContext } from './service-health'
import { countSources } from './install'
import type { EnglishCoverage } from './service-types'
import type { BrewEntry, WithErrors } from './runtime/frame/brew-commands'
import { getSource, type SourceEntry } from './sources'
import type { LibraryView } from './revision'
import { LibraryServiceCore } from './service-core'
export { LibraryServiceCore } from './service-core'
export type { FrameContext, LibraryServiceOptions } from './service-core'
export type { DetailResult, English, EnglishCoverage, EnglishPairs, QueryRow, UnpairedReason } from './service-types'

export class LibraryService extends LibraryServiceCore {
  // ---- 自制（源登记表里 kind = brew 的源；作者包管理器在对应那套程序的小窗里）----

  private brewContext(): BrewContext {
    return {
      db: this.opts.db, revisions: this.opts.revisions, operations: this.operations,
      openFrame: (codeSet, ctx) => this.gatedOpen(codeSet, ctx ?? {}),
      frame: (codeSet, view) => this.frame(codeSet, view),
      ...(this.opts.onDataChanged ? { onDataChanged: this.opts.onDataChanged } : {}),
      ...(this.opts.onLog ? { onLog: this.opts.onLog } : {}),
      onPublished: (_view, previous) => { this.retire(previous) },
      ...(this.opts.beforeBrewWrite ? { beforeWrite: this.opts.beforeBrewWrite } : {}),
      ...(this.opts.onBrewDirty ? { onDirty: this.opts.onBrewDirty } : {}),
    }
  }

  private brewSource(sourceId: string): SourceEntry {
    const s = getSource(sourceId)
    if (s.kind !== 'brew') throw new Error(`${sourceId} 不是自制源`)
    return s
  }

  async brewCatalog(sourceId: string, viewArg?: LibraryView): Promise<WithErrors<unknown[] | null>> {
    const view = await this.view(viewArg)
    return (await this.frame(this.brewSource(sourceId).codeSet, view)).call('brewCatalog')
  }

  async brewInstalled(sourceId: string, viewArg?: LibraryView): Promise<BrewEntry[]> {
    const view = await this.view(viewArg)
    return (await this.frame(this.brewSource(sourceId).codeSet, view)).call('brewInstalled')
  }

  /** 自制改过以后（含可编辑自制）在准备版本里重解析并发布；调用方已经写过作者存储时用 mutateAuthor。 */
  async reparseBrew(sourceId: string, signal?: AbortSignal): Promise<BrewParseReport> {
    const s = this.brewSource(sourceId)
    const r = await mutateAuthor(this.brewContext(), s.codeSet, 'brew-reparse', async () => null, signal)
    return r.parse
  }

  /**
   * P5.5 U2 编辑写原文：改作者存储、不解析就发布、记脏，后台再解析（service-brew.ts writeAuthor）。
   * run 返回 { value, touched }：touched = 改了哪些包（作者本地编号）。
   */
  async writeAuthor<T>(codeSet: string, kind: string, run: (view: LibraryView) => Promise<{ value: T; touched: string[] }>): Promise<{ value: T; view: LibraryView; dirty: string[] }> {
    return writeAuthor(this.brewContext(), codeSet, kind, run)
  }

  /** 原文改过、还没重新解析的包（作者本地编号）；空 = 解析结果是最新的。 */
  async brewDirty(sourceId: string, viewArg?: LibraryView): Promise<string[]> {
    return (await (await this.view(viewArg)).brewState(sourceId))?.dirty ?? []
  }

  /** 在准备版本里跑一次作者存储修改，再重解析、发布。可编辑条目 / 房规 / 存副本都走这里。 */
  async mutateAuthor<T>(codeSet: string, kind: string, run: (view: LibraryView) => Promise<T>): Promise<{ value: T; parse: BrewParseReport; view: LibraryView }> {
    return mutateAuthor(this.brewContext(), codeSet, kind, run)
  }

  async brewAddUrl(sourceId: string, url: string, onProgress?: BrewProgress, signal?: AbortSignal): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport; view?: string }> {
    return brewAddUrl(this.brewContext(), sourceId, url, onProgress, signal)
  }

  async brewInstallSources(sourceId: string, sources: string[], signal?: AbortSignal): Promise<WithErrors<{ added: BrewEntry[]; notFound: string[] }> & { parse: BrewParseReport | null; view?: string }> {
    return brewInstallSources(this.brewContext(), sourceId, sources, signal)
  }

  async brewImport(sourceId: string, files: Array<{ name: string; text: string }>) {
    return brewImport(this.brewContext(), sourceId, files)
  }

  /** 在已有准备视图里删包并重解析，不发布；供官方单书删除在同一次发布里连带删除。 */
  deleteBrewsInView(sourceId: string, docIdLocals: string[], view: LibraryView) {
    return prepareBrewDelete(this.brewContext(), sourceId, docIdLocals, view)
  }

  async brewDelete(sourceId: string, docIdLocals: string[], handle?: import('./operations').OperationHandle): Promise<WithErrors<number> & { parse: BrewParseReport; view?: string }> {
    return brewDelete(this.brewContext(), sourceId, docIdLocals, handle)
  }

  /** 拉取更新前先看有没有新版（只比较、不替换）；有新版的再调 brewPull。 */
  async brewCheckUpdates(sourceId: string, docIdLocals: string[] | null = null) {
    const view = await this.currentView()
    return (await this.frame(this.brewSource(sourceId).codeSet, view)).call('brewCheckUpdates', docIdLocals)
  }

  async brewPull(sourceId: string, docIdLocals: string[] | null = null, signal?: AbortSignal): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport | null; view?: string }> {
    return brewPull(this.brewContext(), sourceId, docIdLocals, signal)
  }

  /** 中英配对覆盖率（P5 B-26 体检）。 */
  async englishCoverage(sourceId: string, viewArg?: LibraryView): Promise<EnglishCoverage> {
    const view = await this.view(viewArg)
    return englishCoverageOf(this.healthContext(), sourceId, view)
  }

  private healthContext(): HealthContext {
    return {
      report: (id, view) => this.report(id, view),
      parsed: (id, prop, view) => this.parsed(id, prop, view),
      englishPairs: (id, view) => this.englishPairs(id, view),
      frame: (codeSet, view) => this.frame(codeSet, view),
      stored: (key, fingerprint, view) => storedOf(view, key, fingerprint),
      brewSourceCounts: (id, view) => this.brewSourceCounts(id, view),
    }
  }

  /** 体检：日志与体检分开、每来源隔离失败（P5 M7）。 */
  async health(viewArg?: LibraryView): Promise<HealthReport> {
    const view = await this.view(viewArg)
    return healthOf(this.healthContext(), view)
  }

  private async brewSourceCounts(sourceId: string, view: LibraryView): Promise<Record<string, number>> {
    const prefix = `parsed:${sourceId}:`
    const map = await view.derivedKeys(prefix)
    return countSources([...map.entries()].map(([key, rec]) => ({ key, value: rec.value })), prefix, { lower: true })
  }

  /** 这套作者程序对应的官方数据装好了吗（作者程序启动要读它；没装时自制读不了）。 */
  async officialInstalled(codeSet: string, viewArg?: LibraryView): Promise<boolean> {
    return officialInstalledOf(await this.view(viewArg), codeSet)
  }

  /** 下载 / 更新完成后在后台把中英配对表建好（P5-1 B-42）。 */
  async warmEnglishPairs(sourceId: string, viewArg?: LibraryView): Promise<void> {
    await warmEnglishPairsOf({ englishPairs: (id, view) => this.englishPairs(id, view), ...(this.opts.onLog ? { onLog: this.opts.onLog } : {}) }, sourceId, await this.view(viewArg))
  }
}
