import type { Raw } from '../extract/load'

export interface TableSeedRow {
  min: number
  max: number
  cells: string[]
  refs: string[]
  then?: { table: string; times?: number }
  qty?: string
}

export interface TableSeed {
  source: string
  book: string
  page: number
  name: string
  nameEn?: string
  caption?: string
  dice: string
  cols: string[]
  rows: TableSeedRow[]
  group?: { id: string; name: string }
  parentKey?: string
  srd?: boolean
}

export interface TableContext {
  source: string
  page: number
  parentName: string
  parentNameEn?: string
  parentKey: string
}

export function parseDice(label: string): { dice: string; faces: number } | undefined {
  const match = /^(\d{0,2})d(\d{1,3})$/i.exec(label.trim().replace(/\s+/g, ''))
  if (!match) return undefined
  const count = match[1] ? Number(match[1]) : 1
  const faces = Number(match[2])
  if (!count || !faces) return undefined
  return { dice: `${count === 1 ? '' : count}d${faces}`, faces: faces * count }
}

function rangeOf(cell: string, faces: number): { min: number; max: number } | undefined {
  const text = cell.trim().replace(/[–—]/g, '-')
  const single = /^(\d{1,3})$/.exec(text)
  if (single) {
    let n = Number(single[1])
    if (n === 0) n = faces
    return { min: n, max: n }
  }
  const range = /^(\d{1,3})\s*-\s*(\d{1,3})$/.exec(text)
  if (!range) return undefined
  let min = Number(range[1])
  let max = Number(range[2])
  if (min === 0) min = faces
  if (max === 0) max = faces
  return { min, max }
}

function assertCoverage(seed: TableSeed): void {
  const faces = parseDice(seed.dice)!.faces
  const seen = new Set<number>()
  for (const row of seed.rows) {
    if (row.min < 1 || row.max > faces || row.min > row.max) throw new Error(`随机表「${seed.name}」的范围 ${row.min}-${row.max} 超出 ${seed.dice}`)
    for (let n = row.min; n <= row.max; n++) {
      if (seen.has(n)) throw new Error(`随机表「${seed.name}」的范围重叠：${n}`)
      seen.add(n)
    }
  }
  if (seen.size !== faces) throw new Error(`随机表「${seed.name}」没有恰好覆盖 ${seed.dice} 的全部结果`)
}

function cellsOf(row: unknown): string[] {
  if (Array.isArray(row)) return row.map((cell) => (typeof cell === 'string' ? cell : typeof cell === 'number' ? String(cell) : ''))
  if (row && typeof row === 'object') {
    const obj = row as Raw
    return Object.values(obj).map((v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : ''))
  }
  return []
}

function thenOf(cells: string[]): { table: string } | undefined {
  for (const cell of cells) {
    const match = /\{@table ([^}|]+)/.exec(cell)
    if (match) return { table: match[1] }
  }
  return undefined
}

/** 从 5etools 的 table 块生成随机表；第一列不是骰子范围时返回 undefined。 */
export function tableFromBlock(block: Raw, ctx: TableContext): TableSeed | undefined {
  const labels = Array.isArray(block.colLabels) ? block.colLabels.map((l) => String(l)) : []
  if (!labels.length) return undefined
  const parsed = parseDice(labels[0])
  if (!parsed) return undefined
  const rowsRaw = Array.isArray(block.rows) ? block.rows : []
  const rows: TableSeedRow[] = []
  for (const row of rowsRaw) {
    const cells = cellsOf(row)
    if (!cells.length) continue
    const range = rangeOf(cells[0], parsed.faces)
    if (!range) throw new Error(`随机表「${String(block.caption ?? ctx.parentName)}」的第一列不是骰子范围：${cells[0]}`)
    const resultCells = cells.slice(1)
    rows.push({ ...range, cells: resultCells, refs: [], then: thenOf(resultCells) })
  }
  if (!rows.length) return undefined
  const caption = typeof block.caption === 'string' ? block.caption : undefined
  const seed: TableSeed = {
    source: ctx.source,
    book: ctx.source,
    page: ctx.page,
    name: caption ? `${ctx.parentName}·${caption}` : `${ctx.parentName}·${labels[1] ?? '随机表'}`,
    nameEn: `${ctx.parentNameEn ?? ctx.parentName} ${caption ?? labels[1] ?? 'table'}`,
    caption,
    dice: parsed.dice,
    cols: labels.slice(1).map((l) => l || '结果'),
    rows,
    parentKey: ctx.parentKey,
    srd: block.srd === true,
  }
  assertCoverage(seed)
  return seed
}

export function lootTable(raw: Raw, category: string): TableSeed | undefined {
  const rowsRaw = Array.isArray(raw.table) ? raw.table : []
  if (!rowsRaw.length) return undefined
  const max = Math.max(...rowsRaw.map((r) => Number((r as Raw).max ?? 0)))
  if (!Number.isFinite(max) || max <= 0) return undefined
  const dice = `d${max}`
  const rows: TableSeedRow[] = []
  for (const item of rowsRaw) {
    const row = item as Raw
    const min = Number(row.min)
    const rangeMax = Number(row.max)
    if (!Number.isFinite(min) || !Number.isFinite(rangeMax)) continue
    const cells: string[] = []
    if (row.coins && typeof row.coins === 'object') {
      cells.push(Object.entries(row.coins as Raw).map(([coin, formula]) => `${String(formula)} ${coin}`).join(' + '))
    }
    if (typeof row.item === 'string') cells.push(row.item)
    for (const [key, value] of Object.entries(row)) {
      if (['min', 'max', 'coins', 'item'].includes(key)) continue
      if (typeof value === 'string') cells.push(value)
    }
    rows.push({ min, max: rangeMax, cells: cells.length ? cells : ['—'], refs: [], then: thenOf(cells) })
  }
  if (!rows.length) return undefined
  const seed: TableSeed = {
    source: String(raw.source),
    book: String(raw.source),
    page: Number(raw.page ?? 0),
    name: String(raw.name ?? raw.ENG_name ?? '随机表'),
    nameEn: typeof raw.ENG_name === 'string' ? raw.ENG_name : undefined,
    dice,
    cols: ['结果'],
    rows,
    group: { id: `loot-${category}`, name: `宝藏表·${category}` },
  }
  assertCoverage(seed)
  return seed
}

export function collectEmbeddedTables(value: unknown, ctx: TableContext, out: TableSeed[], depth = 0): void {
  if (depth > 30) return
  if (Array.isArray(value)) {
    value.forEach((item) => collectEmbeddedTables(item, ctx, out, depth + 1))
    return
  }
  if (!value || typeof value !== 'object') return
  const obj = value as Raw
  if (obj.type === 'table') {
    const seed = tableFromBlock(obj, ctx)
    if (seed) out.push(seed)
  }
  for (const [key, child] of Object.entries(obj)) {
    if (key === 'rows' || key === 'colLabels') continue
    collectEmbeddedTables(child, ctx, out, depth + 1)
  }
}

export function collectTables(data: { tables: Raw[]; loot: Raw[] }, entries: Array<{ raw: Raw; source: string; page: number; name: string; nameEn?: string }>): TableSeed[] {
  const seeds: TableSeed[] = []
  for (const raw of data.tables) {
    const seed = tableFromBlock(raw, { source: String(raw.source), page: Number(raw.page ?? 0), parentName: String(raw.name ?? '随机表'), parentNameEn: typeof raw.ENG_name === 'string' ? raw.ENG_name : undefined, parentKey: `table:${String(raw.source)}|${String(raw.name)}` })
    if (seed) seeds.push({ ...seed, srd: raw.srd === true })
  }
  for (const [category, list] of Object.entries(groupLoot(data.loot))) {
    for (const raw of list) {
      const seed = lootTable(raw, category)
      if (seed) seeds.push({ ...seed, srd: raw.srd === true })
    }
  }
  for (const entry of entries) {
    const ctx = { source: entry.source, page: entry.page, parentName: entry.name, parentNameEn: entry.nameEn, parentKey: `${entry.source}|${entry.name}` }
    collectEmbeddedTables(entry.raw.entries, ctx, seeds)
    for (const seed of seeds) if (!seed.srd && seed.parentKey === ctx.parentKey) seed.srd = entry.raw.srd === true
  }
  return seeds
}

function groupLoot(loot: Raw[]): Record<string, Raw[]> {
  const out: Record<string, Raw[]> = {}
  for (const raw of loot) {
    const key = String(raw._lootCategory ?? 'loot')
    ;(out[key] ??= []).push(raw)
  }
  return out
}
