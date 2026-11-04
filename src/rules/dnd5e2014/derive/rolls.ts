import type { Effect } from '../data/effects'
import type { AbilityKey, SkillKey } from '../data/enums'
import type { Part, PersonDerived } from './types'

/** 骰盘「③ 加值与骰式」「⑤ 掷法」的数据来源（U5R §11）：只读结构化 effects，不预制任何法术名。 */
export type RollKind = 'check' | 'save' | 'initiative'
export interface RollRow {
  label: string
  /** 固定值（可正负）；骰式加值用 dice。 */
  amount?: number
  dice?: string
  /** 来源说明（悬停显示）。 */
  source: string
  /** 来自 rollBonus 且 consumedOnUse。 */
  consumedOnUse?: boolean
  /** 自动行（不是自定义）。 */
  auto: true
}
export interface SourcedEffect { source: string; effect: Effect }
export interface RollSources {
  rows: RollRow[]
  /** 优势 / 劣势的来源名；数量不影响结果（p173）。 */
  adv: string[]
  dis: string[]
  mode: 'normal' | 'advantage' | 'disadvantage'
  /** 先攻 / 死亡豁免等规则提示。 */
  notes: string[]
  /** 无法算时的原因（属性或熟练数据缺失）。 */
  failure?: string
}

export interface RollInput {
  kind: RollKind
  ability: AbilityKey
  /** 技能检定时给；属性检定 / 豁免 / 先攻不给。 */
  skill?: SkillKey
  derived: PersonDerived
  effects: SourcedEffect[]
}

function matchesScope(scope: string | undefined, ability: AbilityKey, skill: SkillKey | undefined): boolean {
  if (!scope || scope === 'all') return true
  return scope === ability || scope === skill
}

/** 优势与劣势只要各有至少一个就互相抵消，不论各有几个（PHB p173）。 */
export function resolveMode(adv: number, dis: number): RollSources['mode'] {
  if (adv > 0 && dis > 0) return 'normal'
  if (adv > 0) return 'advantage'
  if (dis > 0) return 'disadvantage'
  return 'normal'
}

export function rollSources(input: RollInput): RollSources {
  const { kind, ability, skill, derived, effects } = input
  const rows: RollRow[] = []
  const adv: string[] = []
  const dis: string[] = []
  const notes: string[] = []
  let failure: string | undefined
  const push = (parts: Part[]): void => {
    for (const p of parts) if (!p.overridden && p.kind !== 'override') rows.push({ label: p.label, amount: p.amount, source: p.label, auto: true })
    const over = parts.find((p) => p.kind === 'override')
    if (over) rows.push({ label: '覆盖', amount: over.amount, source: '读数覆盖', auto: true })
  }
  if (kind === 'check' && skill) {
    const res = derived.skills[skill]
    if (res.value === null) failure = '缺少属性或熟练加值，无法自动算；请手动填加值'
    else push(res.parts)
  } else if (kind === 'save') {
    const res = derived.saves[ability]
    if (res.value === null) failure = '缺少属性或熟练加值，无法自动算；请手动填加值'
    else push(res.parts)
  } else if (kind === 'initiative') {
    if (derived.initiative.value === null) failure = '缺少敏捷，无法自动算先攻'
    else push(derived.initiative.parts)
    notes.push('先攻是敏捷检定（PHB p177）')
  } else {
    const res = derived.abilities[ability]
    if (res.modifier === null) failure = '缺少属性值，无法自动算'
    else rows.push({ label: `${ability.toUpperCase()} 调整值`, amount: res.modifier, source: '属性调整值', auto: true })
  }
  const on = kind === 'initiative' ? 'check' : kind
  for (const { source, effect } of effects) {
    if (effect.kind === 'rollBonus' && effect.on === on && matchesScope(effect.scope, ability, skill)) {
      rows.push({ label: effect.label ?? source, dice: effect.dice, amount: effect.amount, source, consumedOnUse: effect.consumedOnUse, auto: true })
    } else if (effect.kind === 'note' && effect.text.includes('自动失败') && ((kind === 'save' && effect.text.includes('豁免')) || (kind === 'check' && effect.text.includes('属性检定')))) {
      notes.push(`${source}：${effect.text}`)
    } else if (effect.kind === 'advantage' && !effect.against && (effect.on === on || (kind === 'initiative' && effect.on === 'initiative'))) {
      adv.push(source)
    } else if (effect.kind === 'disadvantage' && !effect.against && (effect.on === on || (kind === 'initiative' && effect.on === 'initiative'))) {
      dis.push(source)
    }
  }
  return { rows, adv, dis, mode: resolveMode(adv.length, dis.length), notes, failure }
}

// ── 结果判定（p174、p175）──────────────────────────────────────────────────────

/** 对 DC：总值 ≥ DC 通过。天然 20 / 1 不自动成败（检定与豁免没有这条规则）。 */
export function meetsDc(total: number, dc: number): boolean { return total >= dc }

/** 对抗（p174）：高者胜；平局局面不变。 */
export function contestOutcome(a: number, b: number): 'a' | 'b' | 'tie' { return a > b ? 'a' : a < b ? 'b' : 'tie' }

/** 被动值 = 10 + 加值；优势 +5、劣势 −5（p175）。 */
export function passiveValue(bonus: number, mode: RollSources['mode']): number {
  return 10 + bonus + (mode === 'advantage' ? 5 : mode === 'disadvantage' ? -5 : 0)
}

/** 随机 DC：整数 1–25，等概率；rand 注入便于测试。 */
export const RANDOM_DC_MIN = 1
export const RANDOM_DC_MAX = 25
export function randomDc(rand: () => number = Math.random): number {
  return RANDOM_DC_MIN + Math.min(RANDOM_DC_MAX - RANDOM_DC_MIN, Math.floor(rand() * (RANDOM_DC_MAX - RANDOM_DC_MIN + 1)))
}

/** 力竭 N 级的累计效果（读条件条目的 exhaustion levels；1 级起检定劣势、3 级起攻击与豁免劣势：PHB p291）。 */
export function exhaustionEffects(levels: Array<{ level: number; effects: Effect[] }>, current: number): SourcedEffect[] {
  return levels.filter((l) => l.level <= current).flatMap((l) => l.effects.map((effect) => ({ source: `力竭 ${l.level} 级`, effect })))
}
/** 人物身上所有结构化来源：效果快照 + 力竭。 */
export function effectSourcesOf(effects: Array<{ name: string; effects?: Effect[] }>, exhaustion: number, levels: Array<{ level: number; effects: Effect[] }>): SourcedEffect[] {
  return [...effects.flatMap((e) => (e.effects ?? []).map((effect) => ({ source: e.name, effect }))), ...exhaustionEffects(levels, exhaustion)]
}
