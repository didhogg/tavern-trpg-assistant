// 官方书目（BE-7，D2-P2 B1 设计 §8.1 / L1）：没装官方数据也能列出各本书和冒险。
// 做法：开一个允许联网的一次性小窗，让作者程序自己读书目文件（文件名来自作者加载器登记表）；
// 它按需取到的文件（书目、导航索引、初始化要读的小文件）照常存进本地仓，所以只下载几百 KB；
// 整理好的书目按“数据集 + 锁定版本”存进派生物，下次（含断网）直接用。已装好的数据集不联网，用现成小窗读本地文件。
// 书目文件和冒险文件各自独立：哪个取不到就只记哪个的错误（record.errors），不抛错、不写缓存（重试会重新联网）。
import type { LibraryDatabase } from './db'
import type { DirectoryData } from './runtime/frame/directory-commands'
import type { AuthorFrame } from './runtime/host'
import type { PlanOwner } from './plan'
import { commitOf, officialSourceOf } from './sources'
import type { LibraryView } from './revision'

export interface DirectoryRecord extends Omit<DirectoryData, 'corpora'> {
  codeSet: string
  commit: string
  /** books.json 的 book / adventures.json 的 adventure，条目原样（作者字段不挑不改）。 */
  books: any[] // eslint-disable-line @typescript-eslint/no-explicit-any -- 作者条目没有类型
  adventures: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  /** 冒险编号 → 正文文件路径（作者加载器给的拼法）；下载大小估算与下载共用。 */
  adventureFiles: Record<string, string>
  /** 冒险的类别名（作者加载器登记表的 props[0]），查"这本冒险下载了没有"用。 */
  adventureProp: string
  /** 文件 → 归属（来源 / 书正文 / 冒险正文 / 职业文件）；没登记的是共用文件。 */
  owners: Record<string, PlanOwner>
  /** 作者来源索引文件 → 索引里的全部来源（按书安装时用来生成读上下文过滤）。 */
  indexSources: Record<string, string[]>
  /** 哪个目录文件取不到及原因；null = 正常。 */
  errors: { books: string | null; adventures: string | null }
}

export interface DirectoryOptions {
  db: LibraryDatabase
  /** 已装好的数据集用：现成的只读本地小窗。 */
  localFrame: (codeSet: string) => Promise<AuthorFrame>
  /** 没装的数据集用：允许联网的一次性小窗；kvScope 隔离，不碰真正的作者存储。 */
  networkFrame: (codeSet: string, kvScope: string, view?: LibraryView) => Promise<AuthorFrame>
  /** 当前已发布版本；给了就按版本的提交号缓存书目。 */
  view?: () => Promise<LibraryView>
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))
const KEY_VERSION = 'v3'

export class BookDirectory {
  private readonly inflight = new Map<string, Promise<DirectoryRecord>>()

  constructor(private readonly opts: DirectoryOptions) {}

  private async keyOf(codeSet: string): Promise<{ key: string; commit: string; sourceId: string }> {
    const source = officialSourceOf(codeSet)
    const view = this.opts.view ? await this.opts.view() : null
    const commit = view ? await view.commitOf(source) : commitOf(source)
    return { key: `directory:${KEY_VERSION}:${source.id}@${commit}`, commit, sourceId: source.id }
  }

  /** 只看缓存，不联网、不开小窗。 */
  async peek(codeSet: string): Promise<DirectoryRecord | null> {
    const saved = await this.opts.db.derived.get((await this.keyOf(codeSet)).key)
    return saved ? (saved.value as DirectoryRecord) : null
  }

  get(codeSet: string): Promise<DirectoryRecord> {
    let p = this.inflight.get(codeSet)
    if (!p) {
      p = this.load(codeSet)
      this.inflight.set(codeSet, p)
      void p.then(() => this.inflight.delete(codeSet), () => this.inflight.delete(codeSet))
    }
    return p
  }

  /**
   * 重新取书目（库页「一键更新」，P5 B-14）：不看缓存、重新读作者书目文件并覆盖缓存；
   * 取失败（断网、地址不通）时保留旧的，不把书架变成空的。返回现在有效的那份。
   */
  async refresh(codeSet: string): Promise<DirectoryRecord> {
    const old = await this.peek(codeSet)
    this.inflight.delete(codeSet)
    const p = this.load(codeSet, true)
    this.inflight.set(codeSet, p)
    try {
      const fresh = await p
      return (fresh.errors.books || fresh.errors.adventures) && old ? old : fresh
    } finally {
      this.inflight.delete(codeSet)
    }
  }

  private async load(codeSet: string, force = false): Promise<DirectoryRecord> {
    const { key, commit, sourceId } = await this.keyOf(codeSet)
    const saved = await this.opts.db.derived.get(key)
    if (saved && !force) return saved.value as DirectoryRecord

    const failed = (why: string): DirectoryRecord => ({
      codeSet, commit, groups: [], sources: {}, books: [], adventures: [], adventureFiles: {}, adventureProp: '',
      owners: {}, indexSources: {}, sourceFiles: { maps: {}, classFiles: [] },
      errors: { books: `官方书目（${codeSet}）取不到：${why}`, adventures: `官方冒险目录（${codeSet}）取不到：${why}` },
    })
    const installed = (await this.opts.db.sets.get(sourceId))?.status === 'installed'
    const view = this.opts.view ? await this.opts.view() : undefined
    let frame: AuthorFrame
    try {
      frame = installed ? await this.opts.localFrame(codeSet) : await this.opts.networkFrame(codeSet, `directory:${codeSet}`, view)
    } catch (e) {
      return failed(msg(e))
    }
    try {
      const corpus = (await frame.call('loaders')).filter((l) => l.kind === 'corpus' && l.index)
      const specs = corpus.map((l) => ({ index: l.index as string, prop: l.props[0] }))
      const data = await frame.call('directory', specs)
      const find = (marker: string): { items: any[]; files: string[]; error: string | null; prop: string } => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const at = corpus.findIndex((l) => l.props.includes(marker))
        if (at < 0) return { items: [], files: [], error: `作者加载器登记表里没有 ${marker}`, prop: '' }
        return { ...data.corpora[at], prop: corpus[at].props[0] }
      }
      const books = find('bookData')
      const adventures = find('adventureData')
      const owners: Record<string, PlanOwner> = {}
      const addBook = (path: string, id: string, source: string): void => { if (path) owners[path] = { kind: 'book', id, source } }
      const addAdventure = (path: string, id: string, source: string): void => { if (path) owners[path] = { kind: 'adventure', id, source } }
      const sourceFiles = data.sourceFiles ?? { maps: {}, classFiles: [] }
      const indexSources: Record<string, string[]> = {}
      for (const map of Object.values(sourceFiles.maps)) {
        indexSources[map.indexPath] = Object.keys(map.index)
        for (const [source, file] of Object.entries(map.index)) {
          const path = `data/${map.dir}/${file}`
          const cur = owners[path]
          if (cur?.kind === 'source') { if (!cur.sources.includes(source)) cur.sources.push(source) }
          else owners[path] = { kind: 'source', sources: [source] }
        }
      }
      for (const path of sourceFiles.classFiles) owners[path] = { kind: 'class' }
      books.items.forEach((it, i) => addBook(books.files[i], String(it.id), String(it.source)))
      adventures.items.forEach((it, i) => addAdventure(adventures.files[i], String(it.id), String(it.source)))
      const record: DirectoryRecord = {
        codeSet, commit, groups: data.groups, sources: data.sources, books: books.items, adventures: adventures.items,
        adventureFiles: Object.fromEntries(adventures.items.map((it, i) => [String(it.id), adventures.files[i]])),
        adventureProp: adventures.prop, owners, indexSources, sourceFiles,
        errors: { books: books.error ? `官方书目（${codeSet}）取不到：${books.error}` : null, adventures: adventures.error ? `官方冒险目录（${codeSet}）取不到：${adventures.error}` : null },
      }
      if (!record.errors.books && !record.errors.adventures) await this.opts.db.derived.put({ key, fingerprint: commit, value: record, savedAt: Date.now() })
      return record
    } catch (e) {
      const why = frame.failures.length ? `${msg(e)}（${frame.failures[0]}）` : msg(e)
      return failed(why)
    } finally {
      frame.close()
    }
  }
}
