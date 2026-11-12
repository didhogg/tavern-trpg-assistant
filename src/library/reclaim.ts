// 空间回收（P5-5 §12 B3，驾驶员 2026-11-12 批准；P5-3 §6「卸载先发布移除，再回收无引用的文件」）。
// 卸载 / 删除只是发布一个「去掉它」的新版本，旧文件、旧解析结果、旧自制存储副本都还留着。这里在修改锁里清掉：
//   1. 作废（aborted）的准备版本留下的一切；
//   2. 当前版本父链里被更新的一层盖住的旧副本（解析结果、文件版本、自制存储）——读取总是从最新一层往下找，盖住的永远读不到；
//   3. 当前版本里已经卸载的官方资料：整套卸掉的那套的全部文件与解析结果；按书卸掉的书 / 来源 / 冒险独占的文件与正文；
//   4. 没有任何文件版本再指向的文件内容；
//   5. 结算内核换算缓存（kc:）里不属于当前官方数据版本的行（换算钥匙含官方数据版本，旧版本的永远用不上，2026-11-12）。
// 不动：用户数据（战役、存档在另一个库）、自制包本身（当前版本还在的）、房规、版本选择、书目缓存。
// 代价：被回收的旧版本不再能读（读旧版本的小窗在发布后已经退休，service.retire）。
import type { LibraryDatabase } from './db'
import type { BookDirectory } from './directory'
import { parsedKey } from './install'
import type { LibraryOperations } from './operations'
import type { LibraryRevisionStore } from './revision'
import { SOURCES } from './sources'

export interface ReclaimReport {
  /** 估计释放的字节（文件按记录的大小，解析结果 / 存储按 JSON 长度）。 */
  bytes: number
  fileContents: number
  fileVersions: number
  legacyFiles: number
  derived: number
  kv: number
  /** 删掉的结算内核旧换算缓存行数。 */
  kernelCache: number
  /** 跳过的部分（例如没有作者书目缓存，按书卸掉的文件这次没回收）。 */
  notes: string[]
}

const REV = 'rev:'
const jsonBytes = (v: unknown): number => { try { return JSON.stringify(v ?? null).length } catch { return 0 } }

export async function reclaimLibrary(deps: { db: LibraryDatabase; revisions: LibraryRevisionStore; operations: LibraryOperations; directory: BookDirectory; kernelOfficial?: () => Promise<string> }): Promise<ReclaimReport> {
  const { db, revisions, operations, directory } = deps
  return operations.withLock(async (renew) => {
    const report: ReclaimReport = { bytes: 0, fileContents: 0, fileVersions: 0, legacyFiles: 0, derived: 0, kv: 0, kernelCache: 0, notes: [] }
    const view = await revisions.published()
    const chain = await view.chain() // 新 → 旧，最后是旧版 R0
    const prefixOf = (rev: { id: string; legacy?: boolean }): string => (rev.legacy ? '' : `${REV}${rev.id}:`)

    const dropDerived = async (keys: string[]): Promise<void> => {
      if (!keys.length) return
      await db.derived.where('key').anyOf(keys).each((r) => { report.bytes += jsonBytes(r.value) })
      await db.derived.bulkDelete(keys)
      report.derived += keys.length
    }
    const dropVersions = async (keys: Array<[string, string, string]>): Promise<void> => {
      if (!keys.length) return
      await db.fileVersions.bulkDelete(keys)
      report.fileVersions += keys.length
    }

    // 1. 作废的准备版本
    for (const rev of await db.revisions.where('status').equals('aborted').toArray()) {
      await dropDerived(await db.derived.where('key').startsWith(`${REV}${rev.id}:`).primaryKeys())
      await dropVersions((await db.fileVersions.where('revision').equals(rev.id).toArray()).map((r) => [r.revision, r.source, r.path]))
      if (rev.kvScope) {
        for (const scope of [rev.kvScope, `${rev.kvScope}:local`]) {
          const rows = await db.kv.where('scope').equals(scope).toArray()
          for (const r of rows) report.bytes += jsonBytes(r.value)
          await db.kv.bulkDelete(rows.map((r) => [r.scope, r.key]))
          report.kv += rows.length
        }
      }
    }
    await renew()

    // 2. 父链里被盖住的旧副本
    const seenDerived = new Set<string>()
    for (const rev of chain) {
      const p = prefixOf(rev)
      const keys = rev.legacy
        ? (await db.derived.toCollection().primaryKeys()).filter((k) => !k.startsWith(REV))
        : await db.derived.where('key').startsWith(p).primaryKeys()
      const shadowed: string[] = []
      for (const k of keys) {
        const logical = k.slice(p.length)
        if (seenDerived.has(logical)) shadowed.push(k)
        else seenDerived.add(logical)
      }
      // 旧版 R0 的键没有版本前缀，和书目缓存等全局键混在一起：只回收确定是按资料集存的那几类
      await dropDerived(rev.legacy ? shadowed.filter((k) => /^(parsed|pre|audit|alts|sources|tableRefs):/.test(k)) : shadowed)
    }
    const seenFile = new Set<string>()
    for (const rev of chain) {
      if (rev.legacy) continue
      const rows = await db.fileVersions.where('revision').equals(rev.id).toArray()
      const shadowed = rows.filter((r) => { const k = `${r.source}|${r.path}`; if (seenFile.has(k)) return true; seenFile.add(k); return false })
      await dropVersions(shadowed.map((r) => [r.revision, r.source, r.path]))
    }
    for (const codeSet of [...new Set(SOURCES.map((s) => s.codeSet))]) {
      for (const suffix of ['', ':local']) {
        const seen = new Set<string>()
        for (const scope of await view.kvScopes(codeSet)) {
          const rows = await db.kv.where('scope').equals(`${scope}${suffix}`).toArray()
          const shadowed = rows.filter((r) => { if (seen.has(r.key)) return true; seen.add(r.key); return false })
          for (const r of shadowed) report.bytes += jsonBytes(r.value)
          await db.kv.bulkDelete(shadowed.map((r) => [r.scope, r.key]))
          report.kv += shadowed.length
        }
      }
    }
    await renew()

    // 3. 当前版本里已经卸载的官方资料
    const dropPaths = async (source: string, paths: Set<string>): Promise<void> => {
      if (!paths.size) return
      const versions = (await db.fileVersions.where('source').equals(source).toArray()).filter((r) => paths.has(r.path))
      await dropVersions(versions.map((r) => [r.revision, r.source, r.path]))
      // 只取键（正文很大），再只读要删的那些的大小
      const legacy = ((await db.files.where('source').equals(source).primaryKeys()) as Array<[string, string]>).filter(([, path]) => paths.has(path))
      if (!legacy.length) return
      await db.files.where('[source+path]').anyOf(legacy).each((r) => { report.bytes += r.size })
      await db.files.bulkDelete(legacy)
      report.legacyFiles += legacy.length
    }
    const allDerived = await db.derived.toCollection().primaryKeys()
    for (const set of SOURCES.filter((s) => s.kind === 'official')) {
      const state = await view.officialState(set.id)
      if (!state) continue
      if (state.status !== 'installed') {
        const legacyKeys = (await db.files.where('source').equals(set.id).primaryKeys()) as Array<[string, string]>
        const paths = new Set([...(await db.fileVersions.where('source').equals(set.id).toArray()).map((r) => r.path), ...legacyKeys.map(([, path]) => path)])
        await dropPaths(set.id, paths)
        await dropDerived(allDerived.filter((k) => (k.startsWith(REV) ? k.split(':').slice(2) : k.split(':')).includes(set.id)))
        continue
      }
      if (state.books === null && state.sources === null && state.adventures === null) continue
      const rec = await directory.peek(set.codeSet)
      if (!rec) { report.notes.push(`${set.id}：没有作者书目缓存，按书卸掉的文件这次没回收`); continue }
      const books = new Set(state.books ?? rec.books.map((b) => String(b.id)))
      const sources = new Set((state.sources ?? []).map((s) => s.toLowerCase()))
      const adventures = new Set(state.adventures ?? [])
      const gone = new Set<string>()
      for (const [path, owner] of Object.entries(rec.owners)) {
        if (owner.kind === 'book' && !books.has(owner.id)) gone.add(path)
        else if (owner.kind === 'adventure' && !adventures.has(owner.id)) gone.add(path)
        else if (owner.kind === 'source' && state.sources !== null && !owner.sources.some((s) => sources.has(s.toLowerCase()))) gone.add(path)
      }
      await dropPaths(set.id, gone)
      const corpusGone = [
        ...rec.books.map((b) => String(b.id)).filter((id) => !books.has(id)).map((id) => parsedKey(set.id, 'book', id)),
        ...rec.adventures.map((a) => String(a.id)).filter((id) => !adventures.has(id)).map((id) => parsedKey(set.id, rec.adventureProp, id)),
      ]
      const wanted = new Set(corpusGone)
      await dropDerived(allDerived.filter((k) => wanted.has(k.startsWith(REV) ? k.split(':').slice(2).join(':') : k)))
    }
    await renew()

    // 4. 没有任何文件版本指向的内容
    const referenced = new Set((await db.fileVersions.toArray()).filter((r) => r.gitSha).map((r) => `${r.source}|${r.path}|${r.gitSha}`))
    const orphans = ((await db.fileContents.toCollection().primaryKeys()) as Array<[string, string, string]>).filter(([source, path, sha]) => !referenced.has(`${source}|${path}|${sha}`))
    if (orphans.length) {
      await db.fileContents.where('[source+path+gitSha]').anyOf(orphans).each((r) => { report.bytes += r.size })
      await db.fileContents.bulkDelete(orphans)
    }
    report.fileContents += orphans.length

    // 5. 结算内核旧换算缓存：钥匙含官方数据版本，不是当前版本的行永远命中不了；没记版本的老格式行也删
    if (deps.kernelOfficial) {
      await renew()
      const official = await deps.kernelOfficial()
      const stale: string[] = []
      await db.derived.where('key').startsWith('kc:').each((r) => {
        const scope = (r.value as { scope?: { official?: unknown }; z?: Uint8Array } | undefined)
        if (scope?.scope?.official !== official) { stale.push(r.key); report.bytes += scope?.z?.byteLength ?? jsonBytes(r.value) }
      })
      if (stale.length) await db.derived.bulkDelete(stale)
      report.kernelCache = stale.length
    }
    return report
  })
}
