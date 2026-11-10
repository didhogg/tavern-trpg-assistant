// 小窗里：列表排序（P5 B-18）。排序的列、每条的排序值、排序函数都是作者自己写的——
// 作者的 filter-<页面>.js 里有 ModalFilter<类别>：_getColumnHeaders（哪些列、哪些能排序）、_getListItem（每条的排序值）、
// 构造时交给基类的 fnSort（比较函数）；排序的外壳用作者的 List.getSortedItems（含名称列的拼音排序、倒序）。
// 这里只按需把那个脚本加载进小窗，原样转调；作者没有 ModalFilter 的类别就是没有排序（不手抄列、不自己定排序规则）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init } from './author'

export interface SortColumn {
  /** 作者的排序键（data-sort），传给 sortRanks。 */
  sort: string
  /** 列标题（作者的用语言）。 */
  text: string
  title: string | null
}

/** 作者列表页的脚本顺序：共用的 filter-common.js（FilterCommon 等），再是这一页自己的 filter-<页面>.js。 */
const scriptsOf = (page: string): string[] => ['js/filter-common.js', `js/filter-${page}.js`]

const tried = new Set<string>()

async function loadScript(src: string): Promise<void> {
  if (tried.has(src)) return
  tried.add(src)
  await new Promise<void>((resolve) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => resolve() // 没有这个脚本 = 这一页没有对应的 ModalFilter
    document.head.appendChild(s)
  })
}

/** 这个类别对应的作者 ModalFilter 类；没有返回 null。按作者页面名对（spells.html → ModalFilterSpells），不写类别清单。 */
async function modalClassOf(prop: string): Promise<{ Cls: any; page: string } | null> {
  await init()
  const page = String(A.DataLoader.getPropPage(prop) ?? '').replace(/\.html$/, '')
  if (!page) return null
  for (const src of scriptsOf(page)) await loadScript(src)
  const key = Object.keys(A).find((k) => k.startsWith('ModalFilter') && k.toLowerCase() === `modalfilter${page}`)
  return key && typeof A[key] === 'function' ? { Cls: A[key], page } : null
}

/**
 * 作者的 PageFilter 在构造时按"当前页面"取英文编号函数（UrlUtil.getCurrentPage，小窗里是 frame.html，会报没有）；
 * 构造期间让它返回这一页的页面名，构造完还原。
 */
function withPage<T>(page: string, fn: () => T): T {
  const original = A.UrlUtil.getCurrentPage
  A.UrlUtil.getCurrentPage = () => `${page}.html`
  try {
    return fn()
  } finally {
    A.UrlUtil.getCurrentPage = original
  }
}

/** 作者在这个类别的列表上有哪些排序列；没有返回空数组。 */
export async function sortColumns(prop: string): Promise<SortColumn[]> {
  const m = await modalClassOf(prop)
  if (!m) return []
  const headers: any[] = m.Cls.prototype._getColumnHeaders.call({})
  return headers
    .map((el) => ({ sort: el.getAttribute('data-sort'), text: el.textContent ?? '', title: el.getAttribute('title') }))
    .filter((c): c is SortColumn => !!c.sort)
}

/** 作者做法：补排序用的归一化字段 → 用 _getListItem 为每条造列表项（带排序值和作者排好的行元素）。条目 = 作者加载器里这个类别的全部（官方 + 已装自制）。 */
async function authorListItems(m: { Cls: any; page: string }, prop: string): Promise<{ inst: any; entities: any[]; items: any[] }> {
  const raw: any[] = [...((await A.DataLoader.pCacheAndGetAllSite(prop)) ?? []), ...((await A.DataLoader.pCacheAndGetAllBrew(prop)) ?? [])]
  return withPage(m.page, () => {
    const inst = new m.Cls({ namespace: 'trpg-sort' })
    const entities = raw.map((e) => structuredClone(e))
    entities.forEach((e) => inst._pageFilter.mutateAndAddToFilters(e))
    const stub = { _previewButtonHandler: { bindPreviewButton() {} }, _isRadio: false, _getNameStyle: () => '' }
    const items = entities.map((e, i) => m.Cls.prototype._getListItem.call(stub, inst._pageFilter, e, i))
    return { inst, entities, items }
  })
}

/** 按某一列排序后每条的名次：作者编号 → 名次（0 起）。做法同作者列表页：列表项带排序值 → List.getSortedItems 排。 */
export async function sortRanks(prop: string, sortBy: string, sortDir: 'asc' | 'desc'): Promise<Record<string, number> | null> {
  const m = await modalClassOf(prop)
  if (!m) return null
  if (!(await sortColumns(prop)).some((c) => c.sort === sortBy)) return null
  const { inst, entities, items } = await authorListItems(m, prop)
  return withPage(m.page, () => {
    const list = { _filteredItems: items, _sortBy: sortBy, _sortDir: sortDir, _fnSort: inst._fnSort, _wrpList: { previousElementSibling: { querySelector: () => ({}) } }, constructor: A.List }
    const sorted: any[] = A.List.prototype.getSortedItems.call(list, { items: [...items] })
    const at = new Map(items.map((it, i) => [it, i]))
    const out: Record<string, number> = {}
    sorted.forEach((it, rank) => {
      const hash = hashOf(prop, entities[at.get(it) as number])
      if (hash && !(hash in out)) out[hash] = rank
    })
    return out
  })
}

export interface ListColumn {
  /** 作者的排序键；这一列不能排序时为 null。 */
  sort: string | null
  text: string
  title: string | null
}

export interface ListCells {
  /** 作者列表页的全部列（含不能排序的），顺序 = 作者的表头。 */
  columns: ListColumn[]
  /** 作者编号 → 每一列的显示文字（作者列表行里每个单元格的文字，顺序同 columns）。 */
  cells: Record<string, string[]>
}

/**
 * 每条在作者列表页上各列显示什么（P5 B-35）：就是作者 ModalFilter<类别>._getListItem 造出来的行里每个单元格的文字
 * （环阶、时间、学派、范围…），不另算。行的前面有勾选框、预览按钮等非数据单元格，所以按表头个数从行尾对齐。
 * 作者没有 ModalFilter 的类别返回 null（界面只显示名称与来源）。
 */
export async function listCells(prop: string): Promise<ListCells | null> {
  const m = await modalClassOf(prop)
  if (!m) return null
  const headers: any[] = m.Cls.prototype._getColumnHeaders.call({})
  const columns: ListColumn[] = headers.map((el) => ({ sort: el.getAttribute('data-sort'), text: el.textContent ?? '', title: el.getAttribute('title') }))
  const { entities, items } = await authorListItems(m, prop)
  const cells: Record<string, string[]> = {}
  items.forEach((it, i) => {
    const hash = hashOf(prop, entities[i])
    if (!hash || hash in cells) return
    const kids: any[] = [...(it.ele?.firstElementChild?.children ?? [])]
    const texts = kids.map((k) => String(k.textContent ?? '').replace(/\s+/g, ' ').trim())
    cells[hash] = columns.map((_, c) => texts[texts.length - columns.length + c] ?? '')
  })
  return { columns, cells }
}
