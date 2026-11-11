// 包体检（P5 T6 后2，驾驶员定放在包 ⋯ →【管理】里）：每个已装自制包现在缺哪些依赖。
// 依赖判断与删除预览同一套（brew-health）；官方来源对到作者书目里的书号，界面据此给「下载这本书」按钮。
// 只读本地（书目只看缓存），不联网。
import type { BrewPacks } from './brew-packs'
import { dependencyStatus, type DependencyStatus, type MissingDependency } from './brew-health'
import type { BookDirectory } from './directory'
import { installedOfficialSources } from './installed-sources'
import type { LibraryRevisionStore } from './revision'
import { SOURCES, getSource, officialSourceOf } from './sources'

export interface PackHealth {
  docIdLocal: string
  filename: string | null
  /** 缺的依赖；官方来源带上对应的书（数据集 + 作者书号 + 书名），书目缓存里找不到时没有 book。 */
  missing: Array<MissingDependency & { book?: { set: string; id: string; name: string } }>
  /** 全部依赖及状态（【依赖包】标签用）；官方来源带上书。 */
  requires: Array<DependencyStatus & { book?: { set: string; id: string; name: string } }>
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
  const withBook = <T extends { source: string; kind: 'official' | 'brew' }>(m: T): T & { book?: { set: string; id: string; name: string } } => {
    const b = m.kind === 'official' ? books.get(m.source.toLowerCase()) : undefined
    return b ? { ...m, book: { set: officialSet, ...b } } : m
  }
  return packs.filter((p) => !docIdLocal || p.docIdLocal === docIdLocal).map((p) => {
    const requires = dependencyStatus(p, official, packs, isOfficial).map(withBook)
    return { docIdLocal: p.docIdLocal, filename: p.filename, requires, missing: requires.filter((d) => !d.ok).map(({ source, props, kind, book }) => (book ? { source, props, kind, book } : { source, props, kind })) }
  })
}

export interface DownloadDependencyPreview {
  sources: string[]
  /** 自制依赖包：installed = 本机已有；否则会随下载一起装。 */
  brew: Array<{ source: string; file: string; installed: boolean }>
  /** 需要的官方书：installed = 已装；否则建议一起下载（book 为作者书目里的书）。 */
  official: Array<{ source: string; installed: boolean; book?: { set: string; id: string; name: string } }>
  /** 自制仓库和官方书目里都找不到的来源（作者安装时会再试上级数据；可能读不全）。 */
  unknown: string[]
}

/** 下载自制包前的依赖预览（P5 T6）：作者算直接依赖；自制仓库里找不到的再对到官方书目。只读，不安装。 */
export async function downloadDependencyPreview(deps: { frame: (codeSet: string) => Promise<{ call: (cmd: 'brewDependencyPreview', url: string) => Promise<{ value: { sources: string[]; dependencies: Array<{ source: string; file: string; installed: boolean }>; unavailable: string[] } | null; errors: string[] }> }>; directory: BookDirectory; revisions: LibraryRevisionStore }, setId: string, url: string): Promise<DownloadDependencyPreview> {
  const codeSet = getSource(setId).codeSet
  const r = await (await deps.frame(codeSet)).call('brewDependencyPreview', url)
  if (!r.value) throw new Error(r.errors[0] ?? '取不到这个包的文件')
  const view = await deps.revisions.published()
  const installed = new Set<string>()
  for (const set of SOURCES.filter((s) => s.kind === 'official' && s.codeSet === codeSet)) for (const src of await installedOfficialSources(view, set.id)) installed.add(src.toLowerCase())
  const rec = await deps.directory.peek(codeSet)
  const officialSet = officialSourceOf(codeSet).id
  const book = (src: string): { set: string; id: string; name: string } | undefined => {
    const b = [...(rec?.books ?? []), ...(rec?.adventures ?? [])].find((x) => String((x as { source?: unknown }).source ?? '').toLowerCase() === src.toLowerCase()) as { id?: unknown; name?: unknown } | undefined
    return b?.id ? { set: officialSet, id: String(b.id), name: String(b.name ?? src) } : undefined
  }
  const official: DownloadDependencyPreview['official'] = []
  const unknown: string[] = []
  for (const src of r.value.unavailable) {
    const b = book(src)
    if (b || installed.has(src.toLowerCase()) || rec?.sources[src]) official.push({ source: src, installed: installed.has(src.toLowerCase()), ...(b ? { book: b } : {}) })
    else unknown.push(src)
  }
  return { sources: r.value.sources, brew: r.value.dependencies, official, unknown }
}
