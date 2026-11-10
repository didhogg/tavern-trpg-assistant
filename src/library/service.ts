// 【库】的数据接口：类别、查询、详情（含英文）、搜索、按书开关（D2-P2 B1 设计 §8.3、§8.6、§8.7、§9）。
// 只交作者对象和作者搜索结果，不挑字段、不改名。凡是要理解字段含义的判断（屏蔽、背景描述、英文编号、
// 搜索匹配与排序）都在小窗里由作者函数做；插件这边只读库、对编号、按来源分组。
import { addGeneratedPairs } from './english-generated'
import { EMBEDDED_PROP, EmbeddedTables } from './embedded-tables'
import { ParsedMemo } from './parsed-memo'
import { brewCorporaKey, parseBrew, type BrewCorpora, type BrewParseReport } from './brew'
import { excludedOf as cachedExcluded, fluffOf as cachedFluff, ensurePrecomputed, invalidatePrecompute, precomputeSource, searchIndexOf, type PrecomputeReport } from './cache'
import type { LibraryDatabase } from './db'
import { healthItemsOf, healthReport, type HealthReport, type Layers34Summary, type StoredReport } from './health'
import type { InstallReport } from './install'
import { parsedKey } from './install'
import type { ParsedProp } from './runtime/frame/commands'
import type { SearchHit, SearchIndexDump } from './runtime/frame/read-commands'
import type { DetailResult, English, EnglishCoverage, EnglishPairs, QueryRow, UnpairedReason } from './service-types'
import type { BrewEntry, WithErrors } from './runtime/frame/brew-commands'
import type { AuthorFrame } from './runtime/host'
import { commitOf, getSource, officialSourceOf, SOURCES, type SourceEntry } from './sources'

export type { DetailResult, English, EnglishCoverage, EnglishPairs, QueryRow, UnpairedReason } from './service-types'

export interface LibraryServiceOptions {
  db: LibraryDatabase
  /** 开一个只读本地的作者小窗；kvScope 给了就用那个作者存储范围（隔离解析用）。 */
  openFrame: (codeSet: string, kvScope?: string) => Promise<AuthorFrame>
  /** 自制 / 房规变了之后接着换算（T2）；回调由后端接，库层不认识结算内核。 */
  onDataChanged?: (codeSet: string) => Promise<void>
}

export class LibraryService {
  private readonly frames = new Map<string, Promise<AuthorFrame>>()
  private readonly pairsCache = new Map<string, Promise<EnglishPairs>>()
  private readonly searchLoaded = new Map<string, string>()
  private readonly parsedMemo: ParsedMemo
  private readonly embedded: EmbeddedTables

  constructor(private readonly opts: LibraryServiceOptions) {
    this.parsedMemo = new ParsedMemo(opts.db)
    this.embedded = new EmbeddedTables(opts.db, (cs) => this.frame(cs))
  }

  /** 每套作者程序只开一个小窗，屏蔽表、搜索索引都在这个小窗里，开关书也经它改，状态才一致。 */
  frameOf(codeSet: string): Promise<AuthorFrame> {
    return this.frame(codeSet)
  }

  private frame(codeSet: string): Promise<AuthorFrame> {
    let p = this.frames.get(codeSet)
    if (!p) {
      p = this.opts.openFrame(codeSet)
      p.catch(() => this.frames.delete(codeSet))
      this.frames.set(codeSet, p)
    }
    return p
  }

  /** 每次 reset 加一：依赖小窗里算出来的东西（排序名次等）的缓存用它判断是否过期。 */
  generation = 0

  /** 关掉所有小窗。安装、装删自制之后要调用：小窗里作者的缓存和搜索索引是旧的。 */
  reset(): void {
    this.generation++
    for (const p of this.frames.values()) p.then((f) => f.close(), (e: unknown) => console.warn('[trpg-library] 小窗本来就没开成', e))
    this.frames.clear()
    this.pairsCache.clear()
    this.searchLoaded.clear()
  }

  /** 手动把整套资料一次算好存库（装书 / 迁移后用；平时看资料走缓存）。 */
  async precompute(sourceId: string, opts: { prop?: string; fluff?: boolean; excluded?: boolean; search?: boolean } = {}): Promise<PrecomputeReport> {
    const source = getSource(sourceId)
    const frame = await this.frame(source.codeSet)
    return precomputeSource({ source, db: this.opts.db, frame, prop: opts.prop, fluff: opts.fluff ?? true, excluded: opts.excluded ?? true, search: opts.search ?? source.kind === 'official' })
  }

  /** 缓存缺了/资料变了才开小窗补算；平时看资料、查询只读库。 */
  private async ensure(sourceId: string, opts: { prop?: string; fluff?: boolean; excluded?: boolean; search?: boolean }): Promise<void> {
    const source = getSource(sourceId)
    await ensurePrecomputed({ source, db: this.opts.db, openFrame: (cs) => this.opts.openFrame(cs), ...opts })
  }

  async parsed(sourceId: string, prop: string): Promise<ParsedProp> {
    if (prop === EMBEDDED_PROP) return getSource(sourceId).kind === 'official' ? this.embedded.ensure(sourceId) : { items: [], hashes: [], sources: [] } // 埋在条目里的表格（B-09）
    const value = await this.parsedMemo.get(parsedKey(sourceId, prop))
    const rec = value === undefined ? undefined : { value }
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
    if (prop === EMBEDDED_PROP) { const p = await this.parsed(sourceId, prop); return p.items.flatMap((item, i) => (source === undefined || p.sources[i]?.toLowerCase() === source.toLowerCase() ? [{ hash: p.hashes[i], source: p.sources[i], excluded: false, item }] : [])) }
    await this.ensure(sourceId, { prop, excluded: true })
    const p = await this.parsed(sourceId, prop)
    const excludedOf = await cachedExcluded(this.opts.db, sourceId, prop)
    if (excludedOf && p.hashes.some((h) => h && excludedOf[h] === undefined)) throw new Error(`缓存里的「${prop}」屏蔽表和解析结果对不上，不猜`)
    const want = source?.toLowerCase()
    const rows: QueryRow[] = []
    p.items.forEach((item, i) => {
      const excluded = excludedOf?.[p.hashes[i] ?? ''] ?? false
      if (excluded && !includeExcluded) return
      if (want !== undefined && p.sources[i]?.toLowerCase() !== want) return
      rows.push({ hash: p.hashes[i], source: p.sources[i], excluded, item })
    })
    return rows
  }

  /** 自制里的书和冒险目录（装、删、更新自制后重解析时存下的）：类别 → 每本的编号、名称、来源、作者编号。 */
  async brewCorpora(sourceId: string): Promise<BrewCorpora> {
    return ((await this.opts.db.derived.get(brewCorporaKey(sourceId)))?.value ?? {}) as BrewCorpora
  }

  /** 书或冒险的全文（安装时按本解析存下的；自制的在装 / 改自制时解析存下）。 */
  async corpus(sourceId: string, prop: string, id: string): Promise<unknown> {
    const rec = await this.opts.db.derived.get(parsedKey(sourceId, prop, id))
    if (!rec) throw new Error(`${sourceId} 没有这本的全文：${prop} ${id}`)
    return rec.value
  }

  /** 库里存的解析结果中按编号找一条（不经作者缓存）。 */
  async storedItem(sourceId: string, prop: string, hash: string): Promise<{ item: unknown; source: string | null } | null> {
    const p = await this.parsed(sourceId, prop).catch(() => null)
    const i = p ? p.hashes.indexOf(hash) : -1
    return p && i >= 0 ? { item: p.items[i], source: p.sources[i] } : null
  }

  /**
   * 一条的详情：作者对象 + 背景描述 + 英文对象。source 可省（作者从编号里解出）。
   * 条目对象取库里这个数据集自己的解析结果：作者缓存里同编号的自制会顶掉官方（P3-1 探路实测），不能直接用缓存里的；
   * 库里没有这一条时才用作者缓存。背景描述按交出去的那个对象问作者。
   */
  async detail(sourceId: string, prop: string, hash: string, _source?: string | null): Promise<DetailResult | null> {
    await this.ensure(sourceId, { prop, fluff: true, excluded: true })
    const stored = await this.storedItem(sourceId, prop, hash)
    if (!stored) return null
    const f = await cachedFluff(this.opts.db, sourceId, prop, hash)
    const excluded = await cachedExcluded(this.opts.db, sourceId, prop)
    return { item: stored.item, hash, source: stored.source, excluded: excluded?.[hash] ?? false, fluff: f?.fluff ?? null, fluffError: f?.fluffError ?? null, engSiteHash: f?.engSiteHash ?? null, english: await this.english(getSource(sourceId), prop, hash) }
  }

  /** 预计算的配图描述；没有这一条就返回 null（详情共用）。 */
  async fluff(sourceId: string, prop: string, hash: string) {
    return cachedFluff(this.opts.db, sourceId, prop, hash)
  }

  /** fluff：false 时不读配图描述（结算内核换算用不着；读一次要把这一类的配图描述整张读出来）。 */
  async english(s: SourceEntry, prop: string, hash: string, { fluff = true }: { fluff?: boolean } = {}): Promise<English | null> {
    if (!s.pair) return null
    const pair = getSource(s.pair)
    if (!(await this.bothInstalled(s, pair))) return { status: 'not-installed' }
    const hit = (await this.englishPairs(s.id)).pairs[prop]?.[hash]
    if (!hit) return { status: 'not-paired' }
    const stored = await this.storedItem(pair.id, prop, hit.enHash)
    if (!stored) return { status: 'not-found', hash: hit.enHash }
    const f = fluff ? await cachedFluff(this.opts.db, pair.id, prop, hit.enHash) : null
    return { status: 'found', hash: hit.enHash, via: hit.via, item: stored.item, fluff: f?.fluff ?? null }
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
    // +gen：配对表含生成条目（english-generated.ts）；旧表没有，换个记号让它重建一次。
    const fingerprint = `${commitOf(s)}+${commitOf(pair)}+gen4`
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
      // 作者加载器生成的条目（版本 / 亚种 / 魔法变体）按母条目补配对
      out.generated = await addGeneratedPairs(out.pairs, {
        // 冒险 / 书正文这类不按条目解析，没有解析结果，也就没有生成条目
        parsed: (side, prop) => this.parsed(side === 'cn' ? s.id : pair.id, prop).catch(() => null),
        templates: () => cnFrame.call('variantTemplateNames'),
        versions: (side, props) => (side === 'cn' ? cnFrame : enFrame).call('versionOrder', props),
      })
      out.via.generated = Object.values(out.generated).reduce((n, r) => n + r.paired, 0)
      await this.opts.db.derived.put({ key, fingerprint, value: out, savedAt: Date.now() })
      return out
    } finally {
      cnFrame.close()
      enFrame.close()
    }
  }

  /** 作者搜索器的结果原样（按作者得分排序，已按作者的搜索设置去掉被屏蔽的等）。showLegacy：这一次显示旧版来源（2014 战役用）。 */
  async search(sourceId: string, term: string, { showLegacy }: { showLegacy?: boolean } = {}): Promise<SearchHit[]> {
    await this.ensure(sourceId, { search: true })
    const s = getSource(sourceId)
    const frame = await this.frame(s.codeSet)
    const rec = await searchIndexOf(this.opts.db, sourceId)
    if (rec) {
      const fingerprint = `${String(rec.base ?? '')}|${String(rec.exclude ?? '')}|${String(rec.manage ?? '')}`
      if (this.searchLoaded.get(s.codeSet) !== fingerprint) {
        await frame.call('searchIndexLoad', rec as unknown as SearchIndexDump)
        this.searchLoaded.set(s.codeSet, fingerprint)
      }
    }
    return frame.call('search', term, showLegacy ?? null)
  }

  /** 读或改作者的搜索设置。 */
  async searchSettings(sourceId: string, patch: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return (await this.frame(getSource(sourceId).codeSet)).call('searchSettings', patch)
  }

  /** 按书开关：改作者屏蔽表里"整本书"一行（经这套程序唯一的小窗，查询、搜索立即生效）。 */
  async setBookExcluded(sourceId: string, book: string, excluded: boolean): Promise<void> {
    const s = getSource(sourceId)
    await (await this.frame(s.codeSet)).call('setSourceExcluded', book, excluded)
    await invalidatePrecompute(this.opts.db, sourceId, ['excluded'])
    await invalidatePrecompute(this.opts.db, officialSourceOf(s.codeSet).id, ['search'])
    this.searchLoaded.delete(s.codeSet)
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

  /** 在指定作者存储范围里开一个小窗（隔离解析、导入预览用；用完由调用方关）。 */
  openFrameIn(codeSet: string, kvScope: string): Promise<AuthorFrame> {
    return this.opts.openFrame(codeSet, kvScope)
  }

  /** 自制改过以后（含可编辑自制）重解析。 */
  reparseBrew(sourceId: string): Promise<BrewParseReport> {
    return this.afterBrewChange(this.brewSource(sourceId))
  }

  /** 装、导入、删、更新之后：关掉旧小窗（作者缓存和搜索索引是旧的），用新小窗重解析自制内容。 */
  private async afterBrewChange(s: SourceEntry): Promise<BrewParseReport> {
    this.reset()
    const report = await parseBrew({ source: s, db: this.opts.db, openFrame: () => this.opts.openFrame(s.codeSet), openFrameIn: (scope) => this.opts.openFrame(s.codeSet, scope) })
    // 搜索索引里含自制；自制变了，官方那套的搜索缓存作废，下一次搜索重算。
    await invalidatePrecompute(this.opts.db, officialSourceOf(s.codeSet).id, ['search'])
    this.searchLoaded.delete(s.codeSet)
    try { await this.opts.onDataChanged?.(s.codeSet) } catch (error) { report.precomputeError = error instanceof Error ? error.message : String(error) }
    return report
  }

  /** 按网址装（作者自动追装依赖）。 */
  async brewAddUrl(sourceId: string, url: string): Promise<WithErrors<BrewEntry[]> & { parse: BrewParseReport }> {
    const s = this.brewSource(sourceId)
    const r = await (await this.frame(s.codeSet)).call('brewAddUrl', url)
    return { ...r, parse: await this.afterBrewChange(s) }
  }

  /** 缺依赖一键下载：给来源标识（缺什么），作者到来源索引找网址、装上并追装它的依赖。notFound = 索引里查不到的来源。 */
  async brewInstallSources(sourceId: string, sources: string[]): Promise<WithErrors<{ added: BrewEntry[]; notFound: string[] }> & { parse: BrewParseReport | null }> {
    const s = this.brewSource(sourceId)
    const r = await (await this.frame(s.codeSet)).call('brewAddSources', sources)
    return { ...r, parse: r.value.added.length ? await this.afterBrewChange(s) : null }
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
      // 作者程序启动要读这套官方数据：没装就开不了小窗，自制这几项跳过（体检里注明）
      if (source.kind === 'brew' && (await this.opts.db.sets.get(officialSourceOf(source.codeSet).id))?.status !== 'installed') {
        input.officialMissing = officialSourceOf(source.codeSet).id
      } else if (source.kind === 'brew') {
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
