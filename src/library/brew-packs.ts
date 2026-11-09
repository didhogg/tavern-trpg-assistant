// 自制包清单（P5 B-11）：已装的每个自制包——从哪来、有哪些来源、谁做的、依赖谁、多少条。
// 数据都来自作者包管理器（已装包的包头 + 文件元数据 _meta）和包里每条的作者编号（brewDocIndex），这里只拼成界面用的一张表。
// 书架（从下载页下来的包）、【我的库】（本地导入的文件、自己写的内容）、下载页的"已装"标记都用它。
import type { LibraryService } from './service'
import type { ShelfInfo } from './shelf'
import { SOURCES } from './sources'

/** 来历：download = 从自制仓库下载（有网址）；import = 本地导入的文件；editable = 自己写的（可编辑的"我的资料 / 房规"）。 */
export type PackOrigin = 'download' | 'import' | 'editable'

export interface SourceInfo {
  json: string
  full: string | null
  abbreviation: string | null
  authors: string[]
  version: string | null
  dateReleased: string | null
}

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
  /** 每个类别里有几条（作者编号算出来的非空条数）。 */
  props: Record<string, number>
  /** 每个类别里每条的作者编号（删前影响预览找谁用了它用）。 */
  hashes: Record<string, string[]>
  entryCount: number
}

type Meta = { sources?: Array<Record<string, any>>; dependencies?: unknown; includes?: unknown } | null // eslint-disable-line @typescript-eslint/no-explicit-any -- 作者文件元数据没有类型

const originOf = (head: Record<string, unknown>): PackOrigin => (head.isEditable ? 'editable' : head.url ? 'download' : 'import')

export class BrewPacks {
  constructor(private readonly lib: LibraryService) {}

  /** 这套自制（cn-brew / en-brew）里已装的包。 */
  async list(brewSetId: string): Promise<BrewPack[]> {
    const set = SOURCES.find((s) => s.id === brewSetId && s.kind === 'brew')
    if (!set) throw new Error(`${brewSetId} 不是自制源`)
    const installed = await this.lib.brewInstalled(brewSetId)
    const docs = await (await this.lib.frameOf(set.codeSet)).call('brewDocIndex')
    const byId = new Map(docs.map((d) => [d.docIdLocal, d]))
    return installed.map((e) => {
      const head = e.head as Record<string, unknown>
      const meta = e.meta as Meta
      const id = String(head.docIdLocal ?? '')
      const doc = byId.get(id)
      const hashes = Object.fromEntries(Object.entries(doc?.props ?? {}).map(([k, hs]) => [k, hs.filter((h): h is string => !!h)]).filter(([, hs]) => (hs as string[]).length > 0)) as Record<string, string[]>
      const props = Object.fromEntries(Object.entries(hashes).map(([k, hs]) => [k, hs.length]))
      const sourceInfo: SourceInfo[] = (meta?.sources ?? []).map((s) => ({
        json: String(s.json ?? ''), full: s.full ?? null, abbreviation: s.abbreviation ?? null,
        authors: Array.isArray(s.authors) ? s.authors.map(String) : [], version: s.version ?? null, dateReleased: s.dateReleased ?? null,
      }))
      return {
        docIdLocal: id, filename: (head.filename as string | undefined) ?? null, url: (head.url as string | undefined) ?? null, origin: originOf(head),
        isEditable: !!head.isEditable, timeAdded: Number(head.timeAdded ?? 0), sources: doc?.sources ?? sourceInfo.map((s) => s.json), sourceInfo,
        dependencies: meta?.dependencies ?? null, includes: meta?.includes ?? null,
        props: props as Record<string, number>, hashes, entryCount: Object.values(props as Record<string, number>).reduce((a, b) => a + b, 0),
      }
    })
  }

  /** 来源标识（小写）→ 来源信息，书架给自制行补作者、日期用。 */
  async sourceInfoMap(brewSetId: string): Promise<Map<string, SourceInfo>> {
    const out = new Map<string, SourceInfo>()
    for (const p of await this.list(brewSetId)) for (const s of p.sourceInfo) if (!out.has(s.json.toLowerCase())) out.set(s.json.toLowerCase(), s)
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
