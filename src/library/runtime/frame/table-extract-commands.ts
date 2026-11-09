// 小窗里：把埋在条目正文里的表格都提出来（P5 B-09）。作者的 table 类别是挑选过的子集（书里的表全提；冒险、职业、变体规则、
// 背景、物品里只提标了 tableInclude 的），法术、专长、种族、怪物、神祇等里面的表不提。这里直接用作者自己的提取器
// （js/generate-tables-data/：UtilGenTables._doSearch + RecursiveSearchStateGeneric），只把"必须标 tableInclude"关掉，
// 其余（嵌套章节路径、tableIgnore、整理表格字段）全是作者的做法。遍历每个条目所有数组字段，不写死哪些字段装着正文。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init, sourceOf } from './author'

export interface ExtractedTable {
  parentHash: string | null
  parentName: string
  parentSource: string | null
  /** 作者整理后的表（rows、colLabels、caption、intro、footnotes…原样）；name 可能为空（无名表）。 */
  table: Record<string, unknown>
  /** 表所在的章节路径（作者的 path：从外到里的小标题，page 是页码）。 */
  path: Array<{ name?: string; page?: number }>
  /** 表在它的最近章节里的序号（作者的 sectionIndex，从 1 起）。 */
  sectionIndex: number | null
}

/** 作者提取器是按页面 import 的模块（不是全局），按作者模块的同一地址导入，拿到的是同一个类。 */
async function modules(): Promise<{ UtilGenTables: any; RecursiveSearchStateGeneric: any }> {
  const base = new URL('js/generate-tables-data/', location.href).href
  const [utils, models] = await Promise.all([import(/* @vite-ignore */ `${base}generate-tables-data-utils.js`), import(/* @vite-ignore */ `${base}generate-tables-data-models.js`)])
  return { UtilGenTables: utils.UtilGenTables, RecursiveSearchStateGeneric: models.RecursiveSearchStateGeneric }
}

export interface ExtractResult {
  tables: ExtractedTable[]
  /** 作者提取器对这些条目报错（例如条目没有名字或来源，作者整理表格时要用），跳过并记下原因，不丢整类。 */
  skipped: Array<{ name: string; error: string }>
}

/** 一个类别里（作者加载器整类取）所有条目里的所有表格。无编号的条目跳过（无法指回母条目）。 */
export async function extractTables(prop: string): Promise<ExtractResult> {
  await init()
  const { UtilGenTables, RecursiveSearchStateGeneric } = await modules()
  const items: any[] = (await A.DataLoader.pCacheAndGetAllSite(prop)) ?? []
  const out: ExtractedTable[] = []
  const skipped: ExtractResult['skipped'] = []
  for (const ent of items) {
    const parentHash = hashOf(prop, ent)
    if (!parentHash) continue
    try {
      const state = new RecursiveSearchStateGeneric({ isRequireIncludes: false })
      // 作者整理表格时按母条目的类别要不同的字段（职业背景描述要职业名，子职业要职业名与简称）：条目自己有就用，没有用条目名
      const tmpMeta = {
        metaType: prop, name: ent.name, source: ent.source,
        className: ent.className ?? ent.name, classSource: ent.classSource ?? ent.source,
        subclassName: ent.name, subclassShortName: ent.shortName, subclassSource: ent.source ?? ent.classSource,
      }
      for (const [key, value] of Object.entries(ent)) {
        if (!Array.isArray(value) || key.startsWith('_')) continue
        try {
          for (const entry of value) UtilGenTables._doSearch({ state, tmpMeta, section: ent.name, entry })
        } catch (e) {
          // 这个字段不是正文（例如职业的特性清单是引用串、不是条目），跳过这个字段，别的字段照扫
          skipped.push({ name: `${ent.name ?? parentHash}.${key}`, error: e instanceof Error ? e.message : String(e) })
        }
      }
      if (!state._tables.length) continue
      // 作者整理表格时会删掉 path / section（getStacks 里），所以先读原始的再整理；两边按顺序一一对应
      const raw: any[] = state._tables
      const cleaned: any[] = state.getStacks().table
      cleaned.forEach((table, i) => out.push({
        parentHash, parentName: String(ent.name ?? ''), parentSource: sourceOf(ent), table,
        path: raw[i]?.path ?? [], sectionIndex: raw[i]?.sectionIndex ?? null,
      }))
    } catch (e) {
      skipped.push({ name: String(ent.name ?? parentHash), error: e instanceof Error ? e.message : String(e) })
    }
  }
  return { tables: out, skipped }
}
