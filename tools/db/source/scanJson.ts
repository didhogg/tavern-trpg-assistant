import type { CategoryCount, JsonScan, Lang, MetaSource, RecordRow, RecordShape } from './types'

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string | null => (typeof v === 'string' && v.length ? v : null)

function metaSourcesOf(top: Record<string, unknown>): MetaSource[] {
  const meta = isObj(top._meta) ? top._meta : null
  const list = meta && Array.isArray(meta.sources) ? meta.sources : []
  const out: MetaSource[] = []
  for (const item of list) {
    if (!isObj(item) || !str(item.json)) continue
    out.push({
      id: str(item.json)!,
      ...(str(item.full) ? { full: str(item.full)! } : {}),
      ...(str(item.abbreviation) ? { abbreviation: str(item.abbreviation)! } : {}),
      ...(Array.isArray(item.authors) ? { authors: item.authors.map(String) } : {}),
      ...(Array.isArray(item.convertedBy) ? { convertedBy: item.convertedBy.map(String) } : {}),
      ...(str(item.url) ? { url: str(item.url)! } : {}),
      ...(str(item.version) ? { version: str(item.version)! } : {}),
      ...(str(item.dateReleased) ? { dateReleased: str(item.dateReleased)! } : {}),
      ...(str(item.license) ? { license: str(item.license)! } : {}),
    })
  }
  return out
}

function editionOf(top: Record<string, unknown>): string | null {
  const meta = isObj(top._meta) ? top._meta : null
  return str(meta?.edition)
}

/**
 * 读一个 5etools JSON 文件的顶层形状：
 * 数组元素算记录，`_`/`$` 开头的键算元数据（`_meta`、`_test`、`$schema`）；
 * 记录自带 source 就用自己的，没有且文件只声明一个来源时用那个来源；多个来源时不猜。
 */
export function scanJson(top: unknown, lang: Lang): JsonScan {
  const root = isObj(top) ? top : { '(root)': top }
  const topKeys = Object.keys(root)
  const fileEdition = editionOf(root)
  const metaSources = metaSourcesOf(root)
  const records: RecordRow[] = []
  const categories: Record<string, CategoryCount> = {}
  const sourceIds = new Set<string>(metaSources.map((s) => s.id))
  const fallbackSource = metaSources.length === 1 ? metaSources[0]!.id : null
  let contentRecords = 0
  let metaRecords = 0
  let missingSourceRecords = 0
  let missingNameRecords = 0

  const touchCategory = (category: string, meta: boolean): CategoryCount => {
    const c = categories[category] ?? (categories[category] = { records: 0, content: 0, meta: 0, sources: [] })
    c.records += 1
    if (meta) c.meta += 1
    else c.content += 1
    return c
  }
  const add = (category: string, index: number, value: unknown, meta: boolean): void => {
    const c = touchCategory(category, meta)
    if (meta) { metaRecords += 1; return }
    contentRecords += 1
    const o = isObj(value) ? value : null
    const explicit = str(o?.source)
    const source = explicit ?? fallbackSource
    const name = str(o?.name)
    const nameEn = str(o?.ENG_name) ?? (lang === 'en' ? name : null)
    const edition = str(o?.edition) ?? fileEdition ?? 'unknown'
    const shape: RecordShape = isObj(o?._copy) || Array.isArray(o?._versions) ? 'copy' : Array.isArray(o?.data) && typeof o?.id === 'string' ? 'container' : category === 'data' ? 'section' : name ? 'named' : str(o?.abbreviation) ? 'abbreviation' : 'unnamed'
    if (!source && shape === 'named') missingSourceRecords += 1
    if (source && shape === 'unnamed') missingNameRecords += 1
    if (source) { sourceIds.add(source); if (!c.sources.includes(source)) c.sources.push(source) }
    records.push({ category, index, name, nameEn, source, edition, shape })
  }

  for (const [key, value] of Object.entries(root)) {
    const meta = key.startsWith('_') || key.startsWith('$')
    if (Array.isArray(value)) value.forEach((item, i) => add(key, i, item, meta))
    else add(key, 0, value, meta)
  }

  return {
    topKeys,
    fileEdition,
    metaSources,
    records,
    contentRecords,
    metaRecords,
    categories,
    sourceIds: [...sourceIds].sort(),
    missingSourceRecords,
    missingNameRecords,
  }
}

export function stableCounts(rows: RecordRow[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) out[r.edition] = (out[r.edition] ?? 0) + 1
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
}
