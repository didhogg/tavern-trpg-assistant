// 字段形状（作者结构定义拆出来的控件形状 FieldShape）的两个基础判断：跟着 ref 找真正的形状、一个值是「几种写法」里的哪一种。
// 后端用法统计（field-usage.ts）和界面表单（ui/libview/field-shape.ts）共用这一份。只看形状，不写字段名单。
import type { FieldShape } from './brew-validate'

export type Shape = Exclude<FieldShape, { ref: string }>
export type Defs = Record<string, FieldShape>

/** 作者表格和职业进度表共用列标题。返回其原字段名和格子允许的基本值。 */
export function gridFields(fields: ReadonlyArray<{ name: string; shape?: FieldShape }>, defs: Defs) {
  if (!fields.some((f) => f.name === 'colLabels')) return null
  const rows = fields.find((f) => f.name === 'rows' || f.name === 'rowsSpellProgression')
  if (!rows?.shape) return null
  const outer = resolve(rows.shape, defs)
  if (outer.c !== 'list') return null
  const inner = resolve(outer.of, defs)
  const row = inner.c === 'pick' ? inner.branches.map((b) => resolve(b.shape, defs)).find((b) => b.c === 'list') : inner
  if (row?.c !== 'list') return null
  return { rows: rows.name, numeric: resolve(row.of, defs).c === 'number' }
}

/** 跟着 { ref } 找到真正的形状；找不到（或绕圈）就当作「画不了」。 */
export function resolve(shape: FieldShape, defs: Defs): Shape {
  let s = shape
  for (let i = 0; i < 8 && 'ref' in s; i++) s = defs[s.ref] ?? { c: 'json', why: `找不到结构 ${s.ref}` }
  return 'ref' in s ? { c: 'json', why: '结构套得太深' } : s
}

/** 这个值是哪一种写法（几种写法任选时）。按值的样子对：文字 / 数字 / 开关 / 列表 / 一组（看有没有那一种的字段）。 */
export function branchOf(s: Extract<Shape, { c: 'pick' }>, value: unknown, defs: Defs): number {
  if (value === undefined) return 0
  const fits = (b: FieldShape): boolean => {
    const r = resolve(b, defs)
    if (typeof value === 'string') return r.c === 'text' || r.c === 'entries' || (r.c === 'select' && r.enum.includes(value))
    if (typeof value === 'number') return r.c === 'number' || (r.c === 'select' && r.enum.includes(value))
    if (typeof value === 'boolean') return r.c === 'switch' || r.c === 'const'
    if (Array.isArray(value)) return r.c === 'list' || r.c === 'multiselect'
    if (value && typeof value === 'object') return r.c === 'group' || r.c === 'map' || r.c === 'json'
    return false
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const scores = s.branches.map((b) => fits(b.shape) ? b.keys.filter((k) => k in value).length : 0)
    const best = Math.max(...scores)
    if (best) return scores.indexOf(best)
  }
  const i = s.branches.findIndex((b) => fits(b.shape))
  return i >= 0 ? i : 0
}
