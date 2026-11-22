import type { LibraryView } from '../../library/revision'
import type { LibraryService } from '../../library/service'
import { BrewPacks } from '../../library/brew-packs'
import { brewSourceOf, kernelDataSource } from '../../library/sources'
import { withTimeout } from '../../library/service-brew'
import { hashValue } from '../../core/hash'
import { libraryBrews, type PreparedBrew } from './brews'
import { BREW_FILE_DIR, libraryData, startKernel, type KernelInput, type KernelSession } from './host'
import type { FileProvider } from '../../library/files'
import type { KernelBrewReport } from './frame/brew-input'
import type { FrameHandlers } from '../../library/runtime/host'

export async function prepareKernelBrews(service: LibraryService, view: LibraryView, codeSet: string): Promise<{ brews: PreparedBrew[]; itemMasteries: unknown[] }> {
  const brews = await libraryBrews(view, codeSet, async () => ({
    packs: await new BrewPacks(service).list(brewSourceOf(codeSet).id, view),
    flatten: async (body, sources, includedSources) => (await service.frameOf(codeSet, view)).call('flattenCopies', body, sources, { officialOnly: true, includedSources }),
  }))
  const itemMasteries = brews.length && codeSet !== kernelDataSource().codeSet
    ? (await (await service.frameOf(codeSet, view)).call('parseProp', 'itemMastery')).items
    : []
  return { brews, itemMasteries }
}

export async function openKernel(opts: {
  pluginRoot: URL
  container: HTMLElement
  files: FileProvider
  view: LibraryView
  fetchImpl?: typeof fetch
  timeoutMs?: number
  input: KernelInput
  brews: PreparedBrew[]
  itemMasteries: unknown[]
  /** 建卡专用小窗给玩家看（铺满 container）。 */
  visible?: boolean
  buildCard?: FrameHandlers['buildCard']
}): Promise<{ session: KernelSession; boot: unknown; report: KernelBrewReport; brewFingerprint: string | undefined; brewFiles: string[] }> {
  // 作者收下的自制包按文件供应（host.ts file）：作者自己的「额外自制文件」入口按地址读（建卡专用小窗登记，commands-native.ts）
  const brewFiles = new Map<string, string>()
  const session = await startKernel({ ...opts, data: libraryData(opts.files, opts.view), timeoutMs: opts.timeoutMs ?? 180_000, moduleRoots: opts.input.moduleRoots, brewFiles })
  try {
    const { boot, report } = await withTimeout(async () => {
      const boot = await session.boot(opts.input)
      const report = opts.brews.length ? await session.call('loadBrews', opts.brews, opts.itemMasteries) : { loaded: [], flattened: 0, excluded: [] }
      return { boot, report }
    }, '准备结算资料', opts.timeoutMs)
    const loaded = new Set(report.loaded)
    const accepted = opts.brews.filter(({ doc }) => loaded.has(doc.head.docIdLocal))
    const docs = accepted.map(({ doc }) => doc.body)
    for (const { doc } of accepted) brewFiles.set(`${BREW_FILE_DIR}${doc.head.docIdLocal}/${(doc.head.filename || `${doc.head.docIdLocal}.json`).replace(/[\\/]/g, '_')}`, JSON.stringify(doc.body))
    return { session, boot, report, brewFingerprint: docs.length ? hashValue([opts.itemMasteries, docs]) : undefined, brewFiles: [...brewFiles.keys()] }
  } catch (e) {
    session.close()
    throw e
  }
}
