// P3 收尾：插件后端服务入口的组装（唯一同时引用 core / library / rules 运行时的地方）。
// 【库】（含按战役取库、自定义库、下载任务）、结算内核（一个战役一个小窗）、内核存档在这里接好，
// 界面和状态仓库以后只经 services.backend 取用，不各自 new。
import type { TrpgDatabase } from './db'
import type { CampaignService } from './saves/campaign'
import { KernelSaveService } from './saves/kernel'
import { loadSettings } from './backup'
import { LibraryDatabase } from '../library/db'
import { LibraryOperations } from '../library/operations'
import { officialPlan } from '../library/plan'
import { LibraryRevisionStore, type LibraryView } from '../library/revision'
import { FileProvider } from '../library/files'
import { libraryDataVersion, scopedCurrentOverrides, scopedRefChecker } from '../library/kernel-check'
import { LogStore } from '../library/logs'
import { OfficialUpdates } from '../library/official-update'
import { Sorting } from '../library/sorting'
import { libraryHandlers } from '../library/runtime/handlers'
import { startAuthorFrame } from '../library/runtime/host'
import { BrewPacks } from '../library/brew-packs'
import { PairedDownloads } from './paired-download'
import { BrewPairs } from '../library/brew-pairing'
import { configureBrewValidator } from '../library/brew-validate'
import { removeParts, uninstallOfficial, type UninstallReport } from '../library/uninstall'
import { executeBatch, mergeImpacts, withCounterparts, type RemovalBatch } from './removal-batch'
import { removalSizes, type RemovalSizes } from './removal-size'
import { reclaimLibrary, type ReclaimReport } from '../library/reclaim'
import { impactOfEntries, impactOfRemoval, type RemovalImpact, type RemovalTarget } from './removal-impact'
import { Counterparts } from '../library/counterpart'
import { DocumentStore } from '../library/documents'
import { imageUrls, type ImageHref } from '../library/images'
import { EntryLinks } from '../library/entry-links'
import { ScopedLibrary } from '../library/scoped'
import { defaultCampaignLibrary, type CampaignLibrary } from '../library/scopes'
import type { BackupLibraryAdapter } from './transfer/exporter'
import { CustomLibrary } from '../library/custom'
import { BilingualLibrary } from '../library/custom-lang'
import { LibraryService } from '../library/service'
import { DownloadTasks } from '../library/tasks'
import type { RuleRegistry } from '../rules/registry'
import { KernelRuntime } from '../rules/kernel/runtime'
import { KernelPrecompute } from '../rules/kernel/precompute'
import { PrecomputeQueue } from '../rules/kernel/precompute-queue'
import { SOURCES, getSource } from '../library/sources'
import { TrpgError } from './errors'
import type { ImportDeps } from './transfer/importer'
import { CampaignStarter } from './start-campaign'
import { BookDirectory } from '../library/directory'
import { installedOfficialSources } from '../library/installed-sources'
import { downloadDependencyPreview, packHealth, type DownloadDependencyPreview, type PackHealth } from '../library/pack-health'
import { suggestDownloads, type DownloadSuggestion, type MissingRef } from '../library/missing-refs'
import { DownloadEstimator, type DownloadEstimate, type EstimateInput, type EstimateOptions } from '../library/download-estimate'
import { CatalogPrefetch, DEFAULT_PREFETCH_CODE_SETS } from '../library/prefetch'
import { checkCorePacks } from '../rules/kernel/core-pack'
import { BrewParseQueue } from '../library/brew-queue'

export interface LibraryBackend {
  /** 启动时建好 R0、恢复未完成操作；boot 里等它。 */
  ready: Promise<void>
  /** 当前已发布版本（只读）；前端 / 内核只在需要的入口取一次。 */
  currentView: () => Promise<LibraryView>
  revisions: LibraryRevisionStore
  operations: LibraryOperations
  db: LibraryDatabase
  files: FileProvider
  service: LibraryService
  scoped: ScopedLibrary
  /** 图片候选地址与头像（P5 B-03）：条目里只有相对路径，按数据源登记的图片根拼；界面点开才取、缓存在浏览器。 */
  images: { urls: (sourceId: string, href: ImageHref) => string[]; token: (codeSet: string, prop: string, ent: unknown) => Promise<string | null> }
  /** 整套官方资料删除（释放空间，之后可在下载页重新下载）（P5 B-07）。 */
  uninstallOfficial: (setId: string | string[]) => Promise<UninstallReport>
  /** 已装自制包清单（来历、来源、作者、依赖、条数），下载页 / 书架 / 我的库共用（P5 B-11）。 */
  brewPacks: BrewPacks
  /** 下载入口（中英一起）：官方书 / 冒险 / 自制包都走它，界面不自己决定语言。 */
  downloads: PairedDownloads
  /** 列表排序：哪些列能排序、按某一列的名次（作者的 ModalFilter 定义，P5 B-18）。 */
  sorting: Sorting
  /** 统一后端日志：各处错误的流水，能列、能导出全文（P5 B-26）。 */
  logs: LogStore
  /** 官方数据拉取更新：check 只比较，apply 才更新（P5 B-28）。 */
  updates: OfficialUpdates
  /** 自制包中英配对：下载页目录合并、已装包配对（P5 G-2）。 */
  brewPairs: BrewPairs
  /** 中英对应：这一条在另一种语言里是哪一条（P5 B-10）。 */
  counterparts: Counterparts
  /** 文档类数据（规则速查、城主屏参考）：作者当小册子读（P5 B-02）。 */
  documents: DocumentStore
  /** 按（类别、作者编号）找条目在哪个包、术语跳转（P5 B-04、B-05）。 */
  links: EntryLinks
  custom: CustomLibrary
  /** 双语自制（P5.5 C2–C9）：中英成对的包、另一语言的同一条、填入、对不上。 */
  bilingual: BilingualLibrary
  tasks: DownloadTasks
  /** 官方书目（没装也能列）。 */
  directory: BookDirectory
  /** 包体检：已装自制包缺哪些依赖（官方的对到书号），管理页用（P5 T6 后2）。只读本地。 */
  packHealth: (setId: string, docIdLocal?: string) => Promise<PackHealth[]>
  /** 下载自制包前的依赖预览：作者算的直接依赖 + 需要的官方书（P5 T6）。会取一次包文件，不安装。 */
  brewDependencyPreview: (setId: string, url: string) => Promise<DownloadDependencyPreview>
  /** 缺的条目该补哪本书 / 哪个包：条目详情「缺依赖」和读档补包共用（P5 T6 后4）。只读本地。 */
  suggestDownloads: (refs: MissingRef[]) => Promise<{ suggestions: DownloadSuggestion[]; unresolved: MissingRef[] }>
  /** 下载页按所选数据集 / 书 / 冒险估算（不像向导那样自动加结算内核要的英文资料；与真正下载同一份计划，P5 T6 G5）。 */
  estimate: (input: EstimateInput, opts?: EstimateOptions) => Promise<DownloadEstimate>
  /** 首次启动后台预取书目与文件清单（boot.ts 调度）。 */
  prefetch: CatalogPrefetch
  precompute: KernelPrecompute
  /** 改自制 / 房规后的后台补换算。 */
  precomputeQueue: PrecomputeQueue
  /** P5.5 U2：编辑后的自制后台解析队列。 */
  brewQueue: BrewParseQueue
  /** 当前装的数据版本记号（存档保存时现取）。 */
  dataVersion: () => ReturnType<ReturnType<typeof libraryDataVersion>>
}

export interface Backend {
  library: LibraryBackend
  kernel: KernelRuntime
  kernelSave: KernelSaveService
  /** 开局向导：wizardOptions / startCampaign（缺的资料和冒险在【库】后台下载）。 */
  starter: CampaignStarter
  /** 导出 / 导入存档文件要带的【库】那一半：完整备份里的自制 / 范围 / 房规，和导入后"依赖还在不在"的核对（P4 界面接线）。 */
  transfer: { library: BackupLibraryAdapter; checkRefs: NonNullable<ImportDeps['checkRefs']> }
  /** 删除 / 卸载前的影响预览：依赖它的包、房规、版本选择、战役与存档（P5 B-08）。 */
  removalImpact: (target: RemovalTarget) => Promise<RemovalImpact>
  /** 自己写的几条要改编号（改名、换包）或要删之前：谁用了它们（房规、版本选择、战役与存档）。P5.5 B3。 */
  entryChangeImpact: (setId: string, refs: Array<{ prop: string; hash: string }>) => Promise<Pick<RemovalImpact, 'houseRules' | 'choices' | 'saves'>>
  /** 按预览凭据执行删除 / 卸载；预览后资料变了就拒绝（T4）。 */
  removalExecute: (impact: RemovalImpact) => Promise<unknown>
  /** 多选卸载 / 删除（P5-5 §12 B1）：补上另一种语言的那一份，合成一份预览。 */
  removalImpactMany: (targets: RemovalTarget[]) => Promise<RemovalBatch>
  /** 按合并预览执行：按语言分步，每步全成或全不成；第二步失败报 RemovalBatchError（写清已完成哪一步）。 */
  removalExecuteMany: (batch: RemovalBatch) => Promise<{ done: string[]; reclaim: ReclaimReport | null }>
  /** 已装的书 / 冒险 / 自制包各占多少（含另一种语言那份；共用文件不算），P5-5 §12 B2。 */
  removalSizes: (targets: RemovalTarget[]) => Promise<RemovalSizes>
  /** 回收已卸载资料和旧版本留下的空间（P5-5 §12 B3）；卸载成功后会自动做一次。 */
  reclaim: () => Promise<ReclaimReport>
}

export interface BackendOptions {
  db: TrpgDatabase
  campaign: CampaignService
  rules: RuleRegistry
  now: () => number
  /** 插件根目录（作者程序、结算内核文件按它找）；默认是打包后 dist/ 的上一级。 */
  pluginRoot?: URL
  /** 隐藏小窗挂在哪里；默认 document.body。 */
  container?: () => HTMLElement
  /** 【库】数据库名；默认正式库。 */
  libraryDbName?: string
}

/** 插件根目录：本文件打包进 dist/index.js，根目录是它的上一级。 */
const defaultPluginRoot = (): URL => new URL('../', import.meta.url)

export function createBackend(opts: BackendOptions): Backend {
  const pluginRoot = opts.pluginRoot ?? defaultPluginRoot()
  configureBrewValidator(pluginRoot)
  const container = opts.container ?? (() => document.body)

  const db = new LibraryDatabase(opts.libraryDbName)
  const revisions = new LibraryRevisionStore(db)
  // 每发布一个新版本（下载 / 更新 / 自制 / 卸载）后，等下载队列空了回收一次旧副本（2026-11-12：以前只在卸载后回收，下载多了库会涨到几个 G）
  let afterPublish = (): void => {}
  const operations = new LibraryOperations({ db, revisions, onPublished: () => afterPublish(), onDiscarded: () => afterPublish() })
  let ready: Promise<void> = revisions.ensureLegacy().then(() => undefined)
  const files = new FileProvider({ db, ready: revisions.ensureLegacy() })
  const openFrame = (codeSet: string, ctx: { view?: LibraryView; kvScope?: string; filterIndex?: boolean; signal?: AbortSignal } = {}) => startAuthorFrame({
    codeSet, pluginRoot, container: container(), signal: ctx.signal,
    handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => false, ...(ctx.kvScope ? { kvScope: ctx.kvScope } : {}), ...(ctx.view ? { view: ctx.view } : {}), ...(ctx.filterIndex === false ? { filterIndex: false } : {}) }),
  })
  let precompute: KernelPrecompute | null = null
  const runPrecompute = async (codeSets: string[], signal?: AbortSignal, onProgress?: (p: { stage: string; done: number; total: number; item?: string }) => void) => {
    if (!precompute) return null
    const rows = []
    for (const codeSet of [...new Set(codeSets)]) rows.push(await precompute.run({ codeSet, signal, onProgress }))
    return rows
  }
  // 改自制 / 房规后：停手 5 秒再补换算，只看自制和带备选的条目（P5.5 查慢）
  const queue = new PrecomputeQueue(async (codeSet) => precompute?.run({ codeSet, mode: 'changed' }) ?? null, 5000)
  const logs = new LogStore(db)
  // P5.5 U2：编辑只写原文就发布，停手 5 秒后后台批量解析（brew-queue.ts）
  let brewQueue: BrewParseQueue | null = null
  const service = new LibraryService({
    db, revisions, operations, openFrame, onDataChanged: async (codeSet) => queue.trigger(codeSet), onLog: logs.sink(),
    beforeBrewWrite: async (codeSet) => { await brewQueue?.yield(codeSet) },
    onBrewDirty: (codeSet) => brewQueue?.trigger(codeSet),
  })
  // 书目（BE-7）：没装官方数据时用允许联网的一次性小窗读作者书目文件；已装好的用现成本地小窗
  const directory = new BookDirectory({
    db, view: () => revisions.published(), localFrame: async (codeSet) => { const view = await revisions.published(); return openFrame(codeSet, { view, filterIndex: false }) },
    networkFrame: async (codeSet, kvScope, view, target) => {
      const current = view ?? await revisions.published()
      return startAuthorFrame({ codeSet, pluginRoot, container: container(), handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => true, kvScope, view: current, filterIndex: false, writeLegacy: !target, ...(target ? { commit: target.commit, persist: target.persist } : {}) }) })
    },
  })
  const documents = new DocumentStore(db)
  const links = new EntryLinks(service, documents)
  const scoped = new ScopedLibrary(service, db, directory, links)
  brewQueue = new BrewParseQueue(async (codeSet, signal) => {
    const set = SOURCES.find((s) => s.kind === 'brew' && s.codeSet === codeSet)
    if (!set || !(await service.brewDirty(set.id)).length) return { codeSet, skipped: '没有改过的包' }
    const report = await service.reparseBrew(set.id, signal)
    scoped.reset()
    return report
  }, 5000)
  const brewPairs = new BrewPairs(service)
  const updates: OfficialUpdates = new OfficialUpdates({ db, revisions, files, directory, startOfficial: (id, taskOpts) => tasks.startOfficial(id, taskOpts) })
  const sorting = new Sorting(service)
  const counterparts = new Counterparts(service, brewPairs)
  const custom = new CustomLibrary(service, scoped, db, (ref) => counterparts.counterpart(ref), (codeSet) => brewQueue?.busy(codeSet) ?? false, async (codeSet) => { await brewQueue?.settled(codeSet) })
  const bilingual = new BilingualLibrary(custom, service, brewPairs, counterparts)
  const tasks = new DownloadTasks({ db, revisions, operations, files, openFrame: (codeSet, view, signal) => openFrame(codeSet, { view, signal }), onLog: logs.sink(), onDiagnostic: async (setId, report) => { await db.derived.put({ key: `audit:last-failed:${setId}`, fingerprint: '', value: report, savedAt: Date.now() }) }, onPublished: (_view, previous) => { service.retire(previous); scoped.reset() },
    selectUpdate: (id, commit, selection, base) => updates.planSelection(id, commit, selection, base),
    planOfficial: async (setId, planOpts, view) => {
      const source = getSource(setId)
      const rec = await directory.get(source.codeSet, planOpts.commit ? { commit: planOpts.commit } : {})
      if (rec.errors.books) throw new Error(rec.errors.books)
      if (rec.errors.adventures && planOpts.adventures?.length) throw new Error(rec.errors.adventures)
      const list = planOpts.manifest ?? await files.fileList(source, view, planOpts.signal ? { signal: planOpts.signal } : {})
      return officialPlan(list, rec.owners, planOpts, { ...planOpts, indexSources: rec.indexSources, sourceFiles: rec.sourceFiles, codeSet: source.codeSet })
    },
    precompute: async (setId, view, signal, onProgress) => {
      const rows = await runPrecompute([getSource(setId).codeSet], signal, onProgress)
      await service.warmEnglishPairs(setId, view) // 配对表换版本后要重建，趁下载刚完成在后台建好（P5-1 B-42）
      return rows
    } })
  ready = ready.then(async () => {
    await tasks.restore()
    if (await db.revisions.where('status').equals('preparing').count()) afterPublish()
  })
  const dataVersion = libraryDataVersion(revisions, service)
  precompute = new KernelPrecompute({ pluginRoot, files, scoped, db, revisions, dataVersion, container })

  // 结算内核要知道本战役的规则与选书；内核存档写入要结算内核拆人物。两者互相用，经闭包接上。
  let kernelSave: KernelSaveService | null = null
  const kernel = new KernelRuntime({
    pluginRoot, files, scoped, revisions, container, cache: { db, dataVersion },
    hasKernel: async (ownerKey) => !!(kernelSave && await kernelSave.read(ownerKey)),
    campaignOf: async (ownerKey) => {
      const ws = await opts.campaign.getWorkspace(ownerKey)
      if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
      const bound = kernelSave ? await kernelSave.read(ownerKey) : null
      if (!bound) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
      return { rule: bound.rule, library: (await kernelSave!.libraryOf(ownerKey)) as CampaignLibrary, title: ws.ownerLabel }
    },
  })
  kernelSave = new KernelSaveService({
    db: opts.db, campaign: opts.campaign, rules: opts.rules, now: opts.now,
    checkRefs: scopedRefChecker(scoped),
    suggestDownloads: (refs) => suggestDownloads({ brewPacks, directory, revisions }, refs),
    currentVersion: dataVersion,
    currentOverrides: scopedCurrentOverrides(scoped),
    mapRef: (ownerKey) => kernel.mapRef(ownerKey),
    compactActors: (ownerKey, ids) => kernel.compact(ownerKey, ids),
    undoLimit: async () => (await loadSettings(opts.db)).undoLimit,
    onLog: logs.sink(),
  })

  const prefetch = new CatalogPrefetch({ files, directory, codeSets: DEFAULT_PREFETCH_CODE_SETS })
  const brewPacks = new BrewPacks(service)
  const downloads = new PairedDownloads({
    startOfficial: (id, o) => tasks.startOfficial(id, o),
    startAdventure: (id, adv) => tasks.startAdventure(id, adv),
    officialState: async (id) => (await revisions.published()).officialState(id),
    directoryOf: async (codeSet) => (await directory.peek(codeSet)) ?? await directory.get(codeSet).catch((e: unknown) => { console.warn('[trpg-assistant] 另一种语言的书目取不到，按同书号照下', codeSet, e); return null }),
    brewCatalog: (zhId) => brewPairs.catalog(zhId),
    brewAddUrl: (id, url, p, signal) => service.brewAddUrl(id, url, p, signal),
    brewInstallSources: (id, sources, signal) => service.brewInstallSources(id, sources, signal),
    brewInstalledUrls: async (id) => new Set((await brewPacks.list(id)).flatMap((p) => (p.url ? [p.url] : []))),
  })
  const images: LibraryBackend['images'] = {
    urls: imageUrls,
    token: async (codeSet, prop, ent) => (await service.frameOf(codeSet)).call('tokenPath', prop, ent),
  }
  const uninstall = (setId: string | string[]): Promise<UninstallReport> => uninstallOfficial({
    db, revisions, operations, tasks, afterDelete: async (_id, previous) => { if (previous) service.retire(previous); scoped.reset() },
  }, setId)
  const library: LibraryBackend = { ready, currentView: () => revisions.published(), revisions, operations, db, files, service, scoped, documents, links, images, sorting, logs, updates, counterparts, uninstallOfficial: uninstall, brewPacks, downloads, brewPairs, custom, bilingual, tasks, directory, packHealth: (setId, id) => packHealth({ brewPacks, directory, revisions }, setId, id), brewDependencyPreview: (setId, u) => downloadDependencyPreview({ frame: (cs) => service.frameOf(cs) as never, directory, revisions }, setId, u), suggestDownloads: (refs) => suggestDownloads({ brewPacks, directory, revisions }, refs), estimate: (input, o) => new DownloadEstimator({ db, files, directory, revisions }).estimate(input, o), prefetch, precompute, precomputeQueue: queue, brewQueue: brewQueue!, dataVersion }
  const starter = new CampaignStarter({ campaign: opts.campaign, kernelSave, rules: opts.rules, corePacks: () => checkCorePacks({ pluginRoot }), library })
  const transfer: Backend['transfer'] = {
    library: { exportFiles: () => custom.exportBackup(), importFiles: (files) => custom.importBackup(files) },
    checkRefs: (refs) => scoped.fetch(defaultCampaignLibrary(opts.rules.list()[0]?.id ?? 'dnd5e2014', DEFAULT_PREFETCH_CODE_SETS[0]), refs),
  }
  const brewSetOf = (codeSet: string): string => SOURCES.find((s) => s.kind === 'brew' && s.codeSet === codeSet)?.id ?? `${codeSet}-brew`
  const impactAt = async (view: LibraryView, target: RemovalTarget, checkedRevision = view.id): Promise<RemovalImpact> => {
    if (target.kind === 'official') {
      const ids = target.setIds ?? [target.setId]
      const states = await Promise.all(ids.map((id) => view.officialState(id)))
      if (states.some((st) => st?.status !== 'installed')) throw new Error('官方资料已经不在当前版本里，请刷新后再预览')
      if (target.bookIds?.length || target.adventureIds?.length) {
        for (const state of states) {
          if (state?.books && target.bookIds?.some((id) => !state.books!.includes(id))) throw new Error('选中的书已经不在已装集合里，请刷新后再预览')
          if (state?.adventures && target.adventureIds?.some((id) => !state.adventures!.includes(id))) throw new Error('选中的冒险已经不在已装集合里，请刷新后再预览')
        }
      }
    }
    if (target.kind === 'brew') {
      const installed = await brewPacks.list(target.setId, view)
      const missing = target.docIdLocals.find((id) => !installed.some((p) => p.docIdLocal === id))
      if (missing) throw new Error(`这个自制包已经不存在：${missing}`)
    }
    const officialSources = new Set<string>()
    const removedSources = new Set((target.kind === 'official' ? target.bookSources ?? target.bookIds ?? [] : []).map((s) => s.toLowerCase()))
    const whole = target.kind === 'official' && !target.bookIds?.length && !target.bookSources?.length && !target.adventureIds?.length
    for (const set of SOURCES.filter((s) => s.kind === 'official' && s.codeSet === getSource(target.setId).codeSet)) {
      const state = await view.officialState(set.id)
      if (state?.status !== 'installed') continue
      if (whole && (target.setIds ?? [target.setId]).includes(set.id)) continue
      for (const src of await installedOfficialSources(view, set.id)) if (!removedSources.has(src.toLowerCase())) officialSources.add(src.toLowerCase())
    }
    const officialHashes = async (setId: string, bookSources: string[]): Promise<Map<string, Set<string>>> => {
      const wanted = new Set(bookSources.map((s) => s.toLowerCase()))
      const out = new Map<string, Set<string>>()
      for (const [key, rec] of await view.derivedKeys(`parsed:${setId}:`)) {
        if (key.slice(`parsed:${setId}:`.length).startsWith('corpus:')) continue
        const prop = key.slice(`parsed:${setId}:`.length)
        const p = rec.value as { hashes?: Array<string | null>; sources?: Array<string | null> } | undefined
        p?.hashes?.forEach((h, i) => { if (h && p.sources?.[i] && wanted.has(String(p.sources[i]).toLowerCase())) (out.get(prop) ?? out.set(prop, new Set()).get(prop)!).add(h) })
      }
      return out
    }
    return impactOfRemoval({ db: opts.db, manage: scoped.manage, brewPacks, brewSetOf, revision: checkedRevision, officialSources, officialHashes }, target)
  }
  const removalImpact = (target: RemovalTarget): Promise<RemovalImpact> => revisions.published().then((view) => impactAt(view, target))
  const removalImpactMany = async (targets: RemovalTarget[]): Promise<RemovalBatch> => {
    const view = await revisions.published()
    const all = await withCounterparts(view, brewPairs, targets)
    return mergeImpacts(all, await Promise.all(all.map((t) => impactAt(view, t))))
  }
  const reclaim = (): Promise<ReclaimReport> => reclaimLibrary({ db, revisions, operations, directory, kernelOfficial: async () => (await dataVersion()).official })
  // 连着下好几本时只在最后回收一次：发布后等 3 秒，还有任务在跑就再等
  let reclaimTimer: ReturnType<typeof setTimeout> | undefined
  afterPublish = (): void => {
    clearTimeout(reclaimTimer)
    reclaimTimer = setTimeout(() => {
      if (tasks.list().some((t) => t.status === 'running')) { afterPublish(); return }
      void reclaimAfter()
    }, 3000)
  }
  /** 卸载成功后回收空间；回收失败不影响卸载结果，只记日志。 */
  const reclaimAfter = async (): Promise<ReclaimReport | null> => {
    try { return await reclaim() } catch (e) { logs.sink()({ level: 'warn', source: 'library', kind: 'reclaim', message: `回收空间没有成功：${e instanceof Error ? e.message : String(e)}` }); return null }
  }
  const removalSizesOf = async (targets: RemovalTarget[]): Promise<RemovalSizes> => removalSizes({ files, directory, brewPairs }, await revisions.published(), targets)
  const runBatch = (batch: RemovalBatch): Promise<{ done: string[] }> => executeBatch({
    impactAt, operations, brewSetOf,
    removeParts: (parts, handle) => removeParts({ db, revisions, operations, tasks, directory, brewSetOf, removeBrews: (view, setId, ids) => service.deleteBrewsInView(setId, ids, view), afterDelete: async (_id, previous) => { if (previous) service.retire(previous); scoped.reset() } }, parts, handle),
  }, batch)
  const removalExecuteMany = async (batch: RemovalBatch): Promise<{ done: string[]; reclaim: ReclaimReport | null }> => {
    let done: { done: string[] }
    try { done = await runBatch(batch) } catch (e) {
      // 分步执行时前一步已经卸掉的部分也回收
      if ((e as { done?: string[] }).done?.length) await reclaimAfter()
      throw e
    }
    return { ...done, reclaim: await reclaimAfter() }
  }
  const removalExecute = async (impact: RemovalImpact): Promise<unknown> => {
    const target = impact.target
    if (target.kind !== 'official' || !target.setIds) return removalExecuteMany(mergeImpacts([target], [impact]))
    const view = await revisions.published()
    const fresh = await impactAt(view, target)
    if (fresh.plan.fingerprint !== impact.plan.fingerprint) throw new Error('资料或引用已经变化，请重新预览删除影响')
    const targets = target.setIds.map((setId) => ({ ...target, setId, setIds: undefined }))
    return removalExecuteMany(mergeImpacts(targets, await Promise.all(targets.map((t) => impactAt(view, t)))))
  }
  const entryChangeImpact: Backend['entryChangeImpact'] = (setId, refs) => impactOfEntries({ db: opts.db, manage: scoped.manage }, setId, refs)
  return { library, kernel, kernelSave, starter, transfer, removalImpact, entryChangeImpact, removalExecute, removalImpactMany, removalExecuteMany, removalSizes: removalSizesOf, reclaim }
}
