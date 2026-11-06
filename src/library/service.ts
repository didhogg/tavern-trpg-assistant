// 【库】的数据接口：类别、查询、详情（含英文）、搜索、按书开关（D2-P2 B1 设计 §8.3、§8.6、§8.7、§9）。
// 只交作者对象和作者搜索结果，不挑字段、不改名。凡是要理解字段含义的判断（屏蔽、背景描述、英文编号、
// 搜索匹配与排序）都在小窗里由作者函数做；插件这边只读库、对编号、按来源分组。
import type { LibraryDatabase } from './db'
import type { InstallReport } from './install'
import { parsedKey } from './install'
import type { ParsedProp } from './runtime/frame/commands'
import type { Detail, SearchHit } from './runtime/frame/read-commands'
import type { AuthorFrame } from './runtime/host'
import { commitOf, getSource, type SourceEntry } from './sources'

export interface QueryRow {
  hash: string | null
  source: string | null
  excluded: boolean
  item: unknown
}

export type English =
  | { status: 'found'; hash: string; item: unknown; fluff: unknown }
  | { status: 'not-installed' | 'not-found'; hash: string }

export interface DetailResult extends Detail {
  /** 中文条目的英文对象；英文条目、或作者算不出英文编号时为 null。 */
  english: English | null
}

export interface EnglishCoverage {
  source: string
  pair: string
  props: Record<string, { total: number; paired: number; noEngHash: number; unpaired: number }>
  /** 中文程序没有英文编号规则、或英文那套没有这一类的类别。 */
  skipped: Array<{ prop: string; reason: string }>
  unpaired: Array<{ prop: string; hash: string | null; engHash: string | null }>
}

export interface LibraryServiceOptions {
  db: LibraryDatabase
  /** 开一个只读本地的作者小窗。 */
  openFrame: (codeSet: string) => Promise<AuthorFrame>
}

/**
 * 把作者现场给的"编号 → 是否屏蔽"按编号对到库里存的顺序上。
 * 两边编号集合（含重复次数）必须相同，否则说明库里的解析结果过期了，报错不猜。
 */
function alignByHash(prop: string, stored: Array<string | null>, live: Array<string | null>, excluded: boolean[]): boolean[] {
  const byHash = new Map<string | null, boolean[]>()
  live.forEach((h, i) => {
    const list = byHash.get(h)
    if (list) list.push(excluded[i])
    else byHash.set(h, [excluded[i]])
  })
  const out = stored.map((h) => byHash.get(h)?.shift())
  const missing = stored.filter((_, i) => out[i] === undefined)
  const extra = [...byHash.entries()].filter(([, v]) => v.length).map(([h]) => h)
  if (live.length !== stored.length || missing.length || extra.length) {
    throw new Error(`作者程序现场展开的「${prop}」和库里存的解析结果对不上：现场 ${live.length} 条、库里 ${stored.length} 条；库里有现场没有：${missing.slice(0, 3).join('、') || '无'}；现场有库里没有：${extra.slice(0, 3).join('、') || '无'}`)
  }
  return out as boolean[]
}

export class LibraryService {
  private readonly frames = new Map<string, Promise<AuthorFrame>>()

  constructor(private readonly opts: LibraryServiceOptions) {}

  /** 每套作者程序只开一个小窗，屏蔽表、搜索索引都在这个小窗里，开关书也经它改，状态才一致。 */
  private frame(codeSet: string): Promise<AuthorFrame> {
    let p = this.frames.get(codeSet)
    if (!p) {
      p = this.opts.openFrame(codeSet)
      p.catch(() => this.frames.delete(codeSet))
      this.frames.set(codeSet, p)
    }
    return p
  }

  /** 关掉所有小窗。安装、装删自制之后要调用：小窗里作者的缓存和搜索索引是旧的。 */
  reset(): void {
    for (const p of this.frames.values()) p.then((f) => f.close(), (e: unknown) => console.warn('[trpg-library] 小窗本来就没开成', e))
    this.frames.clear()
  }

  private async parsed(sourceId: string, prop: string): Promise<ParsedProp> {
    const rec = await this.opts.db.derived.get(parsedKey(sourceId, prop))
    if (!rec) throw new Error(`${sourceId} 没有这一类的解析结果：${prop}（未安装，或这一类解析失败，见体检）`)
    return rec.value as ParsedProp
  }

  private async report(sourceId: string): Promise<InstallReport> {
    const rec = await this.opts.db.derived.get(`audit:${sourceId}`)
    if (!rec) throw new Error(`${sourceId} 还没安装`)
    return rec.value as InstallReport
  }

  /** 全量解析出来的类别和条数（数解析结果，不写死）。 */
  async categories(sourceId: string): Promise<Record<string, number>> {
    const r = await this.report(sourceId)
    return Object.fromEntries(Object.entries(r.parse.props).map(([prop, v]) => [prop, v.count]))
  }

  /** 按类别（、来源）取作者对象。默认去掉被屏蔽的；includeExcluded 时一并返回并带标记。 */
  async query(sourceId: string, prop: string, { source, includeExcluded = false }: { source?: string; includeExcluded?: boolean } = {}): Promise<QueryRow[]> {
    const p = await this.parsed(sourceId, prop)
    const flags = await (await this.frame(getSource(sourceId).codeSet)).call('excludedFlags', prop)
    // 按编号对齐（作者缓存里的先后顺序取决于先加载了哪本书，不能按位置对）
    const excludedOf = flags.excluded ? alignByHash(prop, p.hashes, flags.hashes, flags.excluded) : null
    const want = source?.toLowerCase()
    const rows: QueryRow[] = []
    p.items.forEach((item, i) => {
      const excluded = excludedOf?.[i] ?? false
      if (excluded && !includeExcluded) return
      if (want !== undefined && p.sources[i]?.toLowerCase() !== want) return
      rows.push({ hash: p.hashes[i], source: p.sources[i], excluded, item })
    })
    return rows
  }

  /** 书或冒险的全文（安装时按本解析存下的）。 */
  async corpus(sourceId: string, prop: string, id: string): Promise<unknown> {
    const rec = await this.opts.db.derived.get(parsedKey(sourceId, prop, id))
    if (!rec) throw new Error(`${sourceId} 没有这本的全文：${prop} ${id}`)
    return rec.value
  }

  /** 一条的详情：作者对象 + 背景描述 + 英文对象。source 可省（作者从编号里解出）。 */
  async detail(sourceId: string, prop: string, hash: string, source?: string | null): Promise<DetailResult | null> {
    const s = getSource(sourceId)
    const d = await (await this.frame(s.codeSet)).call('detail', prop, hash, source ?? null)
    if (!d) return null
    return { ...d, english: d.engHash ? await this.english(s, prop, d.engHash, d.source) : null }
  }

  private async english(s: SourceEntry, prop: string, engHash: string, source: string | null): Promise<English | null> {
    if (!s.pair) return null
    const pair = getSource(s.pair)
    if ((await this.opts.db.sets.get(pair.id))?.status !== 'installed') return { status: 'not-installed', hash: engHash }
    const d = await (await this.frame(pair.codeSet)).call('detail', prop, engHash, source)
    return d ? { status: 'found', hash: engHash, item: d.item, fluff: d.fluff } : { status: 'not-found', hash: engHash }
  }

  /** 作者搜索器的结果原样（按作者得分排序，已按作者的搜索设置去掉被屏蔽的等）。 */
  async search(sourceId: string, term: string): Promise<SearchHit[]> {
    return (await this.frame(getSource(sourceId).codeSet)).call('search', term)
  }

  /** 读或改作者的搜索设置。 */
  async searchSettings(sourceId: string, patch: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return (await this.frame(getSource(sourceId).codeSet)).call('searchSettings', patch)
  }

  /** 按书开关：改作者屏蔽表里"整本书"一行（经这套程序唯一的小窗，查询、搜索立即生效）。 */
  async setBookExcluded(sourceId: string, book: string, excluded: boolean): Promise<void> {
    await (await this.frame(getSource(sourceId).codeSet)).call('setSourceExcluded', book, excluded)
  }

  /** 中英配对覆盖率：中文每一类的英文编号，到英文解析结果里找；没配上的列清单，存进体检。 */
  async englishCoverage(sourceId: string): Promise<EnglishCoverage> {
    const s = getSource(sourceId)
    if (!s.pair) throw new Error(`${sourceId} 没有登记配对的另一种语言`)
    const out: EnglishCoverage = { source: s.id, pair: s.pair, props: {}, skipped: [], unpaired: [] }
    for (const prop of Object.keys((await this.report(s.id)).parse.props)) {
      const cn = await this.parsed(s.id, prop)
      if (!cn.engHashes) {
        out.skipped.push({ prop, reason: '这套程序没有英文编号规则' })
        continue
      }
      const enRec = await this.opts.db.derived.get(parsedKey(s.pair, prop))
      if (!enRec) {
        out.skipped.push({ prop, reason: '英文那套没有这一类的解析结果' })
        continue
      }
      const en = new Set((enRec.value as ParsedProp).hashes)
      const row = (out.props[prop] = { total: cn.items.length, paired: 0, noEngHash: 0, unpaired: 0 })
      cn.engHashes.forEach((engHash, i) => {
        if (engHash && en.has(engHash)) row.paired++
        else {
          if (!engHash) row.noEngHash++
          row.unpaired++
          out.unpaired.push({ prop, hash: cn.hashes[i], engHash })
        }
      })
    }
    await this.opts.db.derived.put({ key: `audit:english:${s.id}`, fingerprint: `${commitOf(s)}+${commitOf(getSource(s.pair))}`, value: out, savedAt: Date.now() })
    return out
  }
}
