// 书目行的作者字段与按分组排列（BE-7）。纯函数：只把作者书目条目的字段原样摆进行里，分组顺序用作者的分组表。
import type { DirectoryRecord } from './directory'
import type { CatalogRow } from './scoped'
import { getSource } from './sources'

/** 一本书 / 一个冒险在作者书目里的字段（缺的为 null；cover 是作者的原对象，只是链接信息，不下载图片）。 */
export interface ShelfInfo {
  id: string
  group: string
  groupName: string
  published: string | null
  revised: string | null
  parentSource: string | null
  author: string | null
  /** 冒险：等级范围；书为 null。 */
  level: { start: number; end: number } | null
  storyline: string | null
  cover: unknown
}

type Entry = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any -- 作者条目没有类型

export function shelfInfoOf(rec: DirectoryRecord, it: Entry): ShelfInfo {
  const group = String(it.group ?? 'other')
  return {
    id: String(it.id),
    group,
    groupName: rec.groups.find((g) => g.group === group)?.displayName ?? group,
    published: it.published ?? null,
    revised: it.revised ?? null,
    parentSource: it.parentSource ?? null,
    author: it.author ?? null,
    level: it.level ?? null,
    storyline: it.storyline ?? null,
    cover: it.cover ?? null,
  }
}

/** 数据集没装时：每本书、每个冒险各一行（条数未知记 0，downloaded 为 false）。 */
export function directoryRows(set: string, rec: DirectoryRecord): Array<Omit<CatalogRow, 'name' | 'abv' | 'edition' | 'membership' | 'view' | 'alternatives'>> {
  return [
    ...rec.books.map((b: Entry) => ({ kind: 'book' as const, set, source: String(b.source), id: null, count: 0, downloaded: false, shelf: shelfInfoOf(rec, b) })),
    ...rec.adventures.map((a: Entry) => ({ kind: 'adventure' as const, set, source: String(a.source), id: String(a.id), count: 0, downloaded: false, shelf: shelfInfoOf(rec, a) })),
  ]
}

/** 数据集已装时：给已有的行补上作者书目字段（书按来源对，冒险按编号对）。 */
export function attachShelf(row: { kind: 'book' | 'adventure'; source: string; id: string | null }, rec: DirectoryRecord): ShelfInfo | null {
  const found = row.kind === 'adventure'
    ? rec.adventures.find((a: Entry) => String(a.id) === row.id)
    : rec.books.find((b: Entry) => String(b.source) === row.source)
  return found ? shelfInfoOf(rec, found) : null
}

export interface ShelfGroup {
  group: string
  name: string
  books: CatalogRow[]
  adventures: CatalogRow[]
}

const byPublished = (a: CatalogRow, b: CatalogRow): number =>
  (a.shelf?.published ?? '9999').localeCompare(b.shelf?.published ?? '9999') || a.name.localeCompare(b.name)

/** 没有作者书目字段的行：自制包的来源归作者的“homebrew”组，其余归“other”。 */
const fallbackGroup = (r: CatalogRow): string => (getSource(r.set).kind === 'brew' ? 'homebrew' : 'other')

/** 按作者分组表的顺序排；每组内按出版日期、书名。空组不出。 */
export function groupShelf(rows: CatalogRow[], groups: DirectoryRecord['groups']): ShelfGroup[] {
  const out: ShelfGroup[] = []
  const known = new Set(groups.map((g) => g.group))
  for (const g of groups) {
    const mine = rows.filter((r) => (r.shelf && known.has(r.shelf.group) ? r.shelf.group : fallbackGroup(r)) === g.group)
    if (!mine.length) continue
    out.push({ group: g.group, name: g.displayName, books: mine.filter((r) => r.kind === 'book').sort(byPublished), adventures: mine.filter((r) => r.kind === 'adventure').sort(byPublished) })
  }
  return out
}
