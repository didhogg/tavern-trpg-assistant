// 列表排序（P5 B-18）：哪些列能排序、按某一列排出来的名次，都由作者的 ModalFilter<类别>（小窗 sortColumns / sortRanks）给出；
// 这里只做缓存和"把界面已有的行按名次排好"。作者没有排序定义的类别：列表是空的，就是没有排序列（不手抄、不自己定规则）。
import type { LibraryService } from './service'
import type { ListCells, SortColumn } from './runtime/frame/sort-commands'

export type { ListCells, ListColumn, SortColumn } from './runtime/frame/sort-commands'
export type SortDir = 'asc' | 'desc'

/** 按名次排序：名次表里没有的排在最后（保持原来的先后）。不改传入的数组。 */
export function sortByRank<T>(rows: T[], hashOf: (row: T) => string | null | undefined, ranks: Record<string, number> | null): T[] {
  if (!ranks) return [...rows]
  const last = Number.MAX_SAFE_INTEGER
  return rows
    .map((row, i) => ({ row, i, r: ranks[hashOf(row) ?? ''] ?? last }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.row)
}

export class Sorting {
  private readonly columnCache = new Map<string, Promise<SortColumn[]>>()
  private readonly rankCache = new Map<string, Promise<Record<string, number> | null>>()
  private readonly cellCache = new Map<string, Promise<ListCells | null>>()

  private seen = 0

  constructor(private readonly lib: Pick<LibraryService, 'frameOf' | 'generation'>) {}

  /** 装、删、改自制后小窗重开了（service.generation 变）：名次要重算（自制条目也在排序里）。 */
  private fresh(): void {
    if (this.seen === this.lib.generation) return
    this.seen = this.lib.generation
    this.rankCache.clear()
    this.columnCache.clear()
    this.cellCache.clear()
  }

  /** 这个类别有哪些能排序的列（作者页面的列标题）；没有 = 空数组。 */
  columns(codeSet: string, prop: string): Promise<SortColumn[]> {
    this.fresh()
    const key = `${codeSet}|${prop}`
    let p = this.columnCache.get(key)
    if (!p) {
      p = this.lib.frameOf(codeSet).then((f) => f.call('sortColumns', prop))
      p.catch(() => this.columnCache.delete(key))
      this.columnCache.set(key, p)
    }
    return p
  }

  /** 每条在作者列表页上各列显示什么（环阶、时间、学派…）：作者列表行里每个单元格的文字，不另算（P5 B-35）；没有 ModalFilter 的类别 = null。 */
  cells(codeSet: string, prop: string): Promise<ListCells | null> {
    this.fresh()
    const key = `${codeSet}|${prop}`
    let p = this.cellCache.get(key)
    if (!p) {
      p = this.lib.frameOf(codeSet).then((f) => f.call('listCells', prop))
      p.catch(() => this.cellCache.delete(key))
      this.cellCache.set(key, p)
    }
    return p
  }

  /** 按某一列排序后每条的名次（作者编号 → 名次）；这一列作者没有定义返回 null。 */
  ranks(codeSet: string, prop: string, sortBy: string, dir: SortDir = 'asc'): Promise<Record<string, number> | null> {
    this.fresh()
    const key = `${codeSet}|${prop}|${sortBy}|${dir}`
    let p = this.rankCache.get(key)
    if (!p) {
      p = this.lib.frameOf(codeSet).then((f) => f.call('sortRanks', prop, sortBy, dir))
      p.catch(() => this.rankCache.delete(key))
      this.rankCache.set(key, p)
    }
    return p
  }

  /** 把一类的行按某一列排好（行要带作者编号）。 */
  async sort<T>(codeSet: string, prop: string, rows: T[], hashOf: (row: T) => string | null | undefined, sortBy: string, dir: SortDir = 'asc'): Promise<T[]> {
    const ranks = await this.ranks(codeSet, prop, sortBy, dir)
    return sortByRank(rows, hashOf, ranks)
  }
}
