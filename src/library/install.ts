// 安装一套官方数据（D2-P2 B1 设计 §8.2、§8.2.1、§11 第 1、2、5 层）：
// 空间检查 → 按作者离线规则下载 → 镜像核对 → 全量解析（作者加载器登记表 + 作者书目）→ 与作者搜索索引对账。
// 解析只读本地（小窗不许联网），用来证明下载的文件是全的。插件不碰字段，只存作者对象整个原样。
import type { LibraryDatabase } from './db'
import type { FileProvider } from './files'
import type { AuthorFrame } from './runtime/host'
import { precachePlan } from './plan'
import { commitOf, type SourceEntry } from './sources'
import { precomputeSource, type PrecomputeReport } from './cache'
import { DocumentStore } from './documents'

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
  plan: { files: number; bytes: number }
  download: { fetched: number; reused: number; failed: Array<{ path: string; error: string }> }
  /** 第 1 层：本地 = 云端镜像。 */
  mirror: { checked: number; missing: string[]; mismatched: string[] }
  /** 第 2 层：作者加载器每一类、每一本都跑通。 */
  parse: {
    props: Record<string, { count: number; noHash: number }>
    corpora: Record<string, { count: number; failed: Array<{ id: string; error: string }> }>
    notRun: Array<{ props: string[]; reason: string }>
    errors: Array<{ prop: string; error: string }>
  }
  /** 第 5 层（辅助）：作者搜索索引对账。 */
  index: Record<string, { parsed: number; index: number; onlyParsed: number; onlyIndex: number; samplesOnlyParsed: string[]; samplesOnlyIndex: string[] }>
  /** 文档类数据（规则速查、城主屏参考）：作者当小册子读，不走条目加载器（P5 B-02）。 */
  documents?: { count: number; error?: string }
  /** 装完作者数据后算好的离线缓存（配图描述、屏蔽标记、搜索索引）。 */
  precompute?: PrecomputeReport
  /** 用户取消了（下载到一半停下；已下载的文件留着，再装就是续传）。 */
  cancelled?: boolean
  ms: number
}

export interface InstallOptions {
  source: SourceEntry
  db: LibraryDatabase
  files: FileProvider
  /** 开一个只读本地的作者小窗（解析用）。 */
  openFrame: () => Promise<AuthorFrame>
  onProgress?: (p: { stage: string; done: number; total: number; item?: string }) => void
  concurrency?: number
  /** 取消：下载阶段每个文件前检查；取消后不解析，安装记录标 cancelled。 */
  signal?: AbortSignal
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

async function pool<T>(items: T[], n: number, fn: (it: T) => Promise<void>): Promise<void> {
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) await fn(items[i++])
  }))
}

export function parsedKey(sourceId: string, prop: string, corpusId?: string): string {
  return corpusId ? `parsed:${sourceId}:corpus:${prop}:${corpusId}` : `parsed:${sourceId}:${prop}`
}

export async function installOfficial({ source, db, files, openFrame, onProgress, concurrency = 6, signal }: InstallOptions): Promise<InstallReport> {
  const t0 = Date.now()
  const commit = commitOf(source)
  const storage = await storageEstimate()
  const list = await files.fileList(source)
  const plan = precachePlan(list)
  const report: InstallReport = {
    source: source.id, commit, storage, plan: { files: plan.files.length, bytes: plan.bytes },
    download: { fetched: 0, reused: 0, failed: [] }, mirror: { checked: 0, missing: [], mismatched: [] },
    parse: { props: {}, corpora: {}, notRun: [], errors: [] }, index: {}, ms: 0,
  }
  const setRecord = (status: string, extra: Record<string, unknown> = {}) => db.sets.put({ id: source.id, commit, status, plan: report.plan, updatedAt: Date.now(), ...extra })

  // 下载（已存的跳过 → 中断后再点安装就是续传）
  await setRecord('downloading')
  let done = 0
  await pool(plan.files, concurrency, async (path) => {
    if (signal?.aborted) return
    try {
      const had = await files.local(source, path)
      if (had === null) {
        await files.get(source, path, { allowNetwork: true })
        report.download.fetched++
      } else report.download.reused++
    } catch (e) {
      report.download.failed.push({ path, error: msg(e) })
    }
    onProgress?.({ stage: 'download', done: ++done, total: plan.files.length, item: path })
  })

  if (signal?.aborted) {
    report.cancelled = true
    report.ms = Date.now() - t0
    await setRecord('cancelled', { ms: report.ms })
    return report
  }

  // 第 1 层：镜像
  onProgress?.({ stage: 'mirror', done: 0, total: plan.files.length })
  for (const path of plan.files) {
    const rec = await db.files.get([source.id, path])
    report.mirror.checked++
    if (!rec || rec.commit !== commit) report.mirror.missing.push(path)
    else if (rec.gitSha !== list[path].sha || rec.size !== list[path].size) report.mirror.mismatched.push(path)
  }

  // 全量解析（第 2 层）
  await setRecord('parsing')
  onProgress?.({ stage: 'open-frame', done: 0, total: 0 })
  const frame = await openFrame()
  try {
    const parsedHashes: Record<string, Set<string>> = {}
    try {
      onProgress?.({ stage: 'author-init', done: 0, total: 0 })
      await frame.call('init')
    } catch (e) {
      // 作者程序初始化失败时只报这一条，不让后面每一类都重复报同一个错
      report.parse.errors.push({ prop: '(作者程序初始化)', error: msg(e) })
      throw e
    }
    onProgress?.({ stage: 'loaders', done: 0, total: 0 })
    const loaders = await frame.call('loaders')
    let n = 0
    for (const loader of loaders) {
      onProgress?.({ stage: 'parse', done: n++, total: loaders.length, item: loader.props.join('/') })
      if (loader.kind === 'corpus') {
        const prop = loader.props[0]
        if (loader.props.includes('adventureData')) {
          report.parse.notRun.push({ props: loader.props, reason: '冒险正文按需下载（作者离线规则），用到哪本再解析哪本' })
          continue
        }
        const entry: InstallReport['parse']['corpora'][string] = (report.parse.corpora[prop] = { count: 0, failed: [] })
        try {
          for (const it of await frame.call('corpusList', loader.index!, prop, loader.page!)) {
            try {
              onProgress?.({ stage: 'parse-corpus', done: entry.count, total: 0, item: it.id })
              const value = await frame.call('parseCorpus', loader.page!, it.source, it.hash)
              await db.derived.put({ key: parsedKey(source.id, prop, it.id), fingerprint: commit, value, savedAt: Date.now() })
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
        // 作者用名字前缀 raw_ 标加载器的中间草稿层（utils-dataloader-dataloader.js 第 27 行 `raw_${prop}`），不是最终输出
        if (prop.startsWith('raw_')) {
          report.parse.notRun.push({ props: [prop], reason: '作者加载器的中间草稿层（raw_ 前缀），不是最终输出' })
          continue
        }
        try {
          onProgress?.({ stage: 'parse-prop', done: 0, total: 0, item: prop })
          const parsed = await frame.call('parseProp', prop)
          const { items, hashes } = parsed
          await db.derived.put({ key: parsedKey(source.id, prop), fingerprint: commit, value: parsed, savedAt: Date.now() })
          report.parse.props[prop] = { count: items.length, noHash: hashes.filter((h) => h === null).length }
          parsedHashes[prop] = new Set(hashes.filter((h): h is string => h !== null))
        } catch (e) {
          report.parse.errors.push({ prop, error: msg(e) })
        }
      }
    }

    // 第 5 层（辅助）：作者搜索索引对账
    try {
      onProgress?.({ stage: 'index', done: 0, total: 0 })
      const index = await frame.call('searchIndexHashes')
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
      onProgress?.({ stage: 'documents', done: 0, total: 0 })
      report.documents = { count: (await new DocumentStore(db).build(source)).length }
    } catch (e) {
      report.documents = { count: 0, error: msg(e) }
    }

    // 第 6 层：把看资料 / 搜索要用的东西一次算好存库（S1）。
    try {
      onProgress?.({ stage: 'precompute', done: 0, total: 0 })
      report.precompute = await precomputeSource({ source, db, frame, fluff: true, excluded: true, search: true })
    } catch (e) {
      report.parse.errors.push({ prop: '(预计算缓存)', error: msg(e) })
    }
  } catch (e) {
    if (!report.parse.errors.length) report.parse.errors.push({ prop: '(解析)', error: msg(e) })
  } finally {
    frame.close()
  }

  onProgress?.({ stage: 'save', done: 0, total: 0 })
  report.ms = Date.now() - t0
  const ok = !report.download.failed.length && !report.mirror.missing.length && !report.mirror.mismatched.length && !report.parse.errors.length
    && Object.values(report.parse.corpora).every((c) => !c.failed.length)
  await db.derived.put({ key: `audit:${source.id}`, fingerprint: commit, value: report, savedAt: Date.now() })
  await setRecord(ok ? 'installed' : 'failed', { ms: report.ms })
  return report
}
