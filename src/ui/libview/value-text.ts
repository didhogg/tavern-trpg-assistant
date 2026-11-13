// 「改了什么」列表里一个值的简短写法：文字截短、数字照写、几项写「n 项」、一组写「一组」、删掉写「（删掉）」。只排版。
export function valueText(v: unknown): string {
  if (v === undefined) return '（没有）'
  if (v === null) return '（删掉）'
  if (typeof v === 'string') return v.length > 40 ? `${v.slice(0, 40)}…` : v || '（空）'
  if (typeof v === 'number' || typeof v === 'boolean') return v === true ? '是' : v === false ? '否' : String(v)
  if (Array.isArray(v)) return v.length === 1 && typeof v[0] !== 'object' ? valueText(v[0]) : `${v.length} 项`
  return '一组'
}
