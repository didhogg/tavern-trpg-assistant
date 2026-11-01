type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

export interface StructuralRef { field: string; id: string }

/** 起始装备块（fixed / choice）里每个物品项的 `id`。 */
function startingIds(block: Rec, push: (id: string) => void): void {
  const items = [...(Array.isArray(block.fixed) ? block.fixed : []), ...(Array.isArray(block.choice) ? block.choice.flat() : [])]
  for (const item of items) if (isObj(item) && typeof item.id === 'string' && ID.test(item.id) && item.id.includes('.')) push(item.id)
}

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
  // 这些字段的值是条目编号（或编号数组）：只取字符串，不往对象里钻（怪物的 traits 是对象列表，里面的 id 是行动编号，不是条目引用）
  for (const key of ['variantOf', 'baseItem', 'target', 'classId', 'parentRace', 'feature', 'traits', 'members']) for (const id of Array.isArray(data[key]) ? data[key] as unknown[] : [data[key]]) if (typeof id === 'string' && ID.test(id) && id.includes('.')) out.push({ field: key, id })
  // 展开法术与表格行里的引用是「软」的：目标不在依赖里时构建把它们剪掉，不算依赖
  if (mode === 'all') add('expandedSpells', data.expandedSpells)
  add('owner.id', isObj(data.owner) ? data.owner.id : undefined)
  for (const c of Array.isArray(data.characteristics) ? data.characteristics : []) add('characteristics[].table', isObj(c) ? c.table : undefined)
  for (const j of Array.isArray(data.joins) ? data.joins : []) if (isObj(j)) { add('joins[].to', j.to); add('joins[].replaces', j.replaces); add('joins[].pool', j.pool); add('joins[].spells[]', j.spells) }
  add('characteristicsFrom', data.characteristicsFrom)
  if (isObj(data.consumes)) add('consumes.pool', data.consumes.pool)
  for (const r of Array.isArray(data.restores) ? data.restores : []) if (isObj(r)) add('restores[].pool', r.pool)
  if (isObj(data.summon)) add('summon.classId', data.summon.classId)
  for (const key of ['startingEquipment', 'equipment']) for (const block of Array.isArray(data[key]) ? data[key] as unknown[] : []) if (isObj(block)) startingIds(block, (id) => out.push({ field: `${key}[].id`, id }))
  for (const c of Array.isArray(data.contents) ? data.contents : []) add('contents[].item', isObj(c) ? c.item : undefined)
  for (const choice of Array.isArray(data.contentsChoice) ? data.contentsChoice : []) for (const x of isObj(choice) && Array.isArray(choice.from) ? choice.from : []) add('contentsChoice[].from[].item', isObj(x) ? x.item : undefined)
  for (const step of Array.isArray(data.advancement) ? data.advancement : []) if (isObj(step)) { add('advancement[].items[]', step.items); add('advancement[].pool[]', step.pool); add('advancement[].explain', step.explain); add('advancement[].replaces', step.replaces) }
  if (isObj(data.requires)) for (const key of ['race', 'class', 'feature', 'spell', 'patron']) add(`requires.${key}`, data.requires[key])
  for (const effect of Array.isArray(data.effects) ? data.effects : []) if (isObj(effect) && effect.kind === 'spellGrant') add('effects[].spells[]', effect.spells)
  for (const id of tableRefs(data)) out.push({ field: 'text.tableRef', id })
  if (mode === 'all') for (const row of Array.isArray(data.rows) ? data.rows : []) if (isObj(row)) add('rows[].refs[]', row.refs)
  return out
}
