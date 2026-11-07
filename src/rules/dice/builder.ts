// 骰盘的骰子按钮 ↔ 骰式文字。骰式怎么读、怎么掷都归作者骰子程序（src/library/runtime/dice.ts）；
// 这里只把作者读出的“若干组骰子 + 加值”排成文字，以及按钮的加一颗、减一颗、调加值。
import type { RollMode } from './format'

/** 骰盘里可以点的骰子。 */
export const DICE_FACES = [4, 6, 8, 10, 12, 20, 100] as const
/** 按钮一次最多加到的颗数（只限按钮；手写骰式由作者程序决定能不能掷）。 */
export const MAX_DICE_COUNT = 100

export interface DiceGroup { count: number; sides: number; sign: 1 | -1 }
export interface Builder { dice: DiceGroup[]; mod: number }

export const EMPTY_BUILDER: Builder = { dice: [], mod: 0 }

/** 作者读出的各组骰子：同面数同符号的合并。 */
export function mergeGroups(groups: DiceGroup[], mod: number): Builder {
  const dice: DiceGroup[] = []
  for (const g of groups) {
    const same = dice.find((d) => d.sides === g.sides && d.sign === g.sign)
    if (same) same.count += g.count
    else dice.push({ ...g })
  }
  return { dice, mod }
}

const ordered = (b: Builder): DiceGroup[] => [...b.dice].sort((x, y) => (y.sign - x.sign) || x.sides - y.sides)

/** 构建器 → 骰式文字：加号的骰子按面数从小到大，减号的骰子在后，加减值在最后，如 `2d6 + 1d20 + 5`。 */
export function builderText(b: Builder): string {
  const parts = ordered(b).map((d, i) => `${i === 0 ? (d.sign === -1 ? '-' : '') : d.sign === -1 ? '- ' : '+ '}${d.count}d${d.sides}`)
  let text = parts.join(' ')
  if (b.mod) text += `${text ? ' ' : ''}${b.mod > 0 ? (text ? '+ ' : '+') : '- '}${Math.abs(b.mod)}`
  return text
}

/** 交给作者掷的骰式与各组顺序。优势 / 劣势用作者写法：唯一的 1d20 写成 2d20kh1 / 2d20kl1。 */
export function authorFormula(b: Builder, mode: RollMode): { formula: string; groups: Array<DiceGroup & { pair: boolean }> } {
  const groups = ordered(b).map((d) => ({ ...d, pair: mode !== 'normal' && d.sides === 20 && d.count === 1 && d.sign === 1 }))
  const parts = groups.map((d, i) => `${d.sign === -1 ? '-' : i === 0 ? '' : '+'}${d.pair ? `2d20${mode === 'adv' ? 'kh1' : 'kl1'}` : `${d.count}d${d.sides}`}`)
  const formula = parts.join('') + (b.mod ? `${b.mod > 0 ? (parts.length ? '+' : '') : '-'}${Math.abs(b.mod)}` : '')
  return { formula, groups }
}

/** 点一下骰子：该面数的骰子多一颗（超过上限时不再增加）。 */
export function addDie(b: Builder, sides: number): Builder {
  const dice = b.dice.map((d) => ({ ...d }))
  const same = dice.find((d) => d.sides === sides && d.sign === 1)
  if (same) same.count = Math.min(MAX_DICE_COUNT, same.count + 1)
  else dice.push({ count: 1, sides, sign: 1 })
  return { ...b, dice }
}

export function removeDie(b: Builder, sides: number): Builder {
  return { ...b, dice: b.dice.map((d) => (d.sides === sides && d.sign === 1 ? { ...d, count: d.count - 1 } : { ...d })).filter((d) => d.count > 0) }
}

/** 加减值加减 delta（限制在 min..max）。 */
export function stepMod(b: Builder, delta: number, min = -20, max = 30): Builder {
  return { ...b, mod: Math.min(max, Math.max(min, b.mod + delta)) }
}

/** 某个面数的骰子现在有几颗（只数加号的）。 */
export function countOf(b: Builder, sides: number): number {
  return b.dice.filter((d) => d.sides === sides && d.sign === 1).reduce((n, d) => n + d.count, 0)
}

/** 优势 / 劣势只在骰式里恰好有一个 1d20（没有别的 d20）时可用。 */
export function canUseMode(b: Builder): boolean {
  const d20 = b.dice.filter((d) => d.sides === 20)
  return d20.length === 1 && d20[0].count === 1 && d20[0].sign === 1
}

export function diceTotal(b: Builder): number {
  return b.dice.reduce((n, d) => n + d.count, 0)
}

/** 结果卡里大骰子的形状：取面数最大的骰子，落到最近的一种。 */
export function heroSides(maxSides: number): number {
  const max = maxSides || 20
  return DICE_FACES.find((f) => max <= f) ?? 100
}
