// 随机表掷骰的界面这一侧（后端 tableRoll 在作者小窗里掷；这里只拼"结果文字"和写进酒馆输入框的注释）。
import type { Services } from '../../core/services'
import type { InlineRoll, TableRollColumn, TableRollOptions, TableRollResult } from '../../library/runtime/frame/table-roll-commands'
import { commentFromLine } from '../../rules/dice/format'
import { splitInline, tagLabel } from './inline-text'

export type { TableRollResult, TableRollOptions, TableRollColumn, InlineRoll }

export const tableName = (table: Record<string, unknown>): string => plainOf(table.caption) || plainOf(table.name)
export const resultTitle = (name: string): string => name ? `【随机表 · ${name}】` : '【随机表】'

/** 作者单元格（字符串 / 嵌套对象 / {type:'cell', entry}）里的纯文字：{@标签} 去成显示文字。 */
export function plainOf(x: unknown): string {
  if (typeof x === 'string') return splitInline(x).map((s) => (s.kind === 'text' ? s.text : s.tag === 'hr' ? '' : tagLabel(s.content))).join('').replace(/\s+/g, ' ').trim()
  if (typeof x === 'number') return String(x)
  if (Array.isArray(x)) return x.map(plainOf).filter(Boolean).join(' · ')
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    if ('entry' in o) return plainOf(o.entry)
    if ('entries' in o) return plainOf(o.entries)
    if (o.type === 'image') return plainOf(o.title)
    if (o.type === 'gallery') return plainOf(o.images)
    if ('roll' in o) return ''
    return Object.values(o).map(plainOf).filter(Boolean).join(' ')
  }
  return ''
}

/** 一次掷骰的结果文字：「掷出 5：结果文字」；名字生成器表每列一段；行内骰子接在后面。 */
export function resultText(r: Extract<TableRollResult, { status: 'complete' }>, name?: string): string {
  const cols = r.rolls.map((c) => `${c.label ? `${c.label}：` : ''}${c.rowIndex === null ? '（没有对应的行）' : plainOf(c.cells) || '（空）'}`)
  const head = r.rolls.length === 1 ? `掷出 ${r.rolls[0].total}` : '掷出'
  const inline = r.inline.map((i) => `${i.text} = ${i.total}`)
  return `${name === undefined ? '' : resultTitle(name)}${head}：${cols.join('；')}${inline.length ? `（${inline.join('，')}）` : ''}`
}

/** 写进酒馆输入框的注释（格式沿用骰盘：<!-- [掷骰] 说明：… -->），说明里带表名与结果。 */
export function rollComment(tableName: string, r: Extract<TableRollResult, { status: 'complete' }>): string {
  const formula = r.rolls.map((c) => `${c.formula} = ${c.total}`).join('，')
  return commentFromLine(formula, resultText(r, tableName))
}

/** 交给小窗的对象要能结构化克隆：界面里的响应式代理不行，先转成纯 JSON。 */
const plainJson = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T

export const frameOf = async (s: Services, codeSet: string) => s.backend.library.service.frameOf(codeSet)

/** 这张表能不能掷（作者判定）。 */
export async function isRollable(s: Services, codeSet: string, table: unknown): Promise<boolean> {
  try { return (await (await frameOf(s, codeSet)).call('tableRow', plainJson(table), 1)).rollable } catch (e) { console.error('[trpg-assistant] 判断表能不能掷失败', e); return false }
}

export async function rollTable(s: Services, codeSet: string, table: unknown, opts: TableRollOptions = {}): Promise<TableRollResult> {
  return (await frameOf(s, codeSet)).call('tableRoll', plainJson(table), plainJson(opts))
}
