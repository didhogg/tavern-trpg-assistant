// T2：装资料 / 改自制 / 改房规后，用作者统一入口把 2014 战役看得到的条目换算好，
// 压缩存进【库】；玩的时候只读。类别不写死：从已解析数据的类别里取，再问作者登记表哪些真有导入器。
import type { FileProvider } from '../../library/files'
import type { LibraryDatabase } from '../../library/db'
import type { ScopedLibrary } from '../../library/scoped'
import { defaultCampaignLibrary } from '../../library/scopes'
import { getSource, SOURCES } from '../../library/sources'
import type { KernelDataVersion } from '../../schemas/kernel'
import { KernelCache, kernelImportKey } from './cache'
import { libraryData, startKernel, type KernelSession } from './host'
import { kernelInput } from './input'
import { kernelEntryOf } from './entry'

export interface PrecomputeProgress { stage: string; done: number; total: number; item?: string }
export interface PrecomputeReport {
  codeSet: string
  rule: string
  skippedReason: string | null
  kernelFingerprint: string
  dataVersion: KernelDataVersion
  total: number
  done: number
  converted: number
  cached: number
  failed: Array<{ prop: string; name: string; error: string }>
  /** 交的是中文条目（房规 / 备选生效，或没有英文对照；蓝图“中文战役”：直接交中文、标“无英文对照”）。照样换算，列出来。 */
  noEnglish: Array<{ prop: string; name: string; reason: string }>
  /** 完整换算后清掉的旧行（结算内核或官方数据换过之前的）。 */
  swept: number
  rawBytes: number
  compressedBytes: number
  ms: number
  cancelled: boolean
  complete: boolean
}

export interface PrecomputeOptions {
  pluginRoot: URL
  files: FileProvider
  scoped: ScopedLibrary
  db: LibraryDatabase
  dataVersion: () => Promise<KernelDataVersion>
  rule?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
  container?: () => HTMLElement
}

interface Candidate { prop: string; entry: unknown; name: string }

const msg = (e: unknown): string => e instanceof Error ? e.message : String(e)

export class KernelPrecompute {
  constructor(private readonly opts: PrecomputeOptions) {}

  private rule(): string {
    return this.opts.rule ?? 'dnd5e2014'
  }

  private markerKey(codeSet: string): string {
    return `kc-meta:${this.rule()}:${codeSet}`
  }

  /** 读当前已存换算的标记；fingerprint 和当前结算内核不一致时 needsUpdate。 */
  async status(codeSet = 'cn'): Promise<{ kernelFingerprint: string; dataVersion: KernelDataVersion; marker: Record<string, unknown> | null; needsUpdate: boolean }> {
    const input = await this.input(codeSet)
    const fingerprint = input.cacheKey ?? ''
    const version = await this.opts.dataVersion()
    const rec = await this.opts.db.derived.get(this.markerKey(codeSet))
    const marker = rec?.value as Record<string, unknown> | null
    return { kernelFingerprint: fingerprint, dataVersion: version, marker, needsUpdate: marker?.kernelFingerprint !== fingerprint || JSON.stringify(marker?.dataVersion) !== JSON.stringify(version) || marker?.complete !== true }
  }

  /** 一个下载任务里的换算段。中途取消会保留已写缓存，下一次从没换的接着换。 */
  async run({ codeSet = 'cn', signal, onProgress, limit }: { codeSet?: string; signal?: AbortSignal; onProgress?: (p: PrecomputeProgress) => void; /** 仅测试用：只换算前 N 条。 */ limit?: number } = {}): Promise<PrecomputeReport> {
    const started = Date.now()
    const input = await this.input(codeSet)
    const fingerprint = input.cacheKey ?? ''
    const version = await this.opts.dataVersion()
    const base: Omit<PrecomputeReport, 'skippedReason' | 'total' | 'done' | 'converted' | 'cached' | 'failed' | 'noEnglish' | 'swept' | 'rawBytes' | 'compressedBytes' | 'ms' | 'cancelled' | 'complete'> = {
      codeSet, rule: this.rule(), kernelFingerprint: fingerprint, dataVersion: version,
    }
    const skip = (reason: string): PrecomputeReport => ({ ...base, skippedReason: reason, total: 0, done: 0, converted: 0, cached: 0, failed: [], noEnglish: [], swept: 0, rawBytes: 0, compressedBytes: 0, ms: Date.now() - started, cancelled: false, complete: false })
    const en = SOURCES.find((s) => s.kind === 'official' && s.codeSet === 'en')
    const own = SOURCES.find((s) => s.kind === 'official' && s.codeSet === codeSet)
    if (!own || (await this.opts.db.sets.get(own.id))?.status !== 'installed') return skip(`${own?.id ?? codeSet} 还没装好`)
    if (!en || (await this.opts.db.sets.get(en.id))?.status !== 'installed') return skip('英文官方数据还没装好，换算需要英文对照原件')

    onProgress?.({ stage: 'open-kernel', done: 0, total: 0 })
    const session = await startKernel({ pluginRoot: this.opts.pluginRoot, container: this.opts.container?.() ?? document.body, data: libraryData(this.opts.files), fetchImpl: this.opts.fetchImpl, timeoutMs: this.opts.timeoutMs ?? 180_000 })
    let total: number; let done = 0; let converted = 0; let cached = 0; let rawBytes = 0; let compressedBytes = 0; let cancelled = false
    const failed: PrecomputeReport['failed'] = []
    try {
      await session.boot(input)
      const noEnglish: PrecomputeReport['noEnglish'] = []
      const candidates = await this.candidates(session, codeSet, noEnglish, signal, limit)
      total = candidates.length
      onProgress?.({ stage: 'convert', done: 0, total })
      const cache = new KernelCache(this.opts.db)
      const scope = { rule: this.rule(), base: fingerprint, official: version.official }
      for (const row of candidates) {
        if (signal?.aborted) { cancelled = true; break }
        const key = await kernelImportKey({ base: fingerprint, dataVersion: version, kind: row.prop === 'monster' ? 'monster' : 'build', prop: row.prop, entry: row.entry })
        if (await cache.get(key) !== null) { cached++; done++; onProgress?.({ stage: 'convert', done, total, item: row.prop }); continue }
        try {
          const result = await session.call('importForBuild', row.prop, row.entry)
          if (result.status !== 'complete' || !result.result) throw Error(result.error ?? `换算状态：${result.status}`)
          const size = await cache.put(key, result.result, scope)
          rawBytes += size.raw; compressedBytes += size.compressed; converted++
        } catch (e) {
          failed.push({ prop: row.prop, name: row.name, error: msg(e) })
        }
        done++
        if (done % 10 === 0) onProgress?.({ stage: 'convert', done, total, item: row.prop })
      }
      const complete = !cancelled && failed.length === 0 && done === total
      // 只在完整跑完后清：中途取消时旧行可能还有人在用（下次接着换）
      const swept = complete && !limit ? await cache.sweep(scope) : 0
      await this.opts.db.derived.put({ key: this.markerKey(codeSet), fingerprint, value: { kernelFingerprint: fingerprint, dataVersion: version, total, done, complete, at: Date.now() }, savedAt: Date.now() })
      return { ...base, skippedReason: null, total, done, converted, cached, failed, noEnglish, swept, rawBytes, compressedBytes, ms: Date.now() - started, cancelled, complete }
    } finally {
      session.close()
    }
  }

  /** 编译一次结算内核输入；T2 的指纹与现场换算共用。 */
  private async input(codeSet: string) {
    return kernelInput({ pluginRoot: this.opts.pluginRoot, rule: this.rule(), world: { id: `precompute-${codeSet}`, title: `precompute ${codeSet}` }, fetchImpl: this.opts.fetchImpl })
  }

  /** 从已解析数据的类别 + 本战役可见条目里收集；类别由作者登记表确认，不写类别清单。 */
  private async candidates(session: KernelSession, codeSet: string, noEnglish: PrecomputeReport['noEnglish'], signal?: AbortSignal, limit?: number): Promise<Candidate[]> {
    const props = new Set<string>()
    for (const source of SOURCES.filter((s) => s.codeSet === codeSet)) {
      await this.opts.db.derived.where('key').startsWith(`parsed:${source.id}:`).each((rec) => {
        const rest = rec.key.slice(`parsed:${source.id}:`.length)
        if (rest.startsWith('corpus:') || rest.startsWith('raw_')) return
        const prop = rest.split(':')[0]
        if (prop && getSource(source.id)) props.add(prop)
      })
    }
    if (signal?.aborted) return []
    const meta = await session.call('importerMeta', [...props])
    const usable = new Set(meta.filter((row) => row.folderType === 'Item' || row.folderType === 'Actor').map((row) => row.prop))
    const library = defaultCampaignLibrary(this.rule(), codeSet)
    const out: Candidate[] = []
    for (const prop of usable) {
      if (signal?.aborted) break
      const rows = await this.opts.scoped.query(library, prop).catch(() => [])
      for (const row of rows) {
        if (limit && out.length >= limit) break
        const item = row.item as { name?: unknown } | null
        // 作者条目里有一类只有属性缩写、没有 name 的元数据（例如 itemProperty）；它们不是 Actor/Item 文档。
        // 作者导入器对它们会返回无文档；这里按内容的真实形状跳过，不写类别名单。
        if (typeof item?.name !== 'string' || !item.name) continue
        const k = await kernelEntryOf(this.opts.scoped, library.codeSet, row.ref, row.item, row.version.altId)
        if (k.noEnglish) noEnglish.push({ prop, name: item.name, reason: k.reason ?? 'english-missing' })
        out.push({ prop, entry: k.entry, name: item.name })
        // 有备选（房规、撞编号的包）：每个备选版本也换好——哪个战役选它都即时；原件已在上面
        if (row.version.count > 0) {
          const d = await this.opts.scoped.detail(library, row.ref)
          for (const alt of d && !('hidden' in d) ? d.alternatives : []) {
            if (alt.item === row.item) continue
            const a = await kernelEntryOf(this.opts.scoped, library.codeSet, row.ref, alt.item, alt.altId)
            if (a.noEnglish) noEnglish.push({ prop, name: item.name, reason: a.reason ?? 'alternative' })
            out.push({ prop, entry: a.entry, name: item.name })
          }
        }
      }
      if (limit && out.length >= limit) break
    }
    return out
  }
}
