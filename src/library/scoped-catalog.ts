// 书架 / 包弹窗的书目行（P5 T4）：从 scoped.ts 拆出，保持单文件职责与行数上限。
import type { BookDirectory, DirectoryRecord } from './directory'
import type { LibraryService } from './service'
import type { LibraryView } from './revision'
import type { EditionInfo } from './runtime/frame/edit-commands'
import { autoAssignment, inScopeOf, membershipOf, sourceUnit, viewOf, type Assignment, type CampaignLibrary, type Membership, type ViewReason } from './scopes'
import type { SourceEntry } from './sources'
import { attachShelf, directoryRows, type ShelfInfo } from './shelf'
import { BrewPack } from './brew-packs'
import { BrewPairs } from './brew-pairing'
import { getSource } from './sources'

export interface CatalogRow {
  kind: 'book' | 'adventure'
  set: string
  source: string
  id: string | null
  name: string
  abv: string
  count: number
  downloaded: boolean
  edition: EditionInfo | null
  membership: Membership
  view: { visible: boolean; reason: ViewReason }
  inScope: boolean
  corpora?: Array<{ prop: string; id: string; name: string }>
  alternatives: number
  shelf?: ShelfInfo | null
  pack?: { docIdLocal: string; filename: string | null; stableId: string | null; sources: string[] }
  /** 另一种语言的名字（官方：作者书目的 ENG_name / 配对语言书目里同来源的名字；自制：配对包的文件名）。没有时不给。用于中英都能搜到（P5 T6 #18）。 */
  altName?: string
}

export const packUrl = (p: BrewPack): string | null => p.url ?? (p.sources.length ? [...p.sources].map((x) => x.toLowerCase()).sort().join(' :: ') : null)

export interface CatalogDeps {
  lib: LibraryService
  directory?: BookDirectory
  sourcesFor: (codeSet: string) => SourceEntry[]
  context: (c: CampaignLibrary, view: LibraryView) => Promise<{ altMap: Map<string, { source: string | null }>; assigns: Map<string, Assignment>; packs: Map<string, Map<string, BrewPack>> }>
  installed: (set: SourceEntry, view: LibraryView) => Promise<boolean>
  editions: (codeSet: string, sources: string[], view: LibraryView) => Promise<Record<string, EditionInfo>>
  sourceCounts: (setId: string, view: LibraryView) => Promise<Record<string, number>>
  adventures: (set: SourceEntry, view: LibraryView) => Promise<Array<{ id: string; source: string; hash: string; downloaded: boolean }>>
}

type DirItem = { name?: unknown; ENG_name?: unknown; source?: unknown }
const dirItems = (rec: DirectoryRecord | null): DirItem[] => (rec ? [...((rec.books ?? []) as DirItem[]), ...((rec.adventures ?? []) as DirItem[])] : [])

/** 另一种语言的名字：本语言书目的 ENG_name，或配对语言书目（只看缓存，不联网）里同来源那本的名字；自制按已装的中英配对包。 */
async function altNamesOf(deps: CatalogDeps, set: SourceEntry, rec: DirectoryRecord | null): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  if (set.kind === 'brew') {
    if (!set.pair) return out
    for (const p of await new BrewPairs(deps.lib).installed(set.id)) if (p.zh && p.en?.filename) out.set(p.zh.docIdLocal, p.en.filename)
    return out
  }
  const partner = set.pair && deps.directory ? await deps.directory.peek(getSource(set.pair).codeSet) : null
  for (const it of dirItems(partner)) if (typeof it.source === 'string' && typeof it.name === 'string') out.set(it.source.toLowerCase(), it.name)
  for (const it of dirItems(rec)) if (typeof it.source === 'string' && typeof it.ENG_name === 'string' && it.ENG_name !== it.name && !out.has(it.source.toLowerCase())) out.set(it.source.toLowerCase(), it.ENG_name)
  return out
}

  /** 书目行。默认只列已装好的数据集；remote = true 时没装的官方数据集也列。 */
export async function catalogFor(deps: CatalogDeps, c: CampaignLibrary, { remote = false, record, view: viewArg }: { remote?: boolean; record?: DirectoryRecord; view?: LibraryView } = {}): Promise<CatalogRow[]> {
    if (remote && !deps.directory) throw new Error('没有接书目入口')
    const view = await (viewArg ? Promise.resolve(viewArg) : deps.lib.currentView())
    const ctx = await deps.context(c, view)
    const altBySource = new Map<string, number>()
    for (const r of ctx.altMap.values()) if (r.source) altBySource.set(r.source.toLowerCase(), (altBySource.get(r.source.toLowerCase()) ?? 0) + 1)
    const rows: Array<Omit<CatalogRow, 'name' | 'abv' | 'edition' | 'membership' | 'view' | 'inScope'> & { nameHint?: string }> = []
    const alt = new Map<string, Map<string, string>>()
    const known: Record<string, { full: string; abv: string; edition: EditionInfo }> = {}
    for (const set of deps.sourcesFor(c.codeSet)) {
      const isInstalled = await deps.installed(set, view)
      const rec = remote && set.kind === 'official' ? (record ?? await deps.directory!.get(c.codeSet)) : null
      if (rec) Object.assign(known, rec.sources)
      try { alt.set(set.id, await altNamesOf(deps, set, rec ?? (set.kind === 'official' && deps.directory ? await deps.directory.peek(c.codeSet) : null))) } catch (e) { console.warn('[trpg-assistant] 另一语言书名读取失败', set.id, e) }
      if (!isInstalled) {
        if (rec) for (const r of directoryRows(set.id, rec)) rows.push({ ...r, alternatives: altBySource.get(r.source.toLowerCase()) ?? 0 })
        continue
      }
      if (set.kind === 'brew') {
        // 自制：一行 = 一个真实作者包（同一来源多个包不再合并 / 猜第一个）
        const packs = [...(ctx.packs.get(set.id)?.values() ?? [])]
        const brewBooks = await deps.lib.brewCorpora(set.id, view)
        for (const pack of packs) {
          const sources = pack.sources.length ? pack.sources : [pack.filename ?? pack.docIdLocal]
          const corpora = Object.entries(brewBooks).flatMap(([prop, list]) => list.filter((b) => sources.some((s) => s.toLowerCase() === b.source.toLowerCase())).map((b) => ({ prop, id: b.id, name: b.name })))
          rows.push({
            kind: 'book', set: set.id, source: sources[0], id: null, nameHint: pack.filename ?? sources[0], count: pack.entryCount, downloaded: true,
            alternatives: sources.reduce((n, s) => n + (altBySource.get(s.toLowerCase()) ?? 0), 0), ...(corpora.length ? { corpora } : {}),
            pack: { docIdLocal: pack.docIdLocal, filename: pack.filename, stableId: packUrl(pack), sources },
          })
        }
        continue
      }
      const allowed = remote ? null : await view.visibleSources(set.id)
      const counts = { ...(await deps.sourceCounts(set.id, view)) }
      const installedBooks = await view.installedBooks(set.id)
      const bookSources = new Set<string>()
      // 已装一套资料时，仍把作者书目里的每一本列出来； downloaded 只说明这一本在不在本地。
      // 已装书架再按 downloaded 过滤，下载目录则能看到下一本。
      for (const book of (rec?.books ?? []) as Array<{ id?: unknown; source?: unknown }>) {
        const id = String(book.id ?? '')
        const source = String(book.source ?? '')
        if (!id || !source) continue
        if (allowed && !allowed.some((s) => s.toLowerCase() === source.toLowerCase())) continue
        bookSources.add(source.toLowerCase())
        const downloaded = !installedBooks || installedBooks.includes(id)
        const row = { kind: 'book' as const, set: set.id, source, id, count: counts[source] ?? 0, downloaded, alternatives: altBySource.get(source.toLowerCase()) ?? 0 }
        rows.push(rec ? { ...row, shelf: attachShelf(row, rec) } : row)
      }
      // 冒险自带的条目（怪物、物品…）来源就是冒险编号：条目数并进作者冒险目录里那一行，不另起一行“书”（否则掉进“其他”分组、同名两行）。
      const adventures = await deps.adventures(set, view)
      const advBySource = new Map(adventures.map((a) => [a.source.toLowerCase(), a]))
      const advCounts = new Map<string, number>()
      // 来源索引里有、但作者书目没列出对应书号的共享/来源行，仍给一行“来源”身份。
      for (const [source, count] of Object.entries(counts)) {
        if (bookSources.has(source.toLowerCase())) continue
        const adv = advBySource.get(source.toLowerCase())
        if (adv) { advCounts.set(adv.id, (advCounts.get(adv.id) ?? 0) + count); continue }
        if (allowed && !allowed.some((s) => s.toLowerCase() === source.toLowerCase())) continue
        const row = { kind: 'book' as const, set: set.id, source, id: null, count, downloaded: true, alternatives: altBySource.get(source.toLowerCase()) ?? 0 }
        rows.push(rec ? { ...row, shelf: attachShelf(row, rec) } : row)
      }
      for (const a of adventures) {
        const row = { kind: 'adventure' as const, set: set.id, source: a.source, id: a.id, count: advCounts.get(a.id) ?? 0, downloaded: a.downloaded, alternatives: altBySource.get(a.source.toLowerCase()) ?? 0 }
        rows.push(rec ? { ...row, shelf: attachShelf(row, rec) } : row)
      }
    }
    const sources = [...new Set(rows.map((r) => r.source))]
    const rest = sources.filter((s) => !known[s])
    const names = rest.length ? await (await deps.lib.frameOf(c.codeSet, view)).call('sourceNames', rest) : {}
    const eds = rest.length ? await deps.editions(c.codeSet, rest, view) : {}
    return rows.map((r) => {
      const unit = sourceUnit(r.source)
      const edition = known[r.source]?.edition ?? eds[r.source] ?? null
      const m = membershipOf(undefined, ctx.assigns.get(unit), autoAssignment(edition ?? undefined))
      const viewRow = viewOf(c, { entry: unit, source: unit }, m)
      const altName = alt.get(r.set)?.get(r.pack ? r.pack.docIdLocal : r.source.toLowerCase())
      return {
        ...r, ...(altName ? { altName } : {}), name: r.nameHint ?? known[r.source]?.full ?? names[r.source]?.full ?? r.source,
        abv: known[r.source]?.abv ?? names[r.source]?.abv ?? r.source, edition, membership: m, view: viewRow, inScope: inScopeOf(viewRow),
      }
    })
  }

