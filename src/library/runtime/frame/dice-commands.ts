// 骰子后端（上位设计 §3.3 a、§3.7）：全部转调作者 5etools 的骰子程序（render-dice.js / render.js），不自己解析。
// 掷骰的随机数：不给骰点时用作者自己的随机数入口（RollerUtil._randomise）；给骰点时按顺序消耗（结算、测试吃已掷点数）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'

const tree = (formula: string): any => A.Renderer.dice.lang.getTree3(formula)?.tree ?? null
const plain = (message: string): string => message.replace(/<[^>]+>/g, '')

/** 条目里的骰子标签（{@dice} {@damage} {@hit} {@d20} {@chance} {@recharge} {@scaledamage} 等）→ 作者生成的骰子条目。 */
export async function diceTag(tag: string, text: string): Promise<unknown> {
  await init()
  return A.Renderer.utils.getTagEntry(tag.startsWith('@') ? tag : `@${tag}`, text)
}

/** 作者能否读这个骰式，以及平均值；min/max 是作者定义的“所有骰子各自取最小/最大”。 */
export async function diceStats(formula: string): Promise<{ ok: boolean; average: number | null; min: number | null; max: number | null }> {
  await init()
  const t = tree(formula)
  if (!t) return { ok: false, average: null, min: null, max: null }
  return { ok: true, average: t.avg({}), min: t.min({}), max: t.max({}) }
}

export interface DiceGroupRead { count: number; sides: number; sign: 1 | -1 }
export type DiceRead =
  | { ok: true; simple: true; dice: DiceGroupRead[]; mod: number }
  | { ok: true; simple: false }
  | { ok: false; error: string }

/**
 * 骰盘打字时读骰式：作者读不了 → 作者给的原因。作者读得了，而且作者词法结果只是“若干 XdY 与整数相加减”时，
 * 按顺序交回每组骰子与加值（骰盘的骰子按钮用）；其余作者写法（kh、r、括号…）照样能掷，只是不拆成按钮。
 */
export async function diceRead(text: string): Promise<DiceRead> {
  await init()
  if (!text.trim()) return { ok: true, simple: true, dice: [], mod: 0 }
  try {
    if (!A.Renderer.dice.lang.getTree3(text, false)?.tree) return { ok: false, error: '作者骰子程序读不了这个骰式' }
  } catch (error) {
    return { ok: false, error: plain(error instanceof Error ? error.message : String(error)) }
  }
  const tk = A.Renderer.dice.tk
  const tokens: any[] = A.Renderer.dice.lang._lex3(text).lexed
  const int = (t: any): number | null => (t?.type === tk.TYP_NUMBER && /^\d+$/.test(String(t.value)) ? Number(t.value) : null)
  const dice: DiceGroupRead[] = []
  let mod = 0
  let i = 0
  while (i < tokens.length) {
    let sign: 1 | -1 = 1
    if (tokens[i] === tk.ADD || tokens[i] === tk.SUB) { sign = tokens[i] === tk.SUB ? -1 : 1; i++ } else if (i > 0) return { ok: true, simple: false }
    const n = int(tokens[i])
    if (tokens[i] === tk.DICE || tokens[i + 1] === tk.DICE) {
      const at = tokens[i] === tk.DICE ? i : i + 1
      const sides = int(tokens[at + 1])
      if (sides === null) return { ok: true, simple: false }
      dice.push({ count: at === i ? 1 : (n ?? 0), sides, sign })
      i = at + 2
    } else if (n !== null) { mod += sign * n; i++ } else return { ok: true, simple: false }
    if (dice.some((d) => !d.count)) return { ok: true, simple: false }
  }
  return { ok: true, simple: true, dice, mod }
}

export type DiceRollResult =
  | { status: 'complete'; formula: string; total: number; used: Array<{ min: number; max: number; value: number }>; text: string | null }
  | { status: 'missing'; formula: string; used: Array<{ min: number; max: number; value: number }>; missing: { dice: { min: number; max: number } } }
  | { status: 'unsupported'; formula: string; reason: string }
  | { status: 'error'; formula: string; error: string }

/**
 * 掷作者骰式。points 给了就按掷骰顺序消耗（每颗是 min..max 之间的整数），不够时不掷，返回 missing 并说明下一颗是几面骰
 * （设计 §3.5“缺东西暂停并说明缺什么”）；不给就用作者自己的随机数。两种方式都记下每颗骰子的点数。
 */
export async function diceRoll(formula: string, points?: number[]): Promise<DiceRollResult> {
  await init()
  const t = tree(formula)
  if (!t) return { status: 'unsupported', reason: '作者骰子程序读不了这个骰式', formula }
  const original = A.RollerUtil._randomise
  const used: Array<{ min: number; max: number; value: number }> = []
  let missing: { min: number; max: number } | null = null
  A.RollerUtil._randomise = (range: { min?: number; max: number }) => {
    const { min = 1, max } = range
    // 作者原入口对“最小大于最大”“只有一种结果”不取随机数，这里同样不消耗骰点
    if (min > max) return 0
    if (min === max) return max
    if (!points) {
      const value = original.call(A.RollerUtil, range)
      used.push({ min, max, value })
      return value
    }
    if (used.length >= points.length) { missing = { min, max }; throw Error('KERNEL_NEEDS_DICE') }
    const value = points[used.length]
    if (!Number.isInteger(value) || value < min || value > max) throw Error(`骰点 ${value} 不在 ${min}～${max} 之间`)
    used.push({ min, max, value })
    return value
  }
  try {
    const meta: any = {}
    const total = t.evl(meta)
    const text = meta.text?.join?.('').replace(/\s+/g, ' ').trim() ?? null
    return { status: 'complete', formula, total, used, text }
  } catch (error) {
    if (missing) return { status: 'missing', formula, used, missing: { dice: missing } }
    return { status: 'error', formula, error: error instanceof Error ? error.message : String(error) }
  } finally {
    A.RollerUtil._randomise = original
  }
}

/** 表格：作者判断能否按点数掷（getAutoConvertedRollMode），以及某个点数落在哪一行（作者 getRollableRow 规范行首）。 */
export async function tableRow(table: any, value: number): Promise<{ rollable: boolean; mode: unknown; index: number | null }> {
  await init()
  const mode = A.Renderer.table.getAutoConvertedRollMode(table)
  if (!mode) return { rollable: false, mode, index: null }
  const index = (table.rows ?? []).findIndex((row: any) => {
    const roll = A.Renderer.getRollableRow(row)?.[0]?.roll
    if (!roll) return false
    const v = roll.pad && value === 100 ? 0 : value
    return roll.exact != null ? roll.exact === v : roll.min <= v && v <= roll.max
  })
  return { rollable: true, mode, index: index >= 0 ? index : null }
}
