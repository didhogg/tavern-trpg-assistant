// 小窗交回的东西统一按作者编号起名（一个出口，不分类型、不分命令）：
// 作者编号（与 Plutonium 写进物品的 flags 同形）→ refMapperFor（存档用的同一个，官方 / 自制都认）
// → 本战役【库】里看得见的这一条 → 它在本战役语言里的名字。
// 对不上（库里没有、本战役看不见）→ null，调用方按自己的规则处理（显示原名，或当作看不见去掉）。
import type { KernelRef } from '../../schemas/kernel'
import type { KernelRefFlags, KernelRefMapper } from '../../core/saves/split'
import type { CampaignLibrary } from '../../library/scopes'
import type { ScopedLibrary } from '../../library/scoped'
import { refMapperFor } from './rebuild'

export interface Named { ref: KernelRef; label: string }
export type Namer = (id: KernelRefFlags) => Promise<Named | null>

type Row = { ref: { set: string; prop: string; hash: string }; item?: unknown }
const keyOf = (r: { set: string; prop: string; hash: string }): string => `${r.set}|${r.prop}|${r.hash}`

/** rowsOf：本战役看得见的某一类条目（战役范围的查询）；每类只查一次。 */
export function namerOf(mapper: KernelRefMapper, rowsOf: (prop: string) => Promise<Row[]>): Namer {
  const byProp = new Map<string, Promise<Map<string, string>>>()
  const names = (prop: string) => {
    let got = byProp.get(prop)
    if (!got) {
      got = rowsOf(prop).then((rows) => new Map(rows.map((r) => [keyOf(r.ref), String((r.item as { name?: unknown } | undefined)?.name ?? '')])))
      byProp.set(prop, got)
    }
    return got
  }
  return async (id) => {
    const ref = mapper(id)
    if (!ref) return null
    const label = (await names(ref.prop)).get(keyOf(ref))
    return label === undefined ? null : { ref, label }
  }
}

/** 本战役的起名器。 */
export async function namerFor(scoped: ScopedLibrary, library: CampaignLibrary): Promise<Namer> {
  return namerOf(await refMapperFor(scoped, library), (prop) => scoped.query(library, prop) as Promise<Row[]>)
}

const isId = (v: unknown): v is KernelRefFlags => !!v && typeof v === 'object' && typeof (v as KernelRefFlags).hash === 'string'

/** 整棵结果里带作者编号（author 字段）的节点：label 换成库里的名字、补上 ref；对不上的原样留着。 */
export async function nameAll<T>(value: T, namer: Namer): Promise<T> {
  const walk = async (node: unknown): Promise<unknown> => {
    if (Array.isArray(node)) return Promise.all(node.map(walk))
    if (!node || typeof node !== 'object') return node
    const src = node as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(src)) out[k] = k === 'author' ? v : await walk(v)
    if (isId(src.author)) {
      const named = await namer(src.author)
      if (named) { out.label = named.label; out.ref = named.ref }
    }
    return out
  }
  return walk(value) as Promise<T>
}
