// 作者掷骰结果 → 骰盘显示用的结果与一行文字。点数、总数都来自作者骰子程序，这里只排版。
import type { DiceGroup } from './builder'

export type RollMode = 'normal' | 'adv' | 'dis'

/** 作者掷完交回的：总数、每颗骰子（几面、点数，按掷骰顺序）、作者自己的明细文字。 */
export interface AuthorRoll { total: number; used: Array<{ max: number; value: number }>; text: string | null }

export interface RollResult {
  /** 规范写法（`1d20+5`）。 */
  expression: string
  mode: RollMode
  total: number
  /** 每颗骰子；优势 / 劣势落选的那颗 dim。 */
  dice: Array<{ sides: number; value: number; dim: boolean }>
  mod: number
  /** 明细，如「12 + 5」「取高 12/7 + 5」；不是按钮能拆的骰式时用作者自己的明细。 */
  detail: string
  /** 采用的 d20 掷出了 20 / 1（只看第一组单独的 1d20）。 */
  natural?: 20 | 1
}

const MODE_LABEL = { normal: '', adv: ' 优势', dis: ' 劣势' } as const

/**
 * 骰式能拆成按钮（groups 是交给作者时的顺序）时，按顺序把作者掷出的点数分回各组；
 * 分不回去（作者另掷了重骰等）或手写的其他写法，就照作者原样显示。
 */
export function resultOf(input: { formula: string; groups: Array<DiceGroup & { pair: boolean }> | null; mod: number; mode: RollMode }, roll: AuthorRoll): RollResult {
  const { groups, mod, mode } = input
  const need = groups?.reduce((n, g) => n + (g.pair ? 2 : g.count), 0)
  if (groups && need === roll.used.length) {
    const dice: RollResult['dice'] = []
    const parts: string[] = []
    let at = 0
    let natural: 20 | 1 | undefined
    let naturalSeen = false
    let sum = mod
    for (const g of groups) {
      const values = roll.used.slice(at, at + (g.pair ? 2 : g.count)).map((u) => u.value)
      at += values.length
      const sign = g.sign === -1 ? '- ' : parts.length ? '+ ' : ''
      let kept = values.reduce((a, b) => a + b, 0)
      if (g.pair) {
        const k = mode === 'adv' ? (values[0] >= values[1] ? 0 : 1) : values[0] <= values[1] ? 0 : 1
        kept = values[k]
        values.forEach((value, i) => dice.push({ sides: 20, value, dim: i !== k }))
        parts.push(`${sign}取${mode === 'adv' ? '高' : '低'} ${values.join('/')}`)
      } else {
        values.forEach((value) => dice.push({ sides: g.sides, value, dim: false }))
        parts.push(`${sign}${values.join(' + ')}`)
      }
      if (!naturalSeen && g.sides === 20 && g.count === 1 && g.sign === 1) {
        naturalSeen = true
        natural = kept === 20 ? 20 : kept === 1 ? 1 : undefined
      }
      sum += g.sign * kept
    }
    if (mod) parts.push(`${mod < 0 ? '- ' : parts.length ? '+ ' : ''}${Math.abs(mod)}`)
    // 自己分回的点数与作者总数一致才用（作者是唯一的结果来源）
    if (sum === roll.total) {
      const expression = groups.map((g, i) => `${g.sign === -1 ? '-' : i === 0 ? '' : '+'}${g.count}d${g.sides}`).join('') + (mod ? `${mod > 0 ? (groups.length ? '+' : '') : '-'}${Math.abs(mod)}` : '')
      return { expression, mode, total: roll.total, dice, mod, detail: parts.join(' '), ...(natural ? { natural } : {}) }
    }
  }
  return {
    expression: input.formula.replace(/\s+/g, ''),
    mode: 'normal',
    total: roll.total,
    dice: roll.used.map((u) => ({ sides: u.max, value: u.value, dim: false })),
    mod: 0,
    detail: roll.text ?? '',
  }
}

/** 一行文字：`1d20+5 优势 = 17（取高 12/7 + 5）`。 */
export function lineText(result: RollResult): string {
  return `${result.expression}${MODE_LABEL[result.mode]} = ${result.total}（${result.detail}）`
}

/** 写进酒馆输入框的注释；说明里的连续短横线会被替换，避免提前结束注释。 */
export function commentFromLine(line: string, note: string): string {
  const cleaned = note.trim().replace(/-{2,}/g, '—').replace(/[<>]/g, '')
  return `<!-- [掷骰] ${cleaned ? `${cleaned}：` : ''}${line} -->`
}
