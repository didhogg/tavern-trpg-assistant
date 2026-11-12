// 小窗里：查询、详情、搜索用到的作者函数（D2-P2 B1 设计 §8.6、§8.7）。只转调作者函数，结果原样交回。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, engSiteHashOf, hashOf, init, sourceOf } from './author'
import { prepareProp } from './page-prepare'

/**
 * 一条是否被屏蔽：照作者列表页的写法（listpage.js 第 1379 行 ExcludeUtil.isExcluded(hash, __prop, source)）；
 * 物品页另外走 Renderer.item.isExcluded（items.js 第 304 行，连带判断基础物品、变体）。
 * 没有来源的条目作者 isExcluded 会报错，也无从按书屏蔽，记为不屏蔽。
 */
export function isExcludedEntity(prop: string, ent: any, hash: string | null): boolean {
  const source = sourceOf(ent)
  if (!source) return false
  if (A.DataLoader.getPropPage(prop) === A.UrlUtil.PG_ITEMS && A.Renderer.item.isExcluded(ent, { hash })) return true
  return A.ExcludeUtil.isExcluded(hash ?? '', ent.__prop ?? prop, source, { isNoCount: true })
}

/**
 * 整类的屏蔽标记（官方 site 或已装自制 brew），附编号；插件按编号对到库里的解析结果上（作者缓存里的先后顺序取决于先加载了哪本书）。
 * 屏蔽表为空时不展开，直接回答"都没屏蔽"（excluded: null）。
 */
export async function excludedFlags(prop: string, scope: 'site' | 'brew' = 'site'): Promise<{ hashes: Array<string | null>; excluded: boolean[] | null }> {
  await init()
  if (!A.ExcludeUtil.getList().length) return { hashes: [], excluded: null }
  await prepareProp(prop)
  const items: any[] = (await (scope === 'brew' ? A.DataLoader.pCacheAndGetAllBrew(prop) : A.DataLoader.pCacheAndGetAllSite(prop))) ?? []
  const hashes = items.map((it) => hashOf(prop, it))
  return { hashes, excluded: items.map((it, i) => isExcludedEntity(prop, it, hashes[i])) }
}

export interface Detail {
  item: unknown
  hash: string
  source: string | null
  excluded: boolean
  /** 背景描述（作者 Renderer.utils.pGetProxyFluff，按类别分派）；没有为 null。 */
  fluff: unknown
  fluffError: string | null
  /** "跳转英文源站"用的编号（中文程序、条目有英文名时才有）。不用于配对，配对见 english-commands.ts。 */
  engSiteHash: string | null
}

/** 按编号取一条（作者 pCacheAndGet；不给来源时用 pCacheAndGetHash 从编号里解出来源）+ 背景描述。 */
export async function detail(prop: string, hash: string, source?: string | null): Promise<Detail | null> {
  await init()
  await prepareProp(prop)
  const item = source ? await A.DataLoader.pCacheAndGet(prop, source, hash) : await A.DataLoader.pCacheAndGetHash(prop, hash)
  if (!item) return null
  let fluff: unknown = null
  let fluffError: string | null = null
  try {
    fluff = (await A.Renderer.utils.pGetProxyFluff({ entity: item, prop })) ?? null
  } catch (e) {
    fluffError = e instanceof Error ? e.message : String(e)
  }
  return { item, hash, source: sourceOf(item), excluded: isExcludedEntity(prop, item, hash), fluff, fluffError, engSiteHash: engSiteHashOf(prop, item) }
}

export interface SearchHit {
  score: number
  /** 作者类别名（Parser.pageCategoryToProp），详情() 用它。 */
  prop: string
  /** 作者索引里的一条原样：u 编号、s 来源、n 英文名、cn 中文名、c 类别、p 页码等。 */
  doc: Record<string, unknown>
}

/**
 * 作者搜索器（OmnisearchBacking.pGetResults），关键词先过作者自己的清理（CleanUtil.getCleanString，同作者搜索框）。
 * showLegacy 不为 null 时，这一次临时改作者的"显示旧版"设置（作者默认藏旧版来源，omnisearch-backing.js 第 175 行），用完改回。
 */
export async function search(term: string, showLegacy: boolean | null = null): Promise<SearchHit[]> {
  await init()
  const S = showLegacy === null ? null : await omnisearchState()
  const before = S?.isShowLegacy
  if (S) S.isShowLegacy = showLegacy
  try {
    const results: any[] = await A.OmnisearchBacking.pGetResults(A.CleanUtil.getCleanString(term))
    return results.map((r) => ({ score: r.score, prop: A.Parser.pageCategoryToProp(r.doc.c), doc: r.doc }))
  } finally {
    if (S) S.isShowLegacy = before
  }
}

/** 作者的搜索设置类只在作者模块里，没挂到全局；按作者模块的同一地址导入，拿到的是同一个类。 */
async function omnisearchState(): Promise<any> {
  const mod = await import(/* @vite-ignore */ new URL('js/omnisearch/omnisearch-state.js', location.href).href)
  return mod.OmnisearchState
}

/** 读或改作者的搜索设置（项目名取作者的 _DEFAULT_STATE，例 isShowLegacy、isShowBrew）。 */
export async function searchSettings(patch: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  await init()
  const S = await omnisearchState()
  for (const [k, v] of Object.entries(patch)) {
    if (!(k in S._DEFAULT_STATE)) throw new Error(`作者的搜索设置里没有这一项：${k}`)
    // 作者给 partneredMode 的是方法，其余是属性
    if (k === 'partneredMode') S.setPartneredMode(v)
    else S[k] = v
  }
  return S._getComp().toObject()
}

/** 作者搜索器建好的索引 + 顺带状态，装书时存库；刷新后 searchIndexLoad 接回，不重建。 */
export interface SearchIndexDump {
  json: string
  maxId: number | null
  categoryCounts: Record<string, number>
  adventureBookLookup: Record<string, number>
}

export async function searchIndexDump(): Promise<SearchIndexDump> {
  await init()
  const B = A.OmnisearchBacking
  await B._pInit()
  return {
    json: JSON.stringify(B._searchIndex.toJSON()),
    maxId: B._maxId ?? null,
    categoryCounts: B._CATEGORY_COUNTS ?? {},
    adventureBookLookup: B._adventureBookLookup ?? {},
  }
}

/** 把存好的索引接回作者搜索器：只设置作者自己的静态状态，不改作者文件。 */
export async function searchIndexLoad(dump: SearchIndexDump): Promise<boolean> {
  await init()
  // 作者在 SearchUtil 里登记 vetoolsFoldAscii；Index.load 会重建流水线，必须先登记再反序列化。
  // 直接调用作者的登记函数，避免为了登记而另造一条流水线。
  A.SearchUtil._initSearchIndex_getFnFold()
  const B = A.OmnisearchBacking
  B._searchIndex = A.elasticlunr.Index.load(JSON.parse(dump.json))
  B._maxId = dump.maxId
  B._CATEGORY_COUNTS = dump.categoryCounts
  B._adventureBookLookup = dump.adventureBookLookup
  B._pLoadSearch = Promise.resolve()
  B._initReInCategory()
  return true
}
