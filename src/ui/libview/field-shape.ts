// P5.5 表单：按后端字段表给的控件形状（FieldShape，作者结构定义拆出来的）画控件时要的小工具。
// 只看形状决定「画成什么、新加一行放什么空值」，不写任何字段名单。
import type { FieldShape } from '../../library/brew-validate'

export type Shape = Exclude<FieldShape, { ref: string }>
export type Defs = Record<string, FieldShape>

/** 跟着 { ref } 找到真正的形状；找不到（或绕圈）就当作「画不了」。 */
export function resolve(shape: FieldShape, defs: Defs): Shape {
  let s = shape
  for (let i = 0; i < 8 && 'ref' in s; i++) s = defs[s.ref] ?? { c: 'json', why: `找不到结构 ${s.ref}` }
  return 'ref' in s ? { c: 'json', why: '结构套得太深' } : s
}

/** 新加一项时的空值（按形状）。 */
export function emptyOf(shape: FieldShape, defs: Defs): unknown {
  const s = resolve(shape, defs)
  switch (s.c) {
    case 'number': return 0
    case 'switch': return false
    case 'select': return s.enum[0]
    case 'multiselect': case 'list': return []
    case 'group': case 'map': return {}
    case 'const': return s.value
    case 'pick': return s.branches[0] ? emptyOf(s.branches[0].shape, defs) : ''
    default: return ''
  }
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

const KIND: Record<string, string> = { text: '文字', number: '数字', switch: '是 / 否', select: '选一个', multiselect: '选几个', list: '好几项', map: '名字 → 值', group: '一组', const: '固定值', entries: '正文', json: 'JSON', pick: '几种写法' }
/** 一种写法的简短叫法（「写法：文字 / 一组」切换按钮上用）。 */
export const kindName = (shape: FieldShape, defs: Defs): string => KIND[resolve(shape, defs).c] ?? '其他'

/** 值算不算「空」（表单分「已填 / 更多选项」、只填空着的用）。 */
export function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}
