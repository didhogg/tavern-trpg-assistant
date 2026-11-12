// 版本化文件读取（P5 T1）：从 revision.ts 拆出，保持单文件职责与行数上限。
import type { LibraryDatabase } from './db'
import type { LibraryRevisionStore, LibraryView } from './revision'
import type { SourceEntry } from './sources'

export interface FileRead {
  text: string
  gitSha: string
  size: number
  commit: string
}

const sameSha = (a: string | null | undefined, b: string | null | undefined): boolean => !!a && !!b && a === b

export async function fileGet(store: LibraryRevisionStore, view: LibraryView, source: SourceEntry, path: string): Promise<FileRead | null> {
  const db: LibraryDatabase = store.db
  for (const rev of await view.chain()) {
    const fv = await db.fileVersions.get([rev.id, source.id, path])
    if (!fv) continue
    if (fv.removed) return null
    if (fv.legacy) {
      const rec = await db.files.get([source.id, path])
      if (!rec || !sameSha(rec.gitSha, fv.gitSha)) return null
      return { text: rec.text, gitSha: rec.gitSha, size: rec.size, commit: fv.commit }
    }
    if (!fv.gitSha) return null
    const content = await db.fileContents.get([source.id, path, fv.gitSha])
    if (!content) return null
    return { text: content.text, gitSha: fv.gitSha, size: content.size, commit: fv.commit }
  }
  const rec = await db.files.get([source.id, path])
  return rec ? { text: rec.text, gitSha: rec.gitSha, size: rec.size, commit: rec.commit } : null
}

export async function filePut(store: LibraryRevisionStore, view: LibraryView, source: SourceEntry, path: string, file: { commit: string; text: string; gitSha: string; size: number }): Promise<void> {
  const db = store.db
  if (view.legacy) {
    await db.files.put({ source: source.id, path, commit: file.commit, text: file.text, gitSha: file.gitSha, size: file.size, savedAt: Date.now() })
    return
  }
  const old = await fileGet(store, view, source, path)
  if (old && sameSha(old.gitSha, file.gitSha)) return
  const legacy = await db.files.get([source.id, path])
  if (legacy && sameSha(legacy.gitSha, file.gitSha)) {
    await db.fileVersions.put({ revision: view.id, source: source.id, path, commit: file.commit, gitSha: file.gitSha, size: file.size, legacy: true, savedAt: Date.now() })
    return
  }
  await db.transaction('rw', [db.fileContents, db.fileVersions], async () => {
    await db.fileContents.put({ source: source.id, path, gitSha: file.gitSha, text: file.text, size: file.size, savedAt: Date.now() })
    await db.fileVersions.put({ revision: view.id, source: source.id, path, commit: file.commit, gitSha: file.gitSha, size: file.size, savedAt: Date.now() })
  })
}

export async function fileRemove(store: LibraryRevisionStore, view: LibraryView, source: SourceEntry, path: string, commit: string): Promise<void> {
  if (view.legacy) {
    await store.db.files.delete([source.id, path])
    return
  }
  await store.db.fileVersions.put({ revision: view.id, source: source.id, path, commit, gitSha: null, size: 0, removed: true, savedAt: Date.now() })
}

export async function fileSha(store: LibraryRevisionStore, view: LibraryView, source: SourceEntry, path: string): Promise<string | null> {
  return (await fileGet(store, view, source, path))?.gitSha ?? null
}

/** 这个版本里某个源实际存在的文件路径（新版本 + 父版本 + 旧 files，后面的删除记号会挡住）。 */
export async function filePaths(store: LibraryRevisionStore, view: LibraryView, source: SourceEntry): Promise<string[]> {
  const db = store.db
  const out = new Set<string>()
  // 复合主键是 [source, path]，不能用 primaryKeys() 后 String(key)；旧探测因此只返回了 ["cn-official"]。
  for (const rec of await db.files.where('source').equals(source.id).toArray()) out.add(rec.path)
  const seen = new Set<string>()
  for (const rev of await view.chain()) {
    const rows = await db.fileVersions.where('revision').equals(rev.id).toArray()
    for (const row of rows) {
      if (row.source !== source.id || seen.has(row.path)) continue
      seen.add(row.path)
      if (row.removed) out.delete(row.path)
      else out.add(row.path)
    }
  }
  return [...out].sort()
}

/** 沿父链找这个索引文件最近的过滤规则；没有规则 = 不过滤，null = 明确不限制。 */
export async function filterIndexFromChain(view: LibraryView, path: string, text: string, codeSet?: string): Promise<string> {
  // 旧版本曾写过空职业目录；作者这两个目录的键是职业名，任何旧来源过滤都不能应用。
  if (path === 'data/class/index.json' || path === 'data/class/fluff-index.json') return text
  for (const rev of await view.chain()) {
    const map = rev.sourceIndexes
    if (!map) continue
    // 新记录按 codeSet|path 存；旧记录只有 path，作为兼容回退。
    const scopedPath = codeSet ? `${codeSet}|${path}` : null
    const scopedStar = codeSet ? `${codeSet}|*` : null
    if (scopedStar && map[scopedStar] === null) return text
    if (scopedPath && Object.prototype.hasOwnProperty.call(map, scopedPath)) {
      const allowed = map[scopedPath]
      if (allowed === null) return text
      return filterText(allowed, text)
    }
    if (map['*'] === null) return text
    if (!Object.prototype.hasOwnProperty.call(map, path)) continue
    const allowed = map[path]
    if (allowed === null) return text
    return filterText(allowed, text)
  }
  return text
}

function filterText(allowed: string[], text: string): string {
  try {
    const json = JSON.parse(text) as Record<string, unknown>
    if (!json || typeof json !== 'object' || Array.isArray(json)) return text
    const keep = new Set(allowed)
    return JSON.stringify(Object.fromEntries(Object.entries(json).filter(([k]) => keep.has(k))))
  } catch { return text }
}
