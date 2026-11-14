// T2：装资料 / 改自制 / 改房规后，用作者统一入口把 2014 战役看得到的条目换算好，
// 压缩存进【库】；玩的时候只读。类别不写死：从已解析数据的类别里取，再问作者登记表哪些真有导入器。
import type { FileProvider } from '../../library/files'
import type { LibraryDatabase } from '../../library/db'
import type { LibraryRevisionStore, LibraryView } from '../../library/revision'
import type { ScopedLibrary } from '../../library/scoped'
import { defaultCampaignLibrary } from '../../library/scopes'
import { getSource, SOURCES } from '../../library/sources'
import type { KernelDataVersion } from '../../schemas/kernel'
import { KernelCache, kernelFilesVersion, kernelImportKey } from './cache'
import { libraryData, startKernel, type KernelSession } from './host'
import { kernelInput } from './input'
import { kernelEntryOf } from './entry'

/** full：装 / 更新资料后的完整换算；changed：改自制 / 房规后的后台补换算（只看自制和带备选的条目）。 */
export type PrecomputeMode = 'full' | 'changed'

export interface PrecomputeProgress { stage: string; done: number; total: number; item?: string }
export interface PrecomputeReport {
  codeSet: string
  rule: string
  mode: PrecomputeMode
  skippedReason: string | null
  kernelFingerprint: string
  dataVersion: KernelDataVersion
  total: number
  done: number
  converted: number
  cached: number
  failed: Array<{ prop: string; name: string; error: string }>
  /** 以前换算失败、这次没再试的（后台补换算；内核或官方数据换过才重试）。 */
  knownFailed: number
  /** 交的是中文条目（房规 / 备选生效，或没有英文对照；蓝图“中文战役”：直接交中文、标“无英文对照”）。照样换算，列出来。 */
  noEnglish: Array<{ prop: string; name: string; reason: string }>
  /** 完整换算后清掉的旧行（结算内核或官方数据换过之前的）。 */
  swept: number
  rawBytes: number
  compressedBytes: number
  ms: number
  cancelled: boolean
  complete: boolean
  /** 这次有没有开结算内核（全都换过就不开）。 */
  kernelOpened: boolean
}

export interface PrecomputeOptions {
  pluginRoot: URL
  files: FileProvider
  scoped: ScopedLibrary
  db: LibraryDatabase
  revisions: LibraryRevisionStore
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

  /**
   * 一个下载任务里的换算段（full），或改自制 / 房规后的后台补换算（changed）。中途取消会保留已写缓存，下一次从没换的接着换。
   * changed：换算钥匙不含自制包版本（cache.ts），改自制不会让官方条目的换算失效，所以只看自制条目和带备选（房规、撞编号的包）的条目；
   *   不清旧行、不写「完整」标记（那是完整换算的事）。
   * 两种都先算钥匙、只查「有没有这一行」（不解压）；全都换过就不开结算内核。换算失败的记成失败行，内核或官方数据换过之前不再重试。
   */
  async run({ codeSet = 'cn', signal, onProgress, limit, mode = 'full' }: { codeSet?: string; signal?: AbortSignal; onProgress?: (p: PrecomputeProgress) => void; /** 仅测试用：只换算前 N 条。 */ limit?: number; mode?: PrecomputeMode } = {}): Promise<PrecomputeReport> {
    const started = Date.now()
    const view = await this.opts.revisions.published()
    const input = await this.input(codeSet)
    const fingerprint = input.cacheKey ?? ''
    const version = await this.opts.dataVersion()
    const base = { codeSet, rule: this.rule(), kernelFingerprint: fingerprint, dataVersion: version, mode }
    const skip = (reason: string): PrecomputeReport => ({ ...base, skippedReason: reason, total: 0, done: 0, converted: 0, cached: 0, failed: [], knownFailed: 0, noEnglish: [], swept: 0, rawBytes: 0, compressedBytes: 0, ms: Date.now() - started, cancelled: false, complete: false, kernelOpened: false })
    const en = SOURCES.find((s) => s.kind === 'official' && s.codeSet === 'en')
    const own = SOURCES.find((s) => s.kind === 'official' && s.codeSet === codeSet)
    if (!own || (await view.officialState(own.id))?.status !== 'installed') return skip(`${own?.id ?? codeSet} 还没装好`)
    if (!en || (await view.officialState(en.id))?.status !== 'installed') return skip('英文官方数据还没装好，换算需要英文对照原件')

    // 结算内核要用时才开（开机要载入全部数据，主线程忙约 10 秒）
    let session: KernelSession | null = null
    const kernel = async (): Promise<KernelSession> => {
      if (session) return session
      onProgress?.({ stage: 'open-kernel', done: 0, total: 0 })
      const s = await startKernel({ pluginRoot: this.opts.pluginRoot, container: this.opts.container?.() ?? document.body, data: libraryData(this.opts.files, view), fetchImpl: this.opts.fetchImpl, timeoutMs: this.opts.timeoutMs ?? 180_000 })
      try { await s.boot(input) } catch (e) { s.close(); throw e }
      session = s
      return s
    }
    let total: number; let done = 0; let converted = 0; let cached = 0; let knownFailed = 0; let rawBytes = 0; let compressedBytes = 0; let cancelled = false
    const failed: PrecomputeReport['failed'] = []
    try {
      const noEnglish: PrecomputeReport['noEnglish'] = []
      const props = await this.importableProps(kernel, codeSet, view, fingerprint)
      const candidates = await this.candidates(props, codeSet, view, noEnglish, signal, limit, mode)
      total = candidates.length
      onProgress?.({ stage: 'convert', done: 0, total })
      const cache = new KernelCache(this.opts.db)
      const scope = { rule: this.rule(), base: fingerprint, official: kernelFilesVersion(version) }
      for (const row of candidates) {
        if (signal?.aborted) { cancelled = true; break }
        const key = await kernelImportKey({ base: fingerprint, dataVersion: version, kind: row.prop === 'monster' ? 'monster' : 'build', prop: row.prop, entry: row.entry })
        const state = await cache.state(key)
        // 完整换算（装 / 更新资料时）照样重试记过的失败（可能是偶发的）；后台补换算跳过
        if (state === 'done' || (state === 'failed' && mode === 'changed')) { if (state === 'failed') knownFailed++; else cached++; done++; if (done % 50 === 0) onProgress?.({ stage: 'convert', done, total, item: row.prop }); continue }
        try {
          const result = await (await kernel()).call('importForBuild', row.prop, row.entry)
          if (result.status !== 'complete' || !result.result) throw Error(result.error ?? `换算状态：${result.status}`)
          const size = await cache.put(key, result.result, scope)
          rawBytes += size.raw; compressedBytes += size.compressed; converted++
        } catch (e) {
          failed.push({ prop: row.prop, name: row.name, error: msg(e) })
          await cache.putFailed(key, msg(e), scope)
        }
        done++
        if (done % 10 === 0) onProgress?.({ stage: 'convert', done, total, item: row.prop })
      }
      const complete = !cancelled && failed.length === 0 && knownFailed === 0 && done === total
      if (mode === 'changed') return { ...base, skippedReason: null, total, done, converted, cached, failed, knownFailed, noEnglish, swept: 0, rawBytes, compressedBytes, ms: Date.now() - started, cancelled, complete, kernelOpened: session !== null }
      // 只在完整跑完后清：中途取消时旧行可能还有人在用（下次接着换）
      const swept = complete && !limit ? await cache.sweep(scope) : 0
      await this.opts.db.derived.put({ key: this.markerKey(codeSet), fingerprint, value: { kernelFingerprint: fingerprint, dataVersion: version, total, done, complete, at: Date.now() }, savedAt: Date.now() })
      return { ...base, skippedReason: null, total, done, converted, cached, failed, knownFailed, noEnglish, swept, rawBytes, compressedBytes, ms: Date.now() - started, cancelled, complete, kernelOpened: session !== null }
    } finally {
      (session as KernelSession | null)?.close()
    }
  }

  /**
   * 已解析数据里有哪些类别作者真有导入器（问内核 importerMeta，不写类别清单）。
   * 问过的结果按内核指纹存下来（kc-importable:规则），下次只有出现没问过的类别才开内核再问。
   */
  private async importableProps(kernel: () => Promise<KernelSession>, codeSet: string, view: LibraryView, fingerprint: string): Promise<Set<string>> {
    const props = new Set<string>()
    for (const source of SOURCES.filter((s) => s.codeSet === codeSet)) {
      const map = await view.derivedKeys(`parsed:${source.id}:`)
      for (const key of map.keys()) {
        const rest = key.slice(`parsed:${source.id}:`.length)
        if (rest.startsWith('corpus:') || rest.startsWith('raw_')) continue
        const prop = rest.split(':')[0]
        if (prop && getSource(source.id)) props.add(prop)
      }
    }
    const memoKey = `kc-importable:${this.rule()}`
    const rec = await this.opts.db.derived.get(memoKey)
    const known: Record<string, boolean> = rec?.fingerprint === fingerprint ? (rec.value as Record<string, boolean>) : {}
    const ask = [...props].filter((p) => !(p in known))
    if (ask.length) {
      const meta = await (await kernel()).call('importerMeta', ask)
      const ok = new Set(meta.filter((row) => row.folderType === 'Item' || row.folderType === 'Actor').map((row) => row.prop))
      for (const p of ask) known[p] = ok.has(p)
      await this.opts.db.derived.put({ key: memoKey, fingerprint, value: known, savedAt: Date.now() })
    }
    return new Set([...props].filter((p) => known[p]))
  }

  /** 编译一次结算内核输入；T2 的指纹与现场换算共用。 */
  private async input(codeSet: string) {
    return kernelInput({ pluginRoot: this.opts.pluginRoot, rule: this.rule(), world: { id: `precompute-${codeSet}`, title: `precompute ${codeSet}` }, fetchImpl: this.opts.fetchImpl })
  }

  /** 从已解析数据的类别 + 本战役可见条目里收集；类别由作者登记表确认，不写类别清单。 */
  private async candidates(usable: Set<string>, codeSet: string, view: LibraryView, noEnglish: PrecomputeReport['noEnglish'], signal?: AbortSignal, limit?: number, mode: PrecomputeMode = 'full'): Promise<Candidate[]> {
    if (signal?.aborted) return []
    const library = defaultCampaignLibrary(this.rule(), codeSet)
    const out: Candidate[] = []
    for (const prop of usable) {
      if (signal?.aborted) break
      const rows = await this.opts.scoped.query(library, prop, { view }).catch(() => [])
      for (const row of rows) {
        if (limit && out.length >= limit) break
        // 后台补换算：官方条目只要没有备选，换算钥匙不受自制改动影响（cache.ts），不用看
        if (mode === 'changed' && getSource(row.ref.set).kind !== 'brew' && row.version.count === 0) continue
        const item = row.item as { name?: unknown } | null
        // 作者条目里有一类只有属性缩写、没有 name 的元数据（例如 itemProperty）；它们不是 Actor/Item 文档。
        // 作者导入器对它们会返回无文档；这里按内容的真实形状跳过，不写类别名单。
        if (typeof item?.name !== 'string' || !item.name) continue
        const k = await kernelEntryOf(this.opts.scoped, library.codeSet, row.ref, row.item, row.version.altId, view)
        if (k.noEnglish) noEnglish.push({ prop, name: item.name, reason: k.reason ?? 'english-missing' })
        out.push({ prop, entry: k.entry, name: item.name })
        // 有备选（房规、撞编号的包）：每个备选版本也换好——哪个战役选它都即时；原件已在上面
        if (row.version.count > 0) {
          const d = await this.opts.scoped.detail(library, row.ref, { view })
          for (const alt of d && !('hidden' in d) ? d.alternatives : []) {
            if (alt.item === row.item) continue
            const a = await kernelEntryOf(this.opts.scoped, library.codeSet, row.ref, alt.item, alt.altId, view)
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
