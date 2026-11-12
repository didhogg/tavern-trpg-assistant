import type { FileList } from './fetcher'
import type { OfficialPlan } from './plan'
import type { LibraryView } from './revision'
import type { InstallOptions, InstallReport } from './install'
import { extendOfficialPlan } from './official-dependencies'

async function pool<T>(items: T[], n: number, fn: (it: T) => Promise<void>): Promise<void> {
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) await fn(items[i++])
  }))
}

/** 先取用户所选和共用原件，再按作者原件里声明的依赖递归补文件。 */
export async function downloadOfficial(opts: InstallOptions & { view: LibraryView }, list: FileList, plan: OfficialPlan, report: InstallReport, commit: string): Promise<OfficialPlan> {
  const { source, files, view } = opts
  // 下载到准备版本（沿父版本已存在的同指纹文件直接复用）
  let done = 0
  const download = async (path: string): Promise<string | null> => {
    if (opts.signal?.aborted || report.download.failed.length) return null
    const expected = list[path]
    try {
      const had = await files.record(source, path, view)
      if (had?.gitSha === expected.sha) { report.download.reused++; return had.text }
      const cached = await files.cachedContent(source, path, expected.sha)
      if (cached !== null) {
        await view.filePut(source, path, { commit, text: cached, gitSha: expected.sha, size: expected.size })
        report.download.reused++
        return cached
      }
      const pinned = opts.fileOverrides?.[path]
      const text = await files.get(source, path, { allowNetwork: true, view, ...(pinned ? { commit: pinned.commit } : {}), ...(opts.signal ? { signal: opts.signal } : {}) })
      report.download.fetched++
      return text
    } catch (e) {
      if (!opts.signal?.aborted) report.download.failed.push({ path, error: e instanceof Error ? e.message : String(e) })
      return null
    } finally {
      opts.onProgress?.({ stage: 'download', done: ++done, total: Math.max(done, plan.files.length), item: path })
    }
  }
  await pool(plan.files, opts.concurrency ?? 6, async (path) => { await download(path) })
  if (!opts.signal?.aborted && !report.download.failed.length) {
    const roots = new Set(plan.files)
    const expanded = await extendOfficialPlan(plan, list, source.codeSet, (path) => {
      if (opts.signal?.aborted) return Promise.resolve(null)
      return roots.has(path) ? files.local(source, path, view) : list[path] ? download(path) : Promise.resolve(null)
    }, opts.concurrency)
    plan = expanded.plan
    report.dependencyFiles = expanded.dependencies
    report.plan.files = plan.files.length
    report.plan.bytes = plan.bytes
    report.plan.bySource = { files: plan.bySource.files.length, bytes: plan.bySource.bytes }
  }
  return plan
}
