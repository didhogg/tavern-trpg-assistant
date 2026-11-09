// 条目之间的"定位"（P5 B-05）：给 类别 + 作者编号，找出它在哪个包里（官方 / 自制 / 书与冒险全文 / 文档）。
// 搜索命中分流（B-01）和术语跳转（B-04）都用它。只读库，不改任何东西。
import { DocumentStore } from './documents'
import type { TagMeta } from './runtime/frame/tag-commands'
import type { LibraryService } from './service'
import { SOURCES, officialSourceOf, type SourceEntry } from './sources'

/** 书、冒险这类"按本取全文"的类别：类别名 → 作者编号（小写）→ 本的编号与来源。 */
export type CorpusIndex = Map<string, Map<string, { id: string; source: string | null }>>

export type LocatedKind = 'entry' | 'corpus' | 'document'

export interface Located {
  kind: LocatedKind
  /** 在哪个数据集里（官方或自制）。 */
  set: string
  prop: string
  hash: string
  source: string | null
  /** 书 / 冒险 / 文档的编号（kind 为 corpus 或 document 时有）。 */
  id: string | null
}

/** 文档的作者编号形如 `bookref-quick,4,跳跃`（文档编号,章节序号,小节名）。 */
export function parseDocumentHash(hash: string, documentIds: Iterable<string>): { id: string; chapter: number | null; header: string | null } | null {
  for (const id of documentIds) {
    if (hash !== id && !hash.startsWith(`${id},`)) continue
    const [, ch, ...rest] = hash.split(',')
    const chapter = ch !== undefined && ch !== '' && Number.isInteger(Number(ch)) ? Number(ch) : null
    let header: string | null = null
    if (rest.length) {
      try { header = decodeURIComponent(rest.join(',')) } catch { header = rest.join(',') }
    }
    return { id, chapter, header }
  }
  return null
}

/** 一个链接标签解析的结果：作者说它指向谁，以及在库里能不能找到。 */
export interface ResolvedTag {
  tag: string
  name: string
  displayText: string
  source: string | null
  /** 作者的页面与类别候选；真正找到的类别在 located 里。 */
  page: string
  hash: string
  /** 书 / 冒险标签带的章节与小节。 */
  part?: { chapter: number | null; section: string | null }
  located: Located | null
}

export class EntryLinks {
  private readonly corpora = new Map<string, Promise<CorpusIndex>>()

  constructor(private readonly lib: LibraryService, readonly docs: DocumentStore) {}

  /** 装、删、重装之后调用（缓存的本目录可能变了）。 */
  reset(): void {
    this.corpora.clear()
  }

  /** 作者书目里每一本书、每个冒险的 编号、来源（读本地的 books.json / adventures.json，作者加载器登记表给出文件）。 */
  corpusIndex(codeSet: string): Promise<CorpusIndex> {
    let p = this.corpora.get(codeSet)
    if (!p) {
      p = (async () => {
        const frame = await this.lib.frameOf(codeSet)
        const out: CorpusIndex = new Map()
        for (const loader of (await frame.call('loaders')).filter((l) => l.kind === 'corpus' && l.index && l.page)) {
          const prop = loader.props[0]
          const rows = await frame.call('corpusList', loader.index as string, prop, loader.page as string)
          out.set(prop, new Map(rows.map((r) => [r.hash.toLowerCase(), { id: r.id, source: r.source ?? null }])))
        }
        return out
      })()
      p.catch(() => this.corpora.delete(codeSet))
      this.corpora.set(codeSet, p)
    }
    return p
  }

  /** 这套官方数据里有哪些文档。 */
  async documentIds(codeSet: string): Promise<string[]> {
    return (await this.docs.list(officialSourceOf(codeSet))).map((d) => d.id)
  }

  /**
   * 找条目所在的包。顺序：文档 → 书 / 冒险 → 官方条目 → 自制条目。
   * 同编号的官方与自制：交官方（原件）；自制里的备选由按战役的版本规则另行处理。
   */
  async locate(codeSet: string, prop: string, hash: string): Promise<Located | null> {
    const official = officialSourceOf(codeSet)
    if (prop === 'document') {
      const doc = parseDocumentHash(hash, await this.documentIds(codeSet))
      return doc ? { kind: 'document', set: official.id, prop, hash, source: null, id: doc.id } : null
    }
    const corpus = (await this.corpusIndex(codeSet)).get(prop)
    if (corpus) {
      const row = corpus.get(hash.toLowerCase())
      return row ? { kind: 'corpus', set: official.id, prop, hash, source: row.source, id: row.id } : null
    }
    const sets: SourceEntry[] = [official, ...SOURCES.filter((s) => s.codeSet === codeSet && s.kind === 'brew')]
    for (const set of sets) {
      const stored = await this.lib.storedItem(set.id, prop, hash)
      if (stored) return { kind: 'entry', set: set.id, prop, hash, source: stored.source, id: null }
    }
    return null
  }

  /**
   * 链接标签 → 条目（所有类别同一个入口）：问作者标签指向哪个页面 / 编号（getTagMeta），
   * 再按作者页面对应的每个类别在库里找所在的包；条目 / 书 / 文档都能找。
   * 作者不认识的标签返回 null；认识但库里没有（没装、被删）时 located 为 null。
   */
  async resolveTag(codeSet: string, tag: string, text: string): Promise<ResolvedTag | null> {
    const meta: TagMeta | null = await (await this.lib.frameOf(codeSet)).call('tagMeta', tag, text)
    if (!meta) return null
    let located: Located | null = null
    for (const prop of [...meta.props, 'document']) {
      located = await this.locate(codeSet, prop, meta.hash)
      if (located) break
    }
    return { tag: meta.tag, name: meta.name, displayText: meta.displayText, source: meta.source, page: meta.page, hash: meta.hash, ...(meta.part ? { part: meta.part } : {}), located }
  }
}
