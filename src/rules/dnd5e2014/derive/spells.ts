import type { DeriveContext, DerivePerson, SpellSlotsResult } from './types'

/** PHB p113 全施法者法术位表；兼职时用它查总施法等级。 */
const FULL_CASTER: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

function casterLevels(ctx: DeriveContext): { full: number; pact: number; hasCaster: boolean } {
  let full = 0
  let pact = 0
  let hasCaster = false
  for (const row of ctx.classes) {
    const sc = row.entry?.spellcasting
    if (!sc) continue
    hasCaster = true
    if (sc.progression === 'pact') { pact += row.level; continue }
    if (sc.progression === 'full') full += row.level
    else if (sc.progression === 'half') {
      const artificer = row.id?.startsWith('class.artificer') ?? false
      full += artificer ? Math.ceil(row.level / 2) : Math.floor(row.level / 2)
    } else if (sc.progression === 'third') full += Math.floor(row.level / 3)
  }
  return { full: Math.min(20, full), pact: Math.min(20, pact), hasCaster }
}

function rowsFrom(numbers: number[], used: Record<string, number>): SpellSlotsResult['rows'] {
  return numbers.map((max, index) => ({ key: String(index + 1), level: index + 1, max, used: used[String(index + 1)] ?? 0 })).filter((row) => row.max > 0)
}

/** U5 §6.9：单职业直接读 slotsByLevel；多职业按书上的兼职施法等级表；契约位单列。 */
export function deriveSpellSlots(person: DerivePerson, ctx: DeriveContext): SpellSlotsResult | null {
  const classes = ctx.classes.filter((row) => row.level > 0)
  if (!classes.length) return null
  if (classes.length === 1) {
    const row = classes[0]
    const entry = row.entry
    const table = entry?.spellcasting?.slotsByLevel?.[Math.min(20, row.level) - 1]
    if (!table) return null
    if ('pact' in table && table.pact) {
      if (table.pact.count <= 0) return null
      return { rows: [{ key: 'pact', level: table.pact.level, max: table.pact.count, used: person.slotsUsed?.pact ?? 0, pact: true }], sources: [`契约位 ${table.pact.count} 个（${table.pact.level} 环）`] }
    }
    const rows = 'slots' in table ? rowsFrom(table.slots, person.slotsUsed ?? {}) : []
    return rows.length ? { rows, sources: [`${row.level} 级法术位表`] } : null
  }
  const levels = casterLevels(ctx)
  if (!levels.hasCaster) return null
  const rows: SpellSlotsResult['rows'] = []
  if (levels.full > 0) rows.push(...rowsFrom(FULL_CASTER[levels.full - 1], person.slotsUsed ?? {}))
  const pactRow = classes.find((row) => row.entry?.spellcasting?.progression === 'pact')
  if (levels.pact > 0) {
    const table = pactRow?.entry?.spellcasting?.slotsByLevel?.[levels.pact - 1]
    if (table && 'pact' in table && table.pact && table.pact.count > 0) {
      rows.push({ key: 'pact', level: table.pact.level, max: table.pact.count, used: person.slotsUsed?.pact ?? 0, pact: true })
    }
  }
  return rows.length ? { rows, sources: [`兼职施法等级 ${levels.full}；契约 ${levels.pact}`] } : null
}
