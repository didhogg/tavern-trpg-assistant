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

export interface BrewContext {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  operations: LibraryOperations
  openFrame: (codeSet: string, ctx?: { view?: LibraryView; kvScope?: string; filterIndex?: boolean }) => Promise<AuthorFrame>
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
export async function afterBrewChange(ctx: BrewContext, s: SourceEntry, view: LibraryView): Promise<BrewParseReport> {
  const report = await parseBrew({
    source: s, db: ctx.db, view,
    openFrame: () => ctx.openFrame(s.codeSet, { view, filterIndex: true }),
    openFrameIn: (scope) => ctx.openFrame(s.codeSet, { view, kvScope: scope, filterIndex: true }),
  })
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
  const value = await (await ctx.frame(s.codeSet, view)).call('brewDelete', docIdLocals)
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

export async function brewAddUrl(ctx: BrewContext, sourceId: string, url: string): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport; view?: string }> {
  const s = brewSource(sourceId)
  const handle = await ctx.operations.begin({ kind: 'brew-add', set: s.id, codeSet: s.codeSet })
  try {
    const r = await withTimeout(async () => (await ctx.frame(s.codeSet, handle.target)).call('brewAddUrl', url), '下载自制包')
    // 作者网络出错时自己吞掉错误、什么都不装（返回空）：这时作废这次准备版本（下了一半的东西不进书架），报明确的失败给界面出横幅
    if (!r.value.length) {
      // 作者的原始报错（带地址、状态码）只进日志页，横幅里只说人话
      ctx.onLog?.({ level: 'error', source: s.id, kind: 'brew-add', message: `下载没有完成：${url}`, detail: r.errors })
      throw new Error('下载没有完成（网络中断或文件取不到），已丢弃这次下了一半的内容，原有内容没有变化')
    }
    const parse = await afterBrewChange(ctx, s, handle.target)
    const view = await publishBrew(ctx, s, handle, parse)
    return { ...r, parse, view: view.id }
  } catch (e) {
    await ctx.operations.abort(handle, e)
    throw e
  }
}

export async function brewInstallSources(ctx: BrewContext, sourceId: string, sources: string[]): Promise<WithErrors<{ added: BrewEntry[]; notFound: string[] }> & { parse: BrewParseReport | null; view?: string }> {
  const s = brewSource(sourceId)
  const handle = await ctx.operations.begin({ kind: 'brew-deps', set: s.id, codeSet: s.codeSet })
  try {
    const r = await withTimeout(async () => (await ctx.frame(s.codeSet, handle.target)).call('brewAddSources', sources), '下载缺的依赖包')
    const parse = r.value.added.length ? await afterBrewChange(ctx, s, handle.target) : null
    if (parse) {
      const view = await publishBrew(ctx, s, handle, parse)
      return { ...r, parse, view: view.id }
    }
    await ctx.operations.abort(handle, new Error('没有装进任何包'))
    return { ...r, parse: null }
  } catch (e) {
    await ctx.operations.abort(handle, e)
    throw e
  }
}

export async function brewImport(ctx: BrewContext, sourceId: string, files: Array<{ name: string; text: string }>) {
  const s = brewSource(sourceId)
  const handle = await ctx.operations.begin({ kind: 'brew-import', set: s.id, codeSet: s.codeSet })
  try {
    const r = await (await ctx.frame(s.codeSet, handle.target)).call('brewAddFiles', files)
    const parse = await afterBrewChange(ctx, s, handle.target)
    const view = await publishBrew(ctx, s, handle, parse)
    return { ...r, parse, view: view.id }
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
    const r = await (await ctx.frame(s.codeSet, handle.target)).call('brewDelete', docIdLocals)
    const parse = await afterBrewChange(ctx, s, handle.target)
    const view = await publishBrew(ctx, s, handle, parse)
    return { ...r, parse, view: view.id }
  } catch (e) {
    if (own) await ctx.operations.abort(handle, e)
    throw e
  }
}

export async function brewPull(ctx: BrewContext, sourceId: string, docIdLocals: string[] | null = null): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport | null; view?: string }> {
  const s = brewSource(sourceId)
  const handle = await ctx.operations.begin({ kind: 'brew-pull', set: s.id, codeSet: s.codeSet })
  try {
    const r = await (await ctx.frame(s.codeSet, handle.target)).call('brewPull', docIdLocals)
    const parse = r.value.length ? await afterBrewChange(ctx, s, handle.target) : null
    if (parse) {
      const view = await publishBrew(ctx, s, handle, parse)
      return { ...r, parse, view: view.id }
    }
    await ctx.operations.abort(handle, new Error('没有更新任何包'))
    return { ...r, parse: null }
  } catch (e) {
    await ctx.operations.abort(handle, e)
    throw e
  }
}
