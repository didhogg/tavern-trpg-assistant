// P5.5 表单：按后端字段表给的控件形状（FieldShape，作者结构定义拆出来的）画控件时要的小工具。
// 只看形状决定「画成什么、新加一行放什么空值」，不写任何字段名单。
import type { FieldShape } from '../../library/brew-validate'
import { branchOf, resolve, type Defs, type Shape } from '../../library/field-shape-core'

export { branchOf, resolve }
export type { Defs, Shape }

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
