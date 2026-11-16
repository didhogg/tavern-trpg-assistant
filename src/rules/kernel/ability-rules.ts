// 建卡「属性值」的三种方式的规则：标准数组、购点、手填。
// 数值来源：作者 statgen（vendor/cn/js/statgen/statgen-ui.js：_STANDARD_ARRAY 第 10 行、购点花费表 _getDefaultStatePointBuyCosts、预算 pb_budget）。
// 作者的 statgen 是界面类、没有可单独调用的规则函数，所以这里只登记这三份数据；
// 单元测试 tests/unit/ability-rules.test.ts 每次读作者那个文件核对，作者改了这里不改就会报错。手填的范围不在这里：取官方 dnd5e 人物数据（0 到 CONFIG.DND5E.maxAbilityScore），由结算小窗给。

export const ABILITY_RULES = {
  standardArray: [15, 14, 13, 12, 10, 8] as number[],
  pointBuy: { budget: 27, costs: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } as Record<number, number> },
}

export type AbilityMethod = 'standardArray' | 'pointBuy' | 'manual'
/** 每项属性的基础值；null / 没写 = 还没放（人物保持官方初值）。 */
export type AbilityBase = Record<string, number | null | undefined>
export interface AbilityPlan { method: AbilityMethod; base: AbilityBase }

export type AbilityProblem = { key: string; code: 'not-integer' | 'out-of-range' | 'not-in-array' | 'not-in-table' } | { key: null; code: 'over-budget' }
export interface AbilityCheck {
  /** 没有违反规则的地方（没放完不算违反）。 */
  ok: boolean
  /** 所有属性都放好了。 */
  complete: boolean
  problems: AbilityProblem[]
  /** 标准数组：还没用掉的数（按从大到小）。 */
  pool?: number[]
  /** 购点：已花、预算、剩余。 */
  cost?: number
  budget?: number
  left?: number
  /** 购点：起点（花费表里最小的分数），切到购点时每项从这里开始。 */
  start?: number
  /** 购点：每项现在花多少，以及点 [＋] / [－] 会变成几（不行 = null：不在表里，或剩的点数不够）。 */
  rows?: Record<string, { cost: number | null; up: number | null; down: number | null }>
}

/** 检查一组基础值合不合方式的规则。keys = 全部属性键；cap = 手填上限（官方给；其余方式用不到）。 */
export function checkAbilities(plan: AbilityPlan, keys: string[], cap: number): AbilityCheck {
  const problems: AbilityProblem[] = []
  const set = keys.filter((k) => typeof plan.base[k] === 'number')
  const complete = set.length === keys.length
  const value = (k: string) => plan.base[k] as number
  for (const k of set) if (!Number.isInteger(value(k))) problems.push({ key: k, code: 'not-integer' })
  const valid = set.filter((k) => Number.isInteger(value(k)))
  if (plan.method === 'manual') {
    for (const k of valid) if (value(k) < 0 || value(k) > cap) problems.push({ key: k, code: 'out-of-range' })
    return { ok: !problems.length, complete, problems }
  }
  if (plan.method === 'standardArray') {
    const left = [...ABILITY_RULES.standardArray]
    for (const k of valid) {
      const at = left.indexOf(value(k))
      if (at < 0) problems.push({ key: k, code: 'not-in-array' }); else left.splice(at, 1)
    }
    return { ok: !problems.length, complete, problems, pool: left.sort((a, b) => b - a) }
  }
  const { budget, costs } = ABILITY_RULES.pointBuy
  let cost = 0
  for (const k of valid) {
    const c = costs[value(k)]
    if (c === undefined) problems.push({ key: k, code: 'not-in-table' }); else cost += c
  }
  if (cost > budget) problems.push({ key: null, code: 'over-budget' })
  const scores = Object.keys(costs).map(Number).sort((a, b) => a - b)
  const left = budget - cost
  const rows = Object.fromEntries(keys.map((k) => {
    const v = plan.base[k]
    if (typeof v !== 'number' || costs[v] === undefined) return [k, { cost: null, up: scores[0], down: null }]
    const up = costs[v + 1] !== undefined && costs[v + 1] - costs[v] <= left ? v + 1 : null
    return [k, { cost: costs[v], up, down: costs[v - 1] !== undefined ? v - 1 : null }]
  }))
  return { ok: !problems.length, complete, problems, cost, budget, left, start: scores[0], rows }
}
