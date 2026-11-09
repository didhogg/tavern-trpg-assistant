// 小窗里：随机表掷骰后端（P5 B-06）。全部转调作者函数：表能不能掷（getAutoConvertedRollMode）、行首点数范围（getRollableRow，
// 含变量骰表"首行 / 末行延伸到无穷"的选项）、表头骰式（RollerUtil.getFullRollCol + Renderer.utils.getTagEntry）、骰子（diceRoll，同一套作者骰子）。
// 作者站点在点表头骰子时做的事——问玩家要调整值、掷骰、找到行、把结果行里的行内骰子也掷一遍、名字生成器每列各掷一次——这里一次做完，
// 界面只管显示。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'
import { diceRoll, type DiceRollResult } from './dice-commands'
import { fillPrompts, parsePrompts, rowIndexOf, splitFormulas, type PromptSpec, type RollCell } from '../../table-roll'

export interface TableFormulaOption { formula: string; prompts: PromptSpec[] }

export interface InlineRoll { tag: string; text: string; formula: string; total: number; used: Array<{ min: number; max: number; value: number }>; detail: string | null }

export interface TableRollColumn {
  /** 名字生成器每一列的列名；普通表为 null。 */
  label: string | null
  formula: string
  total: number
  used: Array<{ min: number; max: number; value: number }>
  detail: string | null
  rowIndex: number | null
  /** 命中行首格之后的各格原样（作者的单元格，可能是字符串或 {type:'cell'…}）。 */
  cells: unknown[]
}

export type TableRollResult =
  | { status: 'not-rollable' }
  /** 骰式有几种写法，先让玩家选一种（再传 formulaIndex）。 */
  | { status: 'choose'; options: TableFormulaOption[] }
  /** 骰式里有要玩家填的数（再传 promptValues）。 */
  | { status: 'needs-input'; formula: string; prompts: PromptSpec[] }
  | { status: 'complete'; mode: number; nameGenerator: boolean; rolls: TableRollColumn[]; inline: InlineRoll[] }
  | { status: 'missing'; reason: string }
  | { status: 'error'; error: string }

export interface TableRollOptions {
  /** 骰式有几种写法时选哪一种（从 0 起）。 */
  formulaIndex?: number
  /** 要玩家填的数，按出现顺序。 */
  promptValues?: number[]
  /** 已掷好的点数（测试、结算用），按掷骰先后消耗；不给就用作者随机数。 */
  points?: number[]
}

const rowCells = (row: any): any[] => (row?.type === 'row' ? row.row : row)

/** 每一行的行首点数范围。变量骰表（作者模式 2）首行 / 末行的范围延伸到无穷，照作者渲染表格时的做法（render.js 的表格渲染）。 */
function rowRolls(table: any, mode: number): Array<RollCell | null> {
  const rows: any[] = table.rows ?? []
  return rows.map((row, i) => {
    const cells = rowCells(row)
    if (!Array.isArray(cells)) return null
    const converted = A.Renderer.getRollableRow(cells, { isForceInfiniteResults: mode === A.RollerUtil.ROLL_COL_VARIABLE, isFirstRow: i === 0, isLastRow: i === rows.length - 1 })
    return (converted?.[0]?.roll as RollCell | undefined) ?? null
  })
}

/** 表能不能掷、点数落在哪一行（保留原有入口；变量骰表的首 / 末行延伸已处理）。 */
export async function tableRow(table: any, value: number): Promise<{ rollable: boolean; mode: unknown; index: number | null }> {
  await init()
  const mode = A.Renderer.table.getAutoConvertedRollMode(table)
  if (!mode) return { rollable: false, mode, index: null }
  return { rollable: true, mode, index: rowIndexOf(rowRolls(table, mode), value) }
}

/** 表头第一格的骰式（作者把它转成 {@dice …} 标签再交给骰子条目）。 */
function headerFormula(table: any): string | null {
  const metas = A.Renderer.table.getHeaderRowMetas(table)
  const first = metas?.at(-1)?.[0]
  if (typeof first !== 'string') return null
  const full: string = A.RollerUtil.getFullRollCol(first)
  const m = /^\{@dice (?<inner>.*)\}$/s.exec(full)
  if (!m?.groups) return null
  return A.Renderer.utils.getTagEntry('@dice', m.groups.inner)?.toRoll ?? null
}

/** 一格（可能嵌套）里的字符串。 */
function stringsOf(x: any, out: string[] = []): string[] {
  if (typeof x === 'string') out.push(x)
  else if (Array.isArray(x)) x.forEach((y) => stringsOf(y, out))
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => stringsOf(y, out))
  return out
}

/** 命中行里的行内骰子标签（{@dice} {@damage} {@hit} {@d20} …）：作者的 getTagEntry 认得且给出骰式的才算。 */
function inlineDice(cells: unknown[]): Array<{ tag: string; text: string; formula: string }> {
  const out: Array<{ tag: string; text: string; formula: string }> = []
  for (const s of stringsOf(cells)) {
    for (const m of s.matchAll(/\{@(\w+) ([^}]*)\}/g)) {
      try {
        const entry = A.Renderer.utils.getTagEntry(`@${m[1]}`, m[2])
        if (typeof entry?.toRoll === 'string' && !/#\$prompt/.test(entry.toRoll)) out.push({ tag: `@${m[1]}`, text: m[2], formula: entry.toRoll })
      } catch {
        // 作者不把这个标签当骰子（例如 {@creature}），跳过
      }
    }
  }
  return out
}

const plain = (s: string): string => s.replace(/<[^>]+>/g, '')

/**
 * 掷一张表。步骤全照作者：表头骰式 →（有几种写法先选、有占位符先填）→ 掷 → 点数找行 → 命中行里的行内骰子也掷。
 * 名字生成器表（作者标 isNameGenerator）每一列各掷一次。
 */
export async function tableRoll(table: any, opts: TableRollOptions = {}): Promise<TableRollResult> {
  await init()
  const mode = A.Renderer.table.getAutoConvertedRollMode(table)
  if (!mode) return { status: 'not-rollable' }
  const toRoll = headerFormula(table)
  if (!toRoll) return { status: 'not-rollable' }
  const source: string = A.Renderer.dice.RE_PROMPT.source
  const options = splitFormulas(toRoll).map((formula) => ({ formula, prompts: parsePrompts(formula, source) }))
  if (options.length > 1 && opts.formulaIndex === undefined) return { status: 'choose', options }
  const chosen = options[opts.formulaIndex ?? 0]
  if (!chosen) return { status: 'error', error: `没有第 ${opts.formulaIndex} 种骰式` }
  let formula = chosen.formula
  if (chosen.prompts.length) {
    if (!opts.promptValues) return { status: 'needs-input', formula, prompts: chosen.prompts }
    try {
      formula = fillPrompts(formula, opts.promptValues, source)
    } catch (e) {
      return { status: 'error', error: e instanceof Error ? e.message : String(e) }
    }
  }
  const rolls = rowRolls(table, mode)
  const nameGenerator = !!table.isNameGenerator
  const metas = A.Renderer.table.getHeaderRowMetas(table)
  const columns = nameGenerator ? (metas?.at(-1)?.length ?? 1) - 1 : 1
  let queue = opts.points ? [...opts.points] : undefined
  const roll = async (f: string): Promise<DiceRollResult> => {
    const r = await diceRoll(f, queue)
    if (queue && r.status === 'complete') queue = queue.slice(r.used.length)
    return r
  }
  const out: TableRollColumn[] = []
  for (let i = 0; i < columns; i++) {
    const r = await roll(formula)
    if (r.status === 'missing') return { status: 'missing', reason: `已给的骰点不够，还要一颗 d${r.missing.dice.max}` }
    if (r.status !== 'complete') return { status: 'error', error: r.status === 'unsupported' ? r.reason : r.status === 'error' ? r.error : '掷骰失败' }
    const rowIndex = rowIndexOf(rolls, r.total)
    const cells = rowIndex === null ? [] : (rowCells((table.rows ?? [])[rowIndex]) as unknown[]).slice(1)
    out.push({ label: nameGenerator ? plain(String(metas.at(-1)[i + 1] ?? '')) : null, formula, total: r.total, used: r.used, detail: r.text, rowIndex, cells: nameGenerator ? [cells[i]].filter((c) => c !== undefined) : cells })
  }
  const inline: InlineRoll[] = []
  for (const col of out) {
    for (const d of inlineDice(col.cells)) {
      const r = await roll(d.formula)
      if (r.status === 'missing') return { status: 'missing', reason: `已给的骰点不够，还要一颗 d${r.missing.dice.max}` }
      if (r.status === 'complete') inline.push({ ...d, total: r.total, used: r.used, detail: r.text })
    }
  }
  return { status: 'complete', mode, nameGenerator, rolls: out, inline }
}
