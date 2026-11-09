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
import { ScopedLibrary } from '../library/scoped'
import type { CampaignLibrary } from '../library/scopes'
import { CustomLibrary } from '../library/custom'
import { LibraryService } from '../library/service'
import { DownloadTasks } from '../library/tasks'
import type { RuleRegistry } from '../rules/registry'
import { KernelRuntime } from '../rules/kernel/runtime'
import { KernelPrecompute } from '../rules/kernel/precompute'
import { PrecomputeQueue } from '../rules/kernel/precompute-queue'
import { getSource } from '../library/sources'
import { TrpgError } from './errors'
import { CampaignStarter } from './start-campaign'

export interface LibraryBackend {
  db: LibraryDatabase
  files: FileProvider
  service: LibraryService
  scoped: ScopedLibrary
  custom: CustomLibrary
  tasks: DownloadTasks
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
  const scoped = new ScopedLibrary(service, db)
  const custom = new CustomLibrary(service, scoped, db)
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

  const library: LibraryBackend = { db, files, service, scoped, custom, tasks, precompute, precomputeQueue: queue, dataVersion }
  const starter = new CampaignStarter({ campaign: opts.campaign, kernelSave, rules: opts.rules, library })
  return { library, kernel, kernelSave, starter }
}
