export const HAN = /[㐀-䶿一-鿿]/

export function hasHan(value: unknown): boolean {
  if (typeof value === 'string') return HAN.test(value)
  if (Array.isArray(value)) return value.some(hasHan)
  if (value && typeof value === 'object') return Object.values(value).some(hasHan)
  return false
}

const isObj = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)

/** 一个对象是不是文字块（形状要对：`{ table: 'id' }` 这类只是碰巧同名的字段，不算）。 */
function isBlock(item: unknown): boolean {
  if (!isObj(item)) return false
  if (typeof item.p === 'string') return true
  if (typeof item.h === 'string') return Array.isArray(item.body)
  if (Array.isArray(item.list)) return item.list.every((x) => typeof x === 'string')
  if (typeof item.quote === 'string') return true
  if (isObj(item.table)) return Array.isArray((item.table as Record<string, unknown>).rows)
  if (isObj(item.tableRef)) return typeof (item.tableRef as Record<string, unknown>).id === 'string'
  return Array.isArray(item.read)
}

export function isBlocks(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.length > 0 && value.every(isBlock)
}

/** 递归收集块里所有 tableRef 的 id（深度优先、保持顺序）。 */
export function tableRefIds(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) { for (const item of value) tableRefIds(item, out); return out }
  if (!value || typeof value !== 'object') return out
  const rec = value as Record<string, unknown>
  if (rec.tableRef && typeof rec.tableRef === 'object') out.push(String((rec.tableRef as Record<string, unknown>).id))
  for (const child of Object.values(rec)) tableRefIds(child, out)
  return out
}

/** 深拷贝并把 tableRef 的 id 换成映射后的 id（英文表 id → 中文表 id）。 */
export function mapTableRefs<T>(value: T, map: ReadonlyMap<string, string>): T {
  if (Array.isArray(value)) return value.map((item) => mapTableRefs(item, map)) as T
  if (!value || typeof value !== 'object') return value
  const rec = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(rec)) {
    if (key === 'tableRef' && child && typeof child === 'object') { const ref = child as Record<string, unknown>; out[key] = { ...ref, id: map.get(String(ref.id)) ?? ref.id } } else out[key] = mapTableRefs(child, map)
  }
  return out as T
}
