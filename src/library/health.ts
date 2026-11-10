// 体检（D2-P2 B1 设计 §9 `体检()`、§11、L11）：把各处已经存下的报告收成一份、同一个格式。
// 只汇总、不重算、不判断数据对不对：安装报告（第 1、2、5 层）、自制解析报告（含作者报的错）、
// 中英配对覆盖率、验证程序跑的第 3、4 层（有就收）、作者包管理器里存了但不显示的包。
import type { BrewParseReport } from './brew'
import type { InstallReport } from './install'
import type { StoredBrew } from './runtime/frame/brew-commands'
import type { EnglishCoverage } from './service'
import type { SourceEntry } from './sources'

/** ok 没问题；info 照实记录（作者规则、未跑的项）；warn 要人看（内容问题、解释不了的差异）；error 我们这边坏了（下载、解析失败）。 */
export type HealthLevel = 'ok' | 'info' | 'warn' | 'error'

export interface HealthItem {
  source: string
  /** 检查项：download、mirror、parse、no-hash、not-run、index、english、english-name、layer3、layer4、brew-parse、brew-author-errors、brew-alternatives、brew-alternatives-errors、brew-hidden、brew-empty、not-installed。 */
  check: string
  /** 第 11 节审计的第几层（有的话）。 */
  layer?: number
  level: HealthLevel
  /** 大白话说明。 */
  title: string
  /** 有问题的条数（ok 为 0）。 */
  count: number
  /** 原样明细（最多 DETAILS 条，全量在各自的报告里）。 */
  details: unknown[]
  /** 报告是旧版本数据做的（之后换过版本），结果仅供参考。 */
  stale?: boolean
}

export interface HealthReport {
  at: number
  items: HealthItem[]
  summary: Record<HealthLevel, number>
}

/** 第 3、4 层报告里体检要用的部分（全文见 tests/e2e/library/audit-layers34.ts）。 */
export interface Layers34Summary {
  schemaVersion: string
  layer3: Record<string, { d: { rawOnly: number; parsedOnly: number; rawNoHash: number; samples: string[] } }>
  layer4: Record<string, { pairs: number; suspicious: Record<string, { count: number; samples: string[] }> }>
}

export interface StoredReport<T> {
  value: T
  /** 存报告时的数据版本；和现在的版本不一样就是旧报告。 */
  stale: boolean
}

export interface HealthInput {
  source: SourceEntry
  installed: boolean
  install?: StoredReport<InstallReport>
  brew?: StoredReport<BrewParseReport>
  english?: StoredReport<EnglishCoverage>
  layers34?: StoredReport<Layers34Summary>
  /** 自制：作者两个包管理器里存着的包（现场问作者）。 */
  brewStorage?: StoredBrew[]
  /** 自制：解析结果里每个来源有几条（来源按作者 SourceUtil.getEntitySource，小写）。 */
  brewSourceCounts?: Record<string, number>
  /** 自制：这套作者程序对应的官方数据还没装，作者程序开不起来，自制检查跳过。 */
  officialMissing?: string
}

const DETAILS = 50

function item(source: string, check: string, level: HealthLevel, title: string, list: unknown[], extra: Partial<HealthItem> = {}): HealthItem {
  return { source, check, level, title, count: list.length, details: list.slice(0, DETAILS), ...extra }
}

const okOr = (list: unknown[], bad: HealthLevel): HealthLevel => (list.length ? bad : 'ok')

function officialItems(id: string, { value: r, stale }: StoredReport<InstallReport>): HealthItem[] {
  const s = stale ? { stale } : {}
  const corpusFailed = Object.entries(r.parse.corpora).flatMap(([prop, c]) => c.failed.map((f) => ({ prop, ...f })))
  const noHash = Object.entries(r.parse.props).filter(([, v]) => v.noHash).map(([prop, v]) => ({ prop, noHash: v.noHash, count: v.count }))
  const index = Object.entries(r.index).filter(([, v]) => v.onlyParsed || v.onlyIndex).map(([prop, v]) => ({ prop, ...v }))
  return [
    item(id, 'download', okOr(r.download.failed, 'error'), '下载失败的文件', r.download.failed, { layer: 1, ...s }),
    item(id, 'mirror', okOr([...r.mirror.missing, ...r.mirror.mismatched], 'error'), `本地和云端对不上的文件（核对了 ${r.mirror.checked} 个）`,
      [...r.mirror.missing.map((path) => ({ path, problem: 'missing' })), ...r.mirror.mismatched.map((path) => ({ path, problem: 'mismatched' }))], { layer: 1, ...s }),
    item(id, 'parse', okOr([...r.parse.errors, ...corpusFailed], 'error'), `作者加载器解析出错的类别或书（解析了 ${Object.keys(r.parse.props).length} 类）`, [...r.parse.errors, ...corpusFailed], { layer: 2, ...s }),
    item(id, 'no-hash', okOr(noHash, 'warn'), '作者编号规则算不出编号的条目（按类别）', noHash, { layer: 2, ...s }),
    item(id, 'not-run', okOr(r.parse.notRun, 'info'), '没有整类解析的（作者规则，附原因）', r.parse.notRun, { layer: 2, ...s }),
    item(id, 'index', okOr(index, 'info'), '解析结果和作者搜索索引的差异（辅助参考，不当作漏解析的证明）', index, { layer: 5, ...s }),
  ]
}

function englishItems(id: string, { value: c, stale }: StoredReport<EnglishCoverage>): HealthItem[] {
  const s = stale ? { stale } : {}
  const byReason: Record<string, number> = {}
  for (const u of c.unpaired) byReason[u.reason] = (byReason[u.reason] ?? 0) + 1
  const total = Object.values(c.props).reduce((n, p) => n + p.total, 0)
  const paired = Object.values(c.props).reduce((n, p) => n + p.paired, 0)
  return [
    item(id, 'english', okOr(c.unpaired, 'info'), `没配上英文的条目（${paired}/${total} 配上；按原因：${Object.entries(byReason).map(([k, v]) => `${k} ${v}`).join('、') || '无'}）`, c.unpaired, s),
    item(id, 'english-name', okOr(c.nameMismatch, 'warn'), '配上的中英两条里，中文的英文名和英文条目名字不一样（只列不改）', c.nameMismatch, s),
  ]
}

function layers34Items(id: string, { value: r, stale }: StoredReport<Layers34Summary>): HealthItem[] {
  const s = { ...(stale ? { stale } : {}) }
  const d = Object.entries(r.layer3).filter(([, t]) => t.d.rawOnly + t.d.parsedOnly + t.d.rawNoHash)
    .map(([prop, t]) => ({ prop, rawOnly: t.d.rawOnly, parsedOnly: t.d.parsedOnly, rawNoHash: t.d.rawNoHash, samples: t.d.samples }))
  const sus = Object.entries(r.layer4).flatMap(([prop, t]) => Object.entries(t.suspicious).map(([diff, v]) => ({ prop, diff, count: v.count, samples: v.samples })))
  return [
    item(id, 'layer3', okOr(d, 'warn'), `审计第 3 层（不漏）：原始和解析后对不上、又没有解析标记能解释的（按类别；结构定义 ${r.schemaVersion}）`, d, { layer: 3, ...s }),
    item(id, 'layer4', okOr(sus, 'warn'), '审计第 4 层（只有解析处不同）：解析前后不一样、又不是加载器加的字段或带解析标记的（按类别、字段）', sus, { layer: 4, ...s }),
  ]
}

function brewItems(input: HealthInput): HealthItem[] {
  const id = input.source.id
  const out: HealthItem[] = []
  if (input.brew) {
    const { value: r, stale } = input.brew
    const corpusFailed = Object.entries(r.parse.corpora ?? {}).flatMap(([prop, c]) => c.failed.map((f) => ({ prop, ...f })))
    const s = stale ? { stale } : {}
    out.push(
      item(id, 'brew-parse', okOr([...r.parse.errors, ...corpusFailed], 'error'), `自制内容解析出错的类别或书（已装 ${r.installed.length} 个包）`, [...r.parse.errors, ...corpusFailed], { layer: 2, ...s }),
      item(id, 'brew-author-errors', okOr(r.parse.authorErrors, 'warn'), '解析时作者报的错（自制内容本身的问题，例如引用了找不到的条目）', r.parse.authorErrors, s),
      item(id, 'not-run', okOr(r.parse.notRun, 'info'), '没有解析的（附原因）', r.parse.notRun, s),
    )
    // P3-1 同编号挂备选：挂了几条是正常信息；取备选对象失败的要看
    const alt = r.alternatives ?? { targets: 0, errors: [] }
    out.push(item(id, 'brew-alternatives', 'info', `和官方或先装的包同编号、挂成备选的条目：${alt.targets} 条（原件照常生效，用户选了才换）`, [], { count: alt.targets, ...s }))
    if (alt.errors.length) out.push(item(id, 'brew-alternatives-errors', 'warn', '同编号的条目，取备选版本失败的', alt.errors, s))
  }
  if (input.officialMissing) out.push(item(id, 'brew-skipped', 'info', `${input.officialMissing} 还没安装，作者程序开不起来，自制的检查跳过`, []))
  if (input.brewStorage) {
    const hidden = input.brewStorage.filter((b) => !b.shown)
    out.push(item(id, 'brew-hidden', okOr(hidden, 'warn'), '存进了作者包管理器、但作者不显示也不加载的包（作者规则：没有来源 _meta.sources 的包被滤掉）', hidden))
  }
  if (input.brewStorage && input.brewSourceCounts) {
    // 作者的按文件诊断（_pGetBrewProcessed_mutDiagnostics）只给已带 __prop 的条目打文件名，普通包打不上，所以按包声明的来源数
    const counts = input.brewSourceCounts
    const empty = input.brewStorage.filter((b) => b.shown && b.sources.every((src) => !counts[src.toLowerCase()])).map((b) => ({ ...b.head, sources: b.sources }))
    out.push(item(id, 'brew-empty', okOr(empty, 'warn'), '显示了、但它声明的来源一条内容都没解析出来的包', empty))
  }
  return out
}

/** 一个源的体检项。纯函数：输入是存下的报告，输出统一格式。 */
export function healthItemsOf(input: HealthInput): HealthItem[] {
  const id = input.source.id
  if (!input.installed && input.source.kind === 'official') return [item(id, 'not-installed', 'info', '还没安装', [])]
  const out: HealthItem[] = []
  if (input.install) out.push(...officialItems(id, input.install))
  if (input.english) out.push(...englishItems(id, input.english))
  else if (input.source.pair && input.installed) out.push(item(id, 'english', 'info', '还没算中英配对覆盖率', []))
  if (input.layers34) out.push(...layers34Items(id, input.layers34))
  else if (input.source.kind === 'official') out.push(item(id, 'layer3', 'info', '审计第 3、4 层只在验证程序里跑（要用作者结构定义 5etools-utils，不随插件发布），这里没有结果', [], { layer: 3 }))
  if (input.source.kind === 'brew') out.push(...brewItems(input))
  return out
}

export function healthReport(items: HealthItem[], at = Date.now()): HealthReport {
  const summary: Record<HealthLevel, number> = { ok: 0, info: 0, warn: 0, error: 0 }
  for (const it of items) summary[it.level]++
  return { at, items, summary }
}
