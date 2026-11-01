/** 参考读取器的通用小函数。遇到不认识的形状一律抛 ShapeError，绝不静默返回空。 */
export type Rec = Record<string, unknown>

export class ShapeError extends Error {}

export const rec = (v: unknown): Rec => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Rec) : {})
export const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
export const str = (v: unknown): string => (typeof v === 'string' ? v : '')
export const num = (v: unknown): number => (typeof v === 'number' ? v : Number.NaN)
export const strs = (v: unknown): string[] => arr(v).filter((x): x is string => typeof x === 'string')

export function shape(ok: unknown, message: string): asserts ok {
  if (!ok) throw new ShapeError(message)
}

/** 行内引用 `{{ref:条目编号|显示文字}}` 取编号；不是引用返回 undefined。 */
export function refId(text: string): string | undefined {
  return /^\{\{ref:([^|}]+)(?:\|[^}]*)?\}\}$/.exec(text.trim())?.[1]
}

/** 把一段文字里的全部引用编号取出来。 */
export function refsIn(text: string): string[] {
  return [...text.matchAll(/\{\{ref:([^|}]+)(?:\|[^}]*)?\}\}/g)].map((m) => m[1])
}

/** 去掉标点、空格、大小写，用来比较英文名（"Smith's Tools" 与 "smiths-tools" 视为同一个）。 */
export const fold = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '')

export const sorted = <T>(list: T[]): T[] => [...list].sort()
export const uniq = <T>(list: T[]): T[] => [...new Set(list)]
export const sameSet = (a: string[], b: string[]): boolean => a.length === b.length && sorted(a).every((x, i) => x === sorted(b)[i])
