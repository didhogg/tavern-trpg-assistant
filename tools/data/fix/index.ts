import { loadOverlay } from './overlay'
import type { ConvertedPack } from '../convert'
import { applyFixes, type FixReport, type Rule } from './engine'
import { RULE as S2_POOL_SPELLING } from './rules/s2-pool-spelling'
import { RULE as S2_WARLOCK_SLOT_LEVEL } from './rules/s2-warlock-slot-level'
import { RULE as S2_TABLE_LEVEL_LABELS } from './rules/s2-table-level-labels'
import { RULE as S2_SPELL_LINKS } from './rules/s2-spell-links'
import { RULE as S2_CULT_LINKS } from './rules/s2-cult-links'
import { RULE as S3B_RACIAL_USES_DUP } from './rules/s3b-racial-uses-dup'

/**
 * 修正规则（按模式批量改，代码）的注册处；逐条修正已全部是 `tools/data/overlay/*.json` 数据文件，
 * 发现数据错误直接改那里的 JSON，不写代码、不在这里登记。规则按这里的顺序执行，然后按文件名顺序执行 JSON。
 */
export const RULES: Rule[] = [S2_POOL_SPELLING, S2_WARLOCK_SLOT_LEVEL, S2_TABLE_LEVEL_LABELS, S2_SPELL_LINKS, S2_CULT_LINKS, S3B_RACIAL_USES_DUP]
export function runFixes(packs: ConvertedPack[]): FixReport {
  return applyFixes(packs, RULES, loadOverlay()) // 全部逐条修正都是 overlay/*.json（编号文件 01–36 是原代码修正表原样搬入，E 开头是 E 站）
}
