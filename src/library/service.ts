// 【库】的数据接口：类别、查询、详情（含英文）、搜索、按书开关（D2-P2 B1 设计 §8.3、§8.6、§8.7、§9）。
// 只交作者对象和作者搜索结果，不挑字段、不改名。凡是要理解字段含义的判断（屏蔽、背景描述、英文编号、
// 搜索匹配与排序）都在小窗里由作者函数做；插件这边只读库、对编号、按来源分组。
import { parseBrew, type BrewParseReport } from './brew'
import type { LibraryDatabase } from './db'
import { healthItemsOf, healthReport, type HealthReport, type Layers34Summary, type StoredReport } from './health'
import type { InstallReport } from './install'
import { parsedKey } from './install'
import type { ParsedProp } from './runtime/frame/commands'
import type { Detail, SearchHit } from './runtime/frame/read-commands'
import type { EnglishMatch } from './runtime/frame/english-commands'
import type { BrewEntry, WithErrors } from './runtime/frame/brew-commands'
import type { AuthorFrame } from './runtime/host'
import { commitOf, getSource, SOURCES, type SourceEntry } from './sources'

export interface QueryRow {
  hash: string | null
  source: string | null
  excluded: boolean
  item: unknown
}

export type English =
  | { status: 'found'; hash: string; via: EnglishMatch['via']; item: unknown; fluff: unknown }
  /** 英文没装；作者的配对没找到这一条；配到了但英文那边按编号取不到。 */
  | { status: 'not-installed' | 'not-paired' }
  | { status: 'not-found'; hash: string }

export interface DetailResult extends Detail {
  /** 中文条目的英文对象；没有登记配对语言的源为 null。 */
  english: English | null
}

/** 作者做法（getEnglishEntity）配出来的中英编号对照。 */
export interface EnglishPairs {
  source: string
  pair: string
  /** 类别 → 中文编号 → { 英文编号, 怎么找到的 } */
  pairs: Record<string, Record<string, { enHash: string; enSource: string | null; via: EnglishMatch['via'] }>>
  /** 作者的定位找不到英文记录的（含读文件出错）。 */
  unmatched: Array<{ prop: string; hash: string; error?: string }>
  via: Record<string, number>
  located: number
}

/** 没配上的原因：不在作者索引里（作者的配对只覆盖索引里的条目）；索引里有但英文没找到；找到了但英文解析结果里没有这个编号。 */
export type UnpairedReason = 'not-in-index' | 'no-english-record' | 'english-not-in-parsed'

export interface EnglishCoverage {
  source: string
  pair: string
  props: Record<string, { total: number; paired: number; nameMismatch: number } & Partial<Record<UnpairedReason, number>>>
  via: Record<string, number>
  unpaired: Array<{ prop: string; hash: string | null; reason: UnpairedReason; enHash?: string }>
  /** 自动核对（只列不改）：配上的中英两条里，中文条目的 ENG_name 和英文条目的 name 不一样。 */
  nameMismatch: Array<{ prop: string; hash: string; enHash: string; via: EnglishMatch['via']; engName: unknown; enName: unknown }>
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
  private readonly pairsCache = new Map<string, Promise<EnglishPairs>>()

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
    this.pairsCache.clear()
  }

  private async parsed(sourceId: string, prop: string): Promise<ParsedProp> {
    const rec = await this.opts.db.derived.get(parsedKey(sourceId, prop))
    // 自制只存有内容的类别：解析记录在、这一类没出错，就是"这一类没有条目"
    if (!rec && getSource(sourceId).kind === 'brew') {
      const report = await this.opts.db.derived.get(`audit:${sourceId}`)
      const errors = (report?.value as BrewParseReport | undefined)?.parse.errors ?? []
      if (report && !errors.some((e) => e.prop === prop)) return { items: [], hashes: [], sources: [] }
    }
    if (!rec) throw new Error(`${sourceId} 没有这一类的解析结果：${prop}（未安装，或这一类解析失败，见体检）`)
    return rec.value as ParsedProp
  }

  private async report(sourceId: string): Promise<{ parse: Pick<InstallReport['parse'], 'props'> }> {
    const rec = await this.opts.db.derived.get(`audit:${sourceId}`)
    if (!rec) throw new Error(`${sourceId} 还没安装`)
    return rec.value as InstallReport | BrewParseReport
  }

  /** 全量解析出来的类别和条数（数解析结果，不写死）。 */
  async categories(sourceId: string): Promise<Record<string, number>> {
    const r = await this.report(sourceId)
    return Object.fromEntries(Object.entries(r.parse.props).map(([prop, v]) => [prop, v.count]))
  }

  /** 按类别（、来源）取作者对象。默认去掉被屏蔽的；includeExcluded 时一并返回并带标记。 */
  async query(sourceId: string, prop: string, { source, includeExcluded = false }: { source?: string; includeExcluded?: boolean } = {}): Promise<QueryRow[]> {
    const p = await this.parsed(sourceId, prop)
    const src = getSource(sourceId)
    const flags = await (await this.frame(src.codeSet)).call('excludedFlags', prop, src.kind === 'brew' ? 'brew' : 'site')
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
    return { ...d, english: await this.english(s, prop, hash) }
  }

  private async english(s: SourceEntry, prop: string, hash: string): Promise<English | null> {
    if (!s.pair) return null
    const pair = getSource(s.pair)
    if (!(await this.bothInstalled(s, pair))) return { status: 'not-installed' }
    const hit = (await this.englishPairs(s.id)).pairs[prop]?.[hash]
    if (!hit) return { status: 'not-paired' }
    const d = await (await this.frame(pair.codeSet)).call('detail', prop, hit.enHash, hit.enSource)
    return d ? { status: 'found', hash: hit.enHash, via: hit.via, item: d.item, fluff: d.fluff } : { status: 'not-found', hash: hit.enHash }
  }

  private async bothInstalled(a: SourceEntry, b: SourceEntry): Promise<boolean> {
    const [x, y] = await Promise.all([this.opts.db.sets.get(a.id), this.opts.db.sets.get(b.id)])
    return x?.status === 'installed' && y?.status === 'installed'
  }

  /**
   * 中英配对表（作者做法，见 runtime/frame/english-commands.ts）。按两边版本存进库，版本不变就直接用。
   * 配对要建索引，作者的 postLoad 可能改动小窗里缓存的数据，所以另开两个小窗、用完关掉，不用查询那个。
   */
  englishPairs(sourceId: string): Promise<EnglishPairs> {
    let p = this.pairsCache.get(sourceId)
    if (!p) {
      p = this.buildEnglishPairs(sourceId)
      p.catch(() => this.pairsCache.delete(sourceId))
      this.pairsCache.set(sourceId, p)
    }
    return p
  }

  private async buildEnglishPairs(sourceId: string): Promise<EnglishPairs> {
    const s = getSource(sourceId)
    if (!s.pair) throw new Error(`${sourceId} 没有登记配对的另一种语言`)
    const pair = getSource(s.pair)
    if (!(await this.bothInstalled(s, pair))) throw new Error(`${s.id} 或 ${pair.id} 还没安装，不能配对`)
    const key = `english:${s.id}`
    const fingerprint = `${commitOf(s)}+${commitOf(pair)}`
    const saved = await this.opts.db.derived.get(key)
    if (saved?.fingerprint === fingerprint) return saved.value as EnglishPairs
    const cnFrame = await this.opts.openFrame(s.codeSet)
    const enFrame = await this.opts.openFrame(pair.codeSet).catch((e: unknown) => { cnFrame.close(); throw e })
    try {
      const docs = await cnFrame.call('englishLocators')
      const matches = await enFrame.call('englishMatch', docs)
      const out: EnglishPairs = { source: s.id, pair: pair.id, pairs: {}, unmatched: [], via: {}, located: docs.length }
      for (const m of matches) {
        if (!m.enHash) {
          out.unmatched.push({ prop: m.prop, hash: m.hash, ...(m.error ? { error: m.error } : {}) })
          continue
        }
        ;(out.pairs[m.prop] ??= {})[m.hash] = { enHash: m.enHash, enSource: m.enSource, via: m.via }
        out.via[m.via ?? 'none'] = (out.via[m.via ?? 'none'] ?? 0) + 1
      }
      await this.opts.db.derived.put({ key, fingerprint, value: out, savedAt: Date.now() })
      return out
    } finally {
      cnFrame.close()
      enFrame.close()
    }
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

  // ---- 自制（源登记表里 kind = brew 的源；作者包管理器在对应那套程序的小窗里）----

  private brewSource(sourceId: string): SourceEntry {
    const s = getSource(sourceId)
    if (s.kind !== 'brew') throw new Error(`${sourceId} 不是自制源`)
    return s
  }

  /** 自制书目：作者读自制仓库目录文件得出的列表（原样）。 */
  async brewCatalog(sourceId: string): Promise<WithErrors<unknown[] | null>> {
    return (await this.frame(this.brewSource(sourceId).codeSet)).call('brewCatalog')
  }

  /** 已装的自制包。 */
  async brewInstalled(sourceId: string): Promise<BrewEntry[]> {
    return (await this.frame(this.brewSource(sourceId).codeSet)).call('brewInstalled')
  }

  /** 装、导入、删、更新之后：关掉旧小窗（作者缓存和搜索索引是旧的），用新小窗重解析自制内容。 */
  private async afterBrewChange(s: SourceEntry): Promise<BrewParseReport> {
    this.reset()
    return parseBrew({ source: s, db: this.opts.db, openFrame: () => this.opts.openFrame(s.codeSet) })
  }

  /** 按网址装（作者自动追装依赖）。 */
  async brewAddUrl(sourceId: string, url: string): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport }> {
    const s = this.brewSource(sourceId)
    const r = await (await this.frame(s.codeSet)).call('brewAddUrl', url)
    return { ...r, parse: await this.afterBrewChange(s) }
  }

  /** 导入本地文件（文件名 + 原文）。 */
  async brewImport(sourceId: string, files: Array<{ name: string; text: string }>) {
    const s = this.brewSource(sourceId)
    const r = await (await this.frame(s.codeSet)).call('brewAddFiles', files)
    return { ...r, parse: await this.afterBrewChange(s) }
  }

  /** 删（按作者包头里的本地编号）。 */
  async brewDelete(sourceId: string, docIdLocals: string[]): Promise<WithErrors<number> & { parse: BrewParseReport }> {
    const s = this.brewSource(sourceId)
    const r = await (await this.frame(s.codeSet)).call('brewDelete', docIdLocals)
    return { ...r, parse: await this.afterBrewChange(s) }
  }

  /** 更新（作者：有新版的直接换）。不给编号就是全部；没有更新的不重解析。 */
  async brewPull(sourceId: string, docIdLocals: string[] | null = null): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport | null }> {
    const s = this.brewSource(sourceId)
    const r = await (await this.frame(s.codeSet)).call('brewPull', docIdLocals)
    return { ...r, parse: r.value.length ? await this.afterBrewChange(s) : null }
  }

  /** 中英配对覆盖率：中文解析结果的每一条，看作者做法配上了没有、英文解析结果里有没有那一条；没配上的按原因列清单，存进体检。 */
  async englishCoverage(sourceId: string): Promise<EnglishCoverage> {
    const s = getSource(sourceId)
    const pairs = await this.englishPairs(s.id)
    const unmatched = new Set(pairs.unmatched.map((u) => `${u.prop}\u0000${u.hash}`))
    const out: EnglishCoverage = { source: s.id, pair: pairs.pair, props: {}, via: pairs.via, unpaired: [], nameMismatch: [] }
    for (const prop of Object.keys((await this.report(s.id)).parse.props)) {
      const cn = await this.parsed(s.id, prop)
      const enRec = await this.opts.db.derived.get(parsedKey(pairs.pair, prop))
      const enParsed = enRec ? (enRec.value as ParsedProp) : null
      const en = new Map((enParsed?.hashes ?? []).map((h, i) => [h, i]))
      const row: EnglishCoverage['props'][string] = (out.props[prop] = { total: cn.items.length, paired: 0, nameMismatch: 0 })
      cn.hashes.forEach((hash, i) => {
        const hit = hash ? pairs.pairs[prop]?.[hash] : undefined
        let reason: UnpairedReason | null = null
        if (!hit) reason = hash && unmatched.has(`${prop}\u0000${hash}`) ? 'no-english-record' : 'not-in-index'
        else if (!en.has(hit.enHash)) reason = 'english-not-in-parsed'
        if (!reason) {
          row.paired++
          const engName = (cn.items[i] as { ENG_name?: unknown }).ENG_name
          const enName = (enParsed!.items[en.get(hit!.enHash)!] as { name?: unknown }).name
          if (engName !== undefined && engName !== enName) {
            row.nameMismatch++
            out.nameMismatch.push({ prop, hash: hash!, enHash: hit!.enHash, via: hit!.via, engName, enName })
          }
          return
        }
        row[reason] = (row[reason] ?? 0) + 1
        out.unpaired.push({ prop, hash, reason, ...(hit ? { enHash: hit.enHash } : {}) })
      })
    }
    await this.opts.db.derived.put({ key: `audit:english:${s.id}`, fingerprint: `${commitOf(s)}+${commitOf(getSource(pairs.pair))}`, value: out, savedAt: Date.now() })
    return out
  }

  // ---- 体检 ----

  private async stored<T>(key: string, fingerprint: (fp: string) => boolean): Promise<StoredReport<T> | undefined> {
    const rec = await this.opts.db.derived.get(key)
    return rec ? { value: rec.value as T, stale: !fingerprint(rec.fingerprint) } : undefined
  }

  /** 体检：源登记表里每个源的各份报告汇成一份（第 9 节）。自制会现场问作者包管理器存了哪些包。 */
  async health(): Promise<HealthReport> {
    const items = []
    for (const source of SOURCES) {
      const commit = commitOf(source)
      const set = await this.opts.db.sets.get(source.id)
      const pairCommit = source.pair ? commitOf(getSource(source.pair)) : ''
      const input: Parameters<typeof healthItemsOf>[0] = {
        source,
        installed: set?.status === 'installed',
        install: source.kind === 'official' ? await this.stored<InstallReport>(`audit:${source.id}`, (fp) => fp === commit) : undefined,
        brew: source.kind === 'brew' ? await this.stored<BrewParseReport>(`audit:${source.id}`, () => true) : undefined,
        english: await this.stored<EnglishCoverage>(`audit:english:${source.id}`, (fp) => fp === `${commit}+${pairCommit}`),
        layers34: await this.stored<Layers34Summary>(`audit:layers34:${source.id}`, (fp) => fp.startsWith(`${commit}+`)),
      }
      if (source.kind === 'brew') {
        input.brewStorage = await (await this.frame(source.codeSet)).call('brewStorage')
        input.brewSourceCounts = await this.brewSourceCounts(source.id)
      }
      items.push(...healthItemsOf(input))
    }
    return healthReport(items)
  }

  /** 自制解析结果里每个来源有几条（来源是解析时作者 SourceUtil.getEntitySource 给的，见 brew-commands.ts parseBrewProp）。 */
  private async brewSourceCounts(sourceId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {}
    for (const rec of await this.opts.db.derived.where('key').startsWith(`parsed:${sourceId}:`).toArray()) {
      for (const src of (rec.value as ParsedProp).sources) if (src) counts[src.toLowerCase()] = (counts[src.toLowerCase()] ?? 0) + 1
    }
    return counts
  }
}
