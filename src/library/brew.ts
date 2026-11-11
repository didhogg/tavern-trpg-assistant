// 自制内容的解析（D2-P2 B1 设计 §8.4：装、删、更新自制之后"重开小窗 → 重跑解析"）。
// 和官方的全量解析一样：按作者加载器登记表逐类调作者加载器（读已装自制用 pCacheAndGetAllBrew），结果原样存进库。
// P5 T1/T3：解析写进准备版本；旧的解析结果不删，先写删除记号把父层挡住，失败时旧版本仍可读。
import { buildAlternatives, altsKey, type AltIndex } from './alternatives'
import { precomputeSource, type PrecomputeReport } from './cache'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import type { AuthorFrame } from './runtime/host'
import type { LibraryView } from './revision'
import type { SourceEntry } from './sources'

/** 自制里的书 / 冒险目录：类别（book / adventure）→ 每本的编号、名称、来源、作者编号。 */
export interface CorpusRow { id: string; name: string; source: string; hash: string }
export type BrewCorpora = Record<string, CorpusRow[]>
export const brewCorporaKey = (brewSetId: string): string => `corpora:${brewSetId}`

export interface BrewParseReport {
  source: string
  /** 已装的自制包（作者包头）。 */
  installed: Array<Record<string, unknown>>
  parse: {
    props: Record<string, { count: number; noHash: number }>
    notRun: Array<{ props: string[]; reason: string }>
    errors: Array<{ prop: string; error: string }>
    /** 自制里的书和冒险正文（B-29）：每类解析了几本、失败的。 */
    corpora: Record<string, { count: number; failed: Array<{ id: string; error: string }> }>
    /** 解析期间作者自己报的错误原文（例：自制内容引用了找不到的条目）。内容问题归自制作者，原样交给体检。 */
    authorErrors: string[]
  }
  /** 同编号挂备选（P3-1）：挂了几条、取备选失败的。 */
  alternatives: { targets: number; errors: AltIndex['errors'] }
  /** 改完自制后重算的离线缓存（配图描述、屏蔽标记）。 */
  precompute?: PrecomputeReport
  /** T2 换算段失败原因（不冒充作者解析错误）。 */
  precomputeError?: string
  ms: number
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

/** 用一个新开的小窗在准备版本里重解析这套程序已装的全部自制内容；旧版本数据不删。 */
export async function parseBrew({ source, db, view, openFrame, openFrameIn }: {
  source: SourceEntry
  db: LibraryDatabase
  view: LibraryView
  openFrame: () => Promise<AuthorFrame>
  openFrameIn: (kvScope: string) => Promise<AuthorFrame>
}): Promise<BrewParseReport> {
  const t0 = Date.now()
  const report: BrewParseReport = { source: source.id, installed: [], parse: { props: {}, corpora: {}, notRun: [], errors: [], authorErrors: [] }, alternatives: { targets: 0, errors: [] }, ms: 0 }
  // 先给父层的旧结果写删除记号；下面解析成功再写新结果（某一类没了也不会把旧结果带回来）
  for (const prefix of [`parsed:${source.id}:`, `pre:${source.id}:`, brewCorporaKey(source.id), altsKey(source.id)]) {
    const old = await view.derivedKeys(prefix)
    for (const key of old.keys()) await view.derivedDelete(key)
  }
  const corpora: BrewCorpora = {}
  const frame = await openFrame()
  try {
    report.installed = (await frame.call('brewInstalled')).map((b) => b.head)
    for (const loader of await frame.call('loaders')) {
      if (loader.kind === 'corpus') {
        // 自制里的书和冒险（B-29）：目录取自作者合并后的自制数据，正文走作者加载器（和官方书同一条 parseCorpus）。本地文件，没有"按需下载"
        const prop = loader.props[0]
        const entry: BrewParseReport['parse']['corpora'][string] = (report.parse.corpora[prop] = { count: 0, failed: [] })
        const listed: CorpusRow[] = []
        try {
          for (const it of await frame.call('brewCorpusList', prop, loader.page!)) {
            try {
              await view.derivedPut(parsedKey(source.id, prop, it.id), 'brew', await frame.call('parseCorpus', loader.page!, it.source, it.hash))
              listed.push(it)
              entry.count++
            } catch (e) {
              entry.failed.push({ id: it.id, error: msg(e) })
            }
          }
          if (listed.length) corpora[prop] = listed
        } catch (e) {
          report.parse.errors.push({ prop, error: msg(e) })
        }
        continue
      }
      for (const prop of loader.props) {
        if (prop.startsWith('raw_')) continue
        try {
          const parsed = await frame.call('parseBrewProp', prop)
          if (!parsed.items.length) continue
          await view.derivedPut(parsedKey(source.id, prop), 'brew', parsed)
          report.parse.props[prop] = { count: parsed.items.length, noHash: parsed.hashes.filter((h) => h === null).length }
        } catch (e) {
          report.parse.errors.push({ prop, error: msg(e) })
        }
      }
    }
    await view.derivedPut(brewCorporaKey(source.id), 'brew', corpora)
    report.parse.authorErrors = await frame.call('frameErrors')
    const alts = await buildAlternatives({ source, db, view, frame, openFrameIn })
    report.alternatives = { targets: Object.keys(alts.targets).length, errors: alts.errors }
    try {
      report.precompute = await precomputeSource({ source, db, frame, view, fluff: true, excluded: true, search: false })
    } catch (e) {
      report.precomputeError = msg(e)
    }
  } finally {
    frame.close()
  }
  report.ms = Date.now() - t0
  await view.derivedPut(`audit:${source.id}`, 'brew', report)
  return report
}
