// 按战役看【库】（D2-P3 整体设计 §2.2、§2.4、§2.7）：书目、查询、详情、取条目、搜索都按战役的选书设置过滤，
// 交出的是"生效版本"（原件，或用户选了的备选 / 房规）。P5 T4：身份、浏览、关闭书、查询放大一起收口。
import { altsKey, type AltIndex, type AltRecord } from './alternatives'
import { packTarget, packVariant } from './pack-target'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import { sourceCountsAll } from './installed-sources'
import { ManageStore, type ChoiceLevel, type HouseRuleLink } from './manage'
import type { DetailResult, English, EnglishPairs, LibraryService, QueryRow } from './service'
import type { EditionInfo } from './runtime/frame/edit-commands'
import {
  autoAssignment, BUILTIN_SCOPES, entryUnit, membershipOf, refKey, sourceUnit, viewOf,
  type Assignment, type CampaignLibrary, type EntryRef, type EntrySelection, type Membership, type ScopeDef, type ViewReason,
} from './scopes'
import { SOURCES, getSource, officialSourceOf, type SourceEntry } from './sources'
import { chooseVersion, expandVariants, variantsOf, type Alternative, type Chosen, type VariantInfo } from './versions'
export type { VariantInfo } from './versions'
import { hashValue } from '../core/hash'
import type { BookDirectory, DirectoryRecord } from './directory'
import { BrewPacks, type BrewPack } from './brew-packs'
import { catalogFor, packUrl, type CatalogRow } from './scoped-catalog'
export type { CatalogRow } from './scoped-catalog'
import { DocumentStore } from './documents'
import { variantLinks, type VariantLink } from './variants'
import { EntryLinks, type Located, type ResolvedTag } from './entry-links'
import { scopedSearch, type ScopedSearchHit } from './scoped-search'
import { groupShelf, type ShelfGroup } from './shelf'
import type { LibraryView } from './revision'
import type { KernelOverride } from '../schemas/kernel'
import { detailItem } from './scoped-detail'
export interface VersionInfo extends Chosen {
  /** 有几个备选（不含原件）。 */
  count: number
}
export interface ScopedRow {
  ref: EntryRef
  source: string | null
  reason: ViewReason
  /** 本战役看不看得到（browse 模式也会返回看不到的行，带 false）。 */
  visible: boolean
  /** 生效版本的作者对象（拆行时是这一行自己那个版本的对象）。 */
  item: unknown
  version: VersionInfo
  /** 只在 expand 时有。 */
  variant?: VariantInfo
  /** 自制包的稳定身份（浏览 / 删除按包定位，不按来源猜）。 */
  pack?: { docIdLocal: string; filename: string | null; stableId: string | null; sources: string[] }
}
export interface ScopedDetail extends Omit<DetailResult, 'item' | 'english'> {
  ref: EntryRef
  reason: ViewReason
  /** 本战役关着 / 不在范围时，browse 仍然给内容，并标出。 */
  closed: boolean
  item: unknown
  /** 原件（官方或先装的包）。 */
  base: unknown
  version: VersionInfo
  alternatives: Array<Omit<Alternative, 'item'> & { item: unknown }>
  /** 英文对照只对原件（官方）有意义；生效的是备选时为 null。 */
  english: English | null
  docIdLocal?: string
}
export type FetchResult =
  | { ok: true; ref: EntryRef; source: string | null; item: unknown; version: VersionInfo; closed: boolean }
  | { ok: false; ref: EntryRef; reason: 'not-installed' | 'not-found' }
interface Context {
  view: LibraryView
  assigns: Map<string, Assignment>
  altMap: Map<string, AltRecord>
  levels: { rule: Record<string, string>; global: Record<string, string> }
  houseUnits: Set<string>
  houseByTarget: Map<string, HouseRuleLink[]>
  houseItems: Map<string, unknown>
  packs: Map<string, Map<string, BrewPack>>
}
export class ScopedLibrary {
  readonly manage: ManageStore
  private readonly editionCache = new Map<string, EditionInfo>()
  constructor(private readonly lib: LibraryService, db: LibraryDatabase, private readonly directory?: BookDirectory, readonly links: EntryLinks = new EntryLinks(lib, new DocumentStore(db))) {
    this.manage = new ManageStore(db)
  }
  setsOf(codeSet: string): SourceEntry[] {
    return SOURCES.filter((s) => s.codeSet === codeSet)
  }
  private async context(c: CampaignLibrary, view: LibraryView): Promise<Context> {
    const assigns = await this.manage.assignments()
    const altMap = await this.alts(c.codeSet, view)
    const levels = { rule: await this.manage.choices(`rule:${c.rule}`), global: await this.manage.choices('global') }
    const links = await this.manage.houseRules()
    const houseByTarget = new Map<string, HouseRuleLink[]>()
    for (const link of links) {
      const k = refKey(link.target)
      houseByTarget.set(k, [...(houseByTarget.get(k) ?? []), link])
    }
    const packs = new Map<string, Map<string, BrewPack>>()
    for (const set of this.setsOf(c.codeSet).filter((s) => s.kind === 'brew')) {
      const rows = await new BrewPacks(this.lib).list(set.id, view).catch(() => [])
      packs.set(set.id, new Map(rows.map((p) => [p.docIdLocal, p])))
    }
    return { view, assigns, altMap, levels, houseUnits: new Set(links.map((l) => refKey(l.house))), houseByTarget, houseItems: new Map(), packs }
  }
  private async installed(set: SourceEntry, view: LibraryView): Promise<boolean> {
    if (set.kind === 'brew') {
      if (await view.brewState(set.id)) return true
      return !!(await view.derivedGet(`audit:${set.id}`))
    }
    return (await view.officialState(set.id))?.status === 'installed'
  }
  private async readable(set: SourceEntry, view: LibraryView): Promise<boolean> {
    if (set.kind === 'official') return (await view.officialState(set.id))?.status === 'installed'
    return (await this.installed(set, view)) && (await this.lib.officialInstalled(set.codeSet, view))
  }
  async scopes(): Promise<ScopeDef[]> {
    return [...BUILTIN_SCOPES, ...(await this.manage.userScopes())]
  }

  /** 作者对来源的版本判断（问小窗，缓存到下次 reset）。 */
  async editions(codeSet: string, sources: string[], viewArg?: LibraryView): Promise<Record<string, EditionInfo>> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const want = [...new Set(sources)].filter((s) => !this.editionCache.has(`${view.id}|${codeSet}|${s.toLowerCase()}`))
    if (want.length) {
      const got = await (await this.lib.frameOf(codeSet, view)).call('editionOf', want)
      for (const [s, e] of Object.entries(got)) this.editionCache.set(`${view.id}|${codeSet}|${s.toLowerCase()}`, e)
    }
    return Object.fromEntries(sources.map((s) => [s, this.editionCache.get(`${view.id}|${codeSet}|${s.toLowerCase()}`)!]))
  }
  reset(): void {
    this.editionCache.clear()
    this.links.reset()
  }

  private async alts(codeSet: string, view: LibraryView): Promise<Map<string, AltRecord>> {
    const out = new Map<string, AltRecord>()
    for (const set of this.setsOf(codeSet).filter((s) => s.kind === 'brew')) {
      const rec = (await view.derivedGet(altsKey(set.id)))?.value as AltIndex | undefined
      for (const [k, v] of Object.entries(rec?.targets ?? {})) out.set(k, v)
    }
    return out
  }

  private async alternativesOf(ref: EntryRef, ctx: Context): Promise<Alternative[]> {
    const out = [...(ctx.altMap.get(refKey(ref))?.alts ?? [])]
    for (const link of ctx.houseByTarget.get(refKey(ref)) ?? []) {
      const key = refKey(link.house)
      let item = ctx.houseItems.get(key)
      if (item === undefined) {
        const house = await this.lib.storedItem(link.house.set, link.house.prop, link.house.hash, ctx.view)
        if (!house) continue
        item = house.item
        ctx.houseItems.set(key, item)
      }
      out.push({ altId: `house:${link.house.hash}`, kind: 'houserule', filename: null, ref: link.house, item })
    }
    return out
  }

  private version(key: string, alts: Alternative[], ctx: Context, campaignChoice?: string): { chosen: VersionInfo; item: unknown | undefined } {
    const chosen = chooseVersion(alts, { campaign: campaignChoice, rule: ctx.levels.rule[key], global: ctx.levels.global[key] })
    const alt = alts.find((a) => a.altId === chosen.altId)
    return { chosen: { ...chosen, count: alts.length }, item: alt?.item }
  }

  async viewFor(c: CampaignLibrary, ref: EntryRef, source: string | null, assigns?: Map<string, Assignment>, viewArg?: LibraryView): Promise<{ visible: boolean; reason: ViewReason; membership: Membership }> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const a = assigns ?? (await this.manage.assignments())
    const allowed = await view.visibleSources(ref.set)
    if (allowed && source && !allowed.some((s) => s.toLowerCase() === source.toLowerCase())) {
      return { visible: false, reason: 'out-of-scope', membership: membershipOf(undefined, a.get(sourceUnit(source)), null) }
    }
    const auto = source ? autoAssignment((await this.editions(c.codeSet, [source], view))[source]) : null
    const m = membershipOf(a.get(entryUnit(ref)), source ? a.get(sourceUnit(source)) : undefined, auto)
    return { ...viewOf(c, { entry: entryUnit(ref), source: source ? sourceUnit(source) : null }, m), membership: m }
  }

  async activeOverrides(viewArg?: LibraryView): Promise<KernelOverride[]> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const out: KernelOverride[] = []
    for (const link of await this.manage.houseRules()) {
      const stored = await this.lib.storedItem(link.house.set, link.house.prop, link.house.hash, view)
      if (!stored) continue
      out.push({ target: { kind: 'entry', ...link.target }, house: { kind: 'houserule', ...link.house }, digest: hashValue(stored.item) })
    }
    return out
  }

  /** 按战役查一类。mode = browse 时关闭 / 不在范围的行也返回（带 visible=false），供浏览本机内容。 */
  async query(c: CampaignLibrary, prop: string, { source, expand = false, mode = 'campaign', packDocIdLocal, view: viewArg }: { source?: string; expand?: boolean; mode?: 'campaign' | 'browse'; packDocIdLocal?: string; view?: LibraryView } = {}): Promise<ScopedRow[]> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const ctx = await this.context(c, view)
    const rows: ScopedRow[] = []
    for (const set of this.setsOf(c.codeSet)) {
      if (!(await this.readable(set, view))) continue
      const allowed = set.kind === 'official' ? await view.visibleSources(set.id) : null
      const pack = packDocIdLocal ? ctx.packs.get(set.id)?.get(packDocIdLocal) : undefined
      if (packDocIdLocal && !pack) continue
      const got = pack
        ? (await this.lib.packOwnedItems(set.id, pack, view))[prop]?.filter((r) => !r.excluded && (!source || r.source?.toLowerCase() === source.toLowerCase())) ?? []
        : await this.lib.query(set.id, prop, { source, view }).catch((e: unknown) => {
          if (e instanceof Error && e.message.includes('没有这一类的解析结果')) return [] as QueryRow[]
          throw e
        })
      await this.editions(c.codeSet, [...new Set(got.flatMap((r) => r.source ? [r.source] : []))], view)
      for (const r of got) {
        if (!r.hash) continue
        if (allowed && r.source && !allowed.some((s) => s.toLowerCase() === r.source!.toLowerCase())) continue
        const candidate: EntryRef = { set: set.id, prop, hash: r.hash }
        const { ref, altId } = pack ? packTarget(candidate, set.codeSet, pack.docIdLocal, ctx.altMap) : { ref: candidate, altId: null }
        if (ctx.houseUnits.has(refKey(ref))) continue
        const v = await this.viewFor(c, ref, r.source, ctx.assigns, view)
        if (!v.visible && mode !== 'browse') continue
        const alts = await this.alternativesOf(ref, ctx)
        const { chosen, item } = this.version(refKey(ref), alts, ctx, c.choices[refKey(ref)])
        const row: ScopedRow = {
          ref, source: r.source, reason: v.reason, visible: v.visible, item: pack ? r.item : item ?? r.item, version: chosen,
          ...(pack ? { pack: { docIdLocal: pack.docIdLocal, filename: pack.filename, stableId: packUrl(pack), sources: pack.sources } } : {}),
        }
        if (expand && pack) rows.push({ ...row, variant: packVariant(chosen.altId, alts, pack.docIdLocal, altId !== null) })
        else if (expand) rows.push(...expandVariants(row, r.item, alts))
        else rows.push(row)
      }
    }
    return rows
  }
  async variantsOf(c: CampaignLibrary, ref: EntryRef, viewArg?: LibraryView): Promise<{ parent: EntryRef | null; variants: Array<VariantLink & { ref: EntryRef }> }> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const links = variantLinks(await this.lib.parsed(ref.set, ref.prop, view), ref.hash)
    const assigns = await this.manage.assignments()
    const variants: Array<VariantLink & { ref: EntryRef }> = []
    for (const v of links.variants) {
      const vref = { set: ref.set, prop: ref.prop, hash: v.hash }
      if ((await this.viewFor(c, vref, v.source, assigns, view)).visible) variants.push({ ...v, ref: vref })
    }
    return { parent: links.parent ? { set: ref.set, prop: ref.prop, hash: links.parent } : null, variants }
  }

  async storedItem(ref: EntryRef, viewArg?: LibraryView): Promise<{ item: unknown; source: string | null } | null> {
    return this.lib.storedItem(ref.set, ref.prop, ref.hash, viewArg)
  }

  async englishOf(ref: EntryRef, opts: { fluff?: boolean } = {}, viewArg?: LibraryView): Promise<English | null> {
    const set = SOURCES.find((s) => s.id === ref.set)
    if (!set) return null
    return this.lib.english(set, ref.prop, ref.hash, { ...opts, ...(viewArg ? { view: viewArg } : {}) })
  }

  async englishPairs(codeSet: string, viewArg?: LibraryView): Promise<EnglishPairs> {
    return this.lib.englishPairs(officialSourceOf(codeSet).id, viewArg)
  }

  async detail(c: CampaignLibrary, ref: EntryRef, { browse = false, view: viewArg, selection }: { browse?: boolean; view?: LibraryView; selection?: EntrySelection } = {}): Promise<ScopedDetail | { hidden: ViewReason } | null> {
    const view = viewArg ?? await this.lib.currentView()
    const scope = { ...c, codeSet: getSource(ref.set).codeSet }
    const ctx = await this.context(scope, view)
    if (selection && 'docIdLocal' in selection) ref = packTarget(ref, scope.codeSet, selection.docIdLocal, ctx.altMap).ref
    const key = refKey(ref)
    const alternatives = await this.alternativesOf(ref, ctx)
    const { chosen } = this.version(key, alternatives, ctx, c.choices[key])
    const entry = await detailItem(this.lib, ref, ctx.packs, ctx.altMap.get(key), alternatives, chosen, view, selection)
    if (!entry) return null
    const v = await this.viewFor(scope, ref, entry.source, ctx.assigns, view)
    if (!v.visible && !browse) return { hidden: v.reason }
    return { ...entry, ref, reason: v.reason, closed: !v.visible, version: chosen, alternatives }
  }

  async fetch(c: CampaignLibrary, refs: EntryRef[], viewArg?: LibraryView): Promise<FetchResult[]> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const ctx = await this.context(c, view)
    const out: FetchResult[] = []
    for (const ref of refs) {
      const set = SOURCES.find((s) => s.id === ref.set)
      if (!set || !(await this.installed(set, view))) {
        out.push({ ok: false, ref, reason: 'not-installed' })
        continue
      }
      const stored = await this.lib.storedItem(ref.set, ref.prop, ref.hash, view)
      if (!stored) { out.push({ ok: false, ref, reason: 'not-found' }); continue }
      if (set.kind === 'official') {
        const allowed = await view.visibleSources(set.id)
        if (allowed && stored.source && !allowed.some((src) => src.toLowerCase() === stored.source!.toLowerCase())) { out.push({ ok: false, ref, reason: 'not-found' }); continue }
      }
      const v = await this.viewFor(c, ref, stored.source, ctx.assigns, view)
      const { chosen, item } = this.version(refKey(ref), await this.alternativesOf(ref, ctx), ctx, c.choices[refKey(ref)])
      out.push({ ok: true, ref, source: stored.source, item: item ?? stored.item, version: chosen, closed: !v.visible })
    }
    return out
  }

  async search(c: CampaignLibrary, term: string, { expand = false, view: viewArg }: { expand?: boolean; view?: LibraryView } = {}): Promise<ScopedSearchHit[]> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const hits = await this.searchHits(c, term, view)
    if (!expand) return hits
    const ctx = await this.context(c, view)
    const out: ScopedSearchHit[] = []
    for (const h of hits) {
      const collisions = h.target.kind === 'entry' ? (await this.alternativesOf(h.ref, ctx)).filter((a) => a.kind === 'collision') : []
      if (!collisions.length) { out.push(h); continue }
      const { chosen } = this.version(refKey(h.ref), collisions, ctx, c.choices[refKey(h.ref)])
      for (const v of variantsOf(chosen.altId, collisions)) out.push({ ...h, doc: v.source ? { ...h.doc, s: v.source } : h.doc, variant: v.variant })
    }
    return out
  }

  private searchHits(c: CampaignLibrary, term: string, view: LibraryView): Promise<ScopedSearchHit[]> {
    return scopedSearch({
      lib: this.lib, links: this.links, sets: this.setsOf(c.codeSet), view,
      installed: (s) => this.installed(s, view), readable: (s) => this.readable(s, view),
      viewFor: (cc, ref, source, assigns) => this.viewFor(cc, ref, source, assigns, view), assignments: () => this.manage.assignments(), houseUnits: async () => (await this.context(c, view)).houseUnits,
    }, c, term)
  }

  async locate(c: CampaignLibrary, prop: string, hash: string, viewArg?: LibraryView): Promise<(Located & { ref: EntryRef; visible: boolean; reason: ViewReason; alternatives: number }) | null> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const at = await this.links.locate(c.codeSet, prop, hash, view)
    if (!at) return null
    const ref: EntryRef = { set: at.set, prop: at.prop, hash: at.hash }
    const v: { visible: boolean; reason: ViewReason } = at.kind === 'document' ? { visible: true, reason: 'global' } : await this.viewFor(c, ref, at.source, undefined, view)
    const alternatives = at.kind === 'entry' ? (await this.alternativesOf(ref, await this.context(c, view))).length : 0
    return { ...at, ref, visible: v.visible, reason: v.reason, alternatives }
  }

  async resolveTag(c: CampaignLibrary, tag: string, text: string, viewArg?: LibraryView): Promise<(ResolvedTag & { view: { visible: boolean; reason: ViewReason; alternatives: number } | null }) | null> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const r = await this.links.resolveTag(c.codeSet, tag, text, view)
    if (!r) return null
    const at = r.located && (await this.locate(c, r.located.prop, r.located.hash, view))
    return { ...r, view: at ? { visible: at.visible, reason: at.reason, alternatives: at.alternatives } : null }
  }

  /** 书目行（实现在 scoped-catalog.ts）。 */
  async catalog(c: CampaignLibrary, { remote = false, record, view: viewArg }: { remote?: boolean; record?: DirectoryRecord; view?: LibraryView } = {}): Promise<CatalogRow[]> {
    return catalogFor({
      lib: this.lib, ...(this.directory ? { directory: this.directory } : {}),
      sourcesFor: (cs) => this.setsOf(cs), context: (cc, v) => this.context(cc, v),
      installed: (set, v) => this.installed(set, v), editions: (cs, ss, v) => this.editions(cs, ss, v),
      sourceCounts: (id, v) => this.sourceCounts(id, v), adventures: (set, v) => this.adventures(set, v),
    }, c, { remote, ...(record ? { record } : {}), ...(viewArg ? { view: viewArg } : {}) })
  }
  async shelf(c: CampaignLibrary, view?: LibraryView): Promise<{ groups: ShelfGroup[]; booksError: string | null; adventuresError: string | null; brewError: string | null }> {
    const record = await this.directory!.get(c.codeSet)
    const rows = await this.catalog(c, { remote: true, record, ...(view ? { view } : {}) })
    let brewError: string | null = null
    const v = view ?? await this.lib.currentView()
    for (const set of this.setsOf(c.codeSet).filter((s) => s.kind === 'brew')) {
      try { await new BrewPacks(this.lib).list(set.id, v) } catch (e) { brewError = brewError ?? `${set.id}：${e instanceof Error ? e.message : String(e)}` }
    }
    return { groups: groupShelf(rows, record.groups), booksError: record.errors.books, adventuresError: record.errors.adventures, brewError }
  }
  private async sourceCounts(setId: string, view: LibraryView): Promise<Record<string, number>> {
    const allowed = await view.visibleSources(setId)
    const trim = (counts: Record<string, number>): Record<string, number> => {
      if (allowed) for (const key of Object.keys(counts)) if (!allowed.some((s) => s.toLowerCase() === key.toLowerCase())) delete counts[key]
      return counts
    }
    return trim(await sourceCountsAll(view, setId))
  }
  async adventures(set: SourceEntry, viewArg?: LibraryView): Promise<Array<{ id: string; source: string; hash: string; downloaded: boolean }>> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const frame = await this.lib.frameOf(set.codeSet, view)
    const loader = (await frame.call('loaders')).find((l) => l.kind === 'corpus' && l.props.includes('adventureData'))
    if (!loader?.index || !loader.page) return []
    const installed = await view.installedAdventures(set.id)
    const out = []
    for (const it of await frame.call('corpusList', loader.index, loader.props[0], loader.page)) {
      const downloaded = installed ? installed.includes(it.id) : !!(await view.derivedGet(parsedKey(set.id, loader.props[0], it.id)))
      out.push({ ...it, downloaded })
    }
    return out
  }

  async previewAssignment(codeSet: string, unit: string, next: Assignment | null, viewArg?: LibraryView): Promise<{ unit: string; before: Membership; after: Membership }> {
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const assigns = await this.manage.assignments()
    const source = unit.startsWith('src:') ? unit.slice(4) : null
    const auto = source ? autoAssignment((await this.editions(codeSet, [source], view))[source]) : null
    const before = membershipOf(undefined, assigns.get(unit), auto)
    const after = membershipOf(undefined, next ?? undefined, auto)
    return { unit, before, after }
  }

  setAssignment(unit: string, next: Assignment | null): Promise<void> {
    return this.manage.setAssignment(unit, next)
  }

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
