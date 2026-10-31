import type { Raw } from '../extract/load'

export function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function str(value: unknown): string {
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
}

export function normRaw(input: string): string {
  let out = input
  for (let i = 0; i < 8 && out.includes('{@'); i++) out = out.replace(/\{@\w+ ([^{}]*)\}/g, (_m, inner: string) => inner.split('|')[0])
  return out.replace(/[^0-9A-Za-z一-鿿]/g, '').toLowerCase()
}

export interface ParsedLabel { expr: string; modifierPrompt?: string; deck: boolean; lo: number; hi: number }

export function parseLabel(label: unknown): ParsedLabel | undefined {
  if (typeof label !== 'string') return undefined
  let s = label.trim()
  let deck = false
  const tag = /^\{@dice ([^}]*)\}$/.exec(s)
  if (tag) { const parts = tag[1].split('|'); s = parts[0]; if (parts[1] && /牌/.test(parts[1])) deck = true }
  let modifierPrompt: string | undefined
  const pm = /#\$prompt_number:title=([^$]*)\$#/.exec(s)
  if (pm) { modifierPrompt = pm[1]; s = s.replace(/#\$prompt_number:title=[^$]*\$#/, '') }
  s = s.replace(/\s+/g, '').toLowerCase().replace(/\+$/, '')
  if (!/^\d*d\d+(\+\d*d\d+)*$/.test(s)) return undefined
  let lo = 0, hi = 0
  for (const term of s.split('+')) { const m = /^(\d*)d(\d+)$/.exec(term)!; const c = m[1] ? Number(m[1]) : 1; lo += c; hi += c * Number(m[2]) }
  const expr = s.split('+').map((t) => (t.startsWith('d') ? '1' + t : t)).join('+')
  return { expr, modifierPrompt, deck, lo, hi }
}

export function storageDice(expr: string): string {
  return expr.split('+').map((term) => term.startsWith('1d') ? term.slice(1) : term).join('+')
}

export function rangeOf(cell: unknown, hi: number): { min: number; max: number } | undefined {
  if (cell && typeof cell === 'object') {
    const c = cell as Raw
    const r = isObj(c.roll) ? c.roll : undefined
    if (r && typeof r.exact === 'number') return { min: r.exact, max: r.exact }
    if (r && typeof r.min === 'number' && typeof r.max === 'number') return { min: r.min === 0 ? hi : r.min, max: r.max === 0 ? hi : r.max }
    return undefined
  }
  if (typeof cell === 'number' && Number.isInteger(cell)) return { min: cell === 0 ? hi : cell, max: cell === 0 ? hi : cell }
  if (typeof cell !== 'string') return undefined
  const t = cell.trim().replace(/[–—−]/g, '-')
  let m = /^(\d{1,3})$/.exec(t)
  if (m) { let n = Number(m[1]); if (n === 0 && hi >= 100) n = hi; return { min: n, max: n } }
  m = /^(\d{1,3})\s*-\s*(\d{1,3})$/.exec(t)
  if (m) { let a = Number(m[1]), b = Number(m[2]); if (a === 0) a = hi; if (b === 0) b = hi; return { min: a, max: b } }
  return undefined
}

export function cellText(cell: unknown): string {
  if (typeof cell === 'string') return cell
  if (typeof cell === 'number') return String(cell)
  if (isObj(cell) && typeof cell.entry === 'string') return cell.entry
  if (isObj(cell) && isObj(cell.roll) && typeof cell.roll.exact === 'number') return String(cell.roll.exact)
  if (isObj(cell) && isObj(cell.roll) && typeof cell.roll.min === 'number' && typeof cell.roll.max === 'number') return `${cell.roll.min}—${cell.roll.max}`
  return ''
}

export function refCell(cell: unknown): string {
  if (typeof cell === 'string') return cell
  if (typeof cell === 'number') return String(cell)
  if (isObj(cell) && typeof cell.entry === 'string') return cell.entry
  if (isObj(cell) && isObj(cell.roll) && typeof cell.roll.exact === 'number') return String(cell.roll.exact)
  if (isObj(cell) && isObj(cell.roll) && typeof cell.roll.min === 'number' && typeof cell.roll.max === 'number') return `${cell.roll.min}—${cell.roll.max}`
  if (isObj(cell) && cell.type === 'entries' && Array.isArray(cell.entries) && cell.entries.every((x) => typeof x === 'string')) return (cell.entries as string[]).join(' ')
  throw new Error(`无法转成文字的单元格 ${JSON.stringify(cell)}`)
}

export function refRows(rows: unknown): Array<{ cells: string[]; indent?: boolean }> {
  if (!Array.isArray(rows)) return []
  return rows.map((row) => {
    if (Array.isArray(row)) return { cells: row.map(refCell) }
    const rec = isObj(row) ? row : {}
    return { cells: Array.isArray(rec.row) ? rec.row.map(refCell) : [], ...(rec.style === 'row-indent-first' ? { indent: true } : {}) }
  })
}

export function zero(n: number, dice: string): number {
  return n === 0 ? parseLabel(dice)!.hi : n
}

export function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entry'
}
