import type { ConvertedPack } from '../convert'
import { applyFixes, type FixReport, type Rule, type RowSet } from './engine'
import { ROWS as S1_ARTIFICER_LIST } from './rows/s1-artificer-list'
import { ROWS as S2_STARTING_EQUIPMENT } from './rows/s2-starting-equipment'
import { ROWS as S2_SCROLL_LABELS } from './rows/s2-scroll-labels'
import { ROWS as S2_LANG_OTHER } from './rows/s2-lang-other'
import { ROWS as S3A_EQUIP } from './rows/s3a-equip'
import { ROWS as S3A_TOOL_CHOOSE } from './rows/s3a-tool-choose'
import { ROWS as S3A_ARTIFICER_FIREARMS } from './rows/s3a-artificer-firearms'
import { ROWS as S3A_SUBCLASS_CASTING } from './rows/s3a-subclass-casting'
import { RULE as S2_POOL_SPELLING } from './rules/s2-pool-spelling'
import { RULE as S2_WARLOCK_SLOT_LEVEL } from './rules/s2-warlock-slot-level'
import { RULE as S2_TABLE_LEVEL_LABELS } from './rules/s2-table-level-labels'
import { RULE as S2_SPELL_LINKS } from './rules/s2-spell-links'
import { RULE as S2_CULT_LINKS } from './rules/s2-cult-links'

/**
 * 修正规则与逐条修正表的注册处：每新增一个文件，在这里加**一行**。
 * 规则按这里的顺序执行，然后执行逐条表（顺序同这里）。
 */
export const RULES: Rule[] = [S2_POOL_SPELLING, S2_WARLOCK_SLOT_LEVEL, S2_TABLE_LEVEL_LABELS, S2_SPELL_LINKS, S2_CULT_LINKS]
export const ROW_SETS: RowSet[] = [
  { file: 'rows/s1-artificer-list.ts', rows: S1_ARTIFICER_LIST },
  { file: 'rows/s2-starting-equipment.ts', rows: S2_STARTING_EQUIPMENT },
  { file: 'rows/s2-scroll-labels.ts', rows: S2_SCROLL_LABELS },
  { file: 'rows/s2-lang-other.ts', rows: S2_LANG_OTHER },
  { file: 'rows/s3a-equip.ts', rows: S3A_EQUIP },
  { file: 'rows/s3a-tool-choose.ts', rows: S3A_TOOL_CHOOSE },
  { file: 'rows/s3a-artificer-firearms.ts', rows: S3A_ARTIFICER_FIREARMS },
  { file: 'rows/s3a-subclass-casting.ts', rows: S3A_SUBCLASS_CASTING },
]

export function runFixes(packs: ConvertedPack[]): FixReport {
  return applyFixes(packs, RULES, ROW_SETS)
}
