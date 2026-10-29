import { INLINE_MARKUP } from '../../schemas/text'

export type Segment = { kind: 'text'; text: string } | { kind: 'ref'; id: string; text: string } | { kind: 'mark'; mark: string; text: string }

/** 行内标记 {{种类:参数|显示文字}} → 片段：ref 是可点的关联术语，其余只显示文字。 */
export function parseInline(input: string): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of input.matchAll(new RegExp(INLINE_MARKUP.source, 'g'))) {
    if (m.index! > last) out.push({ kind: 'text', text: input.slice(last, m.index) })
    const arg = m[2].replace(/\\\|/g, '|')
    const text = m[3] ?? arg
    out.push(m[1] === 'ref' ? { kind: 'ref', id: arg, text } : { kind: 'mark', mark: m[1], text })
    last = m.index! + m[0].length
  }
  if (last < input.length) out.push({ kind: 'text', text: input.slice(last) })
  return out
}
