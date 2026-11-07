// 按战役看【库】（D2-P3 整体设计 §2.2、§2.4、§2.7）：书目、查询、详情、取条目、搜索都按战役的选书设置过滤，
// 交出的是"生效版本"（原件，或用户选了的备选 / 房规）。战役的选书设置由调用方传入（存在战役记录里，P3-3）。
import { altsKey, type AltIndex, type AltRecord } from './alternatives'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import { ManageStore, type ChoiceLevel } from './manage'
import type { DetailResult, English, LibraryService, QueryRow } from './service'
import type { ParsedProp } from './runtime/frame/commands'
import type { EditionInfo } from './runtime/frame/edit-commands'
import type { SearchHit } from './runtime/frame/read-commands'
import {
  autoAssignment, BUILTIN_SCOPES, entryUnit, membershipOf, refKey, ruleScopes, sourceUnit, viewOf,
  type Assignment, type CampaignLibrary, type EntryRef, type Membership, type ScopeDef, type ViewReason,
} from './scopes'
import { SOURCES, type SourceEntry } from './sources'
import { chooseVersion, type Alternative, type Chosen } from './versions'

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
}

export class ScopedLibrary {
  readonly manage: ManageStore
  private readonly editionCache = new Map<string, EditionInfo>()

  constructor(private readonly lib: LibraryService, private readonly db: LibraryDatabase) {
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
      if (house) out.push({ altId: `house:${link.house.hash}`, kind: 'houserule', filename: null, item: house.item })
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

  /** 按战役取一条详情：生效版本 + 原件 + 全部备选 + 背景描述 + 英文（原件生效时）。看不到的返回 null 和原因。 */
  async detail(c: CampaignLibrary, ref: EntryRef): Promise<ScopedDetail | { hidden: ViewReason } | null> {
    const d = await this.lib.detail(ref.set, ref.prop, ref.hash)
    if (!d) return null
    const v = await this.viewFor(c, ref, d.source)
    if (!v.visible) return { hidden: v.reason }
    const alts = await this.alternativesOf(ref, await this.alts(c.codeSet))
    const { chosen, item } = this.version(c, refKey(ref), alts, await this.choicesFor(c))
    const effective = item ?? d.item
    const fluff = item === undefined ? { fluff: d.fluff, fluffError: d.fluffError } : await (await this.lib.frameOf(c.codeSet)).call('fluffOf', ref.prop, effective)
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

  /** 按战役搜索：作者搜索器（本规则要显示旧版时临时打开），结果只留本战役看得到的。 */
  async search(c: CampaignLibrary, term: string): Promise<Array<SearchHit & { ref: EntryRef; reason: ViewReason }>> {
    const official = this.setsOf(c.codeSet).find((s) => s.kind === 'official')
    const brew = this.setsOf(c.codeSet).find((s) => s.kind === 'brew')
    if (!official || !(await this.installed(official))) return []
    const hits = await this.lib.search(official.id, term, { showLegacy: ruleScopes(c.rule).showLegacy })
    const assigns = await this.manage.assignments()
    const house = await this.houseUnits()
    const out: Array<SearchHit & { ref: EntryRef; reason: ViewReason }> = []
    for (const h of hits) {
      const hash = String(h.doc.u ?? '')
      const source = typeof h.doc.s === 'string' ? h.doc.s : null
      const inOfficial = await this.lib.storedItem(official.id, h.prop, hash)
      const ref = { set: inOfficial || !brew ? official.id : brew.id, prop: h.prop, hash }
      if (house.has(refKey(ref))) continue
      const v = await this.viewFor(c, ref, source, assigns)
      if (v.visible) out.push({ ...h, ref, reason: v.reason })
    }
    return out
  }

  /** 书目：本套程序已装的每本书 / 每个自制来源 / 每本冒险，各自的归属、在不在本战役、条数、备选数。 */
  async catalog(c: CampaignLibrary): Promise<CatalogRow[]> {
    const assigns = await this.manage.assignments()
    const altMap = await this.alts(c.codeSet)
    const altBySource = new Map<string, number>()
    for (const r of altMap.values()) if (r.source) altBySource.set(r.source.toLowerCase(), (altBySource.get(r.source.toLowerCase()) ?? 0) + 1)
    const rows: Array<Omit<CatalogRow, 'name' | 'abv' | 'edition' | 'membership' | 'view'>> = []
    for (const set of this.setsOf(c.codeSet)) {
      if (!(await this.installed(set))) continue
      for (const [source, count] of Object.entries(await this.sourceCounts(set.id))) {
        rows.push({ kind: 'book', set: set.id, source, id: null, count, downloaded: true, alternatives: altBySource.get(source.toLowerCase()) ?? 0 })
      }
      if (set.kind === 'official') {
        for (const a of await this.adventures(set)) rows.push({ kind: 'adventure', set: set.id, source: a.source, id: a.id, count: 0, downloaded: a.downloaded, alternatives: 0 })
      }
    }
    const sources = [...new Set(rows.map((r) => r.source))]
    const names = sources.length ? await (await this.lib.frameOf(c.codeSet)).call('sourceNames', sources) : {}
    const eds = await this.editions(c.codeSet, sources)
    return rows.map((r) => {
      const unit = sourceUnit(r.source)
      const m = membershipOf(undefined, assigns.get(unit), autoAssignment(eds[r.source]))
      return { ...r, name: names[r.source]?.full ?? r.source, abv: names[r.source]?.abv ?? r.source, edition: eds[r.source] ?? null, membership: m, view: viewOf(c, { entry: unit, source: unit }, m) }
    })
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
