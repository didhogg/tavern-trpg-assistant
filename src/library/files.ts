// 官方原始文件：先问本地库；允许联网时才去云端取、核对指纹、原样存进本地库。
// P5 T1：读取和下载都带一个固定的库版本；新版本写自己的文件版本，旧版本继续读旧文件。
import type { LibraryDatabase } from './db'
import { fetchFileList, fetchVerified, type FetchLike, type FileList } from './fetcher'
import { commitOf, fileListUrlAt, mirrorRootsAt, type SourceEntry } from './sources'
import type { LibraryRevisionStore, LibraryView } from './revision'

export interface FileProviderOptions {
  db: LibraryDatabase
  fetchImpl?: FetchLike
  /** 启动时恢复数据提交号（官方更新后不是登记表那个）；读写文件前先等它（B-28）。 */
  ready?: Promise<void>
  /** 版本化读取（P5 T1）；不给时按旧的单版本行为（测试 / 迁移前）。 */
  revisions?: LibraryRevisionStore
}

export interface FileRecordRead {
  text: string
  gitSha: string
  size: number
  commit: string
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

  private async commit(source: SourceEntry, view?: LibraryView): Promise<string> {
    if (view) return view.commitOf(source)
    return commitOf(source)
  }

  /** 锁定版本的云端文件清单；取过一次就存进派生物，之后离线也能用。 */
  async fileList(source: SourceEntry, view?: LibraryView): Promise<FileList> {
    await this.ready
    const commit = await this.commit(source, view)
    const key = `filelist:${source.id}@${commit}`
    let p = this.lists.get(key)
    if (!p) {
      p = (async () => {
        const saved = view ? await view.derivedGet(key) : await this.db.derived.get(key)
        if (saved) return saved.value as FileList
        const list = await fetchFileList(fileListUrlAt(source, commit), this.fetchImpl)
        if (view) await view.derivedPut(key, commit, list)
        else await this.db.derived.put({ key, fingerprint: commit, value: list, savedAt: Date.now() })
        return list
      })()
      p.catch(() => this.lists.delete(key))
      this.lists.set(key, p)
    }
    return p
  }

  /** 重新取云端文件清单并覆盖缓存（P5 B-14）；取失败时原缓存不动，错误抛给调用方。 */
  async refreshFileList(source: SourceEntry, view?: LibraryView): Promise<FileList> {
    await this.ready
    const commit = await this.commit(source, view)
    const key = `filelist:${source.id}@${commit}`
    const list = await fetchFileList(fileListUrlAt(source, commit), this.fetchImpl)
    if (view) await view.derivedPut(key, commit, list)
    else await this.db.derived.put({ key, fingerprint: commit, value: list, savedAt: Date.now() })
    this.lists.set(key, Promise.resolve(list))
    return list
  }

  /** 已缓存的云端文件清单；没取过就是 null（不联网）。 */
  async cachedFileList(source: SourceEntry, view?: LibraryView): Promise<FileList | null> {
    await this.ready
    const commit = await this.commit(source, view)
    const saved = view ? await view.derivedGet(`filelist:${source.id}@${commit}`) : await this.db.derived.get(`filelist:${source.id}@${commit}`)
    return saved ? (saved.value as FileList) : null
  }

  /** 只读本地、返回完整记录（镜像核对用）。 */
  async record(source: SourceEntry, path: string, view?: LibraryView): Promise<FileRecordRead | null> {
    await this.ready
    if (view) return view.fileGet(source, path)
    const rec = await this.db.files.get([source.id, path])
    return rec && rec.commit === commitOf(source) ? { text: rec.text, gitSha: rec.gitSha, size: rec.size, commit: rec.commit } : null
  }

  async local(source: SourceEntry, path: string, view?: LibraryView): Promise<string | null> {
    return (await this.record(source, path, view))?.text ?? null
  }

  /** 取一个文件的原文。本地没有且不允许联网 → null；云端清单里没有这个文件 → null。 */
  async get(source: SourceEntry, path: string, { allowNetwork, view, writeLegacy = false }: { allowNetwork: boolean; view?: LibraryView; writeLegacy?: boolean }): Promise<string | null> {
    const local = await this.record(source, path, view)
    if (local) return local.text
    if (!allowNetwork) return null
    const commit = await this.commit(source, view)
    const expected = (await this.fileList(source, view))[path]
    if (!expected) return null
    const fetched = await fetchVerified(mirrorRootsAt(source, commit), path, expected, this.fetchImpl)
    const text = new TextDecoder('utf-8', { fatal: true }).decode(fetched.bytes)
    if (view && !writeLegacy) await view.filePut(source, path, { commit, text, gitSha: fetched.gitSha, size: fetched.bytes.length })
    else await this.db.files.put({ source: source.id, path, commit, text, gitSha: fetched.gitSha, size: fetched.bytes.length, savedAt: Date.now() })
    return text
  }
}
