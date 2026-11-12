// 小窗里：官方书目（BE-7）。读作者书目文件（books.json / adventures.json，文件名来自作者加载器登记表的 index，由调用方传入），
// 连同作者的分组表（SourceUtil.ADV_BOOK_GROUPS）、来源全名缩写、版本归类一起交回。只转调作者函数，条目原样。
// 两个书目文件各自独立：一个取不到只记它的错误，另一个照常交回（P4 向导：书目取不到才挡下一步，冒险目录取不到只提示）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'
import { corpusFile, editionOf, type EditionInfo } from './edit-commands'

export interface DirectoryData {
  /** 作者的分组表（含当前语言站的显示名），顺序即作者导航栏顺序。 */
  groups: Array<{ group: string; displayName: string }>
  /** 每个书目文件：条目原样（书：books.json 的 book；冒险：adventures.json 的 adventure）；
   *  files 与 items 一一对应，是作者加载器给的正文文件路径（冒险下载大小估算用）；取不到时 items 为空、error 写原因。 */
  corpora: Array<{ prop: string; items: any[]; files: string[]; error: string | null }>
  /** 书目里出现的每个来源：全名、缩写、版本归类（作者函数）。 */
  sources: Record<string, { full: string; abv: string; edition: EditionInfo }>
  /** 来源 → 文件映射与职业文件（P5 T2 按书计划用）。 */
  sourceFiles: SourceFiles
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

/** 一个来源索引文件：目录名、索引文件路径、来源 → 文件。 */
export interface SourceFileMap {
  /** 作者程序里的目录名（data/<dir>/…）。 */
  dir: string
  /** 作者自己读的索引文件路径（index.json / fluff-index.json）。 */
  indexPath: string
  /** 键 → 文件名的索引（作者自己的 index.json 原文）。 */
  index: Record<string, string>
  /** 作者的键是资料来源，还是像职业那样的分组名。 */
  bySource: boolean
}

export interface SourceFiles {
  /** 按类别：多来源加载器的来源 → 文件映射。 */
  maps: Record<string, SourceFileMap>
  /** 作者按职业拆的文件（data/class/index.json 的值）；这些文件不按来源拆。 */
  classFiles: string[]
}

/** 作者的来源 → 文件映射与职业文件清单（P5 T2）；全部问作者，不手抄书单 / 文件名。 */
export async function sourceFiles(): Promise<SourceFiles> {
  await init()
  const maps: SourceFiles['maps'] = {}
  const seen = new Set<string>()
  for (const loader of A.DataLoader._DATA_TYPE_LOADER_LIST) {
    for (const prop of (loader.constructor.PROPS as string[])) {
      if (seen.has(prop) || prop.startsWith('raw_')) continue
      seen.add(prop)
      const cfg = A.DataUtil[prop]
      if (!cfg || typeof cfg.pLoadIndex !== 'function') continue
      const dir = String(cfg._DIR ?? '')
      if (!dir) continue
      const index = await cfg.pLoadIndex() as Record<string, string>
      maps[prop] = {
        dir, indexPath: `data/${dir}/${cfg._isFluff ? 'fluff-' : ''}index.json`, index,
        bySource: Object.keys(index).some((key) => A.Parser.hasSourceJson(key)),
      }
    }
  }
  const classFiles = [...new Set(Object.values(maps).filter((map) => !map.bySource)
    .flatMap(({ dir, index }) => Object.values(index).map((file) => `data/${dir}/${file}`)))]
  return { maps, classFiles }
}

export async function directory(specs: Array<{ index: string; prop: string }>): Promise<DirectoryData> {
  await init()
  const corpora: DirectoryData['corpora'] = []
  for (const spec of specs) {
    try {
      const json = await A.DataUtil.loadJSON(`data/${spec.index}`)
      const items: any[] = json[spec.prop] ?? []
      corpora.push({ prop: spec.prop, items, files: await Promise.all(items.map((it) => corpusFile(spec.prop, String(it.id)))), error: null })
    } catch (e) {
      corpora.push({ prop: spec.prop, items: [], files: [], error: msg(e).split('\n')[0] })
    }
  }
  const names = [...new Set(corpora.flatMap((c) => c.items.map((it) => A.SourceUtil.getEntitySource(it) as string)))]
  const editions = names.length ? await editionOf(names) : {}
  const sources: DirectoryData['sources'] = {}
  for (const s of names) sources[s] = { full: A.Parser.sourceJsonToFull(s), abv: A.Parser.sourceJsonToAbv(s), edition: editions[s] }
  return { groups: (A.SourceUtil.ADV_BOOK_GROUPS as DirectoryData['groups']).map((g) => ({ ...g })), corpora, sources, sourceFiles: await sourceFiles() }
}
