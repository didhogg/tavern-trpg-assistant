// 条目正文里的行内标签 {@tag 内容} 的拆分（作者的写法）。拆分是纯字符串处理；标签是链接 / 骰子 / 普通文字，由作者函数判断（见 useTags.ts），这里不猜。
export type InlineSeg = { kind: 'text'; text: string } | { kind: 'tag'; tag: string; content: string }

/** 把一段文字按 {@tag content} 拆开（支持标签里再套标签：括号配平）。没配平的 { 当普通文字。 */
export function splitInline(input: string): InlineSeg[] {
  const out: InlineSeg[] = []
  let text = ''
  const flush = (): void => { if (text) { out.push({ kind: 'text', text }); text = '' } }
  let i = 0
  while (i < input.length) {
    if (input[i] === '{' && input[i + 1] === '@') {
      let depth = 0
      let j = i
      for (; j < input.length; j++) {
        if (input[j] === '{') depth++
        else if (input[j] === '}' && --depth === 0) break
      }
      if (j < input.length) {
        const body = input.slice(i + 2, j)
        const space = body.search(/\s/)
        flush()
        out.push({ kind: 'tag', tag: space < 0 ? body : body.slice(0, space), content: space < 0 ? '' : body.slice(space + 1) })
        i = j + 1
        continue
      }
    }
    text += input[i++]
  }
  flush()
  return out
}

/** 标签内容的显示文字：作者约定 `显示名|来源|…|自定义文字`，没有自定义文字时取第一段。 */
/** 后面的段不是显示文字的标签（{@filter 文字|页面|筛选条件}）：只取第一段。 */
const FIRST_ONLY = new Set(['filter'])

export function tagLabel(content: string, tag = ''): string {
  const parts = content.split('|')
  const custom = parts.length >= 3 && !FIRST_ONLY.has(tag) ? parts[parts.length - 1] : ''
  return (custom || parts[0]).trim()
}

/** 只改样式的行内标签（登记表）：标签名 → HTML 标签。别的标签交给作者函数。 */
export const FORMAT_TAGS: Record<string, string> = {
  b: 'strong', bold: 'strong', i: 'em', italic: 'em', u: 'u', underline: 'u', s: 's', strike: 's', sup: 'sup', sub: 'sub', note: 'em',
}
