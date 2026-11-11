// 文档类数据（P5 B-02）：作者把"规则速查""城主屏参考"做成一本本小册子，放在 data/generated/bookref-*.json：
//   { reference: { <文档编号>: { name, id, contents: [章节标题…] } }, data: { <文档编号>: [章节…] } }
// 作者的速查页（quickreference.js）就是直接读这个文件、当书来显示；作者的加载器里没有对应的"条目类别"，
// 所以不能按条目类别读（读出来是 0 条）。这里照作者的读法：原样读下载好的文件，原样存进派生物，不挑字段。
import type { LibraryDatabase } from './db'
import type { LibraryView } from './revision'
import { commitOf, type SourceEntry } from './sources'

/** 文件名规则（不手抄名单）：data/generated/ 下 bookref-*.json，排除 -index 目录文件。 */
const FILE_RULE = /^data\/generated\/bookref-[^/]+\.json$/
const isDocumentFile = (path: string): boolean => FILE_RULE.test(path) && !path.endsWith('-index.json')

export interface DocumentHead {
  id: string
  name: string
  /** 作者的章节目录（章节名 + 小节标题），原样。 */
  contents: unknown[]
  /** 来自哪个文件。 */
  file: string
}

export interface DocumentBody {
  head: DocumentHead
  /** 章节正文数组，原样。 */
  data: unknown[]
}

export const documentKey = (sourceId: string, id: string): string => `doc:${sourceId}:${id}`
export const documentListKey = (sourceId: string): string => `docs:${sourceId}`

interface RawDocumentFile {
  reference?: Record<string, { name?: string; id?: string; contents?: unknown[] }>
  data?: Record<string, unknown[]>
}

/** 一个文件里的文档（作者格式原样）。文件不是这种格式就返回空。 */
export function documentsOfFile(file: string, text: string): DocumentBody[] {
  let raw: RawDocumentFile
  try {
    raw = JSON.parse(text) as RawDocumentFile
  } catch {
    return []
  }
  const out: DocumentBody[] = []
  for (const [id, ref] of Object.entries(raw.reference ?? {})) {
    const data = raw.data?.[id]
    if (!Array.isArray(data)) continue
    out.push({ head: { id, name: String(ref?.name ?? id), contents: Array.isArray(ref?.contents) ? ref.contents : [], file }, data })
  }
  return out
}

export class DocumentStore {
  private readonly building = new Map<string, Promise<DocumentHead[]>>()

  constructor(private readonly db: LibraryDatabase) {}

  /** 这套官方数据里的文档清单；没存过就从已下载的文件里读一次（不联网），所以旧安装不用重装。 */
  list(source: SourceEntry, view?: LibraryView): Promise<DocumentHead[]> {
    const key = `${view?.id ?? 'legacy'}:${source.id}`
    let p = this.building.get(key)
    if (!p) {
      p = this.load(source, view)
      p.catch(() => this.building.delete(key))
      this.building.set(key, p)
    }
    return p
  }

  private async load(source: SourceEntry, view?: LibraryView): Promise<DocumentHead[]> {
    const saved = view ? await view.derivedGet(documentListKey(source.id)) : await this.db.derived.get(documentListKey(source.id))
    if (saved && saved.fingerprint === (view ? await view.commitOf(source) : commitOf(source))) return saved.value as DocumentHead[]
    return this.build(source, view)
  }

  /** 读下载好的文件、存进派生物。同编号的文档（城主屏文件里也带了速查）按文件名顺序取第一份。 */
  async build(source: SourceEntry, view?: LibraryView): Promise<DocumentHead[]> {
    const paths = (view ? await view.filePaths(source) : (await this.db.files.where('source').equals(source.id).primaryKeys()).map(([, path]) => path)).filter(isDocumentFile).sort()
    const seen = new Map<string, DocumentBody>()
    const commit = view ? await view.commitOf(source) : commitOf(source)
    for (const path of paths) {
      const rec = view ? await view.fileGet(source, path) : await this.db.files.get([source.id, path])
      if (!rec || (!view && rec.commit !== commit)) continue
      for (const doc of documentsOfFile(path, rec.text)) if (!seen.has(doc.head.id)) seen.set(doc.head.id, doc)
    }
    for (const doc of seen.values()) {
      if (view) await view.derivedPut(documentKey(source.id, doc.head.id), commit, doc)
      else await this.db.derived.put({ key: documentKey(source.id, doc.head.id), fingerprint: commit, value: doc, savedAt: Date.now() })
    }
    const heads = [...seen.values()].map((d) => d.head)
    if (view) await view.derivedPut(documentListKey(source.id), commit, heads)
    else await this.db.derived.put({ key: documentListKey(source.id), fingerprint: commit, value: heads, savedAt: Date.now() })
    return heads
  }

  /** 一份文档的全文。没有就抛错（说明哪份、哪套）。 */
  async get(source: SourceEntry, id: string, view?: LibraryView): Promise<DocumentBody> {
    await this.list(source, view)
    const rec = view ? await view.derivedGet(documentKey(source.id, id)) : await this.db.derived.get(documentKey(source.id, id))
    if (!rec) throw new Error(`${source.id} 没有这份文档：${id}`)
    return rec.value as DocumentBody
  }

  /** 清掉缓存（重装或删除整套资料后）。 */
  async clear(source: SourceEntry, view?: LibraryView): Promise<void> {
    this.building.delete(`${view?.id ?? 'legacy'}:${source.id}`)
    if (view) {
      const old = await view.derivedKeys(`doc:${source.id}:`)
      for (const key of old.keys()) await view.derivedDelete(key)
      if (await view.derivedGet(documentListKey(source.id))) await view.derivedDelete(documentListKey(source.id))
    } else {
      await this.db.derived.where('key').startsWith(`doc:${source.id}:`).delete()
      await this.db.derived.delete(documentListKey(source.id))
    }
  }
}
