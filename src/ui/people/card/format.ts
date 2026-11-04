import type { Part } from '../../../rules/dnd5e2014/derive'

export const signed = (value: number | null | undefined): string => (value === null || value === undefined ? '' : value >= 0 ? `+${value}` : `${value}`)

/** 悬停气泡用：逐项「名称 值」，最后合计；有覆盖写「已被覆盖」（U5R §1.2）。最多 8 行。 */
export function partLines(parts: Part[], total: number | null, unit = '', plain = false): string[] {
  if (parts.length === 0) return []
  const fmt = (n: number, first: boolean): string => `${plain || first ? n : signed(n)}${unit}`
  const lines = parts.slice(0, 6).map((p, i) => (p.overridden ? `${p.label} ${fmt(p.amount, i === 0)}（已被覆盖）` : `${p.label} ${p.kind === 'override' ? p.amount : fmt(p.amount, i === 0)}${p.kind === 'override' ? unit : ''}`))
  if (parts.length > 6) lines.push(`…另有 ${parts.length - 6} 项`)
  if (total !== null && parts.length > 1) lines.push(`合计 ${plain ? total : signed(total)}${unit}`)
  return lines.slice(0, 8)
}
