import type { ConvertedPack } from '../convert'
import { applyFixes, type FixReport, type Rule, type RowSet } from './engine'
import { ROWS as S1_ARTIFICER_LIST } from './rows/s1-artificer-list'
import { ROWS as S2_STARTING_EQUIPMENT } from './rows/s2-starting-equipment'
import { ROWS as S2_SCROLL_LABELS } from './rows/s2-scroll-labels'
import { RULE as S2_POOL_SPELLING } from './rules/s2-pool-spelling'
import { RULE as S2_WARLOCK_SLOT_LEVEL } from './rules/s2-warlock-slot-level'
import { RULE as S2_TABLE_LEVEL_LABELS } from './rules/s2-table-level-labels'
import { RULE as S2_SPELL_LINKS } from './rules/s2-spell-links'

/**
 * 修正规则与逐条修正表的注册处：每新增一个文件，在这里加**一行**。
 * 规则按这里的顺序执行，然后执行逐条表（顺序同这里）。
 */
export const RULES: Rule[] = [S2_POOL_SPELLING, S2_WARLOCK_SLOT_LEVEL, S2_TABLE_LEVEL_LABELS, S2_SPELL_LINKS]
export const ROW_SETS: RowSet[] = [
  { file: 'rows/s1-artificer-list.ts', rows: S1_ARTIFICER_LIST },
  { file: 'rows/s2-starting-equipment.ts', rows: S2_STARTING_EQUIPMENT },
  { file: 'rows/s2-scroll-labels.ts', rows: S2_SCROLL_LABELS },
]

export function runFixes(packs: ConvertedPack[]): FixReport {
  return applyFixes(packs, RULES, ROW_SETS)
}
