// 变体 / 版本挂在母条目旁边显示（P5 B-33）。
// 作者加载器会把一条的变体展开成独立条目：_versions（版本）、亚种、魔法变体。母条目由作者写在生成条目上的出处字段给出，
// 判断规则与中英配对共用（english-generated.ts，不写类别清单）。这里只做反查：这一条有哪些变体、这一条自己是谁的变体。
// 职业 / 子职特性的变体（isClassFeatureVariant）作者已把它排在被替换的特性紧后面，数据里本来就有，不需要这里处理。
import { generated, type Gen, type Kind } from './english-generated'
import type { ParsedProp } from './runtime/frame/commands'

export interface VariantLink {
  hash: string
  kind: Kind
  source: string | null
  item: unknown
}

export interface VariantLinks {
  /** 这一条自己是变体时，它的母条目编号。 */
  parent: string | null
  /** 这一条有哪些变体（按解析结果里的先后）。 */
  variants: VariantLink[]
}

const cache = new WeakMap<ParsedProp, { byMother: Map<string, Gen[]>; byHash: Map<string, Gen> }>()

function indexOf(list: ParsedProp) {
  let idx = cache.get(list)
  if (!idx) {
    const gens = generated(list, (h) => h)
    const byMother = new Map<string, Gen[]>()
    for (const g of gens) byMother.set(g.mother, [...(byMother.get(g.mother) ?? []), g])
    idx = { byMother, byHash: new Map(gens.map((g) => [g.hash, g])) }
    cache.set(list, idx)
  }
  return idx
}

export function variantLinks(list: ParsedProp, hash: string): VariantLinks {
  const idx = indexOf(list)
  const sourceOf = (h: string): string | null => list.sources[list.hashes.indexOf(h)] ?? null
  return {
    parent: idx.byHash.get(hash)?.mother ?? null,
    variants: (idx.byMother.get(hash) ?? []).map((g) => ({ hash: g.hash, kind: g.kind, source: sourceOf(g.hash), item: g.it })),
  }
}
