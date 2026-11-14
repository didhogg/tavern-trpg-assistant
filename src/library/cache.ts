// P3 性能改进 S1：装书 / 改自制 / 开关书时，用作者自己的加载器把配图描述、屏蔽标记、
// 英文对象和搜索索引算好存进【库】。看资料 / 搜索只读库；缓存带依赖指纹，资料变了就作废。
import type { DerivedRecord, LibraryDatabase } from './db'
import type { AuthorFrame } from './runtime/host'
import type { ParsedProp } from './runtime/frame/commands'
import type { SourceEntry } from './sources'
import type { LibraryView } from './revision'
import { commitOf, officialSourceOf } from './sources'
import { parsedKey } from './install'
import { hashValue, stableStringify } from '../core/hash'

export interface PrecomputeReport {
  source: string
  base: string
  props: number
  fluff: number
  excluded: number
  search: boolean
  searchBytes: number
  ms: number
}

export interface PrecomputeOptions {
  source: SourceEntry
  db: LibraryDatabase
  frame: AuthorFrame
  /** 只算这一类别；不给就算这个源的全部类别。 */
  prop?: string
  fluff?: boolean
  excluded?: boolean
  search?: boolean
  /** 固定的库版本（P5 T1）；不给时按旧的单版本行为。 */
  view?: LibraryView
}

export interface CacheOptions {
  source: SourceEntry
  db: LibraryDatabase
  openFrame: (codeSet: string) => Promise<AuthorFrame>
  prop?: string
  fluff?: boolean
  excluded?: boolean
  search?: boolean
  view?: LibraryView
}

const preKey = (sourceId: string, kind: 'fluff' | 'excluded' | 'search', prop?: string): string =>
  prop ? `pre:${sourceId}:${kind}:${prop}` : `pre:${sourceId}:${kind}`

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)

/** 源的资料基线：提交号 + 已装自制包的校验值和。 */
export async function baseFingerprint(source: SourceEntry, db: LibraryDatabase, view?: LibraryView): Promise<string> {
  const rec = view ? await view.derivedGet(`audit:${source.codeSet}-brew`) : await db.derived.get(`audit:${source.codeSet}-brew`)
  const installed = isRecord(rec?.value) && Array.isArray(rec.value.installed) ? rec.value.installed as Array<Record<string, unknown>> : []
  const brew = hashValue(installed.map((h) => `${String(h.docIdLocal ?? '')}:${String(h.checksum ?? '')}`).sort())
  return `${commitOf(source)}|${brew}`
}

/** 范围/房规/归类摘要：这些是插件管理记录，变了也把搜索/屏蔽缓存作废。 */
export async function manageFingerprint(db: LibraryDatabase): Promise<string> {
  const rows = await db.manage.toArray()
  return hashValue(rows.map((r) => `${r.kind}|${r.key}|${stableStringify(r.value)}`).sort())
}

async function parsedProps(db: LibraryDatabase, sourceId: string, view?: LibraryView): Promise<string[]> {
  const prefix = `parsed:${sourceId}:`
  if (view) {
    const map = await view.derivedKeys(prefix)
    return [...map.keys()].filter((k) => !k.slice(prefix.length).startsWith('corpus:')).map((k) => k.slice(prefix.length))
  }
  const recs = await db.derived.where('key').startsWith(prefix).toArray()
  return recs.filter((r) => !r.key.includes(':corpus:')).map((r) => r.key.slice(prefix.length))
}

async function put(db: LibraryDatabase, key: string, fingerprint: string, value: unknown, view?: LibraryView): Promise<void> {
  if (view) await view.derivedPut(key, fingerprint, value)
  else await db.derived.put({ key, fingerprint, value, savedAt: Date.now() })
}

/** 装书 / 改自制后一次算好；frame 必须是已经加载好作者数据的那一个。 */
export async function precomputeSource(opts: PrecomputeOptions): Promise<PrecomputeReport> {
  const t0 = Date.now()
  const { source, db, frame } = opts
  const base = await baseFingerprint(source, db, opts.view)
  const manage = await manageFingerprint(db)
  const excludeList = opts.excluded || opts.search ? await frame.call('excludeList') : null
  const exclude = excludeList ? hashValue(excludeList) : ''
  const props = opts.prop ? [opts.prop] : await parsedProps(db, source.id, opts.view)
  const report: PrecomputeReport = { source: source.id, base, props: props.length, fluff: 0, excluded: 0, search: false, searchBytes: 0, ms: 0 }
  for (const prop of props) {
    const rec = opts.view ? await opts.view.derivedGet(parsedKey(source.id, prop)) : await db.derived.get(parsedKey(source.id, prop))
    const parsed = rec?.value as ParsedProp | undefined
    if (!parsed?.items.length) continue
    if (opts.fluff) {
      const fluff = await frame.call('fluffOfMany', prop, parsed.items)
      await put(db, preKey(source.id, 'fluff', prop), base, fluff, opts.view)
      report.fluff += Object.keys(fluff).length
    }
    if (opts.excluded) {
      const flags = await frame.call('excludedFlags', prop, source.kind === 'brew' ? 'brew' : 'site')
      if (flags.excluded) {
        const count = (hashes: Array<string | null>): Map<string, number> => {
          const out = new Map<string, number>()
          for (const h of hashes) if (h) out.set(h, (out.get(h) ?? 0) + 1)
          return out
        }
        const live = count(flags.hashes)
        const stored = count(parsed.hashes)
        if (live.size !== stored.size || [...stored].some(([h, n]) => live.get(h) !== n)) {
          throw new Error(`作者程序现场展开的「${prop}」和库里存的解析结果对不上：现场 ${flags.hashes.length} 条、库里 ${parsed.hashes.length} 条`)
        }
      }
      const excluded: Record<string, boolean> = {}
      if (flags.excluded) flags.hashes.forEach((h, i) => { if (h) excluded[h] = flags.excluded![i] })
      await put(db, preKey(source.id, 'excluded', prop), `${base}|${exclude}|${manage}`, { excluded: flags.excluded ? excluded : null, base, exclude, manage }, opts.view)
      report.excluded++
    }
  }
  if (opts.search && source.kind === 'official') {
    const dump = await frame.call('searchIndexDump')
    // version：读的时候（ensurePrecomputed）按这一版资料核对；以前没存，每次搜索都判过期、整份重建（性能支线 2026-11-14 实测每次 2 秒多）
    await put(db, preKey(source.id, 'search'), `${base}|${exclude}|${manage}`, { ...dump, base, exclude, manage, version: opts.view?.id ?? '' }, opts.view)
    report.search = true
    report.searchBytes = dump.json.length
  }
  report.ms = Date.now() - t0
  return report
}

async function record(db: LibraryDatabase, key: string): Promise<DerivedRecord | undefined> {
  return db.derived.get(key)
}

/** 缺缓存/资料变了才开小窗补算；平时只读库。 */
export async function ensurePrecomputed(opts: CacheOptions): Promise<void> {
  const { source, db, openFrame } = opts
  // 这一类在这一套里本来就没有条目（自制常见）：没有东西可算，也就永远存不下缓存；不跳过的话每查一次就开一个新小窗（P5-1 B-41）
  if (opts.prop) {
    const parsed = (opts.view ? await opts.view.derivedGet(parsedKey(source.id, opts.prop)) : await db.derived.get(parsedKey(source.id, opts.prop)))?.value as { items?: unknown[] } | undefined
    if (!parsed?.items?.length) return
  }
  const base = await baseFingerprint(source, db, opts.view)
  const manage = await manageFingerprint(db)
  let needFluff = false
  let needExcluded = false
  let needSearch = false
  if (opts.fluff) {
    const rec = opts.view ? await opts.view.derivedGet(preKey(source.id, 'fluff', opts.prop)) : await record(db, preKey(source.id, 'fluff', opts.prop))
    needFluff = !rec || rec.fingerprint !== base
  }
  if (opts.excluded) {
    const rec = opts.view ? await opts.view.derivedGet(preKey(source.id, 'excluded', opts.prop)) : await record(db, preKey(source.id, 'excluded', opts.prop))
    const value = isRecord(rec?.value) ? rec.value : null
    needExcluded = !value || value.base !== base || value.manage !== manage
  }
  if (opts.search) {
    const rec = opts.view ? await opts.view.derivedGet(preKey(source.id, 'search')) : await record(db, preKey(source.id, 'search'))
    const value = isRecord(rec?.value) ? rec.value : null
    needSearch = !value || value.base !== base || value.manage !== manage || value.version !== (opts.view?.id ?? '')
  }
  if (!needFluff && !needExcluded && !needSearch) return
  const frame = await openFrame(source.codeSet)
  try {
    await precomputeSource({ source, db, frame, view: opts.view, prop: opts.prop, fluff: needFluff, excluded: needExcluded, search: needSearch })
  } finally {
    frame.close()
  }
}

export async function invalidatePrecompute(db: LibraryDatabase, sourceId: string, kinds: Array<'fluff' | 'excluded' | 'search'>, view?: LibraryView): Promise<void> {
  for (const kind of kinds) {
    const prefix = preKey(sourceId, kind)
    if (view) {
      const old = await view.derivedKeys(prefix)
      for (const key of old.keys()) await view.derivedDelete(key)
    } else {
      await db.derived.where('key').startsWith(prefix).delete()
    }
  }
}

// ---- 读缓存 ----

export type FluffRecord = { fluff: unknown; fluffError: string | null; engSiteHash: string | null }

export async function fluffOf(db: LibraryDatabase, sourceId: string, prop: string, hash: string, view?: LibraryView): Promise<FluffRecord | null> {
  const rec = view ? await view.derivedGet(preKey(sourceId, 'fluff', prop)) : await record(db, preKey(sourceId, 'fluff', prop))
  const map = isRecord(rec?.value) ? rec.value : null
  const hit = map?.[hash]
  return isRecord(hit) ? hit as unknown as FluffRecord : null
}

export async function excludedOf(db: LibraryDatabase, sourceId: string, prop: string, view?: LibraryView): Promise<Record<string, boolean> | null> {
  const rec = view ? await view.derivedGet(preKey(sourceId, 'excluded', prop)) : await record(db, preKey(sourceId, 'excluded', prop))
  const value = isRecord(rec?.value) ? rec.value : null
  const excluded = value?.excluded
  return isRecord(excluded) ? excluded as Record<string, boolean> : null
}

export async function searchIndexOf(db: LibraryDatabase, sourceId: string, view?: LibraryView): Promise<Record<string, unknown> | null> {
  const rec = view ? await view.derivedGet(preKey(sourceId, 'search')) : await record(db, preKey(sourceId, 'search'))
  return isRecord(rec?.value) ? rec.value : null
}

export async function currentOfficial(source: SourceEntry): Promise<SourceEntry> {
  return officialSourceOf(source.codeSet)
}

export async function cacheKey(sourceId: string, kind: 'fluff' | 'excluded' | 'search', prop?: string): Promise<string> {
  return preKey(sourceId, kind, prop)
}
