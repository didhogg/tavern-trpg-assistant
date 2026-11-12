// 小窗里：P3-1 用到的作者入口（D2-P3 整体设计 §2.1、§2.3–§2.5）。只转调作者函数，结果原样交回。
// 版本判断、来源名、单包编号、可编辑自制、文字转条目、新条目模板、自制导出、背景描述。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, engSiteHashOf, hashOf, init } from './author'
import { prepareProp } from './page-prepare'
import { isMineWithoutEdition, type BrewDocLike } from '../../scopes'

const mod = (path: string): Promise<any> => import(/* @vite-ignore */ new URL(`js/${path}`, location.href).href)

export interface EditionInfo {
  classic: boolean | null
  basis: 'date' | 'brew-meta' | null
}

/**
 * 作者对来源的版本判断（SourceUtil.isClassicSource，utils.js 第 648 行）：
 * 自制 / 试玩稿按包头 _meta.edition（没写时作者默认旧版，utils-brew-base.js 第 1235 行）；
 * 官方按出版日期；查不到日期的作者也判断不了 → classic: null。
 * 例外（P5.5 R78）：【我的库】里的自制（本地导入的、自己写的，都没有网址）包头没写 edition 的，不替它猜旧版，
 * 记作判断不了（未归类）；从网址下载的自制照作者默认。
 */
export async function editionOf(sources: string[]): Promise<Record<string, EditionInfo>> {
  await init()
  const out: Record<string, EditionInfo> = {}
  const brews: BrewDocLike[] = await A.BrewUtil2.pGetBrew()
  for (const s of sources) {
    if (A.BrewUtil2.hasSourceJson(s) && isMineWithoutEdition(brews, s)) out[s] = { classic: null, basis: 'brew-meta' }
    else if (A.BrewUtil2.hasSourceJson(s) || A.PrereleaseUtil.hasSourceJson(s)) out[s] = { classic: !!A.SourceUtil.isClassicSource(s), basis: 'brew-meta' }
    else if (A.Parser.sourceJsonToDate(s)) out[s] = { classic: !!A.SourceUtil.isClassicSource(s), basis: 'date' }
    else out[s] = { classic: null, basis: null }
  }
  return out
}

/** 来源的全名、缩写（作者 Parser.sourceJsonToFull / sourceJsonToAbv）。 */
export async function sourceNames(sources: string[]): Promise<Record<string, { full: string; abv: string }>> {
  await init()
  return Object.fromEntries(sources.map((s) => [s, { full: A.Parser.sourceJsonToFull(s), abv: A.Parser.sourceJsonToAbv(s) }]))
}

const requiresOf = (body: any): BrewRequirement[] => {
  const out: BrewRequirement[] = []
  const seen = new Set<string>()
  const add = (r: BrewRequirement): void => {
    const key = `${r.kind}|${r.prop}|${String(r.source).toLowerCase()}|${r.hash ?? ''}`
    if (seen.has(key)) return
    seen.add(key); out.push(r)
  }
  for (const kind of ['dependencies', 'includes'] as const) {
    for (const [prop, list] of Object.entries(body?._meta?.[kind] ?? {})) {
      for (const source of Array.isArray(list) ? list : []) add({ kind: kind === 'dependencies' ? 'dependency' : 'include', prop, source: String(source) })
    }
  }
  for (const [prop, list] of Object.entries(body?._meta?.otherSources ?? {})) {
    for (const source of Object.keys((list ?? {}) as Record<string, unknown>)) add({ kind: 'otherSource', prop, source })
  }
  for (const [prop, list] of Object.entries(body ?? {})) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    for (const entry of list) {
      const copy = (entry as any)?._copy
      if (!copy || typeof copy !== 'object') continue
      const source = String(copy.source ?? '')
      if (!source) continue
      add({ kind: 'copy', prop, source, hash: hashOf(prop, copy) })
    }
  }
  return out
}

/** 已装自制每个包：包头 + 声明的来源 + 每类每条的作者编号（原始文件直接算，不经加载器，所以同编号的都在）。 */
export interface BrewRequirement {
  kind: 'dependency' | 'include' | 'otherSource' | 'copy'
  prop: string
  source: string
  hash?: string | null
}

export async function brewDocIndex(): Promise<Array<{ docIdLocal: string; filename: string | null; url: string | null; timeAdded: number; order: number; isEditable: boolean; sources: string[]; props: Record<string, Array<string | null>>; requires: BrewRequirement[] }>> {
  await init()
  return (await A.BrewUtil2.pGetBrew()).map((b: any, i: number) => ({
    docIdLocal: b.head.docIdLocal,
    filename: b.head.filename ?? null,
    url: b.head.url ?? null,
    timeAdded: b.head.timeAdded ?? 0,
    order: i,
    isEditable: !!b.head.isEditable,
    sources: (b.body?._meta?.sources ?? []).map((s: any) => s?.json).filter(Boolean),
    props: Object.fromEntries(Object.entries(b.body ?? {})
      .filter(([k, v]) => !k.startsWith('_') && Array.isArray(v))
      .map(([k, v]) => [k, (v as any[]).map((e) => (e && typeof e === 'object' ? hashOf(k, e) : null))])),
    requires: requiresOf(b.body),
  }))
}

/** 已装自制的原样（包头 + 内容），按本地编号取；不给编号就是全部。 */
export async function brewRaw(docIdLocals: string[] | null = null): Promise<any[]> {
  await init()
  const all = await A.BrewUtil2.pGetBrew()
  return docIdLocals ? all.filter((b: any) => docIdLocals.includes(b.head.docIdLocal)) : all
}

/**
 * 隔离小窗里用：按编号取作者加载器处理后的自制条目（先让作者把这一类自制装进缓存，再按编号取）。
 * 和官方同编号时作者缓存里自制版会顶掉官方版（P3-1 探路实测）；若取回的仍是官方那个对象，说明自制版没装进去，不交。
 */
export async function brewItemsByHash(wants: Array<{ prop: string; hash: string }>): Promise<Record<string, unknown>> {
  await init()
  const out: Record<string, unknown> = {}
  for (const { prop, hash } of wants) {
    await prepareProp(prop)
    await A.DataLoader.pCacheAndGetAllBrew(prop)
    const item = await A.DataLoader.pCacheAndGetHash(prop, hash)
    if (!item) continue
    const site: any[] = (await A.DataLoader.pCacheAndGetAllSite(prop)) ?? []
    if (site.includes(item)) continue
    out[`${prop}|${hash}`] = item
  }
  return out
}

/** 书或冒险正文的文件路径（作者加载器的拼法：utils-dataloader-dataloader.js 第 1134 行）。 */
export async function corpusFile(prop: string, id: string): Promise<string> {
  await init()
  return `data/${prop}/${prop}-${A.UrlUtil.encodeForHash(id.toLowerCase())}.json`
}

/** 导出一个包：作者 brew.body 原样（utils-brew-ui-manage.js 第 909 行的取数部分）。 */
export async function brewExport(docIdLocal: string): Promise<{ filename: string | null; body: unknown } | null> {
  const b = (await brewRaw([docIdLocal]))[0]
  return b ? { filename: b.head.filename ?? null, body: b.body } : null
}

/** 背景描述（作者 Renderer.utils.pGetProxyFluff）：条目对象由插件给（不从作者缓存取，缓存可能被同编号的自制顶掉）。 */
export async function fluffOf(prop: string, item: any): Promise<{ fluff: unknown; fluffError: string | null }> {
  await init()
  try {
    return { fluff: (await A.Renderer.utils.pGetProxyFluff({ entity: item, prop })) ?? null, fluffError: null }
  } catch (e) {
    return { fluff: null, fluffError: e instanceof Error ? e.message : String(e) }
  }
}

/** 整类一次取配图描述：装书/改自制时存进库，看资料时不再开小窗。 */
export async function fluffOfMany(prop: string, items: any[]): Promise<Record<string, { fluff: unknown; fluffError: string | null; engSiteHash: string | null }>> {
  await init()
  const out: Record<string, { fluff: unknown; fluffError: string | null; engSiteHash: string | null }> = {}
  for (const item of items) {
    const hash = hashOf(prop, item)
    if (!hash) continue
    try {
      out[hash] = {
        fluff: (await A.Renderer.utils.pGetProxyFluff({ entity: item, prop })) ?? null,
        fluffError: null,
        engSiteHash: engSiteHashOf(prop, item),
      }
    } catch (e) {
      out[hash] = { fluff: null, fluffError: e instanceof Error ? e.message : String(e), engSiteHash: null }
    }
  }
  return out
}

/** 作者屏蔽表原文（开关书、装书时算缓存指纹用）。 */
export async function excludeList(): Promise<unknown[]> {
  await init()
  return A.ExcludeUtil.getList()
}

// ---- 可编辑自制（作者 utils-brew-impl-brew.js 第 58–135 行）----

/** 可编辑自制包（没有就让作者建一个）。 */
export async function editableDoc(): Promise<{ head: any; body: any }> {
  await init()
  return A.BrewUtil2.pGetOrCreateEditableBrewDoc()
}

/** 可编辑自制里加一个来源（作者 pAddSource）；已有同名来源不重复加。 */
export async function editableEnsureSource(sourceObj: { json: string; full: string; abbreviation: string; authors?: string[]; version?: string }): Promise<string[]> {
  const doc = await editableDoc()
  const has = (doc.body?._meta?.sources ?? []).some((s: any) => String(s.json).toLowerCase() === sourceObj.json.toLowerCase())
  if (!has) await A.BrewUtil2.pAddSource({ authors: [], convertedBy: [], version: '1', ...sourceObj })
  return ((await editableDoc()).body?._meta?.sources ?? []).map((s: any) => s.json)
}

/** 存一条（作者 pPersistEditableBrewEntity：按 uniqueId 新增或覆盖）。没有 uniqueId 就让作者生成。 */
export async function editablePut(prop: string, ent: any): Promise<{ uniqueId: string; hash: string | null; previousHash: string | null; previous: { name: string; source: string } | null; previousEntity: any }> {
  await init()
  // 改已有的一条时先记下它原来的编号和名字（作者编号 = 名字 + 来源，改名就变），调用方据此把指向它的东西搬过去
  const before = ent.uniqueId ? ((await A.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[prop] ?? []).find((x: any) => x?.uniqueId === ent.uniqueId) : null
  const e = { ...ent, uniqueId: ent.uniqueId ?? A.CryptUtil.uid() }
  await A.BrewUtil2.pPersistEditableBrewEntity(prop, e)
  return { uniqueId: e.uniqueId, hash: hashOf(prop, e), previousHash: before ? hashOf(prop, before) : null, previous: before ? { name: String(before.name ?? ''), source: String(before.source ?? '') } : null, previousEntity: before ? A.MiscUtil.copyFast(before) : null }
}

/** 这个来源编号是不是已经有人用了（官方、已装自制、试玩稿；不分大小写）——自己建包时不能撞。 */
export async function sourceTaken(json: string): Promise<boolean> {
  await init()
  const s = json.toLowerCase()
  const official = Object.keys(A.Parser.SOURCE_JSON_TO_FULL ?? {}).some((k) => k.toLowerCase() === s)
  return official || !!A.BrewUtil2.hasSourceJson(json) || !!A.PrereleaseUtil.hasSourceJson(json)
}

/**
 * 按来源导出可编辑自制里的一个包（P5.5 B3），照作者编辑器的做法（makebrew.js _getJsonOutputTemplate、
 * makebrew-builder-base.js pDoHandleClickDownloadJson）：包头 = 这个来源 + 时间（秒）+ edition；每条经 DataUtil.cleanJson、PropOrder.getOrdered。
 * edition 作者编辑器写死 classic，这里由调用方按包的版本标签给。另把条目 _copy 到别的来源的声明成依赖（作者规则：_copy 别的来源要声明）。
 */
export async function editableExport(json: string, edition: 'classic' | 'one'): Promise<{ filename: string; body: any }> {
  await init()
  const { PropOrder } = await mod('utils-proporder.js')
  const doc = await editableDoc()
  const same = (x: unknown): boolean => String(x ?? '').toLowerCase() === json.toLowerCase()
  const src = (doc.body?._meta?.sources ?? []).find((s: any) => same(s?.json))
  if (!src) throw new Error(`可编辑自制里没有来源 ${json}`)
  const ts = Math.round(Date.now() / 1000)
  const body: any = { _meta: { sources: [A.MiscUtil.copyFast(src)], dateAdded: ts, dateLastModified: ts, edition } }
  const deps: Record<string, Set<string>> = {}
  for (const [prop, list] of Object.entries(doc.body ?? {})) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    const mine = (list as any[]).filter((e) => same(e?.source))
    if (!mine.length) continue
    body[prop] = mine.map((e) => PropOrder.getOrdered(A.DataUtil.cleanJson(A.MiscUtil.copyFast(e)), prop))
    for (const e of mine) if (e?._copy?.source && !same(e._copy.source)) (deps[prop] ??= new Set()).add(String(e._copy.source))
  }
  if (Object.keys(deps).length) body._meta.dependencies = Object.fromEntries(Object.entries(deps).map(([k, v]) => [k, [...v]]))
  return { filename: `${A.DataUtil.getCleanFilename(src.full ?? src.json)}.json`, body }
}

/** 去掉作者运行时加的字段（作者 DataUtil.cleanJson：下划线开头的临时字段、uniqueId 等），得到能存回作者格式的原样；不改传入的对象。 */
export async function cleanEntity(ent: any): Promise<any> {
  await init()
  return A.DataUtil.cleanJson(A.MiscUtil.copyFast(ent))
}

/**
 * 一条改了名（或换了来源）：可编辑自制里用 _copy 指向它的条目（房规、自己写的变体）改指新名字，否则作者合并时找不到原件。
 * 作者 _copy 按名字 + 来源找（不分大小写）；写回走作者 pSetEditableBrewDoc（同 editableAddDependencies）。返回改了几条。
 */
export async function editableRetargetCopies(prop: string, from: { name: string; source: string }, to: { name: string; source: string }): Promise<number> {
  await init()
  const doc = A.MiscUtil.copyFast(await editableDoc())
  const same = (a: unknown, b: string): boolean => String(a ?? '').toLowerCase() === b.toLowerCase()
  let n = 0
  for (const e of doc.body?.[prop] ?? []) {
    const c = e?._copy
    if (c && same(c.name, from.name) && same(c.source, from.source)) { c.name = to.name; c.source = to.source; n++ }
  }
  if (n) await A.BrewUtil2.pSetEditableBrewDoc(doc)
  return n
}

/** 删条（作者 pRemoveEditableBrewEntities）。返回删掉的那几条原文（撤销用）。 */
export async function editableRemove(prop: string, uniqueIds: string[]): Promise<any[]> {
  await init()
  const removed = ((await A.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[prop] ?? []).filter((x: any) => uniqueIds.includes(x?.uniqueId)).map((x: any) => A.MiscUtil.copyFast(x))
  await A.BrewUtil2.pRemoveEditableBrewEntities(prop, uniqueIds)
  return removed
}

/**
 * 补依赖声明（作者规则：_copy 别的来源要在 _meta.dependencies 里声明，utils.js _pDoMetaMerge）。
 * 写回走作者 pSetEditableBrewDoc（makebrew-builder-base.js 第 560 行同法）。
 */
export async function editableAddDependencies(add: Record<string, string[]>): Promise<Record<string, string[]>> {
  const doc = A.MiscUtil.copyFast(await editableDoc())
  const deps: Record<string, string[]> = (doc.body._meta.dependencies ??= {})
  for (const [prop, sources] of Object.entries(add)) deps[prop] = [...new Set([...(deps[prop] ?? []), ...sources])]
  await A.BrewUtil2.pSetEditableBrewDoc(doc)
  return deps
}
