import { MAX_DICE_COUNT, parseDice, type DiceTerm } from './parse'

/** 掷骰窗里可以点的骰子。 */
export const DICE_FACES = [4, 6, 8, 10, 12, 20, 100] as const

export interface DiceGroup { count: number; sides: number; sign: 1 | -1 }
export interface Builder { dice: DiceGroup[]; mod: number }

const EMPTY: Builder = { dice: [], mod: 0 }

/** 骰式文字 → 构建器：同面数同符号的骰子合并，常数合并成一个加减值。空文字是合法的空骰式。 */
export function readBuilder(text: string): { ok: true; builder: Builder } | { ok: false; error: string } {
  if (!text.trim()) return { ok: true, builder: EMPTY }
  const parsed = parseDice(text)
  if (!parsed.ok) return parsed
  return { ok: true, builder: fromTerms(parsed.terms) }
}

function fromTerms(terms: DiceTerm[]): Builder {
  const dice: DiceGroup[] = []
  let mod = 0
  for (const t of terms) {
    if (t.kind === 'const') mod += t.sign * t.value
    else {
      const same = dice.find((d) => d.sides === t.sides && d.sign === t.sign)
      if (same) same.count += t.count
      else dice.push({ count: t.count, sides: t.sides, sign: t.sign })
    }
  }
  return { dice, mod }
}

/** 构建器 → 骰式文字：加号的骰子按面数从小到大，减号的骰子在后，加减值在最后，如 `2d6 + 1d20 + 5`。 */
export function builderText(b: Builder): string {
  const ordered = [...b.dice].sort((x, y) => (y.sign - x.sign) || x.sides - y.sides)
  const parts = ordered.map((d, i) => `${i === 0 ? (d.sign === -1 ? '-' : '') : d.sign === -1 ? '- ' : '+ '}${d.count}d${d.sides}`)
  let text = parts.join(' ')
  if (b.mod) text += `${text ? ' ' : ''}${b.mod > 0 ? (text ? '+ ' : '+') : '- '}${Math.abs(b.mod)}`
  return text
}

function edit(text: string, change: (b: Builder) => Builder): string {
  const read = readBuilder(text)
  return builderText(change(read.ok ? read.builder : EMPTY))
}

/** 点一下骰子：该面数的骰子多一颗（超过上限时不再增加）。 */
export function addDie(text: string, sides: number): string {
  return edit(text, (b) => {
    const dice = b.dice.map((d) => ({ ...d }))
    const same = dice.find((d) => d.sides === sides && d.sign === 1)
    if (same) same.count = Math.min(MAX_DICE_COUNT, same.count + 1)
    else dice.push({ count: 1, sides, sign: 1 })
    return { ...b, dice }
  })
}

export function removeDie(text: string, sides: number): string {
  return edit(text, (b) => ({
    ...b,
    dice: b.dice.map((d) => (d.sides === sides && d.sign === 1 ? { ...d, count: d.count - 1 } : { ...d })).filter((d) => d.count > 0),
  }))
}

/** 加减值加减 delta（限制在 min..max）。 */
export function stepMod(text: string, delta: number, min = -20, max = 30): string {
  return edit(text, (b) => ({ ...b, mod: Math.min(max, Math.max(min, b.mod + delta)) }))
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

/** 结果卡里大骰子的形状：取骰式里面数最大的骰子，落到最近的一种。 */
export function heroSides(b: Builder): number {
  const max = b.dice.reduce((m, d) => Math.max(m, d.sides), 0) || 20
  return DICE_FACES.find((f) => max <= f) ?? 100
}
