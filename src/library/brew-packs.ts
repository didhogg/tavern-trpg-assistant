// 自制包清单（P5 B-11 / T4）：已装的每个自制包——从哪来、有哪些来源、谁做的、依赖谁、多少条。
// 数据都来自作者包管理器（已装包的包头 + 文件元数据 _meta）和包里每条的作者编号（brewDocIndex）。
// P5 T4：官方资料没装时也能从作者存储原文列出包 / 导出（不再返回空清单冒充没包）。
import type { LibraryService } from './service'
import type { ShelfInfo } from './shelf'
import type { LibraryView } from './revision'
import { SOURCES } from './sources'

export type PackOrigin = 'download' | 'import' | 'editable'

export interface SourceInfo {
  json: string
  full: string | null
  abbreviation: string | null
  authors: string[]
  version: string | null
  dateReleased: string | null
}

export interface BrewRequirement { kind: 'dependency' | 'include' | 'otherSource' | 'copy'; prop: string; source: string; hash?: string | null }

export interface BrewPack {
  docIdLocal: string
  filename: string | null
  url: string | null
  origin: PackOrigin
  isEditable: boolean
  timeAdded: number
  /** 包里声明的来源（作者的来源标识）。 */
  sources: string[]
  sourceInfo: SourceInfo[]
  /** 作者 _meta 里的依赖与包含，原样。 */
  dependencies: unknown
  includes: unknown
  otherSources?: unknown
  /** 作者实际取数声明：dependencies / includes / otherSources / _copy；用于删除影响核对。 */
  requires: BrewRequirement[]
  /** 每个类别里有几条（作者编号算出来的非空条数）。 */
  props: Record<string, number>
  /** 每个类别里每条的作者编号（删前影响预览找谁用了它用）。 */
  hashes: Record<string, string[]>
  entryCount: number
}

type Meta = { sources?: Array<Record<string, any>>; dependencies?: unknown; includes?: unknown } | null // eslint-disable-line @typescript-eslint/no-explicit-any -- 作者文件元数据没有类型
type StoredDoc = { head: Record<string, unknown>; body?: { _meta?: Meta } }

const originOf = (head: Record<string, unknown>): PackOrigin => (head.isEditable ? 'editable' : head.url ? 'download' : 'import')
const sourcesOf = (meta: Meta): string[] => (meta?.sources ?? []).map((s) => String(s.json ?? '')).filter(Boolean)
const sourceInfoOf = (meta: Meta): SourceInfo[] => (meta?.sources ?? []).map((s) => ({
  json: String(s.json ?? ''), full: s.full ?? null, abbreviation: s.abbreviation ?? null,
  authors: Array.isArray(s.authors) ? s.authors.map(String) : [], version: s.version ?? null, dateReleased: s.dateReleased ?? null,
}))

function metaRequirements(meta: Meta): BrewRequirement[] {
  const out: BrewRequirement[] = []
  for (const kind of ['dependencies', 'includes'] as const) {
    for (const [prop, list] of Object.entries((meta?.[kind] ?? {}) as Record<string, unknown>)) {
      for (const source of Array.isArray(list) ? list : []) out.push({ kind: kind === 'dependencies' ? 'dependency' : 'include', prop, source: String(source) })
    }
  }
  for (const [prop, list] of Object.entries((meta as { otherSources?: Record<string, Record<string, unknown>> } | null)?.otherSources ?? {})) {
    for (const source of Object.keys(list ?? {})) out.push({ kind: 'otherSource', prop, source })
  }
  return out
}

export class BrewPacks {
  constructor(private readonly lib: LibraryService) {}

  /** 这套自制（cn-brew / en-brew）里已装的包。 */
  async list(brewSetId: string, viewArg?: LibraryView): Promise<BrewPack[]> {
    const set = SOURCES.find((s) => s.id === brewSetId && s.kind === 'brew')
    if (!set) throw new Error(`${brewSetId} 不是自制源`)
    const view = await (viewArg ? Promise.resolve(viewArg) : this.lib.currentView())
    const officialOk = await this.lib.officialInstalled(set.codeSet, view)
    if (officialOk) {
      const installed = await this.lib.brewInstalled(brewSetId, view)
      const docs = await (await this.lib.frameOf(set.codeSet, view)).call('brewDocIndex')
      const byId = new Map(docs.map((d) => [d.docIdLocal, d]))
      return installed.map((e) => {
        const head = e.head as Record<string, unknown>
        const meta = e.meta as Meta
        const id = String(head.docIdLocal ?? '')
        const doc = byId.get(id)
        const hashes = Object.fromEntries(Object.entries(doc?.props ?? {}).map(([k, hs]) => [k, hs.filter((h): h is string => !!h)]).filter(([, hs]) => (hs as string[]).length > 0)) as Record<string, string[]>
        const requires = doc?.requires ?? metaRequirements(meta)
        const props = Object.fromEntries(Object.entries(hashes).map(([k, hs]) => [k, hs.length]))
        return {
          docIdLocal: id, filename: (head.filename as string | undefined) ?? null, url: (head.url as string | undefined) ?? null, origin: originOf(head),
          isEditable: !!head.isEditable, timeAdded: Number(head.timeAdded ?? 0), sources: doc?.sources ?? sourcesOf(meta), sourceInfo: sourceInfoOf(meta),
          dependencies: meta?.dependencies ?? null, includes: meta?.includes ?? null, requires,
          props: props as Record<string, number>, hashes, entryCount: Object.values(props as Record<string, number>).reduce((a, b) => a + b, 0),
        }
      })
    }
    // 官方资料没装：直接读作者存储原文，包头和来源信息都在，仍能列出 / 导出；条目索引要作者程序，先不给。
    const raw = (await view.kvGet(set.codeSet, 'HOMEBREW_2_STORAGE')) as StoredDoc[] | null
    return (Array.isArray(raw) ? raw : []).filter((d) => d?.head).map((d) => {
      const head = d.head
      const meta = d.body?._meta ?? null
      const id = String(head.docIdLocal ?? '')
      return {
        docIdLocal: id, filename: (head.filename as string | undefined) ?? null, url: (head.url as string | undefined) ?? null, origin: originOf(head),
        isEditable: !!head.isEditable, timeAdded: Number(head.timeAdded ?? 0), sources: sourcesOf(meta), sourceInfo: sourceInfoOf(meta),
        dependencies: meta?.dependencies ?? null, includes: meta?.includes ?? null, requires: metaRequirements(meta), props: {}, hashes: {}, entryCount: 0,
      }
    })
  }

  /** 来源标识（小写）→ 来源信息，书架给自制行补作者、日期用。 */
  async sourceInfoMap(brewSetId: string, view?: LibraryView): Promise<Map<string, SourceInfo>> {
    const out = new Map<string, SourceInfo>()
    for (const p of await this.list(brewSetId, view)) for (const s of p.sourceInfo) if (!out.has(s.json.toLowerCase())) out.set(s.json.toLowerCase(), s)
    return out
  }
}

/** 书架里自制来源行的书目字段：作者的书目里没有自制，名称 / 作者 / 日期取自包自带的来源信息；分组用作者的 homebrew 组。 */
export function brewShelfInfo(source: string, info: SourceInfo | undefined): ShelfInfo {
  return {
    id: source, group: 'homebrew', groupName: 'Homebrew', published: info?.dateReleased ?? null, revised: null, parentSource: null,
    author: info?.authors.length ? info.authors.join(', ') : null, level: null, storyline: null, cover: null,
  }
}

/** 下载页：自制目录项（作者目录里每个文件一项，带 urlDownload）标上"已装"。 */
export function markInstalled<T extends { urlDownload?: unknown }>(catalog: T[], packs: BrewPack[]): Array<{ entry: T; installed: BrewPack | null }> {
  const byUrl = new Map(packs.filter((p) => p.url).map((p) => [p.url as string, p]))
  return catalog.map((entry) => ({ entry, installed: (typeof entry.urlDownload === 'string' && byUrl.get(entry.urlDownload)) || null }))
}
