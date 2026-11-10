// P3 收尾：插件后端服务入口的组装（唯一同时引用 core / library / rules 运行时的地方）。
// 【库】（含按战役取库、自定义库、下载任务）、结算内核（一个战役一个小窗）、内核存档在这里接好，
// 界面和状态仓库以后只经 services.backend 取用，不各自 new。
import type { TrpgDatabase } from './db'
import type { CampaignService } from './saves/campaign'
import { KernelSaveService } from './saves/kernel'
import { loadSettings } from './backup'
import { LibraryDatabase } from '../library/db'
import { FileProvider } from '../library/files'
import { libraryDataVersion, scopedCurrentOverrides, scopedRefChecker } from '../library/kernel-check'
import { libraryHandlers } from '../library/runtime/handlers'
import { startAuthorFrame } from '../library/runtime/host'
import { BrewPacks } from '../library/brew-packs'
import { BrewPairs } from '../library/brew-pairing'
import { configureBrewValidator } from '../library/brew-validate'
import { uninstallOfficial, type UninstallReport } from '../library/uninstall'
import { impactOfRemoval, type RemovalImpact, type RemovalTarget } from './removal-impact'
import { Counterparts } from '../library/counterpart'
import { DocumentStore } from '../library/documents'
import { imageUrls, type ImageHref } from '../library/images'
import { EntryLinks } from '../library/entry-links'
import { ScopedLibrary } from '../library/scoped'
import { defaultCampaignLibrary, type CampaignLibrary } from '../library/scopes'
import type { BackupLibraryAdapter } from './transfer/exporter'
import { CustomLibrary } from '../library/custom'
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
import { CatalogPrefetch, DEFAULT_PREFETCH_CODE_SETS } from '../library/prefetch'
import { checkCorePacks } from '../rules/kernel/core-pack'

export interface LibraryBackend {
  db: LibraryDatabase
  files: FileProvider
  service: LibraryService
  scoped: ScopedLibrary
  /** 图片候选地址与头像（P5 B-03）：条目里只有相对路径，按数据源登记的图片根拼；界面点开才取、缓存在浏览器。 */
  images: { urls: (sourceId: string, href: ImageHref) => string[]; token: (codeSet: string, prop: string, ent: unknown) => Promise<string | null> }
  /** 整套官方资料删除（释放空间，之后可在下载页重新下载）（P5 B-07）。 */
  uninstallOfficial: (setId: string) => Promise<UninstallReport>
  /** 已装自制包清单（来历、来源、作者、依赖、条数），下载页 / 书架 / 我的库共用（P5 B-11）。 */
  brewPacks: BrewPacks
  /** 自制包中英配对：下载页目录合并、已装包配对（P5 G-2）。 */
  brewPairs: BrewPairs
  /** 中英对应：这一条在另一种语言里是哪一条（P5 B-10）。 */
  counterparts: Counterparts
  /** 文档类数据（规则速查、城主屏参考）：作者当小册子读（P5 B-02）。 */
  documents: DocumentStore
  /** 按（类别、作者编号）找条目在哪个包、术语跳转（P5 B-04、B-05）。 */
  links: EntryLinks
  custom: CustomLibrary
  tasks: DownloadTasks
  /** 官方书目（没装也能列）。 */
  directory: BookDirectory
  /** 首次启动后台预取书目与文件清单（boot.ts 调度）。 */
  prefetch: CatalogPrefetch
  precompute: KernelPrecompute
  /** 改自制 / 房规后的后台补换算。 */
  precomputeQueue: PrecomputeQueue
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
  const files = new FileProvider({ db })
  const openFrame = (codeSet: string, kvScope?: string) => startAuthorFrame({
    codeSet, pluginRoot, container: container(),
    handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => false, kvScope }),
  })
  let precompute: KernelPrecompute | null = null
  const runPrecompute = async (codeSets: string[], signal?: AbortSignal, onProgress?: (p: { stage: string; done: number; total: number; item?: string }) => void) => {
    if (!precompute) return null
    const rows = []
    for (const codeSet of [...new Set(codeSets)]) rows.push(await precompute.run({ codeSet, signal, onProgress }))
    return rows
  }
  const queue = new PrecomputeQueue(async (codeSet) => precompute?.run({ codeSet }) ?? null)
  const service = new LibraryService({ db, openFrame, onDataChanged: async (codeSet) => queue.trigger(codeSet) })
  // 书目（BE-7）：没装官方数据时用允许联网的一次性小窗读作者书目文件；已装好的用现成本地小窗
  const directory = new BookDirectory({
    db, localFrame: (codeSet) => service.frameOf(codeSet),
    networkFrame: (codeSet, kvScope) => startAuthorFrame({ codeSet, pluginRoot, container: container(), handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => true, kvScope }) }),
  })
  const documents = new DocumentStore(db)
  const links = new EntryLinks(service, documents)
  const scoped = new ScopedLibrary(service, db, directory, links)
  const brewPairs = new BrewPairs(service)
  const counterparts = new Counterparts(service, brewPairs)
  const custom = new CustomLibrary(service, scoped, db, (ref) => counterparts.counterpart(ref))
  const tasks = new DownloadTasks({ db, files, openFrame: (codeSet) => openFrame(codeSet),
    precompute: (setId, signal, onProgress) => runPrecompute([getSource(setId).codeSet], signal, onProgress) })
  const dataVersion = libraryDataVersion(db, service)
  precompute = new KernelPrecompute({ pluginRoot, files, scoped, db, dataVersion, container })

  // 结算内核要知道本战役的规则与选书；内核存档写入要结算内核拆人物。两者互相用，经闭包接上。
  let kernelSave: KernelSaveService | null = null
  const kernel = new KernelRuntime({
    pluginRoot, files, scoped, container, cache: { db, dataVersion },
    hasKernel: async (ownerKey) => !!(kernelSave && await kernelSave.read(ownerKey)),
    campaignOf: async (ownerKey) => {
      const ws = await opts.campaign.getWorkspace(ownerKey)
      if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
      const bound = kernelSave ? await kernelSave.read(ownerKey) : null
      if (!bound) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
      return { rule: bound.rule, library: (ws.data.library ?? bound.library) as CampaignLibrary, title: ws.ownerLabel }
    },
  })
  kernelSave = new KernelSaveService({
    db: opts.db, campaign: opts.campaign, rules: opts.rules, now: opts.now,
    checkRefs: scopedRefChecker(scoped),
    currentVersion: dataVersion,
    currentOverrides: scopedCurrentOverrides(scoped),
    mapRef: (ownerKey) => kernel.mapRef(ownerKey),
    compactActors: (ownerKey, ids) => kernel.compact(ownerKey, ids),
    undoLimit: async () => (await loadSettings(opts.db)).undoLimit,
  })

  const prefetch = new CatalogPrefetch({ files, directory, codeSets: DEFAULT_PREFETCH_CODE_SETS })
  const brewPacks = new BrewPacks(service)
  const images: LibraryBackend['images'] = {
    urls: imageUrls,
    token: async (codeSet, prop, ent) => (await service.frameOf(codeSet)).call('tokenPath', prop, ent),
  }
  const uninstall = (setId: string): Promise<UninstallReport> => uninstallOfficial({
    db, tasks, afterDelete: async (id) => { service.reset(); scoped.reset(); await documents.clear(getSource(id)) },
  }, setId)
  const library: LibraryBackend = { db, files, service, scoped, documents, links, images, counterparts, uninstallOfficial: uninstall, brewPacks, brewPairs, custom, tasks, directory, prefetch, precompute, precomputeQueue: queue, dataVersion }
  const starter = new CampaignStarter({ campaign: opts.campaign, kernelSave, rules: opts.rules, corePacks: () => checkCorePacks({ pluginRoot }), library })
  const transfer: Backend['transfer'] = {
    library: { exportFiles: () => custom.exportBackup(), importFiles: (files) => custom.importBackup(files) },
    checkRefs: (refs) => scoped.fetch(defaultCampaignLibrary(opts.rules.list()[0]?.id ?? 'dnd5e2014', DEFAULT_PREFETCH_CODE_SETS[0]), refs),
  }
  const brewSetOf = (codeSet: string): string => SOURCES.find((s) => s.kind === 'brew' && s.codeSet === codeSet)?.id ?? `${codeSet}-brew`
  const removalImpact = (target: RemovalTarget): Promise<RemovalImpact> => impactOfRemoval({ db: opts.db, manage: scoped.manage, brewPacks, brewSetOf }, target)
  return { library, kernel, kernelSave, starter, transfer, removalImpact }
}
