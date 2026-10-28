import type { RollResult } from './roll'

const MODE_LABEL = { normal: '', adv: ' 优势', dis: ' 劣势' } as const

/** 明细：每颗骰子的点数与常数，如「12 + 5」「取高 12/7 + 5」「4 + 2 + 3」。 */
export function detailText(result: RollResult): string {
  const parts = result.terms.map((t, i) => {
    const sign = t.term.sign === -1 ? '- ' : i === 0 ? '' : '+ '
    if (t.term.kind === 'const') return `${sign}${t.term.value}`
    if (t.kept !== undefined) return `${sign}取${result.mode === 'adv' ? '高' : '低'} ${t.rolls.join('/')}`
    return `${sign}${t.rolls.join(' + ')}`
  })
  return parts.join(' ')
}

/** 一行文字：`1d20+5 优势 = 17（取高 12/7 + 5）`。 */
export function lineText(result: RollResult): string {
  return `${result.expression}${MODE_LABEL[result.mode]} = ${result.total}（${detailText(result)}）`
}

/** 写进酒馆输入框的注释；说明里的连续短横线会被替换，避免提前结束注释。 */
export function commentFromLine(line: string, note: string): string {
  const cleaned = note.trim().replace(/-{2,}/g, '—').replace(/[<>]/g, '')
  return `<!-- [掷骰] ${cleaned ? `${cleaned}：` : ''}${line} -->`
}

export function commentText(result: RollResult, note: string): string {
  return commentFromLine(lineText(result), note)
}
