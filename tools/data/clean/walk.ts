type Rec = Record<string, unknown>

export const isObj = (value: unknown): value is Rec => !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * 就地遍历所有字符串叶子；回调返回新字符串则替换并计一处，返回 undefined 表示不改。
 * 路径用 `.` 连接键与数组下标，与 R13 的 fields 路径一致。
 */
export function mapStrings(root: unknown, fn: (value: string, path: string) => string | undefined, path = ''): number {
  let changed = 0
  if (Array.isArray(root)) {
    root.forEach((item, index) => {
      const here = path ? `${path}.${index}` : String(index)
      if (typeof item === 'string') { const next = fn(item, here); if (next !== undefined && next !== item) { root[index] = next; changed++ } } else changed += mapStrings(item, fn, here)
    })
  } else if (isObj(root)) {
    for (const [key, item] of Object.entries(root)) {
      const here = path ? `${path}.${key}` : key
      if (typeof item === 'string') { const next = fn(item, here); if (next !== undefined && next !== item) { root[key] = next; changed++ } } else changed += mapStrings(item, fn, here)
    }
  }
  return changed
}

const BLOCK_KEYS = ['p', 'h', 'list', 'quote', 'table', 'tableRef', 'read']
export const looksLikeBlocks = (value: unknown): value is Rec[] => Array.isArray(value) && value.length > 0 && value.every((item) => isObj(item) && BLOCK_KEYS.some((key) => key in item))

/** 受保护片段：`{{…}}` 标记、`<$…$>` 记号、网址；规则只处理它们之外的普通文字。 */
const PROTECTED = /\{\{[^{}]*\}\}|<\$[^$]*\$>|https?:\/\/[^\s)）]+/g

export function mapPlain(text: string, fn: (plain: string) => string): string {
  let out = ''
  let last = 0
  for (const match of text.matchAll(PROTECTED)) {
    out += fn(text.slice(last, match.index)) + match[0]
    last = match.index + match[0].length
  }
  return out + fn(text.slice(last))
}
