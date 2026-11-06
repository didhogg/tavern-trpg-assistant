import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Lang, PairCoverage } from './types'

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string | null => (typeof v === 'string' && v.length ? v : null)

export interface CatalogRow {
  source: string
  name: string | null
  nameEn: string | null
  published: string | null
}

/** 从上游自己的 books.json / adventures.json 取来源名和出版日期；没有书单。 */
export function loadCatalog(root: string, lang: Lang): Map<string, CatalogRow> {
  const out = new Map<string, CatalogRow>()
  for (const file of ['books.json', 'adventures.json']) {
    const p = join(root, file)
    if (!existsSync(p)) continue
    const top = JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>
    for (const key of ['book', 'adventure']) {
      const list = top[key]
      if (!Array.isArray(list)) continue
      for (const item of list) {
        if (!isObj(item)) continue
        const source = str(item.source) ?? str(item.id)
        if (!source) continue
        const name = str(item.name)
        const nameEn = str(item.ENG_name) ?? (lang === 'en' ? name : null)
        const published = str(item.published)
        const old = out.get(source)
        out.set(source, { source, name: name ?? old?.name ?? null, nameEn: nameEn ?? old?.nameEn ?? null, published: published ?? old?.published ?? null })
      }
    }
  }
  return out
}

/** 上游规则：2024-09-17 及以后出版的书进 2024；日期缺失不猜。 */
export const EDITION_CUTOFF = '2024-09-17'
export function editionFromDate(published: string | null): '2014' | '2024' | 'unknown' {
  if (!published) return 'unknown'
  return published >= EDITION_CUTOFF ? '2024' : '2014'
}

/** 自制文件自带的 edition：classic→2014，one→2024；其它值不猜。 */
export function editionFromHomebrew(value: string | null | undefined): '2014' | '2024' | 'unknown' {
  if (value === 'classic') return '2014'
  if (value === 'one') return '2024'
  return 'unknown'
}

export function pairCoverage(primary: string, primaryIds: Set<string>, secondary: string, secondaryIds: Set<string>): PairCoverage {
  const onlyPrimary: string[] = []
  const onlySecondary: string[] = []
  let paired = 0
  for (const id of [...primaryIds].sort()) {
    if (secondaryIds.has(id)) paired += 1
    else onlyPrimary.push(id)
  }
  for (const id of [...secondaryIds].sort()) if (!primaryIds.has(id)) onlySecondary.push(id)
  return { primary, secondary, primaryIds: primaryIds.size, secondaryIds: secondaryIds.size, paired, onlyPrimary, onlySecondary }
}
