// 小窗里：【我的库】的包 = 作者的一个独立自制包（P5.5 B8）。对任意一个包做作者改可编辑包的同一个动作：
// 复制整包 → 换 / 加 / 删那一条 → BrewUtil2.pUpdateBrew 写回（utils-brew-impl-brew.js pPersistEditableBrewEntity 同法）。
// 条目第一次被改时补一个 uniqueId（作者编辑器 CryptUtil.uid 同法），导出时 DataUtil.cleanJson 会去掉它。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init } from './author'
import { prepareProp } from './page-prepare'

const mod = (path: string): Promise<any> => import(/* @vite-ignore */ new URL(`js/${path}`, location.href).href)
const same = (a: unknown, b: string): boolean => String(a ?? '').toLowerCase() === b.toLowerCase()

async function docOf(docIdLocal: string): Promise<any> {
  await init()
  const d = (await A.BrewUtil2.pGetBrew()).find((b: any) => b.head.docIdLocal === docIdLocal)
  if (!d) throw new Error(`作者存储里没有这个包：${docIdLocal}`)
  return A.MiscUtil.copyFast(d)
}

/**
 * 包里的一条（按 uniqueId，没有就按作者编号）连同作者编号；没补过 uniqueId 的补一个（只在返回的副本上，存的时候才写进包，
 * 存时带上 replaceHash 找到原来那条）。
 */
export async function packEntity(docIdLocal: string, prop: string, key: { uniqueId?: string; hash?: string }): Promise<{ entity: any; hash: string | null; hadId: boolean } | null> {
  const doc = await docOf(docIdLocal)
  const list: any[] = doc.body?.[prop] ?? []
  const e = list.find((x) => (key.uniqueId && x?.uniqueId === key.uniqueId) || (key.hash && hashOf(prop, x) === key.hash))
  return e ? { entity: { ...e, uniqueId: e.uniqueId ?? A.CryptUtil.uid() }, hash: hashOf(prop, e), hadId: !!e.uniqueId } : null
}

/**
 * 存一条进包：按 uniqueId 找到就换，找不到再按 replaceHash（作者编号）找没补过 uniqueId 的那条换，都没有就加。
 * 返回形状同 editablePut：改之前的编号、名字、原文（改名搬记录、撤销用）。
 */
export async function packPut(docIdLocal: string, prop: string, ent: any, opts: { replaceHash?: string } = {}): Promise<{ uniqueId: string; hash: string | null; previousHash: string | null; previous: { name: string; source: string } | null; previousEntity: any }> {
  const doc = await docOf(docIdLocal)
  const list: any[] = (doc.body[prop] ??= [])
  let i = ent.uniqueId ? list.findIndex((x) => x?.uniqueId === ent.uniqueId) : -1
  if (i < 0 && opts.replaceHash) i = list.findIndex((x) => !x?.uniqueId && hashOf(prop, x) === opts.replaceHash)
  const before = i >= 0 ? A.MiscUtil.copyFast(list[i]) : null
  const e = { ...ent, uniqueId: ent.uniqueId ?? A.CryptUtil.uid() }
  if (i >= 0) list[i] = e
  else list.push(e)
  await A.BrewUtil2.pUpdateBrew(doc)
  return { uniqueId: e.uniqueId, hash: hashOf(prop, e), previousHash: before ? hashOf(prop, before) : null, previous: before ? { name: String(before.name ?? ''), source: String(before.source ?? '') } : null, previousEntity: before }
}

/** 从包里删条（按 uniqueId）。返回删掉的那几条原文（撤销用）。 */
export async function packRemove(docIdLocal: string, prop: string, uniqueIds: string[]): Promise<any[]> {
  const doc = await docOf(docIdLocal)
  const list: any[] = doc.body?.[prop] ?? []
  const ids = new Set(uniqueIds)
  const removed = list.filter((x) => ids.has(x?.uniqueId)).map((x) => A.MiscUtil.copyFast(x))
  if (!removed.length) return []
  doc.body[prop] = list.filter((x) => !ids.has(x?.uniqueId))
  await A.BrewUtil2.pUpdateBrew(doc)
  return removed
}

/** 包里用 _copy 指向某条的条目改指新名字（同 editableRetargetCopies，只在这一个包里）。返回改了几条。 */
export async function packRetargetCopies(docIdLocal: string, prop: string, from: { name: string; source: string }, to: { name: string; source: string }): Promise<number> {
  const doc = await docOf(docIdLocal)
  let n = 0
  for (const e of doc.body?.[prop] ?? []) {
    const c = e?._copy
    if (c && same(c.name, from.name) && same(c.source, from.source)) { c.name = to.name; c.source = to.source; n++ }
  }
  if (n) await A.BrewUtil2.pUpdateBrew(doc)
  return n
}

/** 改包头里某个来源的显示名 / 缩写（来源编号不变，包的身份不变）。 */
export async function packRenameSource(docIdLocal: string, json: string, patch: { full?: string; abbreviation?: string }): Promise<void> {
  const doc = await docOf(docIdLocal)
  const src = (doc.body?._meta?.sources ?? []).find((s: any) => same(s?.json, json))
  if (!src) throw new Error(`这个包里没有来源 ${json}`)
  Object.assign(src, Object.fromEntries(Object.entries(patch).filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => [k, (v as string).trim()])))
  doc.body._meta.dateLastModified = Math.round(Date.now() / 1000)
  await A.BrewUtil2.pUpdateBrew(doc)
}

/**
 * 导出一个包（作者格式文件）：照作者编辑器导出（DataUtil.cleanJson 去掉 uniqueId 等运行时字段、PropOrder.getOrdered 排字段），
 * 包头原样（来源、依赖、internalCopies 等），只更新修改时间；edition 给了就用给的（包的版本标签）。
 */
export async function packExport(docIdLocal: string, edition?: 'classic' | 'one'): Promise<{ filename: string; body: any }> {
  const { PropOrder } = await mod('utils-proporder.js')
  const doc = await docOf(docIdLocal)
  const body: any = { _meta: { ...A.MiscUtil.copyFast(doc.body._meta ?? {}), dateLastModified: Math.round(Date.now() / 1000), ...(edition ? { edition } : {}) } }
  for (const [prop, list] of Object.entries(doc.body ?? {})) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    body[prop] = (list as any[]).map((e) => PropOrder.getOrdered(A.DataUtil.cleanJson(A.MiscUtil.copyFast(e)), prop))
  }
  const src = doc.body._meta?.sources?.at(-1)
  return { filename: doc.head.filename ?? `${A.DataUtil.getCleanFilename(src?.full ?? src?.json ?? 'pack')}.json`, body }
}

/**
 * 作者网站实际读哪些数据文件（P5.5 B8-3）：让作者把每一类的网站数据都取一遍（每个加载器的 pGetSiteData，作者 pCacheAndGetAllSite 同法），
 * 再交出小窗启动以来作者请求过的数据文件（early.ts 在作者读文件的唯一出口 siteText 记下）。要在**全新的小窗**里调，
 * 否则作者缓存过的不会再读。作者不读的文件（例如给 Foundry 用的 foundry*.json 补充文件）不会出现。取某一类失败的照报，不中断。
 */
export async function authorDataFiles(): Promise<{ paths: string[]; failed: Array<{ props: string[]; error: string }> }> {
  await init()
  const [{ DataLoaderConst }, { DataLoaderInternalUtil }] = await Promise.all([mod('utils-dataloader/utils-dataloader-const.js'), mod('utils-dataloader/utils-dataloader-internal-util.js')])
  const failed: Array<{ props: string[]; error: string }> = []
  for (const loader of new Set<any>(A.DataLoader._DATA_TYPE_LOADER_LIST)) {
    const props: string[] = [...(loader.constructor.PROPS ?? [])]
    if (!props.length) continue
    const pageClean = DataLoaderInternalUtil.getCleanPage({ page: props[0] })
    // 先做作者这一页的准备步骤（例如物品页先装物品类型表），否则作者取数时会报找不到
    try { await prepareProp(props[0]); await loader.pGetSiteData({ pageClean, sourceClean: DataLoaderConst.SOURCE_SITE_ALL }) } catch (e) { failed.push({ props, error: e instanceof Error ? e.message : String(e) }) }
  }
  const seen = (A.__trpgSitePaths ?? new Set()) as Set<string>
  return { paths: [...seen].filter((p) => p.startsWith('data/')).sort(), failed }
}

/** 给包头补依赖声明（_copy 别的来源要在 _meta.dependencies 里声明；同 editableAddDependencies，只是对一个包）。 */
export async function packAddDependencies(docIdLocal: string, add: Record<string, string[]>): Promise<void> {
  const doc = await docOf(docIdLocal)
  const deps: Record<string, string[]> = (doc.body._meta.dependencies ??= {})
  let changed = false
  for (const [prop, sources] of Object.entries(add)) {
    const have = deps[prop] ?? []
    const next = [...new Set([...have, ...sources])]
    if (next.length !== have.length) { deps[prop] = next; changed = true }
  }
  if (changed) await A.BrewUtil2.pUpdateBrew(doc)
}

// ---- P5.5 B8-6 迁移 ----

/** 这些来源里哪些是官方的（作者 Parser.SOURCE_JSON_TO_FULL；sourceTaken 同一个判断）。 */
export async function officialSourcesOf(jsons: string[]): Promise<string[]> {
  await init()
  const official = new Set(Object.keys(A.Parser.SOURCE_JSON_TO_FULL ?? {}).map((k) => k.toLowerCase()))
  return jsons.filter((j) => official.has(j.toLowerCase()))
}

/**
 * 从可编辑自制里取出一个来源：它的包头那一行 + 来源是它的全部条目（保留 uniqueId，撤销记录接着用），并从可编辑自制里删掉
 * （写回走作者 pSetEditableBrewDoc）。交回一个作者格式的包（_copy 别的来源的声明依赖，本来源内部的声明 internalCopies）。
 */
export async function editableTake(json: string): Promise<{ body: any; uniqueIds: string[] }> {
  await init()
  const doc = A.MiscUtil.copyFast(await A.BrewUtil2.pGetOrCreateEditableBrewDoc())
  const src = (doc.body._meta?.sources ?? []).find((s: any) => same(s?.json, json))
  if (!src) throw new Error(`可编辑自制里没有来源 ${json}`)
  const ts = Math.round(Date.now() / 1000)
  const body: any = { _meta: { sources: [src], dateAdded: ts, dateLastModified: ts } }
  const deps: Record<string, Set<string>> = {}
  const internal = new Set<string>()
  const uniqueIds: string[] = []
  for (const [prop, list] of Object.entries(doc.body)) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    const mine = (list as any[]).filter((e) => same(e?.source, json))
    if (!mine.length) continue
    body[prop] = mine
    doc.body[prop] = (list as any[]).filter((e) => !same(e?.source, json))
    for (const e of mine) {
      if (e.uniqueId) uniqueIds.push(e.uniqueId)
      const from = e?._copy?.source
      if (typeof from !== 'string') continue
      if (same(from, json)) internal.add(prop)
      else (deps[prop] ??= new Set()).add(from)
    }
  }
  if (Object.keys(deps).length) body._meta.dependencies = Object.fromEntries(Object.entries(deps).map(([k, v]) => [k, [...v]]))
  if (internal.size) body._meta.internalCopies = [...internal]
  doc.body._meta.sources = doc.body._meta.sources.filter((s: any) => s !== src)
  await A.BrewUtil2.pSetEditableBrewDoc(doc)
  return { body, uniqueIds }
}

/**
 * 修以前「存入我的库」的旧副本（B8-0 两个旧问题）：补 _meta.internalCopies（条目 _copy 本包来源的类别），
 * 去掉和作者给 Foundry 用的补充文件里一模一样的记录（removeKeys = 那些记录的 JSON 原文）。返回去掉了几条。
 */
export async function packFixOldCopy(docIdLocal: string, removeKeys: string[]): Promise<{ removed: number; internalCopies: string[] }> {
  const doc = await docOf(docIdLocal)
  const drop = new Set(removeKeys)
  const sources = (doc.body._meta?.sources ?? []).map((s: any) => String(s?.json ?? '').toLowerCase())
  const internal = new Set<string>(doc.body._meta?.internalCopies ?? [])
  let removed = 0
  for (const [prop, list] of Object.entries(doc.body)) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    const keep = (list as any[]).filter((e) => !drop.has(JSON.stringify(e)))
    removed += (list as any[]).length - keep.length
    doc.body[prop] = keep
    if (keep.some((e) => typeof e?._copy?.source === 'string' && sources.includes(e._copy.source.toLowerCase()))) internal.add(prop)
  }
  if (internal.size) doc.body._meta.internalCopies = [...internal]
  await A.BrewUtil2.pUpdateBrew(doc)
  return { removed, internalCopies: [...internal] }
}
