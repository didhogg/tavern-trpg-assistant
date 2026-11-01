import type { Entry } from '../../../src/schemas/pack'
import { TABLE_OWNERS, type OwnerRule } from '../config/tableOwners'
import type { PackLike } from './variantLists'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
interface Spot { anchor?: string; heading: string[]; order: number }

/** 走一遍书条目的正文：每个 tableRef 在书里的位置＝一路上的小标题（带锚点）＋同一小节里的顺序。 */
function spots(book: Entry): Map<string, Spot> {
  const out = new Map<string, Spot>()
  const walk = (blocks: unknown, stack: Array<{ h: string; anchor?: string }>): void => {
    if (!Array.isArray(blocks)) return
    let order = 0
    for (const b of blocks) {
      if (!isObj(b)) continue
      if (isObj(b.tableRef) && typeof b.tableRef.id === 'string' && !out.has(b.tableRef.id)) {
        order++
        const deepest = [...stack].reverse().find((s) => s.anchor)
        out.set(b.tableRef.id, { ...(deepest?.anchor ? { anchor: deepest.anchor } : {}), heading: stack.map((s) => s.h), order })
      }
      if (typeof b.h === 'string' && Array.isArray(b.body)) walk(b.body, [...stack, { h: b.h, ...(typeof b.anchor === 'string' ? { anchor: b.anchor } : {}) }])
    }
  }
  walk(book.data.text, [])
  return out
}

const owned = (e: Entry): boolean => ['monster', 'race', 'subrace'].includes(e.type) && !e.id.endsWith('.mpmm')

function resolve(rule: OwnerRule, all: Entry[]): string[] {
  const ids = new Set<string>()
  for (const spec of rule.ids) {
    if (typeof spec === 'string') { if (all.some((e) => e.id === spec)) ids.add(spec) }
    else for (const e of all) if (owned(e) && spec.test(e.id)) ids.add(e.id)
  }
  if (!ids.size) throw new Error(`表格归属字典「${rule.book}·${rule.key}」没有命中任何条目`)
  return [...ids]
}

/**
 * G2.5 P4：表格绑定到条目。
 * ①每张出现在书籍章节里的表记下书里的原位置 `at`（锚点、小标题路径、同一小节里的顺序）；
 * ②还没有主人的表，按字典（章节标题或表名 → 条目）写 `parent`（主要的一个）和 `parent.appliesTo`（也适用的其余）。
 * 跨包是软引用：表在自己的包里登记，不去改别的包的条目。
 */
export function addTableBindings(packs: PackLike[]): { positioned: number; bound: number } {
  const all = packs.flatMap((p) => p.entries)
  const tables = new Map(all.filter((e) => e.type === 'table').map((e) => [e.id, e]))
  const rules = TABLE_OWNERS.map((r) => ({ rule: r, owners: resolve(r, all) }))
  let positioned = 0, bound = 0
  for (const book of all.filter((e) => e.type === 'book')) {
    const bookCode = String((book.data.src as { book?: string } | undefined)?.book ?? book.data.book ?? '').toUpperCase()
    for (const [id, spot] of spots(book)) {
      const t = tables.get(id)
      if (!t || isObj(t.data.at)) continue
      t.data.at = spot
      positioned++
      if (isObj(t.data.parent)) continue
      const hit = rules.find(({ rule }) => rule.book === bookCode && rule.by === 'section' && spot.heading.includes(rule.key))
      if (!hit) continue
      const [primary, ...rest] = hit.owners
      t.data.parent = { id: primary, ...(rest.length ? { appliesTo: rest } : {}) }
      bound++
    }
  }
  for (const { rule, owners } of rules.filter((r) => r.rule.by === 'name')) {
    for (const t of tables.values()) {
      if (isObj(t.data.parent) || !isObj(t.data.src) || String(t.data.src.book).toUpperCase() !== rule.book || t.name !== rule.key) continue
      const [primary, ...rest] = owners
      t.data.parent = { id: primary, ...(rest.length ? { appliesTo: rest } : {}) }
      bound++
    }
  }
  return { positioned, bound }
}
