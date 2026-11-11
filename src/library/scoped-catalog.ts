// 书架 / 包弹窗的书目行（P5 T4）：从 scoped.ts 拆出，保持单文件职责与行数上限。
import type { BookDirectory, DirectoryRecord } from './directory'
import type { LibraryService } from './service'
import type { LibraryView } from './revision'
import type { EditionInfo } from './runtime/frame/edit-commands'
import { autoAssignment, inScopeOf, membershipOf, sourceUnit, viewOf, type Assignment, type CampaignLibrary, type Membership, type ViewReason } from './scopes'
import type { SourceEntry } from './sources'
import { attachShelf, directoryRows, type ShelfInfo } from './shelf'
import { BrewPack } from './brew-packs'

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

  /** 书目行。默认只列已装好的数据集；remote = true 时没装的官方数据集也列。 */
export async function catalogFor(deps: CatalogDeps, c: CampaignLibrary, { remote = false, record, view: viewArg }: { remote?: boolean; record?: DirectoryRecord; view?: LibraryView } = {}): Promise<CatalogRow[]> {
    if (remote && !deps.directory) throw new Error('没有接书目入口')
    const view = await (viewArg ? Promise.resolve(viewArg) : deps.lib.currentView())
    const ctx = await deps.context(c, view)
    const altBySource = new Map<string, number>()
    for (const r of ctx.altMap.values()) if (r.source) altBySource.set(r.source.toLowerCase(), (altBySource.get(r.source.toLowerCase()) ?? 0) + 1)
    const rows: Array<Omit<CatalogRow, 'name' | 'abv' | 'edition' | 'membership' | 'view' | 'inScope'> & { nameHint?: string }> = []
    const known: Record<string, { full: string; abv: string; edition: EditionInfo }> = {}
    for (const set of deps.sourcesFor(c.codeSet)) {
      const isInstalled = await deps.installed(set, view)
      const rec = remote && set.kind === 'official' ? (record ?? await deps.directory!.get(c.codeSet)) : null
      if (rec) Object.assign(known, rec.sources)
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
      const allowed = await view.visibleSources(set.id)
      const counts = { ...(await deps.sourceCounts(set.id, view)) }
      const installedBooks = await view.installedBooks(set.id)
      for (const book of (rec?.books ?? []) as Array<{ id?: unknown; source?: unknown }>) {
        const id = String(book.id ?? '')
        const source = String(book.source ?? '')
        if (!id || !source) continue
        if (installedBooks && !installedBooks.includes(id)) continue
        if (!counts[source]) counts[source] = 0
      }
      for (const [source, count] of Object.entries(counts)) {
        if (allowed && !allowed.some((s) => s.toLowerCase() === source.toLowerCase())) continue
        const row = { kind: 'book' as const, set: set.id, source, id: null, count, downloaded: true, alternatives: altBySource.get(source.toLowerCase()) ?? 0 }
        rows.push(rec ? { ...row, shelf: attachShelf(row, rec) } : row)
      }
      for (const a of await deps.adventures(set, view)) {
        const row = { kind: 'adventure' as const, set: set.id, source: a.source, id: a.id, count: 0, downloaded: a.downloaded, alternatives: 0 }
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
      return {
        ...r, name: r.nameHint ?? known[r.source]?.full ?? names[r.source]?.full ?? r.source,
        abv: known[r.source]?.abv ?? names[r.source]?.abv ?? r.source, edition, membership: m, view: viewRow, inScope: inScopeOf(viewRow),
      }
    })
  }

