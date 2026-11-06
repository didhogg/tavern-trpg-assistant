// 官方原始文件：先问本地库；允许联网时才去云端取、核对指纹、原样存进本地库。
import type { LibraryDatabase } from './db'
import { fetchFileList, fetchVerified, type FetchLike, type FileList } from './fetcher'
import { commitOf, fileListUrl, mirrorRoots, type SourceEntry } from './sources'

export interface FileProviderOptions {
  db: LibraryDatabase
  fetchImpl?: FetchLike
}

export class FileProvider {
  private readonly db: LibraryDatabase
  private readonly fetchImpl: FetchLike
  private readonly lists = new Map<string, Promise<FileList>>()

  constructor({ db, fetchImpl }: FileProviderOptions) {
    this.db = db
    this.fetchImpl = fetchImpl ?? ((url) => fetch(url))
  }

  /** 锁定版本的云端文件清单；取过一次就存进派生物，之后离线也能用。 */
  fileList(source: SourceEntry): Promise<FileList> {
    const key = `filelist:${source.id}@${commitOf(source)}`
    let p = this.lists.get(key)
    if (!p) {
      p = (async () => {
        const saved = await this.db.derived.get(key)
        if (saved) return saved.value as FileList
        const list = await fetchFileList(fileListUrl(source), this.fetchImpl)
        await this.db.derived.put({ key, fingerprint: commitOf(source), value: list, savedAt: Date.now() })
        return list
      })()
      p.catch(() => this.lists.delete(key))
      this.lists.set(key, p)
    }
    return p
  }

  async local(source: SourceEntry, path: string): Promise<string | null> {
    const rec = await this.db.files.get([source.id, path])
    return rec && rec.commit === commitOf(source) ? rec.text : null
  }

  /** 取一个文件的原文。本地没有且不允许联网 → null；云端清单里没有这个文件 → null。 */
  async get(source: SourceEntry, path: string, { allowNetwork }: { allowNetwork: boolean }): Promise<string | null> {
    const local = await this.local(source, path)
    if (local !== null || !allowNetwork) return local
    const expected = (await this.fileList(source))[path]
    if (!expected) return null
    const fetched = await fetchVerified(mirrorRoots(source), path, expected, this.fetchImpl)
    const text = new TextDecoder('utf-8', { fatal: true }).decode(fetched.bytes)
    await this.db.files.put({ source: source.id, path, commit: commitOf(source), text, gitSha: fetched.gitSha, size: fetched.bytes.length, savedAt: Date.now() })
    return text
  }
}
