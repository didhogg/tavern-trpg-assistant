// 小窗里：自制内容的书目、已装列表、装、导入、删、更新、解析（D2-P2 B1 设计 §8.4、§8.5、L1、L3–L5、L7）。
// 全部转调作者包管理器 BrewUtil2（js/utils-brew/）与加载器，不读不改自制内容。
// 作者出错时只弹提示框（小窗里看不见）并把错误抛到网页层面（setTimeout(() => { throw e })），
// 所以每次调用都把这段时间里 early.ts 收集到的错误原样交回。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init, sourceOf } from './author'
import type { ParsedProp } from './commands'

export interface WithErrors<T> {
  value: T
  /** 调用期间作者抛出的错误（原文）。 */
  errors: string[]
}

async function withErrors<T>(fn: () => Promise<T>): Promise<WithErrors<T>> {
  await init()
  const list: string[] = A.__trpgFrameErrors
  const start = list.length
  const value = await fn()
  // 作者用 setTimeout 抛错，等它们落地
  await new Promise((resolve) => setTimeout(resolve, 50))
  return { value, errors: list.slice(start) }
}

/** 已装自制包的管理记录：作者的包头（本地编号、加入时间、校验码、网址、文件名、是否本地、是否可编辑）+ 文件元数据 _meta。 */
export interface BrewEntry {
  head: Record<string, unknown>
  meta: unknown
}

const entryOf = (brew: any): BrewEntry => ({ head: brew.head, meta: brew.body?._meta ?? null })

/** 自制书目（作者 pGetCombinedIndexes：读自制仓库 _generated/ 的目录文件）。取不到时 value 为 null。 */
export function brewCatalog(): Promise<WithErrors<unknown[] | null>> {
  return withErrors(() => A.BrewUtil2.pGetCombinedIndexes())
}

/** 已装的自制包（作者 pGetBrew：已过滤掉没有来源的包）。 */
export async function brewInstalled(): Promise<BrewEntry[]> {
  await init()
  return (await A.BrewUtil2.pGetBrew()).map(entryOf)
}

export interface StoredBrew {
  /** 存在作者的哪个包管理器里：自制（BrewUtil2）或试玩稿（PrereleaseUtil）。 */
  kind: 'brew' | 'prerelease'
  head: Record<string, unknown>
  /** 包里声明的来源（_meta.sources[].json）。 */
  sources: string[]
  /** 作者 pGetBrew 是否交出它（作者会滤掉没有来源的包：utils-brew-base.js 第 313 行）。 */
  shown: boolean
}

/** 体检用：作者两个包管理器里存着的全部包（作者 _pGetBrewRaw），以及哪些被作者滤掉、不会显示。 */
export async function brewStorage(): Promise<StoredBrew[]> {
  await init()
  const out: StoredBrew[] = []
  for (const [kind, util] of [['brew', A.BrewUtil2], ['prerelease', A.PrereleaseUtil]] as const) {
    const shown = new Set((await util.pGetBrew()).map((b: any) => b.head.docIdLocal))
    for (const b of (await util._pGetBrewRaw()) ?? []) {
      out.push({ kind, head: b.head, sources: (b.body?._meta?.sources ?? []).map((src: any) => src?.json).filter(Boolean), shown: shown.has(b.head.docIdLocal) })
    }
  }
  return out
}

/** 按网址装（作者 pAddBrewFromUrl：自动追装声明的依赖）。value 是这次加进来的包（含依赖）。 */
export async function brewAddUrl(url: string): Promise<WithErrors<BrewEntry[]>> {
  const r = await withErrors<any[]>(() => A.BrewUtil2.pAddBrewFromUrl(url))
  return { ...r, value: (r.value ?? []).map(entryOf) }
}

/**
 * 缺的来源一键下载（P5 B-24）：照作者装依赖的做法（utils-brew-base.js `_pLoadParentDependencies`）——
 * 每个来源标识用 pGetSourceUrl 到来源索引里找下载网址，pAddBrewFromUrl 惰性装（作者自动追装它声明的依赖），最后 pAddBrewsLazyFinalize 一次收尾。
 * value.added 是这次加进来的包（含依赖）；value.notFound 是来源索引里查不到网址的来源。
 */
export async function brewAddSources(sources: string[]): Promise<WithErrors<{ added: BrewEntry[]; notFound: string[] }>> {
  const r = await withErrors(async () => {
    const notFound: string[] = []
    const failed: string[] = []
    await Promise.all(sources.map(async (source) => {
      const url = await A.BrewUtil2.pGetSourceUrl(source)
      if (!url) { notFound.push(source); return }
      try { await A.BrewUtil2.pAddBrewFromUrl(url, { isLazy: true }) } catch { failed.push(source) }
    }))
    const added: any[] = (await A.BrewUtil2.pAddBrewsLazyFinalize()) ?? []
    return { added, notFound: [...notFound, ...failed] }
  })
  return { errors: r.errors, value: { added: r.value.added.map(entryOf), notFound: r.value.notFound } }
}

/**
 * 导入本地文件：照作者拖放导入的做法（utils-brew-base.js 第 97–127 行）——解析 JSON，
 * 按作者的判断分给试玩稿（PrereleaseUtil）或自制（BrewUtil2）的 pAddBrewsFromFiles。
 * 作者对解析不了的文件直接忽略，这里把它们列出来交回。
 */
export async function brewAddFiles(files: Array<{ name: string; text: string }>): Promise<WithErrors<{ added: BrewEntry[]; notJson: Array<{ name: string; error: string }> }>> {
  const notJson: Array<{ name: string; error: string }> = []
  const metas: Array<{ name: string; json: unknown }> = []
  for (const f of files) {
    try {
      metas.push({ name: f.name, json: JSON.parse(f.text) })
    } catch (e) {
      notJson.push({ name: f.name, error: e instanceof Error ? e.message : String(e) })
    }
  }
  const r = await withErrors(async () => {
    // segregate 是作者给数组加的方法
    const [prerelease, brew] = (metas as any).segregate((m: any) => A.BrewUtil2.constructor._isPrereleaseDroppedJson(m.json))
    const added: any[] = []
    if (prerelease.length) added.push(...((await A.PrereleaseUtil.pAddBrewsFromFiles(prerelease)) ?? []))
    if (brew.length) added.push(...((await A.BrewUtil2.pAddBrewsFromFiles(brew)) ?? []))
    return added
  })
  return { errors: r.errors, value: { added: r.value.map(entryOf), notJson } }
}

/** 删（作者 pDeleteBrews），按本地编号。 */
export async function brewDelete(docIdLocals: string[]): Promise<WithErrors<number>> {
  return withErrors(async () => {
    const ids = new Set(docIdLocals)
    const brews = (await A.BrewUtil2.pGetBrew()).filter((b: any) => ids.has(b.head.docIdLocal))
    await A.BrewUtil2.pDeleteBrews(brews)
    return brews.length
  })
}

/** 更新（作者 pPullAllBrews：按 _meta.dateLastModified，有新版的直接换）。不给编号就是全部。value 是更新了的包。 */
export async function brewPull(docIdLocals: string[] | null = null): Promise<WithErrors<BrewEntry[]>> {
  const r = await withErrors<any[]>(async () => {
    const brews = docIdLocals ? (await A.BrewUtil2.pGetBrew()).filter((b: any) => docIdLocals.includes(b.head.docIdLocal)) : null
    return A.BrewUtil2.pPullAllBrews({ brews })
  })
  return { ...r, value: (r.value ?? []).map(entryOf) }
}

/**
 * 已装自制里的书或冒险目录（P5 B-29）：作者 pGetBrewProcessed 合并后的 book / adventure 数组（书的目录项：编号、名称、章节…；
 * 正文在 bookData / adventureData），连同作者编号、来源。读正文用 parseCorpus（作者 DataLoader 的自制书加载器 DataTypeLoaderCustomBook）。
 */
export async function brewCorpusList(prop: string, page: string): Promise<Array<{ id: string; name: string; source: string; hash: string }>> {
  await init()
  const processed = await A.BrewUtil2.pGetBrewProcessed()
  return (processed?.[prop] ?? []).map((it: any) => ({ id: it.id, name: it.name, source: A.SourceUtil.getEntitySource(it), hash: A.UrlUtil.URL_TO_HASH_BUILDER[page](it) }))
}

export interface BrewUpdateCheck {
  docIdLocal: string
  filename: string | null
  url: string
  /** 本地包内 _meta.dateLastModified / 网址上现在的（没写按作者规则当 0）。 */
  local: number
  remote: number
  hasUpdate: boolean
  /** 取网址失败的原因（原文）；失败的包 hasUpdate = false。 */
  error: string | null
}

/**
 * 自制更新检查（P5 B-28）：只比较、不替换。逐包照作者 pPullAllBrews 的做法——isPullable（不是自己写的、有网址）、
 * DataUtil.loadRawJSON(url, {isBustCache: true}) 重新下载原文件、比较 _meta.dateLastModified——但不调用 pSetBrew，所以什么都不改。
 * 不给编号就是全部可更新的包。点【更新】才调 brewPull。
 */
export async function brewCheckUpdates(docIdLocals: string[] | null = null): Promise<WithErrors<BrewUpdateCheck[]>> {
  return withErrors(async () => {
    const util = A.BrewUtil2
    const brews = (await util.pGetBrew()).filter((b: any) => util.isPullable(b) && (!docIdLocals || docIdLocals.includes(b.head.docIdLocal)))
    const out: BrewUpdateCheck[] = []
    for (const b of brews) {
      const local = b.body._meta?.dateLastModified ?? 0
      try {
        const json = await A.DataUtil.loadRawJSON(b.head.url, { isBustCache: true })
        const remote = json._meta?.dateLastModified ?? 0
        out.push({ docIdLocal: b.head.docIdLocal, filename: b.head.filename ?? null, url: b.head.url, local, remote, hasUpdate: remote > local, error: null })
      } catch (e) {
        out.push({ docIdLocal: b.head.docIdLocal, filename: b.head.filename ?? null, url: b.head.url, local, remote: 0, hasUpdate: false, error: e instanceof Error ? e.message : String(e) })
      }
    }
    return out
  })
}

/** 已装自制里某一类（作者 pCacheAndGetAllBrew），连同作者编号、来源。 */
export async function parseBrewProp(prop: string): Promise<ParsedProp> {
  await init()
  const items: any[] = (await A.DataLoader.pCacheAndGetAllBrew(prop)) ?? []
  return { items, hashes: items.map((it) => hashOf(prop, it)), sources: items.map((it) => sourceOf(it)) }
}
