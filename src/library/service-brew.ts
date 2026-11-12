// 【库】自制资料的写路径（P5 T3）：装 / 改 / 删 / 更新 / 可编辑条目都在准备版本里做，成功才发布。
// 从 service.ts 拆出来，保持单文件职责与行数上限。
import type { LibraryDatabase } from './db'
import { parseBrew, type BrewParseReport } from './brew'
import { invalidatePrecompute } from './cache'
import { LibraryOperations, type OperationHandle } from './operations'
import type { LibraryRevisionStore, LibraryView } from './revision'
import { officialSourceOf, SOURCES, type SourceEntry } from './sources'
import type { AuthorFrame } from './runtime/host'
import type { BrewEntry, WithErrors } from './runtime/frame/brew-commands'
import type { LogSink } from './logs'
import { formatOfCodeSet, splitRecognized } from './formats'

export interface BrewContext {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  operations: LibraryOperations
  openFrame: (codeSet: string, ctx?: { view?: LibraryView; kvScope?: string; filterIndex?: boolean; signal?: AbortSignal }) => Promise<AuthorFrame>
  frame: (codeSet: string, view?: LibraryView) => Promise<AuthorFrame>
  onDataChanged?: (codeSet: string) => Promise<void>
  onLog?: LogSink
  onPublished?: (view: LibraryView, previous: string) => void
}

const brewSource = (sourceId: string): SourceEntry => {
  const s = SOURCES.find((x) => x.id === sourceId)
  if (!s || s.kind !== 'brew') throw new Error(`${sourceId} 不是自制源`)
  return s
}

/** 自制装 / 改 / 删之后：在准备版本里重解析；旧版本数据不删。 */
export async function afterBrewChange(ctx: BrewContext, s: SourceEntry, view: LibraryView, signal?: AbortSignal): Promise<BrewParseReport> {
  signal?.throwIfAborted()
  const report = await parseBrew({
    source: s, db: ctx.db, view,
    openFrame: () => ctx.openFrame(s.codeSet, { view, filterIndex: true, signal }),
    openFrameIn: (scope) => ctx.openFrame(s.codeSet, { view, kvScope: scope, filterIndex: true, signal }),
  })
  signal?.throwIfAborted()
  await invalidatePrecompute(ctx.db, officialSourceOf(s.codeSet).id, ['search'], view)
  return report
}

/** 缺依赖导致作者合并全部自制包失败：这次改动不发布，旧版本照常可读（修法 A）。界面据 missing 给【下载依赖包】【删除缺依赖的包】。 */
export class BrewDependencyError extends Error {
  readonly missing: NonNullable<BrewParseReport['parse']['missingDeps']>
  constructor(readonly setId: string, missing: NonNullable<BrewParseReport['parse']['missingDeps']>, detail: string) {
    super(`缺依赖包 ${missing.map((m) => m.source).join('、') || '（未知）'}，这次改动已取消，原有内容没有变化（${detail.slice(0, 160)}）`)
    this.name = 'BrewDependencyError'
    this.missing = missing
  }
}

/** 解析结果能不能发布：缺依赖 / 整类解析失败都不发布（P5 核验 5 + 修法 A）。所有发布自制改动的路径都先过这里。 */
export function assertPublishable(s: SourceEntry, report: BrewParseReport): void {
  if (report.parse.missingDeps) throw new BrewDependencyError(s.id, report.parse.missingDeps, report.parse.errors[0]?.error ?? '')
  const fatal = report.parse.errors.length || Object.values(report.parse.corpora ?? {}).some((c) => c.failed.length)
  if (fatal) {
    const first = report.parse.errors[0]?.error ?? Object.values(report.parse.corpora ?? {}).flatMap((c) => c.failed)[0]?.error ?? '自制解析失败'
    throw new Error(`自制解析失败，没有发布：${first}`)
  }
}

export async function prepareBrewDelete(ctx: BrewContext, sourceId: string, docIdLocals: string[], view: LibraryView): Promise<{ value: WithErrors<number>; parse: BrewParseReport; packs: ReturnType<typeof packsOf> }> {
  const s = brewSource(sourceId)
  const frame = await ctx.frame(s.codeSet, view)
  const value = await frame.call('brewDelete', docIdLocals)
  const errors = await frame.call('storageFlush')
  if (errors.length) throw new Error(errors[0])
  const parse = await afterBrewChange(ctx, s, view)
  // 官方单本卸载连带删包也走这里：同样先检查，不能发布被清空的自制库
  assertPublishable(s, parse)
  return { value, parse, packs: packsOf(parse) }
}

export const packsOf = (report: BrewParseReport): Array<{ docIdLocal: string; stableId: string | null; checksum: string | null }> =>
  report.installed.map((head) => {
    const id = String(head.docIdLocal ?? '')
    const url = typeof head.url === 'string' ? head.url : null
    const checksum = String(head.checksum ?? head.version ?? head.dateAdded ?? head.filename ?? '')
    return { docIdLocal: id, stableId: url ?? id, checksum }
  })

export function logBrew(ctx: BrewContext, s: SourceEntry, report: BrewParseReport): void {
  const log = ctx.onLog
  if (!log) return
  for (const e of report.parse.errors) log({ level: 'error', source: s.id, kind: 'brew-parse', message: `${e.prop}：${e.error}` })
  for (const [prop, c] of Object.entries(report.parse.corpora ?? {})) for (const f of c.failed) log({ level: 'error', source: s.id, kind: 'brew-corpus', message: `${prop} ${f.id}：${f.error}` })
  if (report.parse.authorErrors.length) log({ level: 'warn', source: s.id, kind: 'brew-author-errors', message: `解析时作者报了 ${report.parse.authorErrors.length} 条错`, detail: report.parse.authorErrors })
  if (report.alternatives.errors.length) log({ level: 'warn', source: s.id, kind: 'brew-alternatives', message: `${report.alternatives.errors.length} 条同编号的备选版本取失败`, detail: report.alternatives.errors })
  if (report.precomputeError) log({ level: 'warn', source: s.id, kind: 'brew-precompute', message: report.precomputeError })
}

export async function publishBrew(ctx: BrewContext, s: SourceEntry, handle: OperationHandle, report: BrewParseReport): Promise<LibraryView> {
  // 初始化 / 存储 / 整类解析失败 / 缺依赖：不发布缺内容的版本；旧版本继续可读。
  assertPublishable(s, report)
  const partial = report.alternatives.errors.length > 0 || !!report.precomputeError
  const view = await ctx.operations.publish(handle, {
    brews: { [s.id]: { packs: packsOf(report) } }, result: report,
    status: partial ? 'partial' : 'done',
  })
  try { await ctx.onDataChanged?.(s.codeSet) } catch (e) { ctx.onLog?.({ level: 'warn', source: s.id, kind: 'brew-precompute', message: e instanceof Error ? e.message : String(e) }) }
  logBrew(ctx, s, report)
  ctx.onPublished?.(view, handle.base.id)
  return view
}

/** 整个操作有可观测阶段、截止时间和取消收尾；超时只作废这次准备版本。 */
export async function withTimeout<T>(run: () => Promise<T>, what: string, ms = 180_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(`${what}超过 ${ms / 1000} 秒没有响应，已作废这次准备，请重试`)), ms) })
  try { return await Promise.race([run(), timeout]) } finally { clearTimeout(timer) }
}

/** 在准备版本里跑一次作者存储修改，再重解析、发布。可编辑条目 / 房规 / 存副本都走这里。 */
export async function mutateAuthor<T>(ctx: BrewContext, codeSet: string, kind: string, run: (view: LibraryView) => Promise<T>): Promise<{ value: T; parse: BrewParseReport; view: LibraryView }> {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
  if (!s) throw new Error(`作者程序 ${codeSet} 没有登记自制数据集`)
  const handle = await ctx.operations.begin({ kind, set: s.id, codeSet })
  try {
    const value = await run(handle.target)
    const f = await ctx.openFrame(codeSet, { view: handle.target, filterIndex: true })
    try {
      const errors = await f.call('storageFlush')
      if (errors.length) throw new Error(errors[0])
    } finally { f.close() }
    const parse = await afterBrewChange(ctx, s, handle.target)
    const view = await publishBrew(ctx, s, handle, parse)
    return { value, parse, view }
  } catch (e) {
    await ctx.operations.abort(handle, e)
    throw e
  }
}

/** 自制包下载的真实阶段（P5 T6 B1，驾驶员批准）：作者一次调用下完主文件和依赖，中间拆不开，所以只有这三段。 */
export type BrewProgress = (stage: 'download' | 'parse' | 'publish', step: number, total: number) => void

/** 下载、补依赖、更新共用准备版本和关闭小窗的时机，作者入口只负责取各自的资料。 */
async function downloadBrew<T>(
  ctx: BrewContext, sourceId: string, kind: string, label: string,
  load: (frame: AuthorFrame) => Promise<T>, hasContent: (value: T) => boolean, signal?: AbortSignal, onProgress?: BrewProgress,
): Promise<T & { parse: BrewParseReport | null; view?: string }> {
  const s = brewSource(sourceId)
  const handle = await ctx.operations.begin({ kind, set: s.id, codeSet: s.codeSet, signal })
  const step = async (stage: 'download' | 'parse' | 'publish', i: number): Promise<void> => {
    signal?.throwIfAborted()
    onProgress?.(stage, i, 3)
    await ctx.operations.progress(handle, { stage: `brew-${stage}`, done: i, total: 3 })
  }
  try {
    await step('download', 0)
    const frame = await ctx.openFrame(s.codeSet, { view: handle.target, filterIndex: true, signal })
    let value: T
    try {
      value = await withTimeout(() => load(frame), label)
      if (hasContent(value)) {
        const errors = await frame.call('storageFlush')
        if (errors.length) throw new Error(errors[0])
      }
    } finally { frame.close() }
    if (!hasContent(value)) {
      await ctx.operations.abort(handle, new Error('没有写入任何包'))
      return { ...value, parse: null }
    }
    await step('parse', 1)
    const parse = await afterBrewChange(ctx, s, handle.target, signal)
    await step('publish', 2)
    const view = await publishBrew(ctx, s, handle, parse)
    return { ...value, parse, view: view.id }
  } catch (e) {
    await ctx.operations.abort(handle, e)
    throw e
  }
}

export async function brewAddUrl(ctx: BrewContext, sourceId: string, url: string, onProgress?: BrewProgress, signal?: AbortSignal): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport; view?: string }> {
  const result = await downloadBrew(ctx, sourceId, 'brew-add', '下载自制包', async (frame) => {
    const r = await frame.call('brewAddUrl', url)
    if (!r.value.length) {
      ctx.onLog?.({ level: 'error', source: sourceId, kind: 'brew-add', message: `下载没有完成：${url}`, detail: r.errors })
      throw new Error('下载没有完成（网络中断或文件取不到），已丢弃这次下了一半的内容，原有内容没有变化')
    }
    return r
  }, () => true, signal, onProgress)
  return { ...result, parse: result.parse! }
}

export function brewInstallSources(ctx: BrewContext, sourceId: string, sources: string[], signal?: AbortSignal): Promise<WithErrors<{ added: BrewEntry[]; notFound: string[] }> & { parse: BrewParseReport | null; view?: string }> {
  return downloadBrew(ctx, sourceId, 'brew-deps', '下载缺的依赖包', (frame) => frame.call('brewAddSources', sources), (r) => !!r.value.added.length, signal)
}

/** 作者导入成没成：作者出错时整批不加、返回空并抛错；加进了包，或者一条错都没有，就是成了（同一个文件再导一次作者不重复加，也算成）。 */
export const authorImportOk = (r: { value: { added: unknown[] }; errors: unknown[] }): boolean => r.value.added.length > 0 || r.errors.length === 0

/**
 * 导入本地文件。先按这套资料集的数据格式认文件（P5.5 A3，formats.ts）：不是这种格式的拒收并写明原因，不交给作者；
 * 一个都认不出就报错（什么都不改）。不是合法 JSON 的照旧交给作者，作者列进 notJson。
 */
export async function brewImport(ctx: BrewContext, sourceId: string, files: Array<{ name: string; text: string }>) {
  const s = brewSource(sourceId)
  const { accepted, rejected } = splitRecognized(formatOfCodeSet(s.codeSet), files)
  if (!accepted.length) throw new Error(`没有可以导入的文件：${rejected.map((x) => `${x.name}：${x.reason}`).join('；')}`)
  const handle = await ctx.operations.begin({ kind: 'brew-import', set: s.id, codeSet: s.codeSet })
  try {
    const r = await (await ctx.frame(s.codeSet, handle.target)).call('brewAddFiles', accepted)
    // 成没成按作者自己的结果判断：作者导入出错时整批不加（返回空、错误用 setTimeout 抛出）。
    // 作者容忍的错误（例如断网取不到自制来源索引，作者注明"支持离线导入文件"，utils-brew-base.js _pGetBrewDependencies_getBrewIndex）
    // 也会被小窗当作未处理错误收进 errors；这类不算导入失败，记进日志。
    const ok = authorImportOk(r)
    if (ok && r.errors.length) ctx.onLog?.({ level: 'warn', source: s.id, kind: 'brew-import-author-errors', message: `导入成功，作者程序另报了 ${r.errors.length} 条错`, detail: r.errors })
    const parse = await afterBrewChange(ctx, s, handle.target)
    const view = await publishBrew(ctx, s, handle, parse)
    return { ...r, ok, rejected, parse, view: view.id }
  } catch (e) {
    await ctx.operations.abort(handle, e)
    throw e
  }
}

export async function brewDelete(ctx: BrewContext, sourceId: string, docIdLocals: string[], supplied?: OperationHandle): Promise<WithErrors<number> & { parse: BrewParseReport; view?: string }> {
  const s = brewSource(sourceId)
  const own = !supplied
  const handle = supplied ?? await ctx.operations.begin({ kind: 'brew-delete', set: s.id, codeSet: s.codeSet })
  try {
    const { value, parse } = await prepareBrewDelete(ctx, sourceId, docIdLocals, handle.target)
    const view = await publishBrew(ctx, s, handle, parse)
    return { ...value, parse, view: view.id }
  } catch (e) {
    if (own) await ctx.operations.abort(handle, e)
    throw e
  }
}

export function brewPull(ctx: BrewContext, sourceId: string, docIdLocals: string[] | null = null, signal?: AbortSignal): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport | null; view?: string }> {
  return downloadBrew(ctx, sourceId, 'brew-pull', '更新自制包', async (frame) => {
    const r = await frame.call('brewPull', docIdLocals)
    if (!r.value.length && r.errors.length) throw new Error(r.errors[0])
    return r
  }, (r) => !!r.value.length, signal)
}
