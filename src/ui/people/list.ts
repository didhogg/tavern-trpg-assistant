import type { Person, PeopleCategoryId } from '../../schemas/people'

export type CategoryFilter = PeopleCategoryId | 'all'
export type SortKey = 'touched' | 'created' | 'name' | 'level'
export type SortDir = 'asc' | 'desc'

export interface FilterOptions {
  categoryId?: CategoryFilter
  search?: string
  tagIds?: string[]
  /** 标签 id → 名称，用于搜索标签名。 */
  tagNames?: Record<string, string>
  classNames?: Record<string, string>
  raceNames?: Record<string, string>
}

export function filterPeople(people: Person[], options: FilterOptions): Person[] {
  const category = options.categoryId ?? 'all'
  const q = (options.search ?? '').trim().toLowerCase()
  const wanted = options.tagIds ?? []
  return people.filter((person) => {
    if (person.trashedAt !== undefined) return false
    if (category !== 'all' && person.categoryId !== category) return false
    if (wanted.some((id) => !person.tags.includes(id))) return false
    if (!q) return true
    const text = [
      person.name,
      person.nameEn ?? '',
      person.block.creatureType?.type ?? '',
      person.block.race ? (options.raceNames?.[person.block.race] ?? person.block.race) : '',
      ...(person.block.classes ?? []).flatMap((c) => [c.class, c.subclass ?? '', options.classNames?.[c.class] ?? '', c.subclass ? (options.classNames?.[c.subclass] ?? '') : '']),
      ...person.tags.map((id) => options.tagNames?.[id] ?? ''),
    ].join(' ').toLowerCase()
    return text.includes(q)
  })
}

export function crValue(cr: unknown): number | undefined {
  if (typeof cr === 'number') return cr
  if (cr && typeof cr === 'object' && 'value' in cr && typeof (cr as { value?: unknown }).value === 'number') return (cr as { value: number }).value
  return undefined
}

/** 总等级；没有职业时用挑战等级（分数按小数）；都没有返回 undefined。 */
export function levelOf(person: Person): number | undefined {
  const classes = person.block.classes ?? []
  if (classes.length) return classes.reduce((sum, c) => sum + c.level, 0)
  return crValue(person.block.cr)
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, 'zh')
}

/** 置顶永远在前；没有等级的排在最后。 */
export function sortPeople(people: Person[], options: { key: SortKey; dir: SortDir }): Person[] {
  const direction = options.dir === 'asc' ? 1 : -1
  const primary = (p: Person): number | string | undefined => {
    if (options.key === 'touched') return p.touchedAt
    if (options.key === 'created') return p.createdAt
    if (options.key === 'name') return p.name
    return levelOf(p)
  }
  return [...people].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    const av = primary(a)
    const bv = primary(b)
    if (av === undefined || bv === undefined) {
      if (av === undefined && bv === undefined) return compareText(a.name, b.name)
      return av === undefined ? 1 : -1
    }
    let result = typeof av === 'string' && typeof bv === 'string' ? compareText(av, bv) : Number(av) - Number(bv)
    if (result === 0) result = compareText(a.name, b.name) || (a.serial ?? 1) - (b.serial ?? 1)
    return result * direction
  })
}
