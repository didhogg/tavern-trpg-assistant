/** 一条放行规则：允许哪些条目的哪些路径变化。`expect` = 实际命中的条目数（精确相等，防止放行范围悄悄变宽）。 */
export interface Allow {
  name: string
  station: number
  /** 精确的条目 id 数组，或按类型（二选一）；不许用宽泛正则匹配 id。 */
  ids?: string[]
  type?: string
  /** 变化路径（从条目根算起，如 /data/value、/data/effects/2/level）必须匹配它。 */
  path: RegExp
  expect: number
  reason: string
}
/** 新增条目（第 3 站会新增约 10 件装备）；删除条目不允许。 */
export interface Added { id: string; pack: string; station: number; basis: string }
/** 允许新增的包依赖（第 1 站起，如塔莎锚点指向 PHB）。 */
export interface AllowRequires { pack: string; requires: string; station: number; reason: string }
