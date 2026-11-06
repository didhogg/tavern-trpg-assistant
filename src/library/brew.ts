// 自制内容的解析（D2-P2 B1 设计 §8.4：装、删、更新自制之后"重开小窗 → 重跑解析"）。
// 和官方的全量解析一样：按作者加载器登记表逐类调作者加载器（读已装自制用 pCacheAndGetAllBrew），结果原样存进库。
// 作者网站的做法也是改了自制就整页重新加载。
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import type { AuthorFrame } from './runtime/host'
import type { SourceEntry } from './sources'

export interface BrewParseReport {
  source: string
  /** 已装的自制包（作者包头）。 */
  installed: Array<Record<string, unknown>>
  parse: {
    props: Record<string, { count: number; noHash: number }>
    notRun: Array<{ props: string[]; reason: string }>
    errors: Array<{ prop: string; error: string }>
    /** 解析期间作者自己报的错误原文（例：自制内容引用了找不到的条目）。内容问题归自制作者，原样交给体检。 */
    authorErrors: string[]
  }
  ms: number
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

/** 用一个新开的小窗重解析这套程序已装的全部自制内容；旧的解析结果先清掉（自制少了的类别不留旧数据）。 */
export async function parseBrew({ source, db, openFrame }: { source: SourceEntry; db: LibraryDatabase; openFrame: () => Promise<AuthorFrame> }): Promise<BrewParseReport> {
  const t0 = Date.now()
  const report: BrewParseReport = { source: source.id, installed: [], parse: { props: {}, notRun: [], errors: [], authorErrors: [] }, ms: 0 }
  await db.derived.where('key').startsWith(`parsed:${source.id}:`).delete()
  const frame = await openFrame()
  try {
    report.installed = (await frame.call('brewInstalled')).map((b) => b.head)
    for (const loader of await frame.call('loaders')) {
      if (loader.kind === 'corpus') {
        report.parse.notRun.push({ props: loader.props, reason: '自制里的书和冒险正文按本取，用到再解析（B2-7 未做）' })
        continue
      }
      for (const prop of loader.props) {
        if (prop.startsWith('raw_')) continue
        try {
          const parsed = await frame.call('parseBrewProp', prop)
          if (!parsed.items.length) continue
          await db.derived.put({ key: parsedKey(source.id, prop), fingerprint: 'brew', value: parsed, savedAt: Date.now() })
          report.parse.props[prop] = { count: parsed.items.length, noHash: parsed.hashes.filter((h) => h === null).length }
        } catch (e) {
          report.parse.errors.push({ prop, error: msg(e) })
        }
      }
    }
    report.parse.authorErrors = await frame.call('frameErrors')
  } finally {
    frame.close()
  }
  report.ms = Date.now() - t0
  await db.derived.put({ key: `audit:${source.id}`, fingerprint: 'brew', value: report, savedAt: Date.now() })
  return report
}
