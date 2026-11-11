// 同编号挂备选（D2-P3 整体设计 §2.4）：自制包装、删、更新之后，找出和官方或先装的包同编号的条目，
// 让原件照常生效，后来的挂成备选。作者加载器合并时"后装的盖掉先装的"（utils-dataloader-dataloader.js 第 1071 行），
// 所以备选的条目对象要单独取：开一个隔离的作者存储范围，只放那个包（和它声明依赖的包），用作者加载器原样解析。
import type { LibraryDatabase } from './db'
import type { LibraryView } from './revision'
import { parsedKey } from './install'
import type { ParsedProp } from './runtime/frame/commands'
import type { AuthorFrame } from './runtime/host'
import { refKey, type EntryRef } from './scopes'
import { officialSourceOf, type SourceEntry } from './sources'
import { findCollisions, packAltId, packStableId, type Alternative, type DocIndex } from './versions'

/** 作者自制存储的键（utils-brew-impl-brew.js 第 9 行 _STORAGE_KEY）。 */
export const BREW_STORAGE_KEY = 'HOMEBREW_2_STORAGE'

export interface AltRecord {
  target: EntryRef
  /** 原条目的来源（作者 getEntitySource），书目按书统计备选用。 */
  source: string | null
  /** 原来生效的：官方，或先装的包（本地编号）。 */
  base: 'official' | string
  alts: Alternative[]
}

export interface AltIndex {
  source: string
  targets: Record<string, AltRecord>
  /** 取备选对象失败的（原文），交给体检。 */
  errors: Array<{ docIdLocal: string; prop: string; hash: string; error: string }>
}

export const altsKey = (brewSetId: string): string => `alts:${brewSetId}`

export type StoredBrew = { head: { docIdLocal: string; filename?: string }; body: { _meta?: { sources?: Array<{ json?: string }>; dependencies?: Record<string, string[]> } } }

/** 一个包加上它 _meta.dependencies 里声明的、由别的已装包提供的来源（作者展开 _copy 时要用）。被测的包放最后，同编号时它赢。 */
export function withDependencies(doc: StoredBrew, all: StoredBrew[]): StoredBrew[] {
  const want = new Set(Object.values(doc.body._meta?.dependencies ?? {}).flat().map((s) => s.toLowerCase()))
  const deps = all.filter((d) => d !== doc && (d.body._meta?.sources ?? []).some((s) => s.json && want.has(s.json.toLowerCase())))
  return [...deps, doc]
}

export interface BuildAltOptions {
  source: SourceEntry
  db: LibraryDatabase
  view: LibraryView
  /** 平常的小窗（读包索引用）。 */
  frame: AuthorFrame
  /** 在指定作者存储范围里开小窗（隔离解析用）。 */
  openFrameIn: (kvScope: string) => Promise<AuthorFrame>
}

/** 在隔离范围里只放这几个包，取指定编号的作者对象（作者加载器原样）。 */
export async function isolatedItems(opts: BuildAltOptions, docs: StoredBrew[], wants: Array<{ prop: string; hash: string }>): Promise<Record<string, unknown>> {
  const { db, source, view } = opts
  const scope = `${source.codeSet}:iso:${docs.at(-1)!.head.docIdLocal}`
  // 复制作者存储的有效内容（新层盖旧层），只换掉自制列表；同步存储也复制
  const scopes = await view.kvScopes(source.codeSet)
  const merged = new Map<string, unknown>()
  for (const s of [...scopes].reverse()) for (const row of await db.kv.where('scope').equals(s).toArray()) { if (row.deleted) merged.delete(row.key); else merged.set(row.key, row.value) }
  merged.set(BREW_STORAGE_KEY, docs)
  await db.kv.bulkPut([...merged].map(([key, value]) => ({ scope, key, value })))
  const localMerged = new Map<string, unknown>()
  for (const s of [...scopes].reverse()) for (const row of await db.kv.where('scope').equals(`${s}:local`).toArray()) { if (row.deleted) localMerged.delete(row.key); else localMerged.set(row.key, row.value) }
  if (localMerged.size) await db.kv.bulkPut([...localMerged].map(([key, value]) => ({ scope: `${scope}:local`, key, value })))
  const frame = await opts.openFrameIn(scope)
  try {
    return await frame.call('brewItemsByHash', wants)
  } finally {
    frame.close()
    await db.kv.where('scope').anyOf(scope, `${scope}:local`).delete()
  }
}

/** 找同编号、取备选对象、把自制解析结果里同编号的那条换回原件，存成备选表。 */
export async function buildAlternatives(opts: BuildAltOptions): Promise<AltIndex> {
  const { source, frame } = opts
  const official = officialSourceOf(source.codeSet)
  const docs: DocIndex[] = await frame.call('brewDocIndex')
  const officialHashes: Record<string, Set<string>> = {}
  const officialParsed = new Map<string, ParsedProp>()
  for (const prop of new Set(docs.flatMap((d) => Object.keys(d.props)))) {
    const rec = await opts.view.derivedGet(parsedKey(official.id, prop))
    if (!rec) continue
    officialParsed.set(prop, rec.value as ParsedProp)
    officialHashes[prop] = new Set((rec.value as ParsedProp).hashes.filter((h): h is string => !!h))
  }
  const collisions = findCollisions(officialHashes, docs)
  const out: AltIndex = { source: source.id, targets: {}, errors: [] }
  if (!collisions.length) {
    await opts.view.derivedPut(altsKey(source.id), 'brew', out)
    return out
  }
  const stored = ((await opts.view.kvGet(source.codeSet, BREW_STORAGE_KEY)) ?? []) as StoredBrew[]
  const byId = new Map(stored.map((d) => [d.head.docIdLocal, d]))
  // 每个涉及的包要取哪些编号
  const need = new Map<string, Array<{ prop: string; hash: string }>>()
  const add = (id: string, prop: string, hash: string) => (need.get(id) ?? need.set(id, []).get(id)!).push({ prop, hash })
  for (const c of collisions) {
    for (const id of c.others) add(id, c.prop, c.hash)
    if (c.base.kind === 'doc') add(c.base.docIdLocal, c.prop, c.hash)
  }
  const items = new Map<string, Record<string, unknown>>()
  for (const [id, wants] of need) {
    const doc = byId.get(id)
    if (!doc) {
      for (const w of wants) out.errors.push({ docIdLocal: id, ...w, error: '作者存储里找不到这个包' })
      continue
    }
    try {
      items.set(id, await isolatedItems(opts, withDependencies(doc, stored), wants))
    } catch (e) {
      for (const w of wants) out.errors.push({ docIdLocal: id, ...w, error: e instanceof Error ? e.message : String(e) })
    }
  }
  const filenameOf = (id: string) => byId.get(id)?.head.filename ?? null
  const brewParsed = new Map<string, ParsedProp>()
  for (const c of collisions) {
    const k = `${c.prop}|${c.hash}`
    const target: EntryRef = { set: c.base.kind === 'official' ? official.id : source.id, prop: c.prop, hash: c.hash }
    const alts: Alternative[] = []
    for (const id of c.others) {
      const item = items.get(id)?.[k]
      if (item === undefined) {
        if (items.has(id)) out.errors.push({ docIdLocal: id, prop: c.prop, hash: c.hash, error: '隔离解析后作者没有交出这一条' })
        continue
      }
      const doc = docs.find((d) => d.docIdLocal === id)
      alts.push({ altId: packAltId(doc ? packStableId(doc) : null, id), legacyIds: [`doc:${id}`], kind: 'collision', filename: filenameOf(id), docIdLocal: id, ref: { set: source.id, prop: c.prop, hash: c.hash }, item })
    }
    // 自制解析结果里同编号的那条：官方是原件 → 去掉；先装的包是原件 → 换成先装的那条
    const p = brewParsed.get(c.prop) ?? ((await opts.view.derivedGet(parsedKey(source.id, c.prop)))?.value as ParsedProp | undefined)
    if (p) brewParsed.set(c.prop, p)
    const i = p ? p.hashes.indexOf(c.hash) : -1
    const op = officialParsed.get(c.prop)
    const targetSource = c.base.kind === 'official' ? (op?.sources[op.hashes.indexOf(c.hash)] ?? null) : (p?.sources[i] ?? null)
    out.targets[refKey(target)] = { target, source: targetSource, base: c.base.kind === 'official' ? 'official' : c.base.docIdLocal, alts }
    if (!p || i < 0) continue
    if (c.base.kind === 'official') {
      p.items.splice(i, 1)
      p.hashes.splice(i, 1)
      p.sources.splice(i, 1)
    } else {
      const baseItem = items.get(c.base.docIdLocal)?.[k]
      if (baseItem !== undefined) p.items[i] = baseItem
    }
  }
  for (const [prop, p] of brewParsed) await opts.view.derivedPut(parsedKey(source.id, prop), 'brew', p)
  await opts.view.derivedPut(altsKey(source.id), 'brew', out)
  return out
}


/**
 * 判断查询出来的条目是否由指定包自己提供：在只放这个包的隔离作者存储里，让作者加载器按同一类别 + 编号取回。
 * 解析时带上目标包作者声明的 dependencies（只用于让作者展开 _copy）；输出再用目标包 raw 清单筛，
 * 依赖包自己的条目不会算到这个包名下。baseitem / magicvariant 等作者加载器在包内合并出的条目会按
 * 解析后的最终类别返回，不需要手写类别转换表。
 */
export async function packOwnedItems(
  opts: BuildAltOptions,
  docIdLocal: string,
  prop: string,
  hashes: string[],
  rawHashes: Iterable<string>,
): Promise<Map<string, unknown>> {
  const stored = ((await opts.view.kvGet(opts.source.codeSet, BREW_STORAGE_KEY)) ?? []) as StoredBrew[]
  const doc = stored.find((d) => String(d.head.docIdLocal) === docIdLocal)
  if (!doc) return new Map()
  const raw = new Set(rawHashes)
  const unique = [...new Set(hashes.filter((hash) => Boolean(hash) && raw.has(hash)))]
  if (!unique.length) return new Map()
  const got = await isolatedItems(opts, withDependencies(doc, stored), unique.map((hash) => ({ prop, hash })))
  return new Map(unique.filter((hash) => got[`${prop}|${hash}`] !== undefined).map((hash) => [hash, got[`${prop}|${hash}`]]))
}
