/** 法术位表（PHB 各施法职业“职业表”、第 6 章“多职业施法者”表、TCE 奇械师表）。
 * 每行是 1 到 9 环的法术位数，下标 = 角色等级 - 1。只写非零环，读取时补零。 */
const row = (...n: number[]): number[] => [...n, ...Array(9 - n.length).fill(0)]

export const FULL: number[][] = [row(2), row(3), row(4, 2), row(4, 3), row(4, 3, 2), row(4, 3, 3), row(4, 3, 3, 1), row(4, 3, 3, 2), row(4, 3, 3, 3, 1), row(4, 3, 3, 3, 2), row(4, 3, 3, 3, 2, 1), row(4, 3, 3, 3, 2, 1), row(4, 3, 3, 3, 2, 1, 1), row(4, 3, 3, 3, 2, 1, 1), row(4, 3, 3, 3, 2, 1, 1, 1), row(4, 3, 3, 3, 2, 1, 1, 1), row(4, 3, 3, 3, 2, 1, 1, 1, 1), row(4, 3, 3, 3, 3, 1, 1, 1, 1), row(4, 3, 3, 3, 3, 2, 1, 1, 1), row(4, 3, 3, 3, 3, 2, 2, 1, 1)]
export const HALF: number[][] = [row(), row(2), row(3), row(3), row(4, 2), row(4, 2), row(4, 3), row(4, 3), row(4, 3, 2), row(4, 3, 2), row(4, 3, 3), row(4, 3, 3), row(4, 3, 3, 1), row(4, 3, 3, 1), row(4, 3, 3, 2), row(4, 3, 3, 2), row(4, 3, 3, 3, 1), row(4, 3, 3, 3, 1), row(4, 3, 3, 3, 2), row(4, 3, 3, 3, 2)]
/** 奇械师：半施法者，但 1 级就有 2 个 1 环位 */
export const ARTIFICER: number[][] = [row(2), row(2), ...HALF.slice(2)]
export const THIRD: number[][] = [row(), row(), row(2), row(3), row(3), row(3), row(4, 2), row(4, 2), row(4, 2), row(4, 3), row(4, 3), row(4, 3), row(4, 3, 2), row(4, 3, 2), row(4, 3, 2), row(4, 3, 3), row(4, 3, 3), row(4, 3, 3), row(4, 3, 3, 1), row(4, 3, 3, 1)]
/** 契约魔法（魔契师）：[法术位数, 法术位环级]，PHB 魔契师职业表 */
export const PACT: Array<[number, number]> = [[1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5]]

/** 子职业、职业的施法类型 → 期望表 */
export const SLOT_TABLE: Record<string, number[][]> = { full: FULL, half: HALF, third: THIRD, artificer: ARTIFICER }
