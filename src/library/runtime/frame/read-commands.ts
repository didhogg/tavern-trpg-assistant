// 小窗里：查询、详情、搜索用到的作者函数（D2-P2 B1 设计 §8.6、§8.7）。只转调作者函数，结果原样交回。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, engSiteHashOf, hashOf, init, sourceOf } from './author'

/**
 * 一条是否被屏蔽：照作者列表页的写法（listpage.js 第 1379 行 ExcludeUtil.isExcluded(hash, __prop, source)）；
 * 物品页另外走 Renderer.item.isExcluded（items.js 第 304 行，连带判断基础物品、变体）。
 * 没有来源的条目作者 isExcluded 会报错，也无从按书屏蔽，记为不屏蔽。
 */
function isExcludedEntity(prop: string, ent: any, hash: string | null): boolean {
  const source = sourceOf(ent)
  if (!source) return false
  if (A.DataLoader.getPropPage(prop) === A.UrlUtil.PG_ITEMS && A.Renderer.item.isExcluded(ent, { hash })) return true
  return A.ExcludeUtil.isExcluded(hash ?? '', ent.__prop ?? prop, source, { isNoCount: true })
}

/**
 * 整类的屏蔽标记，附编号；插件按编号对到库里的解析结果上（作者缓存里的先后顺序取决于先加载了哪本书）。
 * 屏蔽表为空时不展开，直接回答"都没屏蔽"（excluded: null）。
 */
export async function excludedFlags(prop: string): Promise<{ hashes: Array<string | null>; excluded: boolean[] | null }> {
  await init()
  if (!A.ExcludeUtil.getList().length) return { hashes: [], excluded: null }
  const items: any[] = (await A.DataLoader.pCacheAndGetAllSite(prop)) ?? []
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

/** 作者搜索器（OmnisearchBacking.pGetResults），关键词先过作者自己的清理（CleanUtil.getCleanString，同作者搜索框）。 */
export async function search(term: string): Promise<SearchHit[]> {
  await init()
  const results: any[] = await A.OmnisearchBacking.pGetResults(A.CleanUtil.getCleanString(term))
  return results.map((r) => ({ score: r.score, prop: A.Parser.pageCategoryToProp(r.doc.c), doc: r.doc }))
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
