import { describe, expect, it } from 'vitest'
import { healthOf, type HealthContext } from '../../../src/library/service-health'
import type { InstallReport } from '../../../src/library/install'
import type { LibraryView } from '../../../src/library/revision'

describe('体检读取失败安装报告（P5 核验）', () => {
  it('当前版本没有 audit，但最近一次失败报告存在：体检仍列出失败阶段', async () => {
    const failed = {
      source: 'cn-official', commit: 'c', storage: { persisted: null, quota: null, usage: null },
      plan: { files: 1, bytes: 1 }, download: { fetched: 0, reused: 0, failed: [{ path: 'data/x.json', error: '断网' }] },
      mirror: { checked: 1, missing: [], mismatched: [] },
      parse: { props: {}, corpora: {}, notRun: [], errors: [] }, index: {},
      publishable: false, reasons: ['下载失败'], settlementReady: false, ms: 1,
    } as InstallReport
    const view = {
      commitOf: async () => 'c', officialState: async () => null, brewState: async () => null,
      derivedGet: async () => undefined,
    } as unknown as LibraryView
    const ctx: HealthContext = {
      report: async () => ({ parse: { props: {} } }),
      parsed: async () => ({ items: [], hashes: [], sources: [] }),
      englishPairs: async () => ({ source: 'cn-official', pair: 'en-official', pairs: {}, unmatched: [], via: {}, located: 0 }),
      frame: async () => { throw new Error('不该开') },
      stored: async (key) => (key === 'audit:last-failed:cn-official' ? { value: failed, stale: false } : undefined) as never,
      brewSourceCounts: async () => ({}),
    }
    const report = await healthOf(ctx, view)
    expect(report.items.some((i) => i.check === 'download' && i.level === 'error')).toBe(true)
  })
})
