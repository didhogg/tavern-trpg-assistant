// 安装一套官方数据（D2-P2 B1 设计 §8.2、§8.2.1、§11 第 1、2、5 层；P5 T1/T2 改为版本化准备与发布）：
// 空间检查 → 按作者离线 / 按书计划下载到准备版本 → 镜像核对 → 作者加载器解析到准备版本 → 检查 → 发布。
// 解析只读本地（小窗不许联网），用来证明下载的文件是全的。插件不碰字段，只存作者对象整个原样。
import type { LibraryDatabase, OfficialSetState } from './db'
import type { FileProvider } from './files'
import type { AuthorFrame } from './runtime/host'
import { fullPlan, isAdventure, isPrecache, precachePlan, type OfficialPlan } from './plan'
import type { LibraryRevisionStore, LibraryView } from './revision'
import { LibraryOperations } from './operations'
import { invalidatePrecompute, precomputeSource, type PrecomputeReport } from './cache'
import { failedInstallReport } from './install-report'
import { DocumentStore } from './documents'
import { EMBEDDED_PROP, EmbeddedTables } from './embedded-tables'
import type { SourceEntry } from './sources'
const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))
export interface StorageEstimate {
  persisted: boolean | null
  quota: number | null
  usage: number | null
}

/** 照作者离线预载的做法：先申请持久存储，再估算剩余空间（navigation.js 的预载按钮）。 */
export async function storageEstimate(): Promise<StorageEstimate> {
  const s = typeof navigator !== 'undefined' ? navigator.storage : undefined
  if (!s) return { persisted: null, quota: null, usage: null }
  const persisted = (await s.persist?.()) ?? null
  const { quota = null, usage = null } = (await s.estimate?.()) ?? {}
  return { persisted, quota, usage }
}

export interface InstallReport {
  source: string
  commit: string
  storage: StorageEstimate
  plan: {
    files: number; bytes: number
    shared?: { files: number; bytes: number }
    bySource?: { files: number; bytes: number }
    byBook?: { files: number; bytes: number }
    byClass?: { files: number; bytes: number }
    byAdventure?: { files: number; bytes: number }
    missing?: { sources: string[]; books: string[] }
  }
  download: { fetched: number; reused: number; failed: Array<{ path: string; error: string }> }
  /** 第 1 层：本地 = 云端镜像。 */
  mirror: { checked: number; missing: string[]; mismatched: string[] }
  /** 第 2 层：作者加载器每一类、每一本都跑通。 */
  parse: {
    props: Record<string, { count: number; noHash: number }>
    corpora: Record<string, { count: number; skipped: number; failed: Array<{ id: string; error: string }> }>
    notRun: Array<{ props: string[]; reason: string }>
    errors: Array<{ prop: string; error: string }>
  }
  /** 第 5 层（辅助）：作者搜索索引对账（按这次可见来源过滤后的索引）。 */
  index: Record<string, { parsed: number; index: number; onlyParsed: number; onlyIndex: number; samplesOnlyParsed: string[]; samplesOnlyIndex: string[] }>
  /** 文档类数据（规则速查、城主屏参考）：作者当小册子读，不走条目加载器（P5 B-02）。 */
  documents?: { count: number; error?: string }
  /** 埋在条目正文里的表格（作者 table 类别之外的），提出来存成独立类别（P5 B-09）。 */
  embeddedTables?: { count: number; error?: string }
  /** 装完作者数据后算好的离线缓存（配图描述、屏蔽标记、搜索索引）。 */
  precompute?: PrecomputeReport
  /** 预计算 / 换算失败；不阻止资料发布，但结算未就绪。 */
  precomputeError?: string
  /** 这次能不能发布（下载 / 镜像 / 解析 / 选中书正文全部成功）。 */
  publishable: boolean
  /** 用户暂停：没有发布，已校验文件留给后续继续复用。 */
  paused?: boolean
  /** 不能发布的原因；可发布时为空。 */
  reasons: string[]
  /** 资料可浏览，但结算准备失败（换算 / 预计算）；单独重试，不重下资料。 */
  settlementReady: boolean
  /** 发布后的版本编号（包装器 installOfficial 填）。 */
  revision?: string
  /** 用户取消了（下载到一半停下；已下载的文件留在准备区，再装可复用）。 */
  cancelled?: boolean
  ms: number
}
export interface InstallOptions {
  source: SourceEntry
  db: LibraryDatabase
  files: FileProvider
  revisions: LibraryRevisionStore
  /** 开一个绑定到指定版本的作者小窗（解析用）。 */
  openFrame: (view: LibraryView) => Promise<AuthorFrame>
  /** 包装器 installOfficial 自己开操作时用；不给就现建一个。 */
  operations?: LibraryOperations
  /** 已有计划（按书 / 更新）；不给就整套预载。 */
  plan?: OfficialPlan
  /** 准备版本；不给时 installOfficial 自己开一个操作。 */
  view?: LibraryView
  /** 这次安装的可见来源 / 书 / 冒险；null = 全部（旧整套安装）。 */
  sources?: string[] | null
  books?: string[] | null
  adventures?: string[] | null
  onProgress?: (p: { stage: string; done: number; total: number; item?: string }) => void
  concurrency?: number
  signal?: AbortSignal
  /** 失败安装报告单独保存（不进准备版本）。 */
  onDiagnostic?: (setId: string, report: InstallReport) => Promise<void>
  /** 下载 / 解析边界检查；返回 pause 时停在安全边界、作废准备版本。 */
  onCheckpoint?: () => 'continue' | 'pause'
}


async function pool<T>(items: T[], n: number, fn: (it: T) => Promise<void>): Promise<void> {
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) await fn(items[i++])
  }))
}

export async function installedAdventureIds(view: LibraryView, setId: string): Promise<string[]> {
  const prefix = `parsed:${setId}:corpus:`
  const out: string[] = []
  for (const key of (await view.derivedKeys(prefix)).keys()) {
    const rest = key.slice(prefix.length)
    const at = rest.lastIndexOf(':')
    if (at > 0) out.push(rest.slice(at + 1))
  }
  return [...new Set(out)].sort()
}

export function parsedKey(sourceId: string, prop: string, corpusId?: string): string {
  return corpusId ? `parsed:${sourceId}:corpus:${prop}:${corpusId}` : `parsed:${sourceId}:${prop}`
}

/**
 * 数一数解析记录里每个来源有几条。书 / 冒险正文那种记录（键带 corpus:）和没有来源列表的记录不是"按条目解析"的结果，一律跳过。
 * 书架数来源（scoped.sourceCounts）、体检数自制来源（service.brewSourceCounts）共用这一处，两边不会再不一样。
 */
export function countSources(records: Array<{ key: string; value: unknown }>, prefix: string, { lower = false }: { lower?: boolean } = {}): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const rec of records) {
    if (rec.key.slice(prefix.length).startsWith('corpus:')) continue
    const sources = (rec.value as { sources?: unknown } | null | undefined)?.sources
    if (!Array.isArray(sources)) continue
    for (const src of sources) {
      if (typeof src !== 'string' || !src) continue
      const k = lower ? src.toLowerCase() : src
      counts[k] = (counts[k] ?? 0) + 1
    }
  }
  return counts
}

/** 准备版本里的安装 / 解析；不发布。调用方负责操作生命周期或直接发布。 */
export async function prepareOfficial(opts: InstallOptions & { view: LibraryView }): Promise<InstallReport> {
  const { source, db, files, view } = opts
  const t0 = Date.now()
  const commit = await view.commitOf(source)
  const storage = await storageEstimate()
  const list = await files.fileList(source, view, { ...(opts.signal ? { signal: opts.signal } : {}) })
  const plan = opts.plan ?? fullPlan(precachePlan(list))
  const report: InstallReport = {
    source: source.id, commit, storage,
    plan: {
      files: plan.files.length, bytes: plan.bytes,
      shared: { files: plan.shared.files.length, bytes: plan.shared.bytes },
      bySource: { files: plan.bySource.files.length, bytes: plan.bySource.bytes },
      byBook: { files: plan.byBook.files.length, bytes: plan.byBook.bytes },
      byClass: { files: plan.byClass.files.length, bytes: plan.byClass.bytes },
      byAdventure: { files: plan.byAdventure.files.length, bytes: plan.byAdventure.bytes },
      missing: plan.missing,
    },
    download: { fetched: 0, reused: 0, failed: [] }, mirror: { checked: 0, missing: [], mismatched: [] },
    parse: { props: {}, corpora: {}, notRun: [], errors: [] }, index: {},
    publishable: true, reasons: [], settlementReady: true, ms: 0,
  }
  const sources = opts.sources ?? plan.sources
  const books = opts.books ?? plan.books
  // 先把旧版本的解析结果 / 文件引用在准备版本里挡住；失败时准备版本作废，父版本不动。
  for (const key of (await view.derivedKeys(`parsed:${source.id}:`)).keys()) await view.derivedDelete(key)
  for (const path of await view.filePaths(source)) {
    if (isPrecache(path) && !plan.files.includes(path)) await view.fileRemove(source, path, commit)
    else if (isAdventure(path) && opts.adventures && !plan.files.includes(path)) await view.fileRemove(source, path, commit)
  }
  if (plan.missing.sources.length || plan.missing.books.length || (plan.missing.adventures?.length ?? 0)) {
    report.reasons.push(`作者目录里找不到这些书 / 来源 / 冒险：${[...plan.missing.sources, ...plan.missing.books, ...(plan.missing.adventures ?? [])].join('、')}`)
  }

  // 下载到准备版本（沿父版本已存在的同指纹文件直接复用）
  let done = 0
  await pool(plan.files, opts.concurrency ?? 6, async (path) => {
    if (opts.signal?.aborted || opts.onCheckpoint?.() === 'pause') return
    const expected = list[path]
    try {
      const had = await files.record(source, path, view)
      if (had && had.gitSha === expected.sha) report.download.reused++
      else {
        const cached = await files.cachedContent(source, path, expected.sha)
        if (cached !== null) {
          await view.filePut(source, path, { commit, text: cached, gitSha: expected.sha, size: expected.size })
          report.download.reused++
        } else {
          await files.get(source, path, { allowNetwork: true, view, ...(opts.signal ? { signal: opts.signal } : {}) })
          report.download.fetched++
        }
      }
    } catch (e) {
      report.download.failed.push({ path, error: msg(e) })
    }
    opts.onProgress?.({ stage: 'download', done: ++done, total: plan.files.length, item: path })
  })

  if (opts.signal?.aborted) {
    report.cancelled = true
    report.ms = Date.now() - t0
    return report
  }
  if (opts.onCheckpoint?.() === 'pause') {
    report.paused = true
    report.ms = Date.now() - t0
    return report
  }

  // 第 1 层：镜像
  opts.onProgress?.({ stage: 'mirror', done: 0, total: plan.files.length })
  for (const path of plan.files) {
    const rec = await files.record(source, path, view)
    report.mirror.checked++
    if (!rec) report.mirror.missing.push(path)
    else if (rec.gitSha !== list[path].sha || rec.size !== list[path].size) report.mirror.mismatched.push(path)
  }

  // 全量解析（第 2 层）；只解析这次选中的书 / 来源
  opts.onProgress?.({ stage: 'open-frame', done: 0, total: 0 })
  const frame = await opts.openFrame(view)
  try {
    const parsedHashes: Record<string, Set<string>> = {}
    try {
      opts.onProgress?.({ stage: 'author-init', done: 0, total: 0 })
      await frame.call('init')
    } catch (e) {
      report.parse.errors.push({ prop: '(作者程序初始化)', error: msg(e) })
      throw e
    }
    opts.onProgress?.({ stage: 'loaders', done: 0, total: 0 })
    const loaders = await frame.call('loaders')
    let n = 0
    for (const loader of loaders) {
      if (opts.onCheckpoint?.() === 'pause') { report.paused = true; report.ms = Date.now() - t0; return report }
      opts.onProgress?.({ stage: 'parse', done: n++, total: loaders.length, item: loader.props.join('/') })
      if (loader.kind === 'corpus') {
        const prop = loader.props[0]
        if (loader.props.includes('adventureData')) {
          const prop = loader.props[0]
          const entry: InstallReport['parse']['corpora'][string] = (report.parse.corpora[prop] = { count: 0, skipped: 0, failed: [] })
          try {
            const allowed = opts.adventures ? new Set(opts.adventures) : new Set<string>()
            for (const it of await frame.call('corpusList', loader.index!, prop, loader.page!)) {
              if (opts.onCheckpoint?.() === 'pause') { report.paused = true; report.ms = Date.now() - t0; return report }
              if (!allowed.has(it.id)) { entry.skipped++; continue }
              try {
                opts.onProgress?.({ stage: 'parse-corpus', done: entry.count, total: 0, item: it.id })
                await view.derivedPut(parsedKey(source.id, prop, it.id), commit, await frame.call('parseCorpus', loader.page!, it.source, it.hash))
                entry.count++
              } catch (e) { entry.failed.push({ id: it.id, error: msg(e) }) }
            }
          } catch (e) { report.parse.errors.push({ prop, error: msg(e) }) }
          continue
        }
        const entry: InstallReport['parse']['corpora'][string] = (report.parse.corpora[prop] = { count: 0, skipped: 0, failed: [] })
        try {
          for (const it of await frame.call('corpusList', loader.index!, prop, loader.page!)) {
            if (opts.onCheckpoint?.() === 'pause') { report.paused = true; report.ms = Date.now() - t0; return report }
            if (books && !books.includes(it.id)) { entry.skipped++; continue }
            try {
              opts.onProgress?.({ stage: 'parse-corpus', done: entry.count, total: 0, item: it.id })
              const value = await frame.call('parseCorpus', loader.page!, it.source, it.hash)
              await view.derivedPut(parsedKey(source.id, prop, it.id), commit, value)
              entry.count++
            } catch (e) {
              entry.failed.push({ id: it.id, error: msg(e) })
            }
          }
        } catch (e) {
          report.parse.errors.push({ prop, error: msg(e) })
        }
        continue
      }
      for (const prop of loader.props) {
        if (opts.onCheckpoint?.() === 'pause') { report.paused = true; report.ms = Date.now() - t0; return report }
        // 作者用名字前缀 raw_ 标加载器的中间草稿层（utils-dataloader-dataloader.js 第 27 行 `raw_${prop}`），不是最终输出
        if (prop.startsWith('raw_')) {
          report.parse.notRun.push({ props: [prop], reason: '作者加载器的中间草稿层（raw_ 前缀），不是最终输出' })
          continue
        }
        try {
          opts.onProgress?.({ stage: 'parse-prop', done: 0, total: 0, item: prop })
          const parsed = await frame.call('parseProp', prop)
          const { items, hashes } = parsed
          await view.derivedPut(parsedKey(source.id, prop), commit, parsed)
          report.parse.props[prop] = { count: items.length, noHash: hashes.filter((h) => h === null).length }
          parsedHashes[prop] = new Set(hashes.filter((h): h is string => h !== null))
        } catch (e) {
          report.parse.errors.push({ prop, error: msg(e) })
        }
      }
    }

    // 第 5 层（辅助）：作者搜索索引对账；按这次可见来源过滤，避免拿整套索引和部分解析比
    try {
      opts.onProgress?.({ stage: 'index', done: 0, total: 0 })
      const index = await frame.call('searchIndexHashes', sources)
      for (const prop of new Set([...Object.keys(index), ...Object.keys(parsedHashes)])) {
        const a = parsedHashes[prop] ?? new Set<string>()
        const b = new Set(index[prop] ?? [])
        const onlyParsed = [...a].filter((h) => !b.has(h))
        const onlyIndex = [...b].filter((h) => !a.has(h))
        report.index[prop] = { parsed: a.size, index: b.size, onlyParsed: onlyParsed.length, onlyIndex: onlyIndex.length, samplesOnlyParsed: onlyParsed.slice(0, 5), samplesOnlyIndex: onlyIndex.slice(0, 5) }
      }
    } catch (e) {
      report.parse.errors.push({ prop: '(search index)', error: msg(e) })
    }

    // 文档类数据（B-02）：读已下载的 data/generated/bookref-*.json，原样存；失败只记在报告里，不让整套安装失败
    try {
      opts.onProgress?.({ stage: 'documents', done: 0, total: 0 })
      report.documents = { count: (await new DocumentStore(db).build(source, view)).length }
    } catch (e) {
      report.documents = { count: 0, error: msg(e) }
    }

    // 埋在条目里的表格（B-09）：失败只记在报告里，不让整套安装失败
    try {
      opts.onProgress?.({ stage: 'embedded-tables', done: 0, total: 0 })
      const built = await new EmbeddedTables(db, async () => frame).build(source.id, { frame, props: report.parse.props, view })
      report.parse.props[EMBEDDED_PROP] = { count: built.items.length, noHash: 0 }
      report.embeddedTables = { count: built.items.length }
    } catch (e) {
      report.embeddedTables = { count: 0, error: msg(e) }
    }

    // 第 6 层：把看资料 / 搜索要用的东西一次算好存库
    try {
      opts.onProgress?.({ stage: 'precompute', done: 0, total: 0 })
      await invalidatePrecompute(db, source.id, ['fluff', 'excluded', 'search'], view)
      report.precompute = await precomputeSource({ source, db, frame, view, fluff: true, excluded: true, search: true })
      report.settlementReady = true
    } catch (e) {
      report.precomputeError = msg(e)
      report.settlementReady = false
    }
  } catch (e) {
    if (!report.parse.errors.length) report.parse.errors.push({ prop: '(解析)', error: msg(e) })
  } finally {
    frame.close()
  }

  opts.onProgress?.({ stage: 'save', done: 0, total: 0 })
  report.ms = Date.now() - t0
  const corpusFailed = Object.values(report.parse.corpora).some((c) => c.failed.length)
  if (report.download.failed.length) report.reasons.push(`${report.download.failed.length} 个文件没下载下来`)
  if (report.mirror.missing.length || report.mirror.mismatched.length) report.reasons.push('本地文件和云端镜像对不上')
  if (report.parse.errors.length) report.reasons.push('作者加载器解析出错')
  if (corpusFailed) report.reasons.push('选中的书正文解析失败')
  report.publishable = report.reasons.length === 0
  await view.derivedPut(`audit:${source.id}`, commit, report)
  return report
}

/** 安装 / 更新的可见集合：没给就沿用当前版本的设置（旧整套安装为 null）。 */
export async function installOfficial(opts: InstallOptions): Promise<InstallReport> {
  const { revisions, db, source } = opts
  const operations = opts.operations ?? new LibraryOperations({ db, revisions })
  if (opts.view) return prepareOfficial({ ...opts, view: opts.view })
  const handle = await operations.begin({ kind: 'official', set: source.id, codeSet: source.codeSet, sourceIndexes: opts.plan?.sourceIndexes })
  let report: InstallReport | null = null
  try {
    if (opts.plan) await operations.setTargetIndexes(handle, opts.plan.sourceIndexes)
    report = await prepareOfficial({ ...opts, view: handle.target })
    if (report.cancelled) {
      await operations.abort(handle, new Error('已取消'), 'cancelled')
      report.revision = handle.target.id
      return report
    }
    if (!report.publishable) {
      await opts.onDiagnostic?.(source.id, report)
      await operations.abort(handle, new Error(report.reasons.join('；')))
      report.revision = handle.target.id
      return report
    }
    const official: Record<string, OfficialSetState> = {
      [source.id]: {
        commit: report.commit, status: 'installed', sources: opts.sources ?? opts.plan?.sources ?? null, books: opts.books ?? opts.plan?.books ?? null,
        adventures: opts.adventures ?? opts.plan?.adventures ?? null, plan: { files: report.plan.files, bytes: report.plan.bytes },
      },
    }
    const published = await operations.publish(handle, {
      official, sourceIndexes: opts.plan?.sourceIndexes ?? {}, result: report, status: report.settlementReady ? 'done' : 'partial',
    })
    report.revision = published.id
    await db.derived.delete(`audit:last-failed:${source.id}`)
    return report
  } catch (e) {
    if (!report) await opts.onDiagnostic?.(source.id, failedInstallReport(source, e))
    await operations.abort(handle, e)
    throw e
  }
}
