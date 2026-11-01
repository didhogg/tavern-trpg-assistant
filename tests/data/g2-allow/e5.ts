import type { Added, Allow, AllowRequires } from './types'

/** E5 子站（补充层数据文件产生的变化）的放行规则：每条用 `ids` 精确列条目，`expect` ＝ 条目数（来自 E_逐条站.md／规格，不是跑出来再抄）。 */
export const ALLOW: Allow[] = []
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []
