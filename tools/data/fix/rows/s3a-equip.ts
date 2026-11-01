import type { Fix } from '../engine'

// 起始装备里的类别项（任意简易武器、圣徽、奥术法器、乐器……）已由转换器直接读 5etools 的 `equipmentType` 生成（G2.5 P6），
// 这里不再有逐条修正。依据与原先逐条写的对照见 docs/probes/D1.2-G2.5_根因与数据源台账.md。
export const ROWS: Fix[] = []
