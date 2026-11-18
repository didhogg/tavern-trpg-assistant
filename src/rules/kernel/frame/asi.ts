// 属性提升（dnd5e AbilityScoreImprovement 进阶）：界面只交「玩家在每项加了几点」，固定加值的合并、每项上限、点数检查都在这里。
// 名字取 dnd5e 自己的属性登记（CONFIG.DND5E.abilities，中文战役即中文），界面不查表。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { systemText } from './system-text'
import { registryLabels } from './trait-title'

const g = globalThis as any

/** 界面交来的属性提升：chosen = 玩家每项加的点（不含固定加值）。 */
export interface AsiChoice { type: 'asi'; chosen?: Record<string, number>; assignments?: Record<string, number> }

function configOf(advancement: any) {
  const c = advancement.configuration ?? {}
  const points = Number(c.points) || 0
  return { points, cap: Number(c.cap) || points, fixed: Object.fromEntries(Object.entries(c.fixed ?? {}).filter(([, v]) => v)) as Record<string, number>, locked: new Set<string>([...(c.locked ?? [])]) }
}

/** 玩家加的点合不合规：非负整数、不碰锁定项、每项不超上限、合计不超点数。 */
function checked(advancement: any, chosen: Record<string, number> | undefined): Record<string, number> | null {
  const c = configOf(advancement)
  const out: Record<string, number> = {}
  let sum = 0
  for (const [k, n] of Object.entries(chosen ?? {})) {
    if (!n) continue
    if (!Number.isInteger(n) || n < 0 || n > c.cap || c.locked.has(k) || !(k in (g.CONFIG?.DND5E?.abilities ?? {}))) return null
    out[k] = n; sum += n
  }
  return sum <= c.points ? out : null
}

/** 这一步给界面：每项属性一行（名字、固定加值、玩家加的、还能不能加 / 减）+ 还剩几点。没有可分配的点 = 不用玩家选。 */
export function asiView(advancement: any, pick: AsiChoice | undefined): Record<string, unknown> | null {
  const c = configOf(advancement)
  if (!c.points) return null
  const chosen = checked(advancement, pick?.chosen) ?? {}
  const left = c.points - Object.values(chosen).reduce((n, x) => n + x, 0)
  const labels = registryLabels('abilities')
  return {
    kind: 'asi', points: c.points, cap: c.cap, left,
    rows: Object.keys(labels).map((key) => {
      const n = chosen[key] ?? 0
      return { key, label: systemText(labels[key]), fixed: c.fixed[key] ?? 0, chosen: n, canAdd: !c.locked.has(key) && left > 0 && n < c.cap, canRemove: n > 0 }
    }),
  }
}

/** 界面的选择 → 官方进阶要的值（固定加值 + 玩家加的）；不合规 = null。旧写法（已带 assignments）原样交。 */
export function asiValue(advancement: any, pick: AsiChoice): { type: 'asi'; assignments: Record<string, number> } | null {
  if (pick.assignments && !pick.chosen) return { type: 'asi', assignments: pick.assignments }
  const chosen = checked(advancement, pick.chosen)
  if (!chosen) return null
  const assignments: Record<string, number> = { ...configOf(advancement).fixed }
  for (const [k, n] of Object.entries(chosen)) assignments[k] = (assignments[k] ?? 0) + n
  return { type: 'asi', assignments }
}
