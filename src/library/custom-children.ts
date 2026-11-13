// P5.5 §16.10 2c：从属条目在主条目里编辑（新建列表只列主条目）。哪些类别是谁的从属由 entryTypes 的 kind / parent 给（entry-kinds.ts）；
// 包里哪几条属于这一条、主条目引用表怎么同步在小窗（child-commands.ts）。
import { blankEntry, type EntryType } from './custom-new'
import { docIdOf } from './custom-packs'
import { formatOfCodeSet } from './formats'
import type { AuthorFrame } from './runtime/host'

export interface ChildGroup {
  prop: string
  /** 这一类的显示名（子职、职业特性……）。 */
  name: string
  items: Array<{ name: string; hash: string | null; uniqueId: string | null; level: number | null }>
}

export interface ChildDeps {
  frame: (codeSet: string) => Promise<AuthorFrame>
  types: (codeSet: string) => Promise<EntryType[]>
}

/** 包里属于这一条（parent，prop 类）的从属条目，按从属类别分组（这一类没有从属类别 = 空）。 */
export async function childrenOf(d: ChildDeps, codeSet: string, packId: string, prop: string, parent: Record<string, unknown>): Promise<ChildGroup[]> {
  const kids = (await d.types(codeSet)).filter((t) => t.kind === 'child' && t.parent === prop)
  if (!kids.length) return []
  const f = await d.frame(codeSet)
  const got = (await f.call('packChildren', await docIdOf(f, packId), prop, parent, kids.map((k) => k.prop))) as Record<string, ChildGroup['items']>
  return kids.map((k) => ({ prop: k.prop, name: k.name, items: got[k.prop] ?? [] }))
}

/**
 * 新从属条目的起点：空白条目 + 指向主条目的字段（「主类别名 + Name / ShortName / Source」）照主条目填；
 * 指向更上一层的（子职特性的 className）照主条目自己的同名字段填。
 */
export async function childStart(codeSet: string, childProp: string, parentProp: string, parent: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const [blank, table] = await Promise.all([blankEntry(codeSet, childProp), formatOfCodeSet(codeSet).fields(childProp)])
  if (!blank || !table) return null
  const out: Record<string, unknown> = { ...blank }
  for (const f of table.fields) {
    const m = /^(\w+?)(ShortName|Name|Source)$/.exec(f.name)
    if (!m) continue
    const v = m[1] === parentProp
      ? (m[2] === 'Source' ? parent.source : m[2] === 'ShortName' ? parent.shortName ?? parent.name : parent.name)
      : parent[f.name]
    if (v !== undefined && v !== null && v !== '') out[f.name] = v
  }
  return out
}
