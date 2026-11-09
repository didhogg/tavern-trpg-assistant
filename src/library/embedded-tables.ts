// 埋在条目里的表格（P5 B-09）：作者的 table 类别只收一部分表，其余约千张表埋在背景、物品、子职特性、法术、怪物等条目的正文里，
// 筛不出来。装完官方数据后，用作者自己的提取器（小窗命令 extractTables）把它们都提出来，存成独立类别 embeddedTable：
//   · 名字：作者给的（tableName / 表自带 caption）→ 否则「所属条目名」· 最近的小标题 · 第 n 张（n 是这个条目里无名表的序号）
//   · 编号：「所属条目编号~所属类别~t序号」（同名同来源的怪物和它的背景描述编号相同，所以带上类别），数据不变编号就不变
//   · 去重：物品变体、版本生成条目上重复的表，同一来源里内容相同的只留第一张；作者 table 里已经有的也不再收
//   · 不进作者搜索索引（作者的索引不认），库页的表格列表按名字文字匹配即可
// 表原样保留作者字段，所以掷骰（tableRoll）、渲染都和作者的表一样用。
import { hashValue } from '../core/hash'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import type { ParsedProp } from './runtime/frame/commands'
import type { ExtractedTable } from './runtime/frame/table-extract-commands'
import type { AuthorFrame } from './runtime/host'
import { commitOf, getSource } from './sources'

export const EMBEDDED_PROP = 'embeddedTable'

/** 作者 table 类别之外不用扫的类别：表格自己（本来就是表）。 */
const SKIP = new Set(['table', 'tableGroup', EMBEDDED_PROP])

/** 表的内容摘要（只看表本身的内容，不看名字、页码这些别处也会不同的字段）。 */
export function tableDigest(table: Record<string, unknown>): string {
  return hashValue({ colLabels: table.colLabels ?? null, colLabelRows: table.colLabelRows ?? null, rows: table.rows ?? null })
}

const text = (v: unknown): string => (typeof v === 'string' ? v.replace(/\{@\w+ ([^}|]*)[^}]*\}/g, '$1').trim() : '')

/** 表的显示名。unnamedIndex：这个条目里第几张无名表（从 1 起）。 */
export function tableName(ex: Pick<ExtractedTable, 'parentName' | 'table' | 'path'>, unnamedIndex: number): string {
  const own = text(ex.table.name) || text(ex.table.caption)
  if (own) return own
  const section = [...ex.path].reverse().map((p) => text(p.name)).find((n) => n && n !== ex.parentName)
  return [`「${ex.parentName}」`, section, `第 ${unnamedIndex} 张`].filter(Boolean).join(' · ')
}

export interface EmbeddedTableItem extends Record<string, unknown> {
  type: 'table'
  name: string
  source: string | null
  /** 母条目：类别、作者编号、名字。 */
  parent: { prop: string; hash: string; name: string }
  /** 章节路径（从外到里的小标题）。 */
  sectionPath: string[]
}

/**
 * 把各类别提出来的表整理成独立条目：起名、编号、去重。纯函数。
 * known：作者 table / 表组里已有的表的内容摘要。
 */
export function buildEmbedded(extracted: Array<{ prop: string; tables: ExtractedTable[] }>, known: ReadonlySet<string>): ParsedProp & { items: EmbeddedTableItem[] } {
  const seen = new Set(known)
  const items: EmbeddedTableItem[] = []
  const hashes: Array<string | null> = []
  const sources: Array<string | null> = []
  for (const { prop, tables } of extracted) {
    const perParent = new Map<string, { n: number; unnamed: number }>()
    for (const ex of tables) {
      const parentHash = ex.parentHash as string
      const counter = perParent.get(parentHash) ?? { n: 0, unnamed: 0 }
      perParent.set(parentHash, counter)
      counter.n++
      const digest = `${ex.parentSource ?? ''}|${tableDigest(ex.table)}`
      if (seen.has(digest) || known.has(tableDigest(ex.table))) continue
      seen.add(digest)
      const named = !!(text(ex.table.name) || text(ex.table.caption))
      if (!named) counter.unnamed++
      const name = tableName(ex, counter.unnamed)
      items.push({
        ...ex.table, type: 'table', name, source: ex.parentSource,
        parent: { prop, hash: parentHash, name: ex.parentName }, sectionPath: ex.path.map((p) => text(p.name)).filter(Boolean),
      })
      hashes.push(`${parentHash}~${prop}~t${counter.n}`)
      sources.push(ex.parentSource)
    }
  }
  return { items, hashes, sources }
}

export class EmbeddedTables {
  private readonly building = new Map<string, Promise<ParsedProp>>()

  constructor(private readonly db: LibraryDatabase, private readonly frameOf: (codeSet: string) => Promise<AuthorFrame>) {}

  /** 取（没有或版本不对就现建）这套官方数据里的所有嵌入表格。旧安装第一次读时从已装的解析结果现建。 */
  ensure(sourceId: string): Promise<ParsedProp> {
    let p = this.building.get(sourceId)
    if (!p) {
      p = (async () => {
        const saved = await this.db.derived.get(parsedKey(sourceId, EMBEDDED_PROP))
        if (saved && saved.fingerprint === commitOf(getSource(sourceId))) return saved.value as ParsedProp
        return this.build(sourceId)
      })()
      p.catch(() => this.building.delete(sourceId))
      this.building.set(sourceId, p)
    }
    return p
  }

  /**
   * 全部重建：问小窗逐个类别提表，整理后存库。类别清单：装的时候由安装流程传进来；没传就读解析报告（旧安装现建），
   * 这时把条数补记进解析报告，类别清单里才有它。
   */
  async build(sourceId: string, opts: { frame?: AuthorFrame; props?: Record<string, { count: number }> } = {}): Promise<ParsedProp> {
    const source = getSource(sourceId)
    if (source.kind !== 'official') throw new Error(`${sourceId} 不是官方数据集`)
    const audit = (await this.db.derived.get(`audit:${sourceId}`))?.value as { parse?: { props?: Record<string, { count: number }> } } | undefined
    const props = opts.props ?? audit?.parse?.props
    if (!props) throw new Error(`${sourceId} 还没安装`)
    const f = opts.frame ?? (await this.frameOf(source.codeSet))
    const extracted: Array<{ prop: string; tables: ExtractedTable[] }> = []
    const skipped: Record<string, { count: number; sample: string }> = {}
    for (const [prop, v] of Object.entries(props)) {
      if (SKIP.has(prop) || prop.startsWith('raw_') || !v.count) continue
      const r = await f.call('extractTables', prop)
      if (r.tables.length) extracted.push({ prop, tables: r.tables })
      if (r.skipped.length) skipped[prop] = { count: r.skipped.length, sample: `${r.skipped[0].name}：${r.skipped[0].error}` }
    }
    const known = new Set<string>()
    for (const prop of ['table', 'tableGroup']) {
      const rec = await this.db.derived.get(parsedKey(sourceId, prop))
      for (const it of ((rec?.value as ParsedProp | undefined)?.items ?? []) as Array<Record<string, unknown>>) {
        if (prop === 'tableGroup') for (const t of (it.tables as Array<Record<string, unknown>> | undefined) ?? []) known.add(tableDigest(t))
        else known.add(tableDigest(it))
      }
    }
    const built = buildEmbedded(extracted, known)
    await this.db.derived.put({ key: parsedKey(sourceId, EMBEDDED_PROP), fingerprint: commitOf(source), value: { ...built, skipped }, savedAt: Date.now() })
    if (!opts.props && audit?.parse) {
      await this.db.derived.put({ key: `audit:${sourceId}`, fingerprint: commitOf(source), value: { ...audit, parse: { ...audit.parse, props: { ...props, [EMBEDDED_PROP]: { count: built.items.length, noHash: 0 } } } }, savedAt: Date.now() })
    }
    this.building.delete(sourceId)
    return built
  }
}
