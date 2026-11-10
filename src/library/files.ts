// 官方原始文件：先问本地库；允许联网时才去云端取、核对指纹、原样存进本地库。
import type { LibraryDatabase } from './db'
import { fetchFileList, fetchVerified, type FetchLike, type FileList } from './fetcher'
import { commitOf, fileListUrl, mirrorRoots, type SourceEntry } from './sources'

export interface FileProviderOptions {
  db: LibraryDatabase
  fetchImpl?: FetchLike
  /** 启动时恢复数据提交号（官方更新后不是登记表那个）；读写文件前先等它（B-28）。 */
  ready?: Promise<void>
}

export class FileProvider {
  private readonly db: LibraryDatabase
  private readonly fetchImpl: FetchLike
  private readonly ready: Promise<void>
  private readonly lists = new Map<string, Promise<FileList>>()

  constructor({ db, fetchImpl, ready }: FileProviderOptions) {
    this.db = db
    this.ready = ready ?? Promise.resolve()
    this.fetchImpl = fetchImpl ?? ((url) => fetch(url))
  }

  /** 启动时恢复数据提交号完成（B-28）。 */
  whenReady(): Promise<void> {
    return this.ready
  }

  /** 锁定版本的云端文件清单；取过一次就存进派生物，之后离线也能用。 */
  async fileList(source: SourceEntry): Promise<FileList> {
    await this.ready
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

  /** 重新取云端文件清单并覆盖缓存（P5 B-14）；取失败时原缓存不动，错误抛给调用方。 */
  async refreshFileList(source: SourceEntry): Promise<FileList> {
    await this.ready
    const key = `filelist:${source.id}@${commitOf(source)}`
    const list = await fetchFileList(fileListUrl(source), this.fetchImpl)
    await this.db.derived.put({ key, fingerprint: commitOf(source), value: list, savedAt: Date.now() })
    this.lists.set(key, Promise.resolve(list))
    return list
  }

  /** 已缓存的云端文件清单；没取过就是 null（不联网）。 */
  async cachedFileList(source: SourceEntry): Promise<FileList | null> {
    await this.ready
    const saved = await this.db.derived.get(`filelist:${source.id}@${commitOf(source)}`)
    return saved ? (saved.value as FileList) : null
  }

  async local(source: SourceEntry, path: string): Promise<string | null> {
    await this.ready
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
