// 失败安装报告：直接抛错（打开作者小窗 / 取文件清单等）也要进体检，不能只留日志。
import type { InstallReport } from './install'
import type { SourceEntry } from './sources'

export function failedInstallReport(source: SourceEntry, error: unknown): InstallReport {
  const message = error instanceof Error ? error.message : String(error)
  const empty = { files: 0, bytes: 0 }
  return {
    source: source.id, commit: '', storage: { persisted: null, quota: null, usage: null },
    plan: { ...empty, shared: empty, bySource: empty, byBook: empty, byClass: empty, byAdventure: empty, missing: { sources: [], books: [] } },
    download: { fetched: 0, reused: 0, failed: [{ path: '(准备阶段)', error: message }] },
    mirror: { checked: 0, missing: [], mismatched: [] },
    parse: { props: {}, corpora: {}, notRun: [], errors: [] }, index: {},
    publishable: false, reasons: [message], settlementReady: false, ms: 0,
  }
}
