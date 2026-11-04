import type { ClassData } from '../data/entries/character'
import type { RuleTables } from './tables'

/** 单职业升降级的差集（U5R §10.4；PHB p15、p163）。纯函数；多职业留给 UNIT4。 */
export interface LevelStep {
  level: number
  /** 平均值升级所得（骰面 ÷ 2 + 1，至少 1 在加体质后计）。 */
  average: number
  /** 体质调整值后的平均增量 = max(1, average + con)。 */
  gainAverage: number
}
export interface LevelDiff {
  from: number
  to: number
  direction: 'up' | 'down' | 'same'
  steps: LevelStep[]
  /** 经过的级别里职业新增（up）或失去（down）的特性条目编号。 */
  features: string[]
  /** 经过的级别里的属性值提升级（abilityScoreImprovement）。 */
  asiLevels: number[]
  /** 目标等级的法术位（数据没有就 null）。 */
  slots: number[] | null
  pact: { count: number; level: number } | null
  /** 目标等级的熟练加值（读库里的升级表；读不到就是 null）。 */
  proficiency: number | null
}

/** tables：规则数值表（熟练加值读「角色升级」表）；没有就是 null。 */
export function levelDiff(entry: ClassData, from: number, to: number, con: number, tables?: RuleTables): LevelDiff {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const levels: number[] = []
  for (let n = lo + 1; n <= hi; n++) levels.push(n)
  const average = Math.floor(entry.hitDie / 2) + 1
  const steps = levels.map((level): LevelStep => ({ level, average, gainAverage: Math.max(1, average + con) }))
  const features: string[] = []
  const asiLevels: number[] = []
  for (const adv of entry.advancement) {
    if (adv.kind === 'itemGrant' && adv.level > lo && adv.level <= hi) features.push(...adv.items)
    if (adv.kind === 'abilityScoreImprovement' && adv.level > lo && adv.level <= hi) asiLevels.push(adv.level)
  }
  const row = entry.spellcasting?.slotsByLevel?.[to - 1]
  const slots = row && 'slots' in row ? row.slots : null
  const pact = row && 'pact' in row ? row.pact : null
  return { from, to, direction: to > from ? 'up' : to < from ? 'down' : 'same', steps, features, asiLevels, slots, pact, proficiency: tables?.profByLevel[Math.max(1, Math.min(20, to)) - 1] ?? null }
}

/** 升级所得生命 = 掷出的点数（没掷则平均）+ 体质，至少 1。 */
export function hpGain(entry: ClassData, con: number, rolled?: number): number {
  const base = rolled ?? Math.floor(entry.hitDie / 2) + 1
  return Math.max(1, base + con)
}
