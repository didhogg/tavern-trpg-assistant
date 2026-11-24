// 人物表格的行与分组：全取 dnd5e 官方角色表的显示数据（只取字段、不算数）。
// 分组照官方：各页 sections 是分组定义（组名、分组键 groups），物品自己的 itemContext.groups 说它属于哪组；
// 换“分组方式”（官方 listControls.grouping，如背包 按类型 / 不分组，特性 按来源 / 按主动被动）= 换用哪个分组键。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明，界面只读字段 */
import type { PersonSheet } from '../../../stores/person'

export interface DocRow {
  id: string; name: string; ref?: unknown; subtitle: string; type: string
  /** 物品原始数据（system 字段）、官方说明标签、官方每件物品的显示上下文（次数、命中、装备态、总重……）。 */
  item: any; labels: any; ctx: any
  children: DocRow[]
}
export interface DocGroup { key: string; label: string; type: string | null; slot: string | null; pips: Array<{ n: number; filled: boolean; label: string }>; usesSlots: boolean; rows: DocRow[]; dataset: any }
export interface ListControls { label: string; sorting: Array<{ key: string; label: string }>; grouping: Array<{ key: string; label: string }>; filters: Array<{ key: string; label: string }> }

const list = <T>(v: unknown): T[] => Array.isArray(v) ? v as T[] : v && typeof v === 'object' ? Object.values(v) as T[] : []
const parts = (s: PersonSheet): Record<string, any> => s.view?.parts ?? {}

/** 某页（inventory / features / spells / actions）的官方列表控件：筛选 / 排序 / 分组选项。 */
export function listControls(s: PersonSheet, part: string): ListControls | null {
  const lc = parts(s)[part]?.listControls
  if (!lc) return null
  const opt = (v: any) => list<any>(v).map((o) => ({ key: String(o.key), label: String(o.label ?? o.key) }))
  return { label: String(lc.label ?? ''), sorting: opt(lc.sorting), grouping: opt(lc.grouping), filters: opt(lc.filters) }
}

/** 一页的分组表。grouping = 分组键（官方 listControls.grouping 的 key；没有分组定义的页按官方 sections 自带的物品）。 */
export function docGroups(s: PersonSheet, part: string, grouping?: string): DocGroup[] {
  const p = parts(s)[part] ?? {}
  const ic: Record<string, any> = s.view?.base?.itemContext ?? {}
  const raw = new Map<string, any>((s.items ?? []).map((i: any) => [i.id, i]))
  const sections = list<any>(p.sections)
  const viewItems = new Map<string, any>()
  for (const sec of sections) for (const it of list<any>(sec.items)) viewItems.set(it.id, it)
  for (const it of list<any>(p.containers)) viewItems.set(it.id, it)
  const row = (id: string): DocRow => {
    const it = viewItems.get(id) ?? {}
    const r = raw.get(id) ?? {}
    return {
      id, name: String(it.name ?? r.name ?? ''), ref: it.ref, subtitle: String(ic[id]?.subtitle ?? ''), type: String(r.type ?? ''),
      item: r, labels: it.labels ?? {}, ctx: ic[id] ?? {},
      // 容器里的东西挂在容器下（Tidy5e InlineContainerView）
      children: part === 'inventory' ? [...viewItems.keys()].filter((k) => raw.get(k)?.system?.container === id).map(row) : [],
    }
  }
  const top = [...viewItems.keys()].filter((k) => !(part === 'inventory' && viewItems.has(raw.get(k)?.system?.container)))
  const head = (sec: any, rows: DocRow[]): DocGroup => ({
    key: String(sec.slot ?? sec.id ?? sec.label), label: String(sec.label ?? ''), type: sec.groups?.type ? String(sec.groups.type) : null,
    slot: sec.usesSlots || sec.slot ? String(sec.slot ?? '') : null, pips: list<any>(sec.pips), usesSlots: !!sec.usesSlots, rows, dataset: sec.dataset ?? {},
  })
  const key = grouping ?? list<any>(p.listControls?.grouping)[0]?.key
  const grouped = key ? sections.filter((sec) => sec.groups && sec.groups[key] !== undefined) : []
  if (grouped.length) {
    return grouped.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
      .map((sec) => head(sec, top.filter((id) => ic[id]?.groups?.[key] === sec.groups[key]).map(row)))
      .filter((g) => g.rows.length)
  }
  // 没有分组定义（法术按环、行动按动作类型）：官方 sections 自带物品
  return sections.map((sec) => head(sec, list<any>(sec.items).map((it) => row(String(it.id))))).filter((g) => g.rows.length || g.usesSlots)
}

/** 所有行（含容器里的）摊平，带缩进层级。 */
export const flatRows = (rows: DocRow[], depth = 0): Array<DocRow & { depth: number; inside: string | null }> =>
  rows.flatMap((r) => [{ ...r, depth, inside: depth ? String(r.item?.system?.container ?? '') || null : null }, ...flatRows(r.children, depth + 1)])

/** 自定义分组（Tidy5e「选分组」；Tidy5e 存在它自己的模块名下，小窗里没装 Tidy5e、写不进它的名下，存我们自己的 flags.tavern-trpg.section）：
 *  有这个名字的行移进同名组，排在官方组后面。 */
export const SECTION_FLAG = 'flags.tavern-trpg.section'
export const sectionOf = (item: any): string => String(item?.flags?.['tavern-trpg']?.section ?? '').trim()
export function withSections(groups: DocGroup[]): DocGroup[] {
  const custom = new Map<string, DocRow[]>()
  const pick = (r: DocRow): string => sectionOf(r.item)
  const kept = groups.map((g) => ({ ...g, rows: g.rows.filter((r) => { const s = pick(r); if (!s) return true; custom.set(s, [...(custom.get(s) ?? []), r]); return false }) }))
  const extra = [...custom].map(([name, rows]): DocGroup => ({ key: `custom:${name}`, label: name, type: null, slot: null, pips: [], usesSlots: false, rows, dataset: {} }))
  return [...kept.filter((g) => g.rows.length || g.usesSlots), ...extra]
}
/** 搜索（名字含这几个字，容器里的也算）+ 官方筛选（passing = 小窗按官方判断交回的通过编号）+ 排序（a = 按名字；其余 = 官方顺序）。只是显示，不改数据。 */
export function refine(groups: DocGroup[], query: string, sort: string, passing: Set<string> | null = null): DocGroup[] {
  const q = query.trim().toLowerCase()
  const hit = (r: DocRow): boolean => ((!q || r.name.toLowerCase().includes(q)) && (!passing || passing.has(r.id))) || r.children.some(hit)
  const order = (rs: DocRow[]): DocRow[] => sort === 'a' ? [...rs].sort((x, y) => x.name.localeCompare(y.name, 'zh-Hans-CN')) : rs
  return groups.map((g) => ({ ...g, rows: order(g.rows.filter(hit)).map((r) => ({ ...r, children: order(r.children) })) })).filter((g) => g.rows.length || (!q && !passing && g.usesSlots))
}
/** 一件物品显示用的名字（官方显示数据里过了中文出口的名字；原始数据的 name 可能是作者英文原名）。 */
export function shownName(s: PersonSheet, id: string): string {
  for (const part of Object.values(parts(s))) {
    for (const sec of list<any>(part?.sections)) for (const it of list<any>(sec.items)) if (it.id === id) return String(it.name ?? '')
    for (const it of list<any>(part?.containers)) if (it.id === id) return String(it.name ?? '')
  }
  return String((s.items ?? []).find((i: any) => i.id === id)?.name ?? '')
}
