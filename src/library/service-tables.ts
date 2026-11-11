// 表格查询：让作者自己的提取器从官方条目、自制条目、书/冒险正文的对象里提表。
import { SOURCES, getSource } from './sources'
import { EMBEDDED_PROP } from './embedded-tables'
import { parsedKey } from './install'
import type { LibraryService } from './service'
import type { LibraryView } from './revision'
import { ensureReadable } from './service-read'
import type { ExtractedTable } from './runtime/frame/table-extract-commands'

export async function tablesFor(
  service: LibraryService,
  sourceId: string,
  prop: string,
  hash?: string,
  viewArg?: LibraryView,
): Promise<{ tables: ExtractedTable[]; skipped: Array<{ name: string; error: string }> }> {
  const view = viewArg ?? await service.currentView()
  await ensureReadable(view, sourceId)
  const source = getSource(sourceId)
  let items: unknown[] | undefined
  let fallback: string | null = null
  if (hash && (prop === 'book' || prop === 'adventure')) {
    const rec = await view.derivedGet(parsedKey(sourceId, prop, hash))
    if (!rec) throw new Error(`${sourceId} 没有这条正文：${prop} ${hash}`)
    const value = rec.value as Record<string, unknown>
    const flatten = (v: unknown): unknown[] => Array.isArray(v) ? v : (v && typeof v === 'object' && Array.isArray((v as { data?: unknown }).data) ? (v as { data: unknown[] }).data : [])
    fallback = (value.bookData as { source?: string } | undefined)?.source ?? (value.adventureData as { source?: string } | undefined)?.source ?? null
    items = Object.values(value).flatMap(flatten)
  } else if (hash) {
    const parsed = await service.parsed(sourceId, prop, view)
    const i = parsed.hashes.indexOf(hash)
    if (i < 0) throw new Error(`${sourceId} 没有这个条目：${prop} ${hash}`)
    items = [parsed.items[i]]
  } else if (source.kind === 'brew') {
    items = (await service.parsed(sourceId, prop, view)).items.filter((it) => !!it)
  }
  const frame = await service.frameOf(source.codeSet, view)
  return frame.call('extractTables', prop, items, fallback)
}

/** 一张关联表的身份：用来按正常详情入口打开（作者 table / 表组 / 埋在条目里的表）。 */
export interface TableRef { set: string; prop: string; hash: string; name: string; source: string | null }
export interface RelatedTables {
  /** 这一条自己正文里的表（作者提取器）。 */
  own: ExtractedTable[]
  /** 这一条正文里 {@table …} 等链接指向的表。 */
  links: TableRef[]
  /** 同一套语言里，内容（单元格、标题）链接到这一条的表。 */
  referencedBy: TableRef[]
  skipped: Array<{ name: string; error: string }>
}

const TABLE_PROPS = ['table', 'tableGroup', EMBEDDED_PROP]
const builds = new WeakMap<LibraryService, Map<string, Promise<Record<string, TableRef[]>>>>()

/** 某一套资料里所有表 → 它们链接到的条目，倒过来存成「类别|编号 → 引用它的表」。按版本存库，同一版本只建一次。 */
async function reverseIndex(service: LibraryService, sourceId: string, view: LibraryView): Promise<Record<string, TableRef[]>> {
  const key = `${view.id}:${sourceId}`
  let building = builds.get(service)
  if (!building) builds.set(service, (building = new Map()))
  let p = building.get(key)
  if (!p) {
    p = (async () => {
      const source = getSource(sourceId)
      const fp = `${await view.commitOf(source)}|${view.id}`
      const saved = await view.derivedGet(`tableRefs:${sourceId}`)
      if (saved && saved.fingerprint === fp) return saved.value as Record<string, TableRef[]>
      const frame = await service.frameOf(source.codeSet, view)
      const out: Record<string, TableRef[]> = {}
      for (const prop of TABLE_PROPS) {
        let parsed
        try { parsed = await service.parsed(sourceId, prop, view) } catch (e) { console.warn('[trpg-assistant] 反向关联表：这一类读不出，跳过', sourceId, prop, e); continue }
        const refs = await frame.call('tagRefs', parsed.items)
        refs.forEach((targets, i) => {
          const hash = parsed.hashes[i]
          if (!hash) return
          const it = parsed.items[i] as { name?: unknown }
          const ref: TableRef = { set: sourceId, prop, hash, name: typeof it?.name === 'string' ? it.name : hash, source: parsed.sources[i] ?? null }
          for (const t of targets) (out[t] ??= []).push(ref)
        })
      }
      await view.derivedPut(`tableRefs:${sourceId}`, fp, out)
      return out
    })()
    for (const k of building.keys()) if (k.endsWith(`:${sourceId}`) && k !== key) building.delete(k)
    p.catch(() => building!.delete(key))
    building.set(key, p)
  }
  return p
}

/**
 * 详情「关联 › 表格」（P5 T6 #8 / G3）：自己的表 + 正文链接到的表 + 同语言里引用了它的表。
 * 「引用」只认作者标签解析出的编号，不按名字猜；读不到的资料集跳过并照常返回其余部分。
 */
export async function relatedTablesFor(service: LibraryService, sourceId: string, prop: string, hash: string, viewArg?: LibraryView, selectedItem?: unknown): Promise<RelatedTables> {
  const view = viewArg ?? await service.currentView()
  const source = getSource(sourceId)
  const frame = await service.frameOf(source.codeSet, view)
  const own = selectedItem === undefined ? await tablesFor(service, sourceId, prop, hash, view) : await frame.call('extractTables', prop, [selectedItem])
  let item = selectedItem
  if (item === undefined && prop !== 'book' && prop !== 'adventure') {
    const parsed = await service.parsed(sourceId, prop, view)
    item = parsed.items[parsed.hashes.indexOf(hash)] ?? null
  }
  const links: TableRef[] = []
  if (item) {
    const [targets] = await frame.call('tagRefs', [item])
    for (const t of targets ?? []) {
      const [tp, th] = t.split('|')
      if (!TABLE_PROPS.includes(tp)) continue
      for (const set of SOURCES.filter((x) => x.codeSet === source.codeSet)) {
        try {
          const parsed = await service.parsed(set.id, tp, view)
          const i = parsed.hashes.indexOf(th)
          if (i >= 0) { links.push({ set: set.id, prop: tp, hash: th, name: String((parsed.items[i] as { name?: unknown })?.name ?? th), source: parsed.sources[i] ?? null }); break }
        } catch (e) { console.debug('[trpg-assistant] 关联表：这一套里没有这一类，换下一套找', set.id, tp, e) }
      }
    }
  }
  const referencedBy: TableRef[] = []
  const seen = new Set<string>()
  for (const set of SOURCES.filter((x) => x.codeSet === source.codeSet)) {
    let index: Record<string, TableRef[]>
    try { await ensureReadable(view, set.id); index = await reverseIndex(service, set.id, view) } catch (e) { console.debug('[trpg-assistant] 关联表：这一套没装或读不出，跳过', set.id, e); continue }
    for (const r of index[`${prop}|${hash}`] ?? []) {
      const k = `${r.set}|${r.prop}|${r.hash}`
      if (seen.has(k) || (r.prop === EMBEDDED_PROP && own.tables.length && (r.hash.startsWith(`${hash}~`)))) continue
      seen.add(k)
      referencedBy.push(r)
    }
  }
  return { own: own.tables, links, referencedBy, skipped: own.skipped }
}
