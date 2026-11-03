import { ALIGNMENT, CREATURE, SIZE } from '../library/zh'
import { crValue } from './list'
import { formatCr } from './rows'
import type { TemplateRow } from './templates'

/** 模板弹窗里各处用到的显示文字：都从怪物属性块读，读不到就是空字符串（界面不显示空信息）。 */
export function sizeCreature(row: TemplateRow): string {
  const block = row.block
  if (!block) return ''
  const size = (block.size ?? []).map((s) => SIZE[s] ?? s).join('/')
  return `${size}${CREATURE[block.creatureType.type] ?? block.creatureType.type}`
}

export function alignmentText(row: TemplateRow): string {
  const value = row.block?.alignment
  return value ? value.split(' ').map((c) => ALIGNMENT[c] ?? c).join('') : ''
}

export function crText(row: TemplateRow): string {
  const cr = crValue(row.block?.cr)
  return cr === undefined ? '' : `挑战 ${formatCr(cr)}`
}

export function acText(row: TemplateRow): string | undefined {
  const ac = row.block?.ac?.[0]
  return ac ? String(ac.value) : undefined
}

export function hpText(row: TemplateRow): string | undefined {
  const hp = row.block?.hp
  if (!hp || !(hp.average > 0)) return undefined
  return hp.formula ? `${hp.average}（${hp.formula}）` : String(hp.average)
}

export function speedText(row: TemplateRow): string | undefined {
  const walk = row.block?.speed?.walk
  return typeof walk === 'number' ? String(walk) : undefined
}

export const isNpc = (row: TemplateRow): boolean => row.entry.type === 'npc'
