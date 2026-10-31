type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

export interface StructuralRef { field: string; id: string }

const ID = /^[a-z]+[a-z0-9.-]*$/
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') { if (ID.test(value) && value.includes('.')) out.push(value) } else if (Array.isArray(value)) for (const x of value) strings(x, out)
  else if (isObj(value)) for (const x of Object.values(value)) strings(x, out)
  return out
}
function tableRefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) { for (const item of value) tableRefs(item, out); return out }
  if (isObj(value)) { if (isObj(value.tableRef) && typeof value.tableRef.id === 'string') out.push(value.tableRef.id); for (const x of Object.values(value)) tableRefs(x, out) }
  return out
}

/**
 * 一个条目的「结构引用」：条目数据里指向别的条目的全部字段（不含正文里的行内 {{ref:}}、不含 supersededBy 这类允许指向更高层的标记）。
 * mode='dependency' 只给硬引用（推导包依赖用）；'all' 还包括会被剪掉的软引用（校验用）。
 * 构建时用它推导包依赖、校验引用；安装时用它校验引用（同一个函数，官方包与自制包一视同仁）。
 */
export function structuralRefs(data: Rec, mode: 'all' | 'dependency' = 'all'): StructuralRef[] {
  const out: StructuralRef[] = []
  const add = (field: string, value: unknown): void => { for (const id of strings(value)) out.push({ field, id }) }
  for (const key of ['variantOf', 'baseItem', 'target', 'classId', 'parentRace', 'feature', 'traits', 'members']) add(key, data[key])
  // 展开法术与表格行里的引用是「软」的：目标不在依赖里时构建把它们剪掉，不算依赖
  if (mode === 'all') add('expandedSpells', data.expandedSpells)
  add('owner.id', isObj(data.owner) ? data.owner.id : undefined)
  for (const c of Array.isArray(data.characteristics) ? data.characteristics : []) add('characteristics[].table', isObj(c) ? c.table : undefined)
  for (const j of Array.isArray(data.joins) ? data.joins : []) if (isObj(j)) { add('joins[].to', j.to); add('joins[].replaces', j.replaces); add('joins[].pool', j.pool) }
  for (const c of Array.isArray(data.contents) ? data.contents : []) add('contents[].item', isObj(c) ? c.item : undefined)
  for (const choice of Array.isArray(data.contentsChoice) ? data.contentsChoice : []) for (const x of isObj(choice) && Array.isArray(choice.from) ? choice.from : []) add('contentsChoice[].from[].item', isObj(x) ? x.item : undefined)
  for (const step of Array.isArray(data.advancement) ? data.advancement : []) if (isObj(step)) { add('advancement[].items[]', step.items); add('advancement[].pool[]', step.pool); add('advancement[].explain', step.explain); add('advancement[].replaces', step.replaces) }
  if (isObj(data.requires)) for (const key of ['race', 'class', 'feature', 'spell', 'patron']) add(`requires.${key}`, data.requires[key])
  for (const effect of Array.isArray(data.effects) ? data.effects : []) if (isObj(effect) && effect.kind === 'spellGrant') add('effects[].spells[]', effect.spells)
  for (const id of tableRefs(data)) out.push({ field: 'text.tableRef', id })
  if (mode === 'all') for (const row of Array.isArray(data.rows) ? data.rows : []) if (isObj(row)) add('rows[].refs[]', row.refs)
  return out
}
