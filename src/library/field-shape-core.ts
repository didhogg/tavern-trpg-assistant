// 字段形状（作者结构定义拆出来的控件形状 FieldShape）的两个基础判断：跟着 ref 找真正的形状、一个值是「几种写法」里的哪一种。
// 后端用法统计（field-usage.ts）和界面表单（ui/libview/field-shape.ts）共用这一份。只看形状，不写字段名单。
import type { FieldShape } from './brew-validate'

export type Shape = Exclude<FieldShape, { ref: string }>
export type Defs = Record<string, FieldShape>

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
  const byKeys = s.branches.findIndex((b) => b.keys.length && value && typeof value === 'object' && b.keys.some((k) => k in (value as object)) && fits(b.shape))
  if (byKeys >= 0) return byKeys
  const i = s.branches.findIndex((b) => fits(b.shape))
  return i >= 0 ? i : 0
}
