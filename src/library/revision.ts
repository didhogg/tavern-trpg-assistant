// P5 T1：库的可读版本（R）与准备版本（R'）。只加插件管理信息，不重新定义作者条目。
//   - 旧 files / derived / kv 当作只读的 R0（rev-legacy），不复制、不清空。
//   - 新版本只写变化：文件按内容哈希去重，解析结果与作者存储按版本层叠加。
//   - 读操作一次捕获一个 R；发布只换“已发布指针”，旧 R 继续可读。
import type {
  BrewSetState, DerivedRecord, LibraryDatabase, OfficialSetState, RevisionRecord,
} from './db'
import { CODE_SETS, SOURCES, type SourceEntry } from './sources'
import { dataVersionOf } from './revision-data'
import { fileGet, filePaths, filePut, fileRemove, fileSha, type FileRead } from './revision-files'
import type { KernelDataVersion } from '../schemas/kernel'

export const LEGACY_REVISION = 'rev-legacy'
const REV_PREFIX = 'rev:'

const uid = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return [...bytes].map((b) => b.toString(36).padStart(2, '0')).join('')
}

export class LibraryView {
  private chainCache: Promise<RevisionRecord[]> | null = null
  private scopeCache = new Map<string, Promise<string[]>>()

  constructor(readonly store: LibraryRevisionStore, readonly revision: RevisionRecord) {}

  get id(): string { return this.revision.id }
  get parent(): string | null { return this.revision.parent }
  get legacy(): boolean { return !!this.revision.legacy }
  get preparing(): boolean { return this.revision.status === 'preparing' }
  get published(): boolean { return this.revision.status === 'published' || this.revision.status === 'superseded' }

  chain(): Promise<RevisionRecord[]> {
    this.chainCache ??= this.store.chain(this)
    return this.chainCache
  }

  commitOf(source: SourceEntry): Promise<string> { return this.store.commitOf(this, source) }
  officialState(setId: string): Promise<OfficialSetState | null> { return this.store.officialState(this, setId) }
  brewState(setId: string): Promise<BrewSetState | null> { return this.store.brewState(this, setId) }
  visibleSources(setId: string): Promise<string[] | null> { return this.store.visibleSources(this, setId) }
  installedBooks(setId: string): Promise<string[] | null> { return this.store.installedBooks(this, setId) }
  installedAdventures(setId: string): Promise<string[] | null> { return this.store.installedAdventures(this, setId) }

  derivedGet(key: string): Promise<DerivedRecord | undefined> { return this.store.derivedGet(this, key) }
  derivedPut(key: string, fingerprint: string, value: unknown): Promise<void> { return this.store.derivedPut(this, key, fingerprint, value) }
  derivedDelete(key: string): Promise<void> { return this.store.derivedDelete(this, key) }
  derivedKeys(prefix: string): Promise<Map<string, DerivedRecord>> { return this.store.derivedKeys(this, prefix) }

  fileGet(source: SourceEntry, path: string): Promise<FileRead | null> { return this.store.fileGet(this, source, path) }
  filePut(source: SourceEntry, path: string, file: { commit: string; text: string; gitSha: string; size: number }): Promise<void> { return this.store.filePut(this, source, path, file) }
  fileRemove(source: SourceEntry, path: string, commit: string): Promise<void> { return this.store.fileRemove(this, source, path, commit) }
  fileSha(source: SourceEntry, path: string): Promise<string | null> { return this.store.fileSha(this, source, path) }
  filePaths(source: SourceEntry): Promise<string[]> { return this.store.filePaths(this, source) }

  kvScopes(codeSet: string): Promise<string[]> {
    let p = this.scopeCache.get(codeSet)
    if (!p) {
      p = this.store.kvScopes(this, codeSet)
      this.scopeCache.set(codeSet, p)
    }
    return p
  }

  kvWriteScope(codeSet: string): string | null { return this.store.kvWriteScope(this, codeSet) }
  kvGet(codeSet: string, key: string): Promise<unknown> { return this.store.kvGet(this, codeSet, key) }
  kvSet(codeSet: string, key: string, value: unknown): Promise<void> { return this.store.kvSet(this, codeSet, key, value) }
  kvRemove(codeSet: string, key: string): Promise<void> { return this.store.kvRemove(this, codeSet, key) }
  localSnapshot(codeSet: string): Promise<Record<string, string>> { return this.store.localSnapshot(this, codeSet) }
  localSet(codeSet: string, key: string, value: string): Promise<void> { return this.store.localSet(this, codeSet, key, value) }
  localRemove(codeSet: string, key: string): Promise<void> { return this.store.localRemove(this, codeSet, key) }

  filterIndex(path: string, text: string): string { return this.store.filterIndex(this, path, text) }
    dataVersion(brews?: Record<string, BrewSetState>): Promise<KernelDataVersion> { return this.store.dataVersion(this, brews) }
}

export class LibraryRevisionStore {
  private readonly viewCache = new Map<string, LibraryView>()
  private legacyReady: Promise<void> | null = null

  constructor(readonly db: LibraryDatabase) {}

  /** 第一次打开 v4：把现有 files / derived / kv / sets 接成只读 R0。只读，不搬数据。 */
  ensureLegacy(): Promise<void> {
    this.legacyReady ??= this.ensureLegacy_()
    return this.legacyReady
  }

  private async ensureLegacy_(): Promise<void> {
    const current = await this.db.state.get('published')
    if (current?.revision) {
      const rev = await this.db.revisions.get(current.revision)
      if (rev) return
    }
    const sets = await this.db.sets.toArray()
    const official: Record<string, OfficialSetState> = {}
    for (const rec of sets) {
      const id = String(rec.id)
      const source = SOURCES.find((s) => s.id === id && s.kind === 'official')
      if (!source) continue
      official[id] = {
        commit: String(rec.commit ?? CODE_SETS[source.codeSet].commit),
        status: rec.status === 'installed' ? 'installed' : 'missing',
        sources: null, books: null, adventures: null,
        ...(rec.plan && typeof rec.plan === 'object' ? { plan: rec.plan as OfficialSetState['plan'] } : {}),
      }
    }
    const now = Date.now()
    const legacy: RevisionRecord = {
      id: LEGACY_REVISION, parent: null, status: 'published', legacy: true,
      official, brews: {}, kvScope: null, kvCodeSet: null, sourceIndexes: {},
      createdAt: 0, updatedAt: now, publishedAt: 0,
    }
    await this.db.transaction('rw', [this.db.revisions, this.db.state], async () => {
      await this.db.revisions.put(legacy)
      await this.db.state.put({ id: 'published', revision: LEGACY_REVISION, updatedAt: now })
      await this.db.state.put({ id: 'generation', value: 0, updatedAt: now })
    })
  }

  async published(): Promise<LibraryView> {
    await this.ensureLegacy()
    const rec = await this.db.state.get('published')
    const id = rec?.revision ?? LEGACY_REVISION
    return this.view(id)
  }

  async view(id: string): Promise<LibraryView> {
    const cached = this.viewCache.get(id)
    if (cached) return cached
    if (id === LEGACY_REVISION) await this.ensureLegacy()
    const revision = await this.db.revisions.get(id)
    if (!revision) throw new Error(`没有这个库版本：${id}`)
    const view = new LibraryView(this, revision)
    this.viewCache.set(id, view)
    return view
  }

  /** 发布后让缓存里的旧对象换成新记录。 */
  async refresh(id: string): Promise<LibraryView> {
    this.viewCache.delete(id)
    return this.view(id)
  }

  async chain(view: LibraryView): Promise<RevisionRecord[]> {
    const out: RevisionRecord[] = []
    let cur: RevisionRecord | undefined = view.revision
    const seen = new Set<string>()
    while (cur && !seen.has(cur.id)) {
      out.push(cur)
      seen.add(cur.id)
      if (!cur.parent) break
      cur = await this.db.revisions.get(cur.parent)
    }
    if (!out.some((r) => r.legacy)) {
      const legacy = await this.db.revisions.get(LEGACY_REVISION)
      if (legacy) out.push(legacy)
    }
    return out
  }

  /** 新开一个准备版本；它继承父版本的所有内容，自己只写变化。 */
  async createPreparing({ parent, kvScope, kvCodeSet, sourceIndexes, official, brews }: {
    parent: LibraryView
    kvScope: string | null
    kvCodeSet: string | null
    sourceIndexes?: Record<string, string[] | null>
    official?: Record<string, OfficialSetState>
    brews?: Record<string, BrewSetState>
  }): Promise<LibraryView> {
    const now = Date.now()
    const revision: RevisionRecord = {
      id: `rev-${now.toString(36)}-${uid()}`, parent: parent.id, status: 'preparing',
      ...(official ? { official } : {}), ...(brews ? { brews } : {}),
      kvScope, kvCodeSet, sourceIndexes: sourceIndexes ?? {}, createdAt: now, updatedAt: now,
    }
    await this.db.revisions.put(revision)
    const view = new LibraryView(this, revision)
    this.viewCache.set(view.id, view)
    return view
  }

  async updatePreparing(view: LibraryView, patch: Partial<RevisionRecord>): Promise<void> {
    const next = { ...view.revision, ...patch, updatedAt: Date.now() }
    await this.db.revisions.put(next)
    this.viewCache.set(next.id, new LibraryView(this, next))
  }

  async commitOf(view: LibraryView, source: SourceEntry): Promise<string> {
    for (const rev of await view.chain()) {
      const at = rev.official?.[source.id]
      if (at?.commit) return at.commit
    }
    const rec = await this.db.sets.get(source.id)
    if (rec && typeof rec.commit === 'string') return rec.commit
    return CODE_SETS[source.codeSet]?.commit ?? ''
  }

  async officialState(view: LibraryView, setId: string): Promise<OfficialSetState | null> {
    for (const rev of await view.chain()) {
      const at = rev.official?.[setId]
      if (at) return at
    }
    const source = SOURCES.find((s) => s.id === setId && s.kind === 'official')
    if (!source) return null
    const rec = await this.db.sets.get(setId)
    return rec ? {
      commit: String(rec.commit ?? CODE_SETS[source.codeSet].commit),
      status: rec.status === 'installed' ? 'installed' : 'missing',
      sources: null, books: null, adventures: null,
    } : null
  }

  async brewState(view: LibraryView, setId: string): Promise<BrewSetState | null> {
    for (const rev of await view.chain()) {
      const at = rev.brews?.[setId]
      if (at) return at
    }
    return null
  }

  async visibleSources(view: LibraryView, setId: string): Promise<string[] | null> {
    return (await this.officialState(view, setId))?.sources ?? null
  }

  async installedBooks(view: LibraryView, setId: string): Promise<string[] | null> {
    return (await this.officialState(view, setId))?.books ?? null
  }

  async installedAdventures(view: LibraryView, setId: string): Promise<string[] | null> {
    return (await this.officialState(view, setId))?.adventures ?? null
  }

  async allOfficialStates(view: LibraryView): Promise<Record<string, OfficialSetState>> {
    const out: Record<string, OfficialSetState> = {}
    for (const rev of [...(await view.chain())].reverse()) Object.assign(out, rev.official ?? {})
    // R0 的 sets 是旧记录；新版没覆盖的沿用旧状态
    for (const rec of await this.db.sets.toArray()) {
      const id = String(rec.id)
      const source = SOURCES.find((s) => s.id === id && s.kind === 'official')
      if (!source || out[id]) continue
      out[id] = {
        commit: String(rec.commit ?? CODE_SETS[source.codeSet].commit),
        status: rec.status === 'installed' ? 'installed' : 'missing',
        sources: null, books: null, adventures: null,
      }
    }
    return out
  }

  async allBrewStates(view: LibraryView): Promise<Record<string, BrewSetState>> {
    const out: Record<string, BrewSetState> = {}
    for (const rev of [...(await view.chain())].reverse()) Object.assign(out, rev.brews ?? {})
    return out
  }
  // ---- 派生结果 ----
  private derivedKey(view: LibraryView, key: string): string {
    return view.legacy ? key : `${REV_PREFIX}${view.id}:${key}`
  }

  async derivedGet(view: LibraryView, key: string): Promise<DerivedRecord | undefined> {
    for (const rev of await view.chain()) {
      const rec = await this.db.derived.get(this.derivedKey(this.viewOf(rev), key))
      if (!rec) continue
      return rec.deleted ? undefined : rec
    }
    return undefined
  }

  async derivedPut(view: LibraryView, key: string, fingerprint: string, value: unknown): Promise<void> {
    await this.db.derived.put({ key: this.derivedKey(view, key), fingerprint, value, savedAt: Date.now() })
  }

  async derivedDelete(view: LibraryView, key: string): Promise<void> {
    if (view.legacy) {
      await this.db.derived.delete(key)
      return
    }
    await this.db.derived.put({ key: this.derivedKey(view, key), fingerprint: '', value: null, deleted: true, savedAt: Date.now() })
  }

  /** 沿父链读某一前缀的全部逻辑键；新版本的同名键盖住旧版本，删除记号会挡住父层。 */
  async derivedKeys(view: LibraryView, prefix: string): Promise<Map<string, DerivedRecord>> {
    const out = new Map<string, DerivedRecord>()
    const seen = new Set<string>()
    for (const rev of await view.chain()) {
      const p = rev.legacy ? prefix : `${REV_PREFIX}${rev.id}:${prefix}`
      const rows = await this.db.derived.where('key').startsWith(p).toArray()
      for (const row of rows) {
        const logical = rev.legacy ? row.key : row.key.slice(`${REV_PREFIX}${rev.id}:`.length)
        if (seen.has(logical)) continue
        seen.add(logical)
        if (!row.deleted) out.set(logical, row)
      }
    }
    return out
  }

  private viewOf(rev: RevisionRecord): LibraryView {
    const cached = this.viewCache.get(rev.id)
    if (cached) return cached
    const view = new LibraryView(this, rev)
    this.viewCache.set(rev.id, view)
    return view
  }
  // ---- 文件版本（实现在 revision-files.ts）----

  fileGet(view: LibraryView, source: SourceEntry, path: string) { return fileGet(this, view, source, path) }
  filePut(view: LibraryView, source: SourceEntry, path: string, file: { commit: string; text: string; gitSha: string; size: number }) { return filePut(this, view, source, path, file) }
  fileRemove(view: LibraryView, source: SourceEntry, path: string, commit: string) { return fileRemove(this, view, source, path, commit) }
  fileSha(view: LibraryView, source: SourceEntry, path: string) { return fileSha(this, view, source, path) }
  filePaths(view: LibraryView, source: SourceEntry) { return filePaths(this, view, source) }
  // ---- 作者存储层 ----

  async kvScopes(view: LibraryView, codeSet: string): Promise<string[]> {
    const out: string[] = []
    for (const rev of await view.chain()) {
      if (rev.kvScope && rev.kvCodeSet === codeSet) out.push(rev.kvScope)
    }
    out.push(codeSet)
    return [...new Set(out)]
  }

  kvWriteScope(view: LibraryView, codeSet: string): string | null {
    if (view.preparing && view.revision.kvScope) return view.revision.kvScope
    if (view.legacy) return codeSet
    return null
  }

  private async kvRecord(view: LibraryView, codeSet: string, key: string): Promise<{ scope: string; value: unknown; deleted?: boolean } | null> {
    for (const scope of await view.kvScopes(codeSet)) {
      const rec = await this.db.kv.get([scope, key])
      if (rec) return { scope, value: rec.value, ...(rec.deleted ? { deleted: true } : {}) }
    }
    return null
  }

  async kvGet(view: LibraryView, codeSet: string, key: string): Promise<unknown> {
    const rec = await this.kvRecord(view, codeSet, key)
    return rec && !rec.deleted ? rec.value : null
  }

  async kvSet(view: LibraryView, codeSet: string, key: string, value: unknown): Promise<void> {
    const scope = this.kvWriteScope(view, codeSet)
    if (!scope) throw new Error('这个库版本是只读的，修改资料要先开一个准备版本')
    await this.db.kv.put({ scope, key, value })
  }

  async kvRemove(view: LibraryView, codeSet: string, key: string): Promise<void> {
    const scope = this.kvWriteScope(view, codeSet)
    if (!scope) throw new Error('这个库版本是只读的，修改资料要先开一个准备版本')
    await this.db.kv.put({ scope, key, value: null, deleted: true })
  }

  async localSnapshot(view: LibraryView, codeSet: string): Promise<Record<string, string>> {
    const out: Record<string, string> = {}
    for (const scope of [...(await view.kvScopes(codeSet))].reverse()) {
      const rows = await this.db.kv.where('scope').equals(`${scope}:local`).toArray()
      for (const row of rows) {
        if (row.deleted) delete out[row.key]
        else out[row.key] = String(row.value ?? '')
      }
    }
    return out
  }

  async localSet(view: LibraryView, codeSet: string, key: string, value: string): Promise<void> {
    const scope = this.kvWriteScope(view, codeSet)
    if (!scope) throw new Error('这个库版本是只读的，修改资料要先开一个准备版本')
    await this.db.kv.put({ scope: `${scope}:local`, key, value })
  }

  async localRemove(view: LibraryView, codeSet: string, key: string): Promise<void> {
    const scope = this.kvWriteScope(view, codeSet)
    if (!scope) throw new Error('这个库版本是只读的，修改资料要先开一个准备版本')
    await this.db.kv.put({ scope: `${scope}:local`, key, value: null, deleted: true })
  }
  // ---- 读上下文里的来源索引过滤 ----

  filterIndex(view: LibraryView, path: string, text: string): string {
    const allowed = view.revision.sourceIndexes?.[path]
    if (allowed === undefined || allowed === null) return text
    try {
      const json = JSON.parse(text) as Record<string, unknown>
      if (!json || typeof json !== 'object' || Array.isArray(json)) return text
      const keep = new Set(allowed)
      return JSON.stringify(Object.fromEntries(Object.entries(json).filter(([k]) => keep.has(k))))
    } catch {
      return text
    }
  }
  // ---- 数据版本记号（N1） ----

  async dataVersion(view: LibraryView, brews?: Record<string, BrewSetState>, officialOverride?: Record<string, OfficialSetState>): Promise<KernelDataVersion> {
    if (!officialOverride && !brews && view.revision.dataVersion) return view.revision.dataVersion
    const officialStates = officialOverride ?? await this.allOfficialStates(view)
    const brewStates = brews ?? await this.allBrewStates(view)
    return dataVersionOf(officialStates, brewStates)
  }
}
