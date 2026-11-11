// 包体检（P5 T6 后2，驾驶员定放在包 ⋯ →【管理】里）：每个已装自制包现在缺哪些依赖。
// 依赖判断与删除预览同一套（brew-health）；官方来源对到作者书目里的书号，界面据此给「下载这本书」按钮。
// 只读本地（书目只看缓存），不联网。
import type { BrewPacks } from './brew-packs'
import { missingDependencies, type MissingDependency } from './brew-health'
import type { BookDirectory } from './directory'
import { installedOfficialSources } from './installed-sources'
import type { LibraryRevisionStore } from './revision'
import { SOURCES, getSource, officialSourceOf } from './sources'

export interface PackHealth {
  docIdLocal: string
  filename: string | null
  /** 缺的依赖；官方来源带上对应的书（数据集 + 作者书号 + 书名），书目缓存里找不到时没有 book。 */
  missing: Array<MissingDependency & { book?: { set: string; id: string; name: string } }>
}

export async function packHealth(deps: { brewPacks: BrewPacks; directory: BookDirectory; revisions: LibraryRevisionStore }, setId: string, docIdLocal?: string): Promise<PackHealth[]> {
  const view = await deps.revisions.published()
  const codeSet = getSource(setId).codeSet
  const packs = await deps.brewPacks.list(setId, view)
  const official = new Set<string>()
  for (const set of SOURCES.filter((s) => s.kind === 'official' && s.codeSet === codeSet)) for (const src of await installedOfficialSources(view, set.id)) official.add(src.toLowerCase())
  const rec = await deps.directory.peek(codeSet)
  const officialSet = officialSourceOf(codeSet).id
  const books = new Map<string, { id: string; name: string }>()
  for (const b of [...(rec?.books ?? []), ...(rec?.adventures ?? [])] as Array<{ id?: unknown; source?: unknown; name?: unknown }>) {
    if (typeof b.source === 'string' && b.id) books.set(b.source.toLowerCase(), { id: String(b.id), name: String(b.name ?? b.source) })
  }
  const isOfficial = (source: string): boolean => books.has(source.toLowerCase()) || !!rec?.sources[source] || official.has(source.toLowerCase())
  return packs.filter((p) => !docIdLocal || p.docIdLocal === docIdLocal).map((p) => ({
    docIdLocal: p.docIdLocal,
    filename: p.filename,
    missing: missingDependencies(p, official, packs, isOfficial).map((m) => {
      const b = m.kind === 'official' ? books.get(m.source.toLowerCase()) : undefined
      return b ? { ...m, book: { set: officialSet, ...b } } : m
    }),
  }))
}
