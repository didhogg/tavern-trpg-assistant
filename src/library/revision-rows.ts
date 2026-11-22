// 已发布版本的“文件版本”和“作者存储”行，记在内存里查（真机性能，2026-11-22 驾驶员批准）。
//
// 读一个文件 / 一个作者存储键要沿父链逐个版本找。真机实测：版本链 217 层，从模板加入一个人物对库读写 8 万多次，
// TauriTavern（macOS WKWebView）的 IndexedDB 每次都跨进程，合计十几秒；测试浏览器的数据库在同进程，看不出来。
//
// 已发布的版本不再写入（安装只写准备版本；作者存储只能写准备版本或旧库基础作用域）：
//   第一次用到时，一个只读事务读出 revisions + fileVersions（或 kv）整表，只把“当时已发布”的版本按版本 / 作用域分组记下；
//   之后沿父链查找只查内存。准备中的版本、读整表之后才发布的版本、旧库基础作用域（可被旧写法改写）不记，照常直接读库
//   （后发布的版本第一次用到时单独读一次补进内存）。本标签页对已记版本的文件写入同步更新内存（write-through），不会读到旧值；回收器删行后整体作废。
import type { FileVersionRecord, KvRecord, LibraryDatabase, RevisionRecord } from './db'

const frozen = (rev: Pick<RevisionRecord, 'status'>): boolean => rev.status === 'published' || rev.status === 'superseded'
const fileKey = (source: string, path: string): string => `${source}\u0000${path}`

type Rows<T> = Map<string, T>

export class RevisionRows {
  /** 版本编号 → （源 + 路径 → 行）；只放已发布版本。 */
  private files: Promise<Map<string, Rows<FileVersionRecord>>> | null = null
  /** 作用域 → （键 → 行）；只放属于已发布版本的作用域（含它的 `:local`）。 */
  private kv: Promise<Map<string, Rows<KvRecord>>> | null = null

  constructor(private readonly db: LibraryDatabase) {}

  /** 某版本里这个文件的版本行；undefined = 这一版没记这个文件。 */
  async fileRow(rev: RevisionRecord, source: string, path: string): Promise<FileVersionRecord | undefined> {
    const rows = await this.fileRows(rev)
    return rows ? rows.get(fileKey(source, path)) : this.db.fileVersions.get([rev.id, source, path])
  }

  /** 某版本记下的全部文件版本行。 */
  async fileRowsOf(rev: RevisionRecord): Promise<FileVersionRecord[]> {
    const rows = await this.fileRows(rev)
    return rows ? [...rows.values()] : this.db.fileVersions.where('revision').equals(rev.id).toArray()
  }

  /** 作用域里这个键的行；scopeOwner = 这个作用域属于哪个版本（旧库基础作用域传 null，照常直接读库）。 */
  async kvRow(scope: string, key: string, scopeOwner: RevisionRecord | null): Promise<KvRecord | undefined> {
    const rows = scopeOwner ? await this.kvRows(scope, scopeOwner) : null
    return rows ? rows.get(key) : this.db.kv.get([scope, key])
  }

  /** 作用域里的全部行（localSnapshot 用）。 */
  async kvRowsOf(scope: string, scopeOwner: RevisionRecord | null): Promise<KvRecord[]> {
    const rows = scopeOwner ? await this.kvRows(scope, scopeOwner) : null
    return rows ? [...rows.values()] : this.db.kv.where('scope').equals(scope).toArray()
  }

  /** 写入后同步内存（只影响已记下的版本；没记的不用管，下次照常读库）。作者存储只写准备版本或基础作用域，都不进内存，不需要同步。 */
  async wroteFile(row: FileVersionRecord): Promise<void> {
    const rows = (await this.files)?.get(row.revision)
    rows?.set(fileKey(row.source, row.path), row)
  }

  /** 回收器删过行（包括已发布版本里被盖住的旧行）：内存全部作废，下次用到时重读。 */
  reset(): void {
    this.files = null
    this.kv = null
  }

  private async fileRows(rev: RevisionRecord): Promise<Rows<FileVersionRecord> | null> {
    this.files ??= this.loadFiles()
    const all = await this.files
    const hit = all.get(rev.id)
    if (hit) return hit
    // 读整表之后才发布的版本：现在已发布就单独读一次补进来
    const fresh = await this.db.revisions.get(rev.id)
    if (!fresh || !frozen(fresh)) return null
    const rows: Rows<FileVersionRecord> = new Map()
    for (const row of await this.db.fileVersions.where('revision').equals(rev.id).toArray()) rows.set(fileKey(row.source, row.path), row)
    all.set(rev.id, rows)
    return rows
  }

  private async kvRows(scope: string, owner: RevisionRecord): Promise<Rows<KvRecord> | null> {
    this.kv ??= this.loadKv()
    const all = await this.kv
    const hit = all.get(scope)
    if (hit) return hit
    const fresh = await this.db.revisions.get(owner.id)
    if (!fresh || !frozen(fresh)) return null
    const rows: Rows<KvRecord> = new Map()
    for (const row of await this.db.kv.where('scope').equals(scope).toArray()) rows.set(row.key, row)
    all.set(scope, rows)
    return rows
  }

  private async loadFiles(): Promise<Map<string, Rows<FileVersionRecord>>> {
    const { db } = this
    return db.transaction('r', [db.revisions, db.fileVersions], async () => {
      const done = new Set((await db.revisions.toArray()).filter(frozen).map((r) => r.id))
      const out = new Map<string, Rows<FileVersionRecord>>()
      for (const id of done) out.set(id, new Map())
      for (const row of await db.fileVersions.toArray()) out.get(row.revision)?.set(fileKey(row.source, row.path), row)
      return out
    })
  }

  private async loadKv(): Promise<Map<string, Rows<KvRecord>>> {
    const { db } = this
    return db.transaction('r', [db.revisions, db.kv], async () => {
      const out = new Map<string, Rows<KvRecord>>()
      for (const rev of await db.revisions.toArray()) {
        if (!frozen(rev) || rev.legacy || !rev.kvScope) continue
        out.set(rev.kvScope, new Map())
        out.set(`${rev.kvScope}:local`, new Map())
      }
      for (const row of await db.kv.toArray()) out.get(row.scope)?.set(row.key, row)
      return out
    })
  }
}

/** 沿父链的作者存储作用域（新 → 旧，最后是旧库基础作用域），带上作用域属于哪个版本（基础作用域为 null）。和 kvScopes 同顺序、同去重。 */
export function kvScopeChain(chain: RevisionRecord[], codeSet: string): Array<{ scope: string; owner: RevisionRecord | null }> {
  const out: Array<{ scope: string; owner: RevisionRecord | null }> = []
  const seen = new Set<string>()
  for (const rev of chain) {
    if (!rev.kvScope || rev.kvCodeSet !== codeSet || seen.has(rev.kvScope)) continue
    seen.add(rev.kvScope)
    out.push({ scope: rev.kvScope, owner: rev.legacy ? null : rev })
  }
  if (!seen.has(codeSet)) out.push({ scope: codeSet, owner: null })
  return out
}
