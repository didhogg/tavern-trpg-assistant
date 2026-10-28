import { parseDice, termsToText, type DiceTerm } from './parse'

/** 返回 [0, 1) 的随机数；测试时可注入固定序列。 */
export type Rng = () => number
export type RollMode = 'normal' | 'adv' | 'dis'

export interface RolledTerm {
  term: DiceTerm
  /** 每颗骰子的点数；优势 / 劣势时为两颗，kept 为被采用的那颗的下标。 */
  rolls: number[]
  kept?: number
  subtotal: number
}

export interface RollResult {
  expression: string
  mode: RollMode
  terms: RolledTerm[]
  total: number
  /** 采用的 d20 掷出了 20 / 1（只看第一个单独的 1d20）。 */
  natural?: 20 | 1
}

/** 使用 crypto.getRandomValues 的随机数源；在非安全上下文（http）中也可用。 */
export const cryptoRng: Rng = () => {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 4294967296
}

function die(rng: Rng, sides: number): number {
  return Math.min(sides, Math.floor(rng() * sides) + 1)
}

export interface RollOptions {
  rng?: Rng
  /** 优势 / 劣势：作用于每个单独的 1d20。 */
  mode?: RollMode
  /** 额外的固定加值（掷骰窗里的「加值」）。 */
  bonus?: number
}

/** 掷骰：失败时抛出带中文原因的 Error。 */
export function rollDice(expression: string, options: RollOptions = {}): RollResult {
  const parsed = parseDice(expression)
  if (!parsed.ok) throw new Error(parsed.error)
  const rng = options.rng ?? cryptoRng
  const mode = options.mode ?? 'normal'
  const terms: DiceTerm[] = [...parsed.terms]
  if (options.bonus) terms.push({ kind: 'const', value: Math.abs(options.bonus), sign: options.bonus < 0 ? -1 : 1 })
  let natural: 20 | 1 | undefined
  let naturalSeen = false
  const rolled: RolledTerm[] = terms.map((term) => {
    if (term.kind === 'const') return { term, rolls: [], subtotal: term.sign * term.value }
    const single20 = term.count === 1 && term.sides === 20
    if (single20 && mode !== 'normal') {
      const pair = [die(rng, 20), die(rng, 20)]
      const kept = mode === 'adv' ? (pair[0] >= pair[1] ? 0 : 1) : pair[0] <= pair[1] ? 0 : 1
      if (!naturalSeen && term.sign === 1) {
        naturalSeen = true
        natural = pair[kept] === 20 ? 20 : pair[kept] === 1 ? 1 : undefined
      }
      return { term, rolls: pair, kept, subtotal: term.sign * pair[kept] }
    }
    const rolls = Array.from({ length: term.count }, () => die(rng, term.sides))
    if (single20 && !naturalSeen && term.sign === 1) {
      naturalSeen = true
      natural = rolls[0] === 20 ? 20 : rolls[0] === 1 ? 1 : undefined
    }
    return { term, rolls, subtotal: term.sign * rolls.reduce((a, b) => a + b, 0) }
  })
  return {
    expression: termsToText(terms),
    mode,
    terms: rolled,
    total: rolled.reduce((sum, t) => sum + t.subtotal, 0),
    ...(natural ? { natural } : {}),
  }
}
