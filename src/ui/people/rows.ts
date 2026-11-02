import { PEOPLE_CATEGORY_LABELS, type Person } from '../../schemas/people'
import { crValue } from './list'

export interface RowSummary {
  line2: string
  hp: { current: number | null; max: number | null; temp: number }
  ac?: number
  effects: string[]
}

export interface RowLabels {
  classes?: Record<string, string>
  races?: Record<string, string>
}

function formatCr(value: number): string {
  if (value === 0.125) return '1/8'
  if (value === 0.25) return '1/4'
  if (value === 0.5) return '1/2'
  return String(value)
}

/** 第二行、生命、AC、效果；分类名由页面决定是否附加。 */
export function rowSummary(person: Person, labels: RowLabels = {}, includeCategory = false): RowSummary {
  const block = person.block
  const parts: string[] = []
  const classes = block.classes ?? []
  if (classes.length) {
    parts.push(classes.map((c) => `${labels.classes?.[c.class] ?? c.class} ${c.level}`).join(' ・ '))
    if (block.race) parts.push(labels.races?.[block.race] ?? block.race)
  } else {
    if (block.creatureType?.type) parts.push(block.creatureType.type)
    const cr = crValue(block.cr)
    if (cr !== undefined) parts.push(`挑战 ${formatCr(cr)}`)
  }
  if (includeCategory) parts.push(PEOPLE_CATEGORY_LABELS[person.categoryId])
  const max = typeof block.hp?.average === 'number' && block.hp.average > 0 ? block.hp.average : null
  return {
    line2: parts.filter(Boolean).join(' ・ '),
    hp: { current: person.hp.current ?? max, max, temp: person.hp.temp },
    ...(block.ac?.[0]?.value !== undefined ? { ac: block.ac[0].value } : {}),
    effects: person.effects.map((e) => e.name),
  }
}
