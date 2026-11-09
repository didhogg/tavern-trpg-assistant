// 官方书目（BE-7，D2-P2 B1 设计 §8.1 / L1）：没装官方数据也能列出各本书和冒险。
// 做法：开一个允许联网的一次性小窗，让作者程序自己读书目文件（文件名来自作者加载器登记表）；
// 它按需取到的文件（书目、导航索引、初始化要读的小文件）照常存进本地仓，所以只下载几百 KB；
// 整理好的书目按“数据集 + 锁定版本”存进派生物，下次（含断网）直接用。已装好的数据集不联网，用现成小窗读本地文件。
import type { LibraryDatabase } from './db'
import type { DirectoryData } from './runtime/frame/directory-commands'
import type { AuthorFrame } from './runtime/host'
import { commitOf, officialSourceOf } from './sources'

export interface DirectoryRecord extends Omit<DirectoryData, 'corpora'> {
  codeSet: string
  commit: string
  /** books.json 的 book / adventures.json 的 adventure，条目原样（作者字段不挑不改）。 */
  books: any[] // eslint-disable-line @typescript-eslint/no-explicit-any -- 作者条目没有类型
  adventures: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface DirectoryOptions {
  db: LibraryDatabase
  /** 已装好的数据集用：现成的只读本地小窗。 */
  localFrame: (codeSet: string) => Promise<AuthorFrame>
  /** 没装的数据集用：允许联网的一次性小窗；kvScope 隔离，不碰真正的作者存储。 */
  networkFrame: (codeSet: string, kvScope: string) => Promise<AuthorFrame>
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

export class BookDirectory {
  private readonly inflight = new Map<string, Promise<DirectoryRecord>>()

  constructor(private readonly opts: DirectoryOptions) {}

  get(codeSet: string): Promise<DirectoryRecord> {
    let p = this.inflight.get(codeSet)
    if (!p) {
      p = this.load(codeSet)
      this.inflight.set(codeSet, p)
      void p.then(() => this.inflight.delete(codeSet), () => this.inflight.delete(codeSet))
    }
    return p
  }

  private async load(codeSet: string): Promise<DirectoryRecord> {
    const source = officialSourceOf(codeSet)
    const commit = commitOf(source)
    const key = `directory:${source.id}@${commit}`
    const saved = await this.opts.db.derived.get(key)
    if (saved) return saved.value as DirectoryRecord

    const installed = (await this.opts.db.sets.get(source.id))?.status === 'installed'
    const frame = installed ? await this.opts.localFrame(codeSet) : await this.opts.networkFrame(codeSet, `directory:${codeSet}`)
    try {
      const corpus = (await frame.call('loaders')).filter((l) => l.kind === 'corpus' && l.index)
      const specs = corpus.map((l) => ({ index: l.index as string, prop: l.props[0] }))
      const data = await frame.call('directory', specs)
      const pick = (marker: string): any[] => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const at = corpus.findIndex((l) => l.props.includes(marker))
        return at < 0 ? [] : data.corpora[at].items
      }
      const record: DirectoryRecord = { codeSet, commit, groups: data.groups, sources: data.sources, books: pick('bookData'), adventures: pick('adventureData') }
      if (!record.books.length && !record.adventures.length) throw new Error('书目文件里没有书也没有冒险')
      await this.opts.db.derived.put({ key, fingerprint: commit, value: record, savedAt: Date.now() })
      return record
    } catch (e) {
      const why = frame.failures.length ? `${msg(e)}（${frame.failures[0]}）` : msg(e)
      throw new Error(`官方书目（${codeSet}）取不到：${why}`, { cause: e })
    } finally {
      if (!installed) frame.close()
    }
  }
}
