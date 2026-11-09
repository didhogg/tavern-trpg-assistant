// 按战役看【库】（D2-P3 整体设计 §2.2、§2.4、§2.7）：书目、查询、详情、取条目、搜索都按战役的选书设置过滤，
// 交出的是"生效版本"（原件，或用户选了的备选 / 房规）。战役的选书设置由调用方传入（存在战役记录里，P3-3）。
import { altsKey, type AltIndex, type AltRecord } from './alternatives'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import { ManageStore, type ChoiceLevel } from './manage'
import type { DetailResult, English, EnglishPairs, LibraryService, QueryRow } from './service'
import type { ParsedProp } from './runtime/frame/commands'
import type { EditionInfo } from './runtime/frame/edit-commands'
import {
  autoAssignment, BUILTIN_SCOPES, entryUnit, membershipOf, refKey, sourceUnit, viewOf,
  type Assignment, type CampaignLibrary, type EntryRef, type Membership, type ScopeDef, type ViewReason,
} from './scopes'
import { SOURCES, officialSourceOf, type SourceEntry } from './sources'
import { chooseVersion, type Alternative, type Chosen } from './versions'
import { hashValue } from '../core/hash'
import type { BookDirectory } from './directory'
import type { DirectoryRecord } from './directory'
import { DocumentStore } from './documents'
import { EntryLinks, type Located } from './entry-links'
import { scopedSearch, type ScopedSearchHit } from './scoped-search'
import { attachShelf, directoryRows, groupShelf, type ShelfGroup, type ShelfInfo } from './shelf'
import type { KernelOverride } from '../schemas/kernel'

export interface VersionInfo extends Chosen {
  /** 有几个备选（不含原件）。 */
  count: number
}

export interface ScopedRow {
  ref: EntryRef
  source: string | null
  reason: ViewReason
  /** 生效版本的作者对象。 */
  item: unknown
  version: VersionInfo
}

export interface ScopedDetail extends Omit<DetailResult, 'item' | 'english'> {
  ref: EntryRef
  reason: ViewReason
  item: unknown
  /** 原件（官方或先装的包）。 */
  base: unknown
  version: VersionInfo
  alternatives: Array<Omit<Alternative, 'item'> & { item: unknown }>
  /** 英文对照只对原件（官方）有意义；生效的是备选时为 null。 */
  english: English | null
}

export type FetchResult =
  | { ok: true; ref: EntryRef; source: string | null; item: unknown; version: VersionInfo }
  | { ok: false; ref: EntryRef; reason: 'not-installed' | 'not-found' | Exclude<ViewReason, 'included' | 'global' | 'scope'> }

export interface CatalogRow {
  kind: 'book' | 'adventure'
  set: string
  source: string
  /** 冒险的编号（按本下载用）；书为 null。 */
  id: string | null
  name: string
  abv: string
  /** 这本在库里有几条（冒险：正文下载了没有）。 */
  count: number
  downloaded: boolean
  edition: EditionInfo | null
  membership: Membership
  view: { visible: boolean; reason: ViewReason }
  /** 这本书里有几条挂了备选。 */
  alternatives: number
  /** 作者书目字段（分组、出版日期、冒险等级 / 故事线、封面链接…）；catalog(c, { remote: true }) 时才有。 */
  shelf?: ShelfInfo | null
}

export class ScopedLibrary {
  readonly manage: ManageStore
  private readonly editionCache = new Map<string, EditionInfo>()

  constructor(private readonly lib: LibraryService, private readonly db: LibraryDatabase, private readonly directory?: BookDirectory, readonly links: EntryLinks = new EntryLinks(lib, new DocumentStore(db))) {
    this.manage = new ManageStore(db)
  }

  /** 这套作者程序（cn / en）下已登记的数据集：官方 + 自制。 */
  setsOf(codeSet: string): SourceEntry[] {
    return SOURCES.filter((s) => s.codeSet === codeSet)
  }

  private async installed(set: SourceEntry): Promise<boolean> {
    if (set.kind === 'brew') return !!(await this.db.derived.get(`audit:${set.id}`))
    return (await this.db.sets.get(set.id))?.status === 'installed'
  }

  async scopes(): Promise<ScopeDef[]> {
    return [...BUILTIN_SCOPES, ...(await this.manage.userScopes())]
  }

  /** 作者对来源的版本判断（问小窗，缓存到下次 reset）。 */
  async editions(codeSet: string, sources: string[]): Promise<Record<string, EditionInfo>> {
    const want = [...new Set(sources)].filter((s) => !this.editionCache.has(`${codeSet}|${s.toLowerCase()}`))
    if (want.length) {
      const got = await (await this.lib.frameOf(codeSet)).call('editionOf', want)
      for (const [s, e] of Object.entries(got)) this.editionCache.set(`${codeSet}|${s.toLowerCase()}`, e)
    }
    return Object.fromEntries(sources.map((s) => [s, this.editionCache.get(`${codeSet}|${s.toLowerCase()}`)!]))
  }

  /** 装、删自制或改归类后调用：清掉缓存的作者判断（自制来源的版本取决于已装的包）。 */
  reset(): void {
    this.editionCache.clear()
    this.links.reset()
  }

  private async alts(codeSet: string): Promise<Map<string, AltRecord>> {
    const out = new Map<string, AltRecord>()
    for (const set of this.setsOf(codeSet).filter((s) => s.kind === 'brew')) {
      const rec = (await this.db.derived.get(altsKey(set.id)))?.value as AltIndex | undefined
      for (const [k, v] of Object.entries(rec?.targets ?? {})) out.set(k, v)
    }
    return out
  }

  /** 一条的全部备选：撞编号的包 + 指向它的房规。 */
  private async alternativesOf(ref: EntryRef, altMap: Map<string, AltRecord>): Promise<Alternative[]> {
    const out = [...(altMap.get(refKey(ref))?.alts ?? [])]
    for (const link of await this.manage.houseRules()) {
      if (refKey(link.target) !== refKey(ref)) continue
      const house = await this.lib.storedItem(link.house.set, link.house.prop, link.house.hash)
      if (house) out.push({ altId: `house:${link.house.hash}`, kind: 'houserule', filename: null, ref: link.house, item: house.item })
    }
    return out
  }

  private async choicesFor(c: CampaignLibrary): Promise<{ rule: Record<string, string>; global: Record<string, string> }> {
    return { rule: await this.manage.choices(`rule:${c.rule}`), global: await this.manage.choices('global') }
  }

  private version(c: CampaignLibrary, key: string, alts: Alternative[], levels: { rule: Record<string, string>; global: Record<string, string> }): { chosen: VersionInfo; item: unknown | undefined } {
    const chosen = chooseVersion(alts, { campaign: c.choices[key], rule: levels.rule[key], global: levels.global[key] })
    const alt = alts.find((a) => a.altId === chosen.altId)
    return { chosen: { ...chosen, count: alts.length }, item: alt?.item }
  }

  /** 在不在本战役（含原因）。 */
  async viewFor(c: CampaignLibrary, ref: EntryRef, source: string | null, assigns?: Map<string, Assignment>): Promise<{ visible: boolean; reason: ViewReason; membership: Membership }> {
    const a = assigns ?? (await this.manage.assignments())
    const auto = source ? autoAssignment((await this.editions(c.codeSet, [source]))[source]) : null
    const m = membershipOf(a.get(entryUnit(ref)), source ? a.get(sourceUnit(source)) : undefined, auto)
    return { ...viewOf(c, { entry: entryUnit(ref), source: source ? sourceUnit(source) : null }, m), membership: m }
  }

  /** 房规条目本身不单独出现在列表里（挂在原条目下当备选）。 */
  private async houseUnits(): Promise<Set<string>> {
    return new Set((await this.manage.houseRules()).map((l) => refKey(l.house)))
  }

  /** 本战役当前实际生效的房规覆盖：目标编号 → 房规条目（带内容指纹）。 */
  async activeOverrides(): Promise<KernelOverride[]> {
    const out: KernelOverride[] = []
    for (const link of await this.manage.houseRules()) {
      const stored = await this.lib.storedItem(link.house.set, link.house.prop, link.house.hash)
      if (!stored) continue
      out.push({
        target: { kind: 'entry', ...link.target },
        house: { kind: 'houserule', ...link.house },
        digest: hashValue(stored.item),
      })
    }
    return out
  }

  /** 按战役查一类：只交本战役看得到的，条目是生效版本。 */
  async query(c: CampaignLibrary, prop: string, { source }: { source?: string } = {}): Promise<ScopedRow[]> {
    const assigns = await this.manage.assignments()
    const altMap = await this.alts(c.codeSet)
    const levels = await this.choicesFor(c)
    const house = await this.houseUnits()
    const rows: ScopedRow[] = []
    for (const set of this.setsOf(c.codeSet)) {
      if (!(await this.installed(set))) continue
      const got: QueryRow[] = await this.lib.query(set.id, prop, { source }).catch((e: unknown) => {
        if (e instanceof Error && e.message.includes('没有这一类的解析结果')) return []
        throw e
      })
      const sources = [...new Set(got.map((r) => r.source).filter((s): s is string => !!s))]
      await this.editions(c.codeSet, sources)
      for (const r of got) {
        if (!r.hash) continue
        const ref = { set: set.id, prop, hash: r.hash }
        if (house.has(refKey(ref))) continue
        const v = await this.viewFor(c, ref, r.source, assigns)
        if (!v.visible) continue
        const { chosen, item } = this.version(c, refKey(ref), await this.alternativesOf(ref, altMap), levels)
        rows.push({ ref, source: r.source, reason: v.reason, item: item ?? r.item, version: chosen })
      }
    }
    return rows
  }

  /** 按编号取【库】解析结果里的那一条（高效版本，不建作者详情）。 */
  async storedItem(ref: EntryRef): Promise<{ item: unknown; source: string | null } | null> {
    return this.lib.storedItem(ref.set, ref.prop, ref.hash)
  }

  /** 按编号取英文对照原件（中文条目喂 Plutonium 用）；英文源或没配对时返回 null。 */
  async englishOf(ref: EntryRef, opts: { fluff?: boolean } = {}): Promise<English | null> {
    const set = SOURCES.find((s) => s.id === ref.set)
    if (!set) return null
    return this.lib.english(set, ref.prop, ref.hash, opts)
  }

  /** 中英配对表（作者做法）；英文源或没装英文时抛错，调用方自行处理。 */
  async englishPairs(codeSet: string): Promise<EnglishPairs> {
    return this.lib.englishPairs(officialSourceOf(codeSet).id)
  }

  /** 按战役取一条详情：生效版本 + 原件 + 全部备选 + 背景描述 + 英文（原件生效时）。看不到的返回 null 和原因。 */
  async detail(c: CampaignLibrary, ref: EntryRef): Promise<ScopedDetail | { hidden: ViewReason } | null> {
    const d = await this.lib.detail(ref.set, ref.prop, ref.hash)
    if (!d) return null
    const v = await this.viewFor(c, ref, d.source)
    if (!v.visible) return { hidden: v.reason }
    const alts = await this.alternativesOf(ref, await this.alts(c.codeSet))
    const { chosen, item } = this.version(c, refKey(ref), alts, await this.choicesFor(c))
    const effective = item ?? d.item
    const alt = item === undefined ? null : alts.find((a) => a.item === effective)
    const cached = alt?.ref ? await this.lib.fluff(alt.ref.set, alt.ref.prop, alt.ref.hash) : null
    const fluff = item === undefined ? { fluff: d.fluff, fluffError: d.fluffError } : { fluff: cached?.fluff ?? null, fluffError: cached?.fluffError ?? null }
    return { ...d, ...fluff, ref, reason: v.reason, item: effective, base: d.item, version: chosen, alternatives: alts, english: item === undefined ? d.english : null }
  }

  /** 按编号批量取（给结算内核、人物用）：每个编号交生效版本，或具体为什么取不到。 */
  async fetch(c: CampaignLibrary, refs: EntryRef[]): Promise<FetchResult[]> {
    const assigns = await this.manage.assignments()
    const altMap = await this.alts(c.codeSet)
    const levels = await this.choicesFor(c)
    const out: FetchResult[] = []
    for (const ref of refs) {
      const set = SOURCES.find((s) => s.id === ref.set)
      if (!set || !(await this.installed(set))) {
        out.push({ ok: false, ref, reason: 'not-installed' })
        continue
      }
      const stored = await this.lib.storedItem(ref.set, ref.prop, ref.hash)
      if (!stored) {
        out.push({ ok: false, ref, reason: 'not-found' })
        continue
      }
      const v = await this.viewFor(c, ref, stored.source, assigns)
      if (!v.visible) {
        out.push({ ok: false, ref, reason: v.reason as 'excluded' | 'out-of-scope' | 'unclassified' })
        continue
      }
      const { chosen, item } = this.version(c, refKey(ref), await this.alternativesOf(ref, altMap), levels)
      out.push({ ok: true, ref, source: stored.source, item: item ?? stored.item, version: chosen })
    }
    return out
  }

  /** 按战役搜索：命中按种类分流（条目 / 书与冒险 / 文档），每条带 target；结果只留本战役看得到的。 */
  search(c: CampaignLibrary, term: string): Promise<ScopedSearchHit[]> {
    return scopedSearch({
      lib: this.lib, links: this.links, sets: this.setsOf(c.codeSet), installed: (s) => this.installed(s),
      viewFor: (cc, ref, source, assigns) => this.viewFor(cc, ref, source, assigns), assignments: () => this.manage.assignments(), houseUnits: () => this.houseUnits(),
    }, c, term)
  }

  /** 按（类别、作者编号）找条目在哪个包，并说明本战役看不看得到（跨包跳转用）。 */
  async locate(c: CampaignLibrary, prop: string, hash: string): Promise<(Located & { ref: EntryRef; visible: boolean; reason: ViewReason; alternatives: number }) | null> {
    const at = await this.links.locate(c.codeSet, prop, hash)
    if (!at) return null
    const ref: EntryRef = { set: at.set, prop: at.prop, hash: at.hash }
    const v: { visible: boolean; reason: ViewReason } = at.kind === 'document' ? { visible: true, reason: 'global' } : await this.viewFor(c, ref, at.source)
    const alternatives = at.kind === 'entry' ? (await this.alternativesOf(ref, await this.alts(c.codeSet))).length : 0
    return { ...at, ref, visible: v.visible, reason: v.reason, alternatives }
  }

  /** 书目：本套程序已装的每本书 / 每个自制来源 / 每本冒险，各自的归属、在不在本战役、条数、备选数。 */
  /**
   * 书目行。默认只列已装好的数据集；remote = true 时没装的官方数据集也列（读作者书目文件，必要时只联网取那几个小文件），
   * 并给每行带上作者书目字段 shelf。联网取不到时抛错，由调用方显示原因。
   */
  async catalog(c: CampaignLibrary, { remote = false, record }: { remote?: boolean; record?: DirectoryRecord } = {}): Promise<CatalogRow[]> {
    if (remote && !this.directory) throw new Error('没有接书目入口')
    const assigns = await this.manage.assignments()
    const altMap = await this.alts(c.codeSet)
    const altBySource = new Map<string, number>()
    for (const r of altMap.values()) if (r.source) altBySource.set(r.source.toLowerCase(), (altBySource.get(r.source.toLowerCase()) ?? 0) + 1)
    const rows: Array<Omit<CatalogRow, 'name' | 'abv' | 'edition' | 'membership' | 'view'>> = []
    const known: Record<string, { full: string; abv: string; edition: EditionInfo }> = {}
    for (const set of this.setsOf(c.codeSet)) {
      const isInstalled = await this.installed(set)
      const rec = remote && set.kind === 'official' ? (record ?? await this.directory!.get(c.codeSet)) : null
      if (rec) Object.assign(known, rec.sources)
      if (!isInstalled) {
        if (rec) for (const r of directoryRows(set.id, rec)) rows.push({ ...r, alternatives: altBySource.get(r.source.toLowerCase()) ?? 0 })
        continue
      }
      for (const [source, count] of Object.entries(await this.sourceCounts(set.id))) {
        const row = { kind: 'book' as const, set: set.id, source, id: null, count, downloaded: true, alternatives: altBySource.get(source.toLowerCase()) ?? 0 }
        rows.push(rec ? { ...row, shelf: attachShelf(row, rec) } : row)
      }
      if (set.kind === 'official') {
        for (const a of await this.adventures(set)) {
          const row = { kind: 'adventure' as const, set: set.id, source: a.source, id: a.id, count: 0, downloaded: a.downloaded, alternatives: 0 }
          rows.push(rec ? { ...row, shelf: attachShelf(row, rec) } : row)
        }
      }
    }
    const sources = [...new Set(rows.map((r) => r.source))]
    // 作者书目已经给过全名 / 缩写 / 版本归类的来源不再问小窗（没装的数据集本地小窗也读不了）
    const rest = sources.filter((s) => !known[s])
    const names = rest.length ? await (await this.lib.frameOf(c.codeSet)).call('sourceNames', rest) : {}
    const eds = rest.length ? await this.editions(c.codeSet, rest) : {}
    return rows.map((r) => {
      const unit = sourceUnit(r.source)
      const edition = known[r.source]?.edition ?? eds[r.source] ?? null
      const m = membershipOf(undefined, assigns.get(unit), autoAssignment(edition ?? undefined))
      return { ...r, name: known[r.source]?.full ?? names[r.source]?.full ?? r.source, abv: known[r.source]?.abv ?? names[r.source]?.abv ?? r.source, edition, membership: m, view: viewOf(c, { entry: unit, source: unit }, m) }
    })
  }

  /**
   * 书架：书目行按作者的分组表排好（BE-7）。没装官方数据也能列。
   * 书目文件、冒险目录各自独立：哪个取不到只在它的 error 里写原因，另一个照常交回（不抛错）。
   */
  async shelf(c: CampaignLibrary): Promise<{ groups: ShelfGroup[]; booksError: string | null; adventuresError: string | null }> {
    const record = await this.directory!.get(c.codeSet)
    const rows = await this.catalog(c, { remote: true, record })
    return { groups: groupShelf(rows, record.groups), booksError: record.errors.books, adventuresError: record.errors.adventures }
  }

  /** 每个来源在这个数据集里有几条（数解析结果；按解析报告的保存时间缓存，重装、改自制后自动重数）。 */
  private async sourceCounts(setId: string): Promise<Record<string, number>> {
    const fp = String((await this.db.derived.get(`audit:${setId}`))?.savedAt ?? '')
    const saved = await this.db.derived.get(`sources:${setId}`)
    if (saved && saved.fingerprint === fp) return saved.value as Record<string, number>
    const counts: Record<string, number> = {}
    const prefix = parsedKey(setId, '')
    await this.db.derived.where('key').startsWith(prefix).each((rec) => {
      if (rec.key.slice(prefix.length).startsWith('corpus:')) return
      for (const src of (rec.value as ParsedProp).sources) if (src) counts[src] = (counts[src] ?? 0) + 1
    })
    await this.db.derived.put({ key: `sources:${setId}`, fingerprint: fp, value: counts, savedAt: Date.now() })
    return counts
  }

  /** 作者冒险书目（adventures.json，经作者加载器登记表找到）；正文下载解析过的标 downloaded。 */
  async adventures(set: SourceEntry): Promise<Array<{ id: string; source: string; hash: string; downloaded: boolean }>> {
    const frame = await this.lib.frameOf(set.codeSet)
    const loader = (await frame.call('loaders')).find((l) => l.kind === 'corpus' && l.props.includes('adventureData'))
    if (!loader?.index || !loader.page) return []
    const out = []
    for (const it of await frame.call('corpusList', loader.index, loader.props[0], loader.page)) {
      out.push({ ...it, downloaded: !!(await this.db.derived.get(parsedKey(set.id, loader.props[0], it.id))) })
    }
    return out
  }

  /** 改归类前的预览：改了以后这本书 / 这一条在各范围的归属。 */
  async previewAssignment(codeSet: string, unit: string, next: Assignment | null): Promise<{ unit: string; before: Membership; after: Membership }> {
    const assigns = await this.manage.assignments()
    const source = unit.startsWith('src:') ? unit.slice(4) : null
    const auto = source ? autoAssignment((await this.editions(codeSet, [source]))[source]) : null
    const before = membershipOf(undefined, assigns.get(unit), auto)
    const after = membershipOf(undefined, next ?? undefined, auto)
    return { unit, before, after }
  }

  setAssignment(unit: string, next: Assignment | null): Promise<void> {
    return this.manage.setAssignment(unit, next)
  }

  /** 选版本：本战役的选择改进战役选书设置（返回新的，调用方存进战役记录）；全局 / 某规则的存进库。 */
  async choose(c: CampaignLibrary, target: EntryRef, altId: string | null, level: 'campaign' | ChoiceLevel = 'campaign'): Promise<CampaignLibrary> {
    const key = refKey(target)
    if (level === 'campaign') {
      const choices = { ...c.choices }
      if (altId === null) delete choices[key]
      else choices[key] = altId
      return { ...c, choices }
    }
    await this.manage.setChoice(level, key, altId)
    return c
  }
}
