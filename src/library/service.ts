// 【库】的数据接口：类别、查询、详情（含英文）、搜索、按书开关（D2-P2 B1 设计 §8.3、§8.6、§8.7、§9）。
// P5 T1/T3：每次读取绑定一个库版本；装 / 改 / 删都走“准备版本 → 发布”，不再提前改活动数据。
import { EMBEDDED_PROP, EmbeddedTables } from './embedded-tables'
import { ParsedMemo } from './parsed-memo'
import type { LogSink } from './logs'
import { brewCorporaKey, type BrewCorpora, type BrewParseReport } from './brew'
import { brewAddUrl, brewDelete, brewImport, brewInstallSources, brewPull, mutateAuthor, prepareBrewDelete, writeAuthor, type BrewContext, type BrewProgress } from './service-brew'
import { excludedOf as cachedExcluded, fluffOf as cachedFluff, ensurePrecomputed, invalidatePrecompute, precomputeSource, searchIndexOf, type PrecomputeReport } from './cache'
import type { LibraryDatabase } from './db'
import type { HealthReport } from './health'
import { OfficialMissingError } from './official-missing'
import { englishCoverageOf, healthOf, officialInstalledOf, storedOf, warmEnglishPairsOf, type HealthContext } from './service-health'
import { buildEnglishPairsFor, type PairContext } from './service-english'
import type { InstallReport } from './install'
import { countSources, parsedKey } from './install'
import type { ParsedProp } from './runtime/frame/commands'
import type { SearchHit, SearchIndexDump } from './runtime/frame/read-commands'
import type { DetailResult, English, EnglishCoverage, EnglishPairs, QueryRow } from './service-types'
import type { BrewEntry, WithErrors } from './runtime/frame/brew-commands'
import type { AuthorFrame } from './runtime/host'
import { getSource, type SourceEntry } from './sources'
import { LibraryOperations } from './operations'
import type { LibraryRevisionStore, LibraryView } from './revision'
import { ensureReadable, installedSource } from './service-read'
import { relatedTablesFor, tablesFor } from './service-tables'
import { PackEntries } from './pack-entries'
import type { BrewPack } from './brew-packs'
import { englishOf } from './service-english-entry'
export type { DetailResult, English, EnglishCoverage, EnglishPairs, QueryRow, UnpairedReason } from './service-types'
export interface FrameContext {
  view?: LibraryView
  /** 隔离解析用的单一作者存储范围（不配合 view 时是旧的单范围行为）。 */
  kvScope?: string
  filterIndex?: boolean
  signal?: AbortSignal
}
export interface LibraryServiceOptions {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  /** 开一个只读本地的作者小窗；view 给了就绑定这个库版本。 */
  openFrame: (codeSet: string, ctx?: FrameContext) => Promise<AuthorFrame>
  /** 自制 / 房规变了之后接着换算（T2）；回调由后端接，库层不认识结算内核。 */
  onDataChanged?: (codeSet: string) => Promise<void>
  /** 自制解析出错、作者报错写日志（P5 B-26）。 */
  onLog?: LogSink
  operations?: LibraryOperations
  /** P5.5 U2：编辑写原文前让后台解析停下放锁；写完发布后通知后台排一次解析（后端接 brew-queue.ts）。 */
  beforeBrewWrite?: (codeSet: string) => Promise<void>
  onBrewDirty?: (codeSet: string) => void
}
export class LibraryService {
  private readonly frames = new Map<string, Promise<AuthorFrame>>()
  private readonly pairsCache = new Map<string, Promise<EnglishPairs>>()
  private readonly searchLoaded = new Map<string, string>()
  private readonly packEntries = new PackEntries()
  private readonly parsedMemo: ParsedMemo
  private readonly embedded: EmbeddedTables
  readonly operations: LibraryOperations
  constructor(private readonly opts: LibraryServiceOptions) {
    this.parsedMemo = new ParsedMemo(opts.db)
    this.embedded = new EmbeddedTables(opts.db, (cs, view) => this.frame(cs, view))
    this.operations = opts.operations ?? new LibraryOperations({ db: opts.db, revisions: opts.revisions })
  }
  /** 当前已发布版本；读操作开始处只取一次。 */
  currentView(): Promise<LibraryView> {
    return this.opts.revisions.published()
  }
  private async view(view?: LibraryView): Promise<LibraryView> {
    return view ?? this.currentView()
  }
  /** 每套作者程序、每个库版本一个小窗；屏蔽表、搜索索引都在这个小窗里，开关书也经它改。 */
  async frameOf(codeSet: string, view?: LibraryView): Promise<AuthorFrame> {
    return this.frame(codeSet, await this.view(view))
  }
  /**
   * 读资料用的那道门（P5.5 收尾 C1）：这种语言的官方资料没装，作者程序启动不了（要读官方数据，B-37），
   * 直接报 OfficialMissingError，不再去开小窗等一个看不懂的「文件不存在」。安装官方资料自己的流程不走这里。
   */
  private async gatedOpen(codeSet: string, ctx: FrameContext): Promise<AuthorFrame> {
    if (!(await officialInstalledOf(ctx.view ?? (await this.currentView()), codeSet))) throw new OfficialMissingError(codeSet)
    return this.opts.openFrame(codeSet, ctx)
  }
  private frame(codeSet: string, view?: LibraryView): Promise<AuthorFrame> {
    const key = `${view?.id ?? 'legacy'}:${codeSet}`
    let p = this.frames.get(key)
    if (!p) {
      p = this.gatedOpen(codeSet, { ...(view ? { view } : {}), filterIndex: true })
      p.catch(() => this.frames.delete(key))
      this.frames.set(key, p)
    }
    return p
  }
  /** 在指定作者存储范围里开一个小窗（隔离解析、导入预览用；用完由调用方关）。 */
  openFrameIn(codeSet: string, kvScope: string, view?: LibraryView): Promise<AuthorFrame> {
    return this.gatedOpen(codeSet, { kvScope, ...(view ? { view } : {}), filterIndex: true })
  }
  generation = 0
  /** 关掉所有小窗（测试 / 全量重置）。 */
  reset(): void {
    this.generation++
    for (const p of this.frames.values()) p.then((f) => f.close(), (e: unknown) => console.warn('[trpg-library] 小窗本来就没开成', e))
    this.frames.clear()
    this.pairsCache.clear()
    this.searchLoaded.clear()
    this.packEntries.clear()
  }
  /** 发布后只关这个旧版本的小窗；别的版本正在读的窗口不动。 */
  retire(viewId: string): void {
    this.generation++
    this.packEntries.retire(viewId)
    for (const [key, p] of [...this.frames]) {
      if (!key.startsWith(`${viewId}:`)) continue
      p.then((f) => f.close(), () => undefined)
      this.frames.delete(key)
    }
    for (const key of [...this.pairsCache.keys()]) if (key.startsWith(`${viewId}:`)) this.pairsCache.delete(key)
    for (const key of [...this.searchLoaded.keys()]) if (key.startsWith(`${viewId}:`)) this.searchLoaded.delete(key)
  }
  /** 手动把整套资料一次算好存库（装书 / 迁移后用；平时看资料走缓存）。 */
  async precompute(sourceId: string, opts: { prop?: string; fluff?: boolean; excluded?: boolean; search?: boolean } = {}, viewArg?: LibraryView): Promise<PrecomputeReport> {
    const view = await this.view(viewArg)
    const source = getSource(sourceId)
    const frame = await this.frame(source.codeSet, view)
    return precomputeSource({ source, db: this.opts.db, frame, view, prop: opts.prop, fluff: opts.fluff ?? true, excluded: opts.excluded ?? true, search: opts.search ?? source.kind === 'official' })
  }
  private async ensure(sourceId: string, opts: { prop?: string; fluff?: boolean; excluded?: boolean; search?: boolean }, view: LibraryView): Promise<void> {
    const source = getSource(sourceId)
    await ensurePrecomputed({ source, db: this.opts.db, view, openFrame: (cs) => this.opts.openFrame(cs, { view, filterIndex: true }), ...opts })
  }
  private packOptions(sourceId: string, view: LibraryView) {
    const source = getSource(sourceId)
    return { source, db: this.opts.db, view, openFrameIn: (scope: string) => this.openFrameIn(source.codeSet, scope, view) }
  }
  packOwnedItems(sourceId: string, pack: BrewPack, view: LibraryView) { return this.packEntries.get(this.packOptions(sourceId, view), pack) }
  packDetail(sourceId: string, pack: BrewPack, prop: string, hash: string, view: LibraryView) { return this.packEntries.detail(this.packOptions(sourceId, view), pack, prop, hash) }
  async parsed(sourceId: string, prop: string, viewArg?: LibraryView): Promise<ParsedProp> {
    const view = await this.view(viewArg)
    await ensureReadable(view, sourceId)
    if (prop === EMBEDDED_PROP) return this.embedded.ensure(sourceId, view)
    const value = await this.parsedMemo.get(parsedKey(sourceId, prop), view)
    const rec = value === undefined ? undefined : { value }
    if (!rec && getSource(sourceId).kind === 'brew') {
      const report = await view.derivedGet(`audit:${sourceId}`)
      const errors = (report?.value as BrewParseReport | undefined)?.parse.errors ?? []
      if (report && !errors.some((e) => e.prop === prop)) return { items: [], hashes: [], sources: [] }
    }
    if (!rec) throw new Error(`${sourceId} 没有这一类的解析结果：${prop}（未安装，或这一类解析失败，见体检）`)
    return rec.value as ParsedProp
  }
  private async report(sourceId: string, viewArg?: LibraryView): Promise<{ parse: Pick<InstallReport['parse'], 'props'> }> {
    const view = await this.view(viewArg)
    const rec = await view.derivedGet(`audit:${sourceId}`)
    if (!rec) throw new Error(`${sourceId} 还没安装`)
    return rec.value as InstallReport | BrewParseReport
  }
  async categories(sourceId: string, viewArgs?: LibraryView): Promise<Record<string, number>> {
    const view = await this.view(viewArgs)
    await ensureReadable(view, sourceId)
    const r = await this.report(sourceId, view)
    return Object.fromEntries(Object.entries(r.parse.props).map(([prop, v]) => [prop, v.count]))
  }
  async query(sourceId: string, prop: string, { source, includeExcluded = false, view: viewArg }: { source?: string; includeExcluded?: boolean; view?: LibraryView } = {}): Promise<QueryRow[]> {
    const view = await this.view(viewArg)
    await ensureReadable(view, sourceId)
    const state = await view.officialState(sourceId)
    const allowed = state?.status === 'installed' && state.sources ? new Set(state.sources.map((x) => x.toLowerCase())) : null
    const want = source?.toLowerCase()
    const visible = (value: string | null): boolean => (want === undefined || value?.toLowerCase() === want) && (!allowed || !value || allowed.has(value.toLowerCase()))
    if (prop === EMBEDDED_PROP) {
      const p = await this.parsed(sourceId, prop, view)
      return p.items.flatMap((item, i) => visible(p.sources[i]) ? [{ hash: p.hashes[i], source: p.sources[i], excluded: false, item }] : [])
    }
    await this.ensure(sourceId, { prop, excluded: true }, view)
    const p = await this.parsed(sourceId, prop, view)
    const excludedOf = await cachedExcluded(this.opts.db, sourceId, prop, view)
    if (excludedOf && p.hashes.some((h) => h && excludedOf[h] === undefined)) throw new Error(`缓存里的「${prop}」屏蔽表和解析结果对不上，不猜`)
    const rows: QueryRow[] = []
    p.items.forEach((item, i) => {
      const excluded = excludedOf?.[p.hashes[i] ?? ''] ?? false
      if (excluded && !includeExcluded) return
      if (!visible(p.sources[i])) return
      rows.push({ hash: p.hashes[i], source: p.sources[i], excluded, item })
    })
    return rows
  }
  async brewCorpora(sourceId: string, viewArg?: LibraryView): Promise<BrewCorpora> {
    const view = await this.view(viewArg)
    return ((await view.derivedGet(brewCorporaKey(sourceId)))?.value ?? {}) as BrewCorpora
  }
  async corpus(sourceId: string, prop: string, id: string, viewArg?: LibraryView): Promise<unknown> {
    const view = await this.view(viewArg)
    await ensureReadable(view, sourceId)
    if (prop === 'book' || prop === 'adventure') {
      const installed = prop === 'book' ? await view.installedBooks(sourceId) : await view.installedAdventures(sourceId)
      if (installed && !installed.includes(id)) throw new Error(`${sourceId} 没有安装这本${prop === 'book' ? '书' : '冒险'}：${id}`)
    }
    const rec = await view.derivedGet(parsedKey(sourceId, prop, id))
    if (!rec) throw new Error(`${sourceId} 没有这本的全文：${prop} ${id}`)
    return rec.value
  }
  async storedItem(sourceId: string, prop: string, hash: string, viewArg?: LibraryView): Promise<{ item: unknown; source: string | null } | null> {
    const view = await this.view(viewArg)
    const p = await this.parsed(sourceId, prop, view).catch(() => null)
    const i = p ? p.hashes.indexOf(hash) : -1
    return p && i >= 0 ? { item: p.items[i], source: p.sources[i] } : null
  }

  tables(sourceId: string, prop: string, hash?: string, viewArg?: LibraryView) { return tablesFor(this, sourceId, prop, hash, viewArg) }
  relatedTables(sourceId: string, prop: string, hash: string, viewArg?: LibraryView, item?: unknown) { return relatedTablesFor(this, sourceId, prop, hash, viewArg, item) }
  async detail(sourceId: string, prop: string, hash: string, _source?: string | null, viewArg?: LibraryView): Promise<DetailResult | null> {
    const view = await this.view(viewArg)
    await ensureReadable(view, sourceId)
    await this.ensure(sourceId, { prop, fluff: true, excluded: true }, view)
    const stored = await this.storedItem(sourceId, prop, hash, view)
    if (!stored) return null
    if (!(await installedSource(view, sourceId, stored.source))) return null
    const f = await cachedFluff(this.opts.db, sourceId, prop, hash, view)
    const excluded = await cachedExcluded(this.opts.db, sourceId, prop, view)
    return { item: stored.item, hash, source: stored.source, excluded: excluded?.[hash] ?? false, fluff: f?.fluff ?? null, fluffError: f?.fluffError ?? null, engSiteHash: f?.engSiteHash ?? null, english: await this.english(getSource(sourceId), prop, hash, { view }) }
  }

  async fluff(sourceId: string, prop: string, hash: string, viewArg?: LibraryView) {
    const view = await this.view(viewArg)
    return cachedFluff(this.opts.db, sourceId, prop, hash, view)
  }

  english(s: SourceEntry, prop: string, hash: string, opts: { fluff?: boolean; view?: LibraryView } = {}): Promise<English | null> {
    return englishOf(this, s, prop, hash, opts)
  }

  englishPairs(sourceId: string, viewArg?: LibraryView): Promise<EnglishPairs> {
    return this.view(viewArg).then((view) => {
      const key = `${view.id}:${sourceId}`
      let p = this.pairsCache.get(key)
      if (!p) {
        const s = getSource(sourceId)
        p = buildEnglishPairsFor(this.englishContext(), s, view)
        p.catch(() => this.pairsCache.delete(key))
        this.pairsCache.set(key, p)
      }
      return p
    })
  }
  private englishContext(): PairContext {
    return { openFrame: this.opts.openFrame, parsed: (id, prop, view) => this.parsed(id, prop, view) }
  }

  async search(sourceId: string, term: string, { showLegacy, view: viewArg }: { showLegacy?: boolean; view?: LibraryView } = {}): Promise<SearchHit[]> {
    const view = await this.view(viewArg)
    await ensureReadable(view, sourceId)
    await this.ensure(sourceId, { search: true }, view)
    const s = getSource(sourceId)
    let frame = await this.frame(s.codeSet, view)
    let rec = await searchIndexOf(this.opts.db, sourceId, view)
    if (rec) {
      const fingerprint = `${String(rec.base ?? '')}|${String(rec.exclude ?? '')}|${String(rec.manage ?? '')}|${view.id}`
      if (this.searchLoaded.get(`${view.id}:${s.codeSet}`) !== fingerprint) {
        try {
          await frame.call('searchIndexLoad', rec as unknown as SearchIndexDump)
          this.searchLoaded.set(`${view.id}:${s.codeSet}`, fingerprint)
        } catch (error) {
          // 缓存格式不兼容：只重建这一版、这一语言的搜索缓存，不碰别的版本。
          this.searchLoaded.delete(`${view.id}:${s.codeSet}`)
          await invalidatePrecompute(this.opts.db, sourceId, ['search'], view)
          await this.precompute(sourceId, { search: true, fluff: false, excluded: false }, view)
          rec = await searchIndexOf(this.opts.db, sourceId, view)
          frame = await this.frame(s.codeSet, view)
          if (rec) await frame.call('searchIndexLoad', rec as unknown as SearchIndexDump)
          this.searchLoaded.set(`${view.id}:${s.codeSet}`, `${String(rec?.base ?? '')}|${String(rec?.exclude ?? '')}|${String(rec?.manage ?? '')}|${view.id}`)
          this.opts.onLog?.({ level: 'warn', source: sourceId, kind: 'search-cache', message: `搜索缓存已重建：${error instanceof Error ? error.message : String(error)}` })
        }
      }
    }
    const hits = await frame.call('search', term, showLegacy ?? null) as SearchHit[]
    const allowed = await view.visibleSources(sourceId)
    return allowed ? hits.filter((h) => { const src = typeof h.doc.s === 'string' ? h.doc.s : null; return !src || allowed.some((x) => x.toLowerCase() === src.toLowerCase()) }) : hits
  }

  async searchSettings(sourceId: string, patch: Record<string, unknown> = {}, viewArg?: LibraryView): Promise<Record<string, unknown>> {
    const view = await this.view(viewArg)
    return (await this.frame(getSource(sourceId).codeSet, view)).call('searchSettings', patch)
  }

  /** 按书开关：只改这个版本自己的作者存储层，不再直接改活动数据。 */
  async setBookExcluded(sourceId: string, book: string, excluded: boolean): Promise<void> {
    const s = getSource(sourceId)
    const handle = await this.operations.begin({ kind: 'author-kv', set: s.id, codeSet: s.codeSet })
    try {
      const f = await this.opts.openFrame(s.codeSet, { view: handle.target, filterIndex: true })
      try {
        await f.call('setSourceExcluded', book, excluded)
        const errors = await f.call('storageFlush')
        if (errors.length) throw new Error(errors[0])
      } finally { f.close() }
      await this.operations.publish(handle, {})
    } catch (e) {
      await this.operations.abort(handle, e)
      throw e
    }
  }

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
