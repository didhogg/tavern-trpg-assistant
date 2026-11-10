// 小窗里插件能叫作者程序做的事。每一件都只是转调作者自己的函数，结果原样交回，不挑字段。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init, sourceOf } from './author'
import { brewAddFiles, brewAddSources, brewAddUrl, brewCatalog, brewDelete, brewInstalled, brewPull, brewStorage, parseBrewProp } from './brew-commands'
import { englishLocators, englishMatch, variantTemplateNames, versionOrder } from './english-commands'
import { detail, excludedFlags, search, searchIndexDump, searchIndexLoad, searchSettings } from './read-commands'
import { directory } from './directory-commands'
import { diceRead, diceRoll, diceStats, diceTag } from './dice-commands'
import { tableRoll, tableRow } from './table-roll-commands'
import { tagMeta } from './tag-commands'
import { tokenPath } from './image-commands'
import { extractTables } from './table-extract-commands'
import { brewDocIndex, brewExport, brewItemsByHash, corpusFile, brewRaw, converters, convertText, editableAddDependencies, editableDoc, editableEnsureSource, editablePut, editableRemove, editionOf, entryTemplate, excludeList, fluffOf, fluffOfMany, sourceNames } from './edit-commands'

export interface LoaderInfo {
  props: string[]
  page: string | null
  /** site：整类取；corpus：书或冒险，按作者书目逐本取。 */
  kind: 'site' | 'corpus'
  index?: string
}

export { init }

/** 作者的加载器登记表（DataLoader._DATA_TYPE_LOADER_LIST），去重后按登记顺序列出。 */
export async function loaders(): Promise<LoaderInfo[]> {
  const seen = new Set<unknown>()
  const out: LoaderInfo[] = []
  for (const loader of A.DataLoader._DATA_TYPE_LOADER_LIST) {
    if (seen.has(loader)) continue
    seen.add(loader)
    const props: string[] = [...loader.constructor.PROPS]
    const page: string | null = loader.constructor.PAGE ?? null
    if (props.some((p) => p === 'bookData' || p === 'adventureData')) out.push({ props, page, kind: 'corpus', index: loader._filename })
    else out.push({ props, page, kind: 'site' })
  }
  return out
}

export interface ParsedProp {
  items: unknown[]
  /** 作者编号，与 items 一一对应。 */
  hashes: Array<string | null>
  /** 来源（作者 SourceUtil.getEntitySource），与 items 一一对应。 */
  sources: Array<string | null>
}

/** 整类取一类（作者的 pCacheAndGetAllSite），连同作者编号、来源一起交回。 */
export async function parseProp(prop: string): Promise<ParsedProp> {
  await init()
  const items: any[] = (await A.DataLoader.pCacheAndGetAllSite(prop)) ?? []
  return {
    items,
    hashes: items.map((it) => hashOf(prop, it)),
    sources: items.map((it) => sourceOf(it)),
  }
}

/** 书或冒险的书目（作者的 books.json / adventures.json）：编号、来源、作者编号。 */
export async function corpusList(index: string, prop: string, page: string): Promise<Array<{ id: string; source: string; hash: string }>> {
  await init()
  const json = await A.DataUtil.loadJSON(`data/${index}`)
  return (json[prop] ?? []).map((it: any) => ({ id: it.id, source: A.SourceUtil.getEntitySource(it), hash: A.UrlUtil.URL_TO_HASH_BUILDER[page](it) }))
}

/** 按本取一本书或冒险的全文（作者的 pCacheAndGet，B0 已取到过 XPHB 正文）。 */
export async function parseCorpus(page: string, source: string, hash: string): Promise<unknown> {
  await init()
  return A.DataLoader.pCacheAndGet(page, source, hash, { isRequired: true })
}

/** 作者预生成的搜索索引（search/index.json + 物品变体副索引 index-item.json），按类别列出作者编号。 */
export async function searchIndexHashes(): Promise<Record<string, string[]>> {
  await init()
  const out: Record<string, string[]> = {}
  for (const file of ['search/index.json', 'search/index-item.json']) {
    const docs: any[] = A.Omnidexer.decompressIndex(await A.DataUtil.loadRawJSON(file))
    for (const d of docs) {
      const prop = A.Parser.CAT_ID_TO_PROP[d.c] ?? `cat:${d.c}`
      ;(out[prop] ??= []).push(d.u)
    }
  }
  return out
}

/** 按书开关：作者屏蔽表里"整本书"一行 = {hash:'*', category:'*', source}。 */
export async function setSourceExcluded(source: string, excluded: boolean): Promise<unknown[]> {
  await init()
  const rest = A.ExcludeUtil.getList().filter((it: any) => !(it.hash === '*' && it.category === '*' && String(it.source).toLowerCase() === source.toLowerCase()))
  const next = excluded ? [...rest, { displayName: source, hash: '*', category: '*', source, isAuto: false }] : rest
  await A.ExcludeUtil.pSetList(next)
  await A.ExcludeUtil._pSave()
  return A.ExcludeUtil.getList()
}

export async function isExcluded(hash: string, prop: string, source: string): Promise<boolean> {
  await init()
  return A.ExcludeUtil.isExcluded(hash, prop, source, { isNoCount: true })
}

/** 审计第 3 层：对原始记录（不经加载器）直接用作者编号规则算编号（D2-P2 B1 设计 §11）。算不出来为 null。 */
export async function rawHashes(prop: string, records: unknown[]): Promise<Array<string | null>> {
  await init()
  return records.map((r) => hashOf(prop, r))
}

/** 这个小窗开起来以后作者抛出的全部错误（early.ts 收集，原文）。 */
export async function frameErrors(): Promise<string[]> {
  return [...(A.__trpgFrameErrors as string[])]
}

export const COMMANDS = { frameErrors, init, loaders, parseProp, corpusList, parseCorpus, searchIndexHashes, setSourceExcluded, isExcluded, excludedFlags, detail, search, searchIndexDump, searchIndexLoad, searchSettings, englishLocators, englishMatch, variantTemplateNames, versionOrder,
  brewCatalog, brewInstalled, brewStorage, brewAddUrl, brewAddSources, brewAddFiles, brewDelete, brewPull, parseBrewProp, rawHashes,
  editionOf, sourceNames, corpusFile, brewDocIndex, brewItemsByHash, brewRaw, brewExport, fluffOf, fluffOfMany, excludeList, editableDoc, editableEnsureSource, editablePut, editableRemove, editableAddDependencies, converters, convertText, entryTemplate,
  diceTag, diceStats, diceRead, diceRoll, tableRow, tableRoll, tagMeta, tokenPath, extractTables, directory }
export type CommandName = keyof typeof COMMANDS
