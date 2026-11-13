// P5.5 编辑器里的 JSON 文字 ⇄ 条目：解析、把结构检查的错误（JSON 指针）换成这段文字里的行号。只做显示用的换算，检查本身是后端 custom.validateEntry。
import { parse } from 'json-source-map'
import type { SchemaIssue } from '../../library/brew-validate'
import type { JsonIssue } from './JsonBox.vue'

export type Ent = Record<string, unknown>

export const toText = (ent: Ent): string => JSON.stringify(ent, null, 2)

/** 文字 → 一条条目；不是合法 JSON、或不是一个对象时给出错的行。 */
export function fromText(text: string): { ok: true; ent: Ent; pointers: Record<string, { value: { line: number } }> } | { ok: false; issue: JsonIssue } {
  try {
    const { data, pointers } = parse(text)
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, issue: { line: 1, text: '要粘贴的是一整条条目：用 { } 包起来的一个对象' } }
    return { ok: true, ent: data as Ent, pointers }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    const at = /position (\d+)/.exec(message)
    const line = at ? text.slice(0, Number(at[1])).split('\n').length : 1
    return { ok: false, issue: { line, text: `不是合法的 JSON：${message}` } }
  }
}

/** 后端的结构问题（路径 /prop/0/字段…）→ 这段文字里的行号（找不到精确位置就退到最近的上一层）。 */
export function issueLines(pointers: Record<string, { value: { line: number } }>, prop: string, issues: SchemaIssue[]): JsonIssue[] {
  const head = `/${prop}/0`
  return issues.map((i) => {
    let p = i.path.startsWith(head) ? i.path.slice(head.length) : i.path
    while (p && !pointers[p]) p = p.slice(0, p.lastIndexOf('/'))
    return { line: (pointers[p]?.value.line ?? 0) + 1, text: i.text }
  })
}
