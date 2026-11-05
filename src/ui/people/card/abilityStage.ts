import { ABILITY_KEYS, type AbilityKey } from '../../../rules/dnd5e2014/data/enums'
import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import type { Rng } from '../../../rules/dice'

/**
 * 标准数组与购点总点数：界面自带的功能，不依赖任何数据包（驾驶员 2026-11-05 明确授权，属于"不手写数据"规则的唯一例外，仅这两项）。
 * 购点的花费表仍然读库（table.phb-p13-r1，在 SRD 包里）。
 */
export const STANDARD_ARRAY: readonly number[] = [15, 14, 13, 12, 10, 8]
export const POINT_BUY_BUDGET = 27

/** 属性弹窗的「暂存」（U5R §10.4）：放入的点数、其他、覆盖、豁免勾选都先在这里，点「保存并写入属性点」才一次写入草稿。纯函数。 */
type Rec = Partial<Record<AbilityKey, number>>
export interface Stage { base: Rec; other: Rec; override: Rec; saves: Record<AbilityKey, boolean>; cleared: boolean }
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

export function initStage(block: MonsterData): Stage {
  const saves = Object.fromEntries(ABILITY_KEYS.map((k) => [k, (block.proficiencies?.saves ?? []).some((r) => r.ability === k)])) as Record<AbilityKey, boolean>
  return { base: { ...((block.abilities ?? {}) as Rec) }, other: { ...((block.abilityOther ?? {}) as Rec) }, override: { ...((block.overrides?.abilities ?? {}) as Rec) }, saves, cleared: false }
}

/** 把暂存写进 block（返回新对象）：abilities / abilityOther / overrides.abilities / proficiencies.saves。 */
export function applyStage(block: MonsterData, stage: Stage): MonsterData {
  const next = clone(block)
  const abilities: Rec = {}
  for (const k of ABILITY_KEYS) if (stage.base[k] !== undefined) abilities[k] = stage.base[k]
  const loose = next as unknown as { abilities?: Rec; abilityOther?: Rec }
  if (Object.keys(abilities).length) loose.abilities = abilities; else delete loose.abilities
  const other: Rec = {}
  for (const k of ABILITY_KEYS) if (stage.other[k]) other[k] = stage.other[k]
  if (Object.keys(other).length) loose.abilityOther = other; else delete loose.abilityOther
  const ov: Rec = {}
  for (const k of ABILITY_KEYS) if (stage.override[k] !== undefined) ov[k] = stage.override[k]
  const overrides = { ...(next.overrides ?? {}) } as Record<string, unknown>
  if (Object.keys(ov).length) overrides.abilities = ov; else delete overrides.abilities
  if (Object.keys(overrides).length) next.overrides = overrides as MonsterData['overrides']; else delete next.overrides
  const have = next.proficiencies?.saves ?? []
  const saves = have.filter((r) => stage.saves[r.ability])
  for (const k of ABILITY_KEYS) if (stage.saves[k] && !saves.some((r) => r.ability === k)) saves.push({ ability: k, sources: [{ kind: 'manual' }] })
  const prof = { ...(next.proficiencies ?? {}) }
  if (saves.length) prof.saves = saves; else delete prof.saves
  if (Object.keys(prof).length) next.proficiencies = prof; else delete next.proficiencies
  return next
}
export const stageDirty = (block: MonsterData, stage: Stage): boolean => JSON.stringify(applyStage(block, stage)) !== JSON.stringify(applyStage(block, initStage(block)))
export const manualCounts = (stage: Stage): { other: number; override: number } => ({ other: ABILITY_KEYS.filter((k) => stage.other[k]).length, override: ABILITY_KEYS.filter((k) => stage.override[k] !== undefined).length })
/** [清除手动修正]：清空「其他」和覆盖，基础值不动；不立刻写。 */
export const clearManual = (stage: Stage): Stage => ({ ...stage, other: {}, override: {}, cleared: true })

// 购点：成本表与总点数读库（`BuyRules`，见 cardData.tables）；代码里不写数
export interface BuyRules { costs: Record<number, number>; budget: number }
export const buyCost = (score: number, costs: Record<number, number>): number | null => costs[score] ?? null
const range = (costs: Record<number, number>): { min: number; max: number } => { const s = Object.keys(costs).map(Number); return { min: Math.min(...s), max: Math.max(...s) } }
export function buySpent(base: Rec, costs: Record<number, number>): number { return ABILITY_KEYS.reduce((n, k) => n + (buyCost(base[k] ?? -1, costs) ?? 0), 0) }
export function canBuyUp(base: Rec, key: AbilityKey, rules: BuyRules): boolean {
  const { min, max } = range(rules.costs)
  const cur = base[key] ?? min
  if (cur >= max) return false
  return buySpent(base, rules.costs) - (buyCost(cur, rules.costs) ?? 0) + (buyCost(cur + 1, rules.costs) ?? 0) <= rules.budget
}
export function buyStep(base: Rec, key: AbilityKey, delta: 1 | -1, rules: BuyRules): Rec {
  const { min, max } = range(rules.costs)
  const cur = Math.min(max, Math.max(min, base[key] ?? min))
  if (delta === 1 && !canBuyUp({ ...base, [key]: cur }, key, rules)) return { ...base, [key]: cur }
  return { ...base, [key]: Math.min(max, Math.max(min, cur + delta)) }
}

/** 4d6 去最低：每组四颗 d6，去掉最低一颗，余下三颗相加。 */
export function roll4d6(rng: Rng): { total: number; dice: number[]; dropped: number } {
  const dice = Array.from({ length: 4 }, () => 1 + Math.min(5, Math.floor(rng() * 6)))
  const dropped = Math.min(...dice)
  const kept = [...dice]; kept.splice(kept.indexOf(dropped), 1)
  return { total: kept.reduce((a, b) => a + b, 0), dice, dropped }
}
