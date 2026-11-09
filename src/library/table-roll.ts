// 表格掷骰的纯逻辑（P5 B-06）：骰式里的"要玩家填的数"（作者的 #$prompt_number:… $# 占位符）、多个骰式写法、点数落在哪一行。
// 骰子本身、表格能不能掷、行首怎么读，都在小窗里由作者函数做（frame/table-roll-commands.ts）；这里只有不依赖作者程序的几件小事，
// 其中占位符参数的读法照作者界面代码（render-dice.js 的 pRollerClickUseData：按逗号拆、按等号分、min / max 转数字，没给的默认 0 / 无穷 / 0）。

/** 要玩家填的一个数。max 为 null 表示没有上限。 */
export interface PromptSpec {
  /** 作者的占位符原文（替换时用）。 */
  raw: string
  title: string | null
  default: number
  min: number
  max: number | null
}

/** 作者的占位符写法（Renderer.dice.RE_PROMPT 的同一个写法，作者那边是静态常量，这里用它传进来的正则源）。 */
export const PROMPT_SOURCE = '#\\$prompt_number:?([^$]*)\\$#'

const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v)
  return v !== undefined && v !== '' && Number.isFinite(n) ? n : fallback
}

/** 一个骰式里所有要玩家填的数，按出现顺序。 */
export function parsePrompts(formula: string, source: string = PROMPT_SOURCE): PromptSpec[] {
  return [...formula.matchAll(new RegExp(source, 'g'))].map((m) => {
    const opts: Record<string, string> = {}
    for (const part of (m[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
      const [k, v] = part.split('=').map((s) => s.trim())
      opts[k] = v
    }
    return {
      raw: m[0],
      title: opts.title ?? null,
      default: num(opts.default, 0),
      min: num(opts.min, 0),
      max: opts.max === undefined ? null : num(opts.max, Number.POSITIVE_INFINITY) === Number.POSITIVE_INFINITY ? null : num(opts.max, 0),
    }
  })
}

/** 把玩家填的数按顺序替换进骰式。个数对不上、或超出 min / max 抛错（说明哪一项）。 */
export function fillPrompts(formula: string, values: number[], source: string = PROMPT_SOURCE): string {
  const specs = parsePrompts(formula, source)
  if (values.length !== specs.length) throw new Error(`要填 ${specs.length} 个数，给了 ${values.length} 个`)
  specs.forEach((s, i) => {
    const v = values[i]
    if (!Number.isFinite(v)) throw new Error(`第 ${i + 1} 个数不是数字`)
    if (v < s.min || (s.max !== null && v > s.max)) throw new Error(`${s.title ?? `第 ${i + 1} 个数`}要在 ${s.min}～${s.max ?? '不限'} 之间`)
  })
  let at = 0
  return formula.replace(new RegExp(source, 'g'), () => String(values[at++]))
}

/** 骰式里用分号分开的多种写法（作者界面让玩家选掷哪个）。 */
export function splitFormulas(toRoll: string): string[] {
  return toRoll.split(';').map((s) => s.trim()).filter(Boolean)
}

/** 作者 getRollableRow 给出的行首点数范围。exact：只有一个点数；min / max：范围（可为无穷）；pad：写成"00"这类补零的写法。 */
export interface RollCell { exact?: number; min?: number; max?: number; pad?: boolean }

/** 点数落在哪一行（第一个匹配的行号）；没有行首范围的行跳过；找不到返回 null。补零写法下 100 记为 0（作者的写法）。 */
export function rowIndexOf(rolls: Array<RollCell | null | undefined>, value: number): number | null {
  const i = rolls.findIndex((roll) => {
    if (!roll) return false
    const v = roll.pad && value === 100 ? 0 : value
    return roll.exact != null ? roll.exact === v : roll.min != null && roll.max != null && roll.min <= v && v <= roll.max
  })
  return i >= 0 ? i : null
}
