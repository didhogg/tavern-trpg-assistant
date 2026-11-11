// 条目之间的"定位"（P5 B-05 / T4）：给 类别 + 作者编号，找出它在哪个包里（官方 / 自制 / 书与冒险全文 / 文档）。
// 搜索命中分流（B-01）和术语跳转（B-04）都用它。只读库，不改任何东西。
// P5 T4：书 / 冒险正文保留多个提供者（官方 + 自制），不再让后写的 Map.set 顶掉官方。
import { DocumentStore } from './documents'
import type { TagMeta } from './runtime/frame/tag-commands'
import type { LibraryService } from './service'
import type { LibraryView } from './revision'
import { SOURCES, officialSourceOf, type SourceEntry } from './sources'

export interface CorpusProvider {
  id: string
  source: string | null
  /** 在哪个数据集（自制的书在自制数据集里）；官方不写。 */
  set?: string
}

/** 书、冒险这类"按本取全文"的类别：类别名 → 作者编号（小写）→ 提供者列表（官方优先，自制在后）。 */
export type CorpusIndex = Map<string, Map<string, CorpusProvider[]>>

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
  /** 同一条正文有几个提供者（官方 + 自制）。 */
  providers?: CorpusProvider[]
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

export interface ResolvedTag {
  tag: string
  name: string
  displayText: string
  source: string | null
  page: string
  hash: string
  part?: { chapter: number | null; section: string | null }
  located: Located | null
}

export class EntryLinks {
  private readonly corpora = new Map<string, Promise<CorpusIndex>>()

  constructor(private readonly lib: LibraryService, readonly docs: DocumentStore) {}

  reset(): void {
    this.corpora.clear()
  }

  /** 作者书目里每一本书、每个冒险的编号、来源（读本地 books.json / adventures.json），以及自制里的书。 */
  corpusIndex(codeSet: string, viewArg?: LibraryView): Promise<CorpusIndex> {
    const key = `${viewArg?.id ?? 'current'}:${codeSet}`
    let p = this.corpora.get(key)
    if (!p) {
      p = (async () => {
        const view = viewArg ?? await this.lib.currentView()
        const frame = await this.lib.frameOf(codeSet, view)
        const out: CorpusIndex = new Map()
        const add = (prop: string, row: { id: string; source: string | null; hash: string }, set?: string): void => {
          const into = out.get(prop) ?? out.set(prop, new Map()).get(prop)!
          const list = into.get(row.hash.toLowerCase()) ?? []
          if (!list.some((x) => x.id === row.id && x.set === set && x.source === row.source)) list.push({ id: row.id, source: row.source, ...(set ? { set } : {}) })
          into.set(row.hash.toLowerCase(), list)
        }
        for (const loader of (await frame.call('loaders')).filter((l) => l.kind === 'corpus' && l.index && l.page)) {
          const prop = loader.props[0]
          for (const r of await frame.call('corpusList', loader.index as string, prop, loader.page as string)) add(prop, r)
        }
        for (const brew of SOURCES.filter((s) => s.codeSet === codeSet && s.kind === 'brew')) {
          if (!(await view.brewState(brew.id)) && !(await view.derivedGet(`audit:${brew.id}`))) continue
          for (const [prop, rows] of Object.entries(await this.lib.brewCorpora(brew.id, view))) for (const r of rows) add(prop, r, brew.id)
        }
        return out
      })()
      p.catch(() => this.corpora.delete(key))
      this.corpora.set(key, p)
    }
    return p
  }

  async documentIds(codeSet: string, viewArg?: LibraryView): Promise<string[]> {
    const view = viewArg ?? await this.lib.currentView()
    return (await this.docs.list(officialSourceOf(codeSet), view)).map((d) => d.id)
  }

  /** 找条目所在的包。顺序：文档 → 书 / 冒险（官方优先，再自制）→ 官方条目 → 自制条目。 */
  async locate(codeSet: string, prop: string, hash: string, viewArg?: LibraryView): Promise<Located | null> {
    const view = viewArg ?? await this.lib.currentView()
    const official = officialSourceOf(codeSet)
    if (prop === 'document') {
      const doc = parseDocumentHash(hash, await this.documentIds(codeSet, view))
      return doc ? { kind: 'document', set: official.id, prop, hash, source: null, id: doc.id } : null
    }
    const providers = (await this.corpusIndex(codeSet, view)).get(prop)?.get(hash.toLowerCase()) ?? []
    for (const p of providers) {
      if (p.set) {
        if (!(await view.brewState(p.set)) && !(await view.derivedGet(`audit:${p.set}`))) continue
        return { kind: 'corpus', set: p.set, prop, hash, source: p.source, id: p.id, providers }
      }
      const state = await view.officialState(official.id)
      if (state?.status !== 'installed') continue
      const installed = prop === 'adventure' ? state.adventures : state.books
      if (installed && !installed.includes(p.id)) continue
      return { kind: 'corpus', set: official.id, prop, hash, source: p.source, id: p.id, providers }
    }
    const sets: SourceEntry[] = [official, ...SOURCES.filter((s) => s.codeSet === codeSet && s.kind === 'brew')]
    for (const set of sets) {
      if (set.id === official.id) {
        if ((await view.officialState(set.id))?.status !== 'installed') continue
      } else if (!(await view.brewState(set.id)) && !(await view.derivedGet(`audit:${set.id}`))) continue
      const stored = await this.lib.storedItem(set.id, prop, hash, view)
      if (stored) return { kind: 'entry', set: set.id, prop, hash, source: stored.source, id: null }
    }
    return null
  }

  async resolveTag(codeSet: string, tag: string, text: string, viewArg?: LibraryView): Promise<ResolvedTag | null> {
    const view = viewArg ?? await this.lib.currentView()
    const meta: TagMeta | null = await (await this.lib.frameOf(codeSet, view)).call('tagMeta', tag, text)
    if (!meta) return null
    let located: Located | null = null
    for (const prop of [...meta.props, 'document']) {
      located = await this.locate(codeSet, prop, meta.hash, view)
      if (located) break
    }
    return { tag: meta.tag, name: meta.name, displayText: meta.displayText, source: meta.source, page: meta.page, hash: meta.hash, ...(meta.part ? { part: meta.part } : {}), located }
  }
}
