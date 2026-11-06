// 中英配对：照中文站作者自己的做法（docs/entity-json-search-guide.md："查英文原文时，将 data/ 替换为 data-bak/"；
// 实现在 node/search-entities.js 的 getEnglishEntity + node/util-search-index.js 的 _pGetIndex）。
// 那两个文件读电脑上的文件，浏览器里不能直接载入，所以只把"逐个文件建索引"的循环和 getEnglishEntity 的查找原样搬进来，
// 唯一的改动是取文件的方式：读本地库（经 DataUtil）。定位本身由作者浏览器版 Omnidexer 产出。
// 我们装的英文官方数据就是 data-bak 的同一版本（2.39.0，已核实），所以"换成 data-bak/"= 去英文小窗读同一路径。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init, sourceOf } from './author'

export interface LocatedDoc {
  /** 作者类别名（Parser.pageCategoryToProp），中文那边的编号属于这一类。 */
  prop: string
  /** 中文作者编号。 */
  hash: string
  /** 原始文件路径，例 data/spells/spells-xphb.json。 */
  file: string
  /** 作者 Omnidexer 的定位：数组键、第几条、数组长度、英文名（ENG_name ?? name）、来源、页码、同来源同页第几条。 */
  locator: { prop: string; ix: number; count: number; name: string; source: string | null; page: unknown; ixSourcePage: number }
}

/**
 * 中文那边：照 node/util-search-index.js _pGetIndex（isIncludeSourceFile）逐个原始文件建索引，带定位和文件路径。
 * 目录型（怪物、法术、职业…）按目录 index.json 读原始文件；单文件型用 DataUtil.loadJSON（与作者相同）。
 * 作者在单文件型里先排序再建索引，但定位是排序前算好的（fnGetEntityLocator）；这里不排序，
 * Omnidexer 自己算的定位就是同一个值（omnidexer.js 第 199–207 行）。特殊索引（TO_INDEX__SPECIAL）作者这里也没有文件，跳过。
 */
export async function englishLocators(): Promise<LocatedDoc[]> {
  await init()
  const out: LocatedDoc[] = []
  const add = async (indexMeta: any, data: any, file: string): Promise<void> => {
    const indexer = new A.Omnidexer()
    await indexer.pAddToIndex(indexMeta, data, { isNoFilter: true, isIncludeEntityLocator: true })
    for (const d of indexer.getIndex().x) {
      if (!d._entityLocator) continue
      out.push({ prop: A.Parser.pageCategoryToProp(d.c), hash: d.u, file, locator: d._entityLocator })
    }
  }
  for (const indexMeta of A.Omnidexer.TO_INDEX__FROM_INDEX_JSON) {
    const dataIndex = await A.DataUtil.loadRawJSON(`data/${indexMeta.dir}/index.json`)
    for (const filename of Object.values(dataIndex) as string[]) {
      const file = `data/${indexMeta.dir}/${filename}`
      await add(indexMeta, await A.DataUtil.loadRawJSON(file), file)
    }
  }
  for (const indexMeta of A.Omnidexer.TO_INDEX) {
    const file = `data/${indexMeta.file}`
    await add(indexMeta, await A.DataUtil.loadJSON(file), file)
  }
  return out
}

export interface EnglishMatch {
  prop: string
  hash: string
  /** 英文那条的作者编号（英文程序的 URL_TO_HASH_BUILDER，按定位里的数组键）；没找到为 null。 */
  enHash: string | null
  /** 英文那条的来源（作者 SourceUtil.getEntitySource）；按编号取英文条目时要用。 */
  enSource: string | null
  /** 找到的方式（getEnglishEntity 的四步之一）。 */
  via: 'name' | 'name-any-array' | 'position' | 'source-page' | null
  error?: string
}

/**
 * 英文那边：照 node/search-entities.js getEnglishEntity 的四步找英文原始记录：
 * ① 同一数组里英文名 + 来源相同 ② 整个文件任一数组里英文名 + 来源相同 ③ 数组长度相同时取同一位置 ④ 同来源同页的第几条。
 */
export async function englishMatch(docs: LocatedDoc[]): Promise<EnglishMatch[]> {
  await init()
  const files = new Map<string, Promise<any>>()
  const load = (file: string): Promise<any> => {
    let p = files.get(file)
    if (!p) {
      p = A.DataUtil.loadRawJSON(file) as Promise<any>
      files.set(file, p)
    }
    return p
  }
  const out: EnglishMatch[] = []
  for (const doc of docs) {
    let englishJson: any
    try {
      englishJson = await load(doc.file)
    } catch (e) {
      out.push({ prop: doc.prop, hash: doc.hash, enHash: null, enSource: null, via: null, error: e instanceof Error ? e.message : String(e) })
      continue
    }
    // ↓ 原样取自 getEnglishEntity
    const locator = doc.locator
    const entities: any[] | null = locator ? A.Omnidexer.getProperty(englishJson, locator.prop) : null
    const isMatch = (ent: any): boolean => ent?.name === locator.name && (locator.source == null || ent.source === locator.source)
    const sourcePageMatches = entities?.filter((ent) => ent.source === locator.source && ent.page === locator.page) || []
    let via: EnglishMatch['via'] = null
    let jsonObj: any = entities?.find(isMatch)
    if (jsonObj) via = 'name'
    else if ((jsonObj = (Object.values(englishJson).filter(Array.isArray) as any[][]).flat().find(isMatch))) via = 'name-any-array'
    else if ((jsonObj = entities?.length === locator.count ? entities[locator.ix] : null)) via = 'position'
    else if ((jsonObj = sourcePageMatches[locator.ixSourcePage])) via = 'source-page'
    // ↑ 原样取自 getEnglishEntity
    out.push({ prop: doc.prop, hash: doc.hash, enHash: jsonObj ? hashOf(locator.prop, jsonObj) : null, enSource: jsonObj ? sourceOf(jsonObj) : null, via })
  }
  return out
}
