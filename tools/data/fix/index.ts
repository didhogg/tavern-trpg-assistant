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
import { ROWS as S3A_ITEMS_ADD_A } from './rows/s3a-items-add-a'
import { ROWS as S3A_ITEMS_ADD_B } from './rows/s3a-items-add-b'
import { ROWS as S3A_PACK_CONTENTS } from './rows/s3a-pack-contents'
import { ROWS as S3A_SHAWM } from './rows/s3a-shawm'
import { ROWS as S3B_SIZE } from './rows/s3b-size'
import { ROWS as S3B_HUMAN_VARIANT } from './rows/s3b-human-variant'
import { ROWS as S3B_INNATE_LEVEL } from './rows/s3b-innate-level'
import { ROWS as S3B_DEEP_GNOME } from './rows/s3b-deep-gnome'
import { ROWS as S3B_FIRBOLG } from './rows/s3b-firbolg'
import { ROWS as S3B_FEAT_REQUIRES } from './rows/s3b-feat-requires'
import { ROWS as S3B_BACKGROUNDS } from './rows/s3b-backgrounds'
import { ROWS as S3B_DIALECTS_VEHICLES } from './rows/s3b-dialects-vehicles'
import { ROWS as S3B_SPELL_DAMAGE } from './rows/s3b-spell-damage'
import { ROWS as S3B_ELDRITCH_BLAST } from './rows/s3b-eldritch-blast'
import { ROWS as S3B_UPCAST_TARGETS } from './rows/s3b-upcast-targets'
import { ROWS as S3B_UPCAST_SUMMON } from './rows/s3b-upcast-summon'
import { ROWS as S3B_UPCAST_DURATION } from './rows/s3b-upcast-duration'
import { ROWS as S3B_UPCAST_OTHER } from './rows/s3b-upcast-other'
import { ROWS as S3B_UPCAST_AREA } from './rows/s3b-upcast-area'
import { ROWS as S3B_UPCAST_HEAL } from './rows/s3b-upcast-heal'
import { ROWS as S3C_HP } from './rows/s3c-hp'
import { ROWS as S3C_PASSIVE } from './rows/s3c-passive'
import { ROWS as S3C_SPELL_LINKS } from './rows/s3c-spell-links'
import { RULE as S2_POOL_SPELLING } from './rules/s2-pool-spelling'
import { RULE as S2_WARLOCK_SLOT_LEVEL } from './rules/s2-warlock-slot-level'
import { RULE as S2_TABLE_LEVEL_LABELS } from './rules/s2-table-level-labels'
import { RULE as S2_SPELL_LINKS } from './rules/s2-spell-links'
import { RULE as S2_CULT_LINKS } from './rules/s2-cult-links'
import { RULE as S3B_RACIAL_USES_DUP } from './rules/s3b-racial-uses-dup'

/**
 * 修正规则与逐条修正表的注册处：每新增一个文件，在这里加**一行**。
 * 规则按这里的顺序执行，然后执行逐条表（顺序同这里）。
 */
export const RULES: Rule[] = [S2_POOL_SPELLING, S2_WARLOCK_SLOT_LEVEL, S2_TABLE_LEVEL_LABELS, S2_SPELL_LINKS, S2_CULT_LINKS, S3B_RACIAL_USES_DUP]
export const ROW_SETS: RowSet[] = [
  { file: 'rows/s1-artificer-list.ts', rows: S1_ARTIFICER_LIST },
  { file: 'rows/s2-starting-equipment.ts', rows: S2_STARTING_EQUIPMENT },
  { file: 'rows/s2-scroll-labels.ts', rows: S2_SCROLL_LABELS },
  { file: 'rows/s2-lang-other.ts', rows: S2_LANG_OTHER },
  { file: 'rows/s3a-equip.ts', rows: S3A_EQUIP },
  { file: 'rows/s3a-tool-choose.ts', rows: S3A_TOOL_CHOOSE },
  { file: 'rows/s3a-artificer-firearms.ts', rows: S3A_ARTIFICER_FIREARMS },
  { file: 'rows/s3a-subclass-casting.ts', rows: S3A_SUBCLASS_CASTING },
  { file: 'rows/s3a-items-add-a.ts', rows: S3A_ITEMS_ADD_A },
  { file: 'rows/s3a-items-add-b.ts', rows: S3A_ITEMS_ADD_B },
  { file: 'rows/s3a-pack-contents.ts', rows: S3A_PACK_CONTENTS },
  { file: 'rows/s3a-shawm.ts', rows: S3A_SHAWM },
  { file: 'rows/s3b-size.ts', rows: S3B_SIZE },
  { file: 'rows/s3b-human-variant.ts', rows: S3B_HUMAN_VARIANT },
  { file: 'rows/s3b-innate-level.ts', rows: S3B_INNATE_LEVEL },
  { file: 'rows/s3b-deep-gnome.ts', rows: S3B_DEEP_GNOME },
  { file: 'rows/s3b-firbolg.ts', rows: S3B_FIRBOLG },
  { file: 'rows/s3b-feat-requires.ts', rows: S3B_FEAT_REQUIRES },
  { file: 'rows/s3b-backgrounds.ts', rows: S3B_BACKGROUNDS },
  { file: 'rows/s3b-dialects-vehicles.ts', rows: S3B_DIALECTS_VEHICLES },
  { file: 'rows/s3b-spell-damage.ts', rows: S3B_SPELL_DAMAGE },
  { file: 'rows/s3b-eldritch-blast.ts', rows: S3B_ELDRITCH_BLAST },
  { file: 'rows/s3b-upcast-targets.ts', rows: S3B_UPCAST_TARGETS },
  { file: 'rows/s3b-upcast-summon.ts', rows: S3B_UPCAST_SUMMON },
  { file: 'rows/s3b-upcast-duration.ts', rows: S3B_UPCAST_DURATION },
  { file: 'rows/s3b-upcast-other.ts', rows: S3B_UPCAST_OTHER },
  { file: 'rows/s3b-upcast-area.ts', rows: S3B_UPCAST_AREA },
  { file: 'rows/s3b-upcast-heal.ts', rows: S3B_UPCAST_HEAL },
  { file: 'rows/s3c-hp.ts', rows: S3C_HP },
  { file: 'rows/s3c-passive.ts', rows: S3C_PASSIVE },
  { file: 'rows/s3c-spell-links.ts', rows: S3C_SPELL_LINKS },
]

export function runFixes(packs: ConvertedPack[]): FixReport {
  return applyFixes(packs, RULES, ROW_SETS)
}
