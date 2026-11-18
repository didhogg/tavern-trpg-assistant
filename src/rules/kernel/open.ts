import type { LibraryView } from '../../library/revision'
import type { LibraryService } from '../../library/service'
import { BrewPacks } from '../../library/brew-packs'
import { brewSourceOf, kernelDataSource } from '../../library/sources'
import { withTimeout } from '../../library/service-brew'
import { hashValue } from '../../core/hash'
import { libraryBrews, type PreparedBrew } from './brews'
import { libraryData, startKernel, type KernelInput, type KernelSession } from './host'
import type { FileProvider } from '../../library/files'
import type { KernelBrewReport } from './frame/brew-input'

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
  /** 作者在建卡时要问玩家（frame/ask-bridge.ts）：交给运行时转给正在建卡的界面。 */
  ask?: (question: unknown) => Promise<unknown>
}): Promise<{ session: KernelSession; boot: unknown; report: KernelBrewReport; brewFingerprint: string | undefined }> {
  const session = await startKernel({ ...opts, data: libraryData(opts.files, opts.view), timeoutMs: opts.timeoutMs ?? 180_000 })
  try {
    const { boot, report } = await withTimeout(async () => {
      const boot = await session.boot(opts.input)
      const report = opts.brews.length ? await session.call('loadBrews', opts.brews, opts.itemMasteries) : { loaded: [], flattened: 0, excluded: [] }
      return { boot, report }
    }, '准备结算资料', opts.timeoutMs)
    const loaded = new Set(report.loaded)
    const docs = opts.brews.filter(({ doc }) => loaded.has(doc.head.docIdLocal)).map(({ doc }) => doc.body)
    return { session, boot, report, brewFingerprint: docs.length ? hashValue([opts.itemMasteries, docs]) : undefined }
  } catch (e) {
    session.close()
    throw e
  }
}
