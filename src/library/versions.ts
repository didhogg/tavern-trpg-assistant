// 备选版本与生效版本（D2-P3 整体设计 §2.3、§2.4）。
// 同编号的条目（两个自制包撞编号、自制包写了官方编号）和自己写的房规，都挂在原条目下当"备选"；
// 原件照常生效，用户选了才换。选择分三层：本战役 > 当前规则 > 全局；都没选 = 原件。
// 这里只有纯逻辑：找同编号、按选择定生效版本。条目对象由【库】交来，不改。
import type { EntryRef } from './scopes'

export interface DocIndex {
  docIdLocal: string
  filename: string | null
  /** 作者包头的加入时间：先装的算"原来的"。同一次导入的几个包时间相同（同一毫秒），再按 order。 */
  timeAdded: number
  /** 在作者存储里的先后（作者按加入顺序往后排）。 */
  order: number
  isEditable: boolean
  /** 类别 → 包里每一条的作者编号（原始文件直接算，不经加载器）。 */
  props: Record<string, Array<string | null>>
}

export interface Collision {
  prop: string
  hash: string
  /** 原来生效的：官方（official）或先装的那个包。 */
  base: { kind: 'official' } | { kind: 'doc'; docIdLocal: string }
  /** 后来的、挂成备选的包。 */
  others: string[]
}

/** 找同编号：和官方撞的，官方是原件；只在自制之间撞的，先装的是原件。同一个包里自己重复的不算（归作者）。 */
export function findCollisions(official: Record<string, Set<string>>, docs: DocIndex[]): Collision[] {
  const ordered = [...docs].sort((a, b) => a.timeAdded - b.timeAdded || a.order - b.order)
  const seen = new Map<string, string[]>()
  for (const d of ordered) {
    for (const [prop, hashes] of Object.entries(d.props)) {
      for (const h of new Set(hashes)) {
        if (!h) continue
        const k = `${prop}\u0000${h}`
        const list = seen.get(k)
        if (list) list.push(d.docIdLocal)
        else seen.set(k, [d.docIdLocal])
      }
    }
  }
  const out: Collision[] = []
  for (const [k, ids] of seen) {
    const [prop, hash] = k.split('\u0000')
    if (official[prop]?.has(hash)) out.push({ prop, hash, base: { kind: 'official' }, others: ids })
    else if (ids.length > 1) out.push({ prop, hash, base: { kind: 'doc', docIdLocal: ids[0] }, others: ids.slice(1) })
  }
  return out
}

export interface Alternative {
  /** 备选编号：撞编号的用包的本地编号 doc:<docIdLocal>；房规用 house:<房规条目编号>。 */
  altId: string
  kind: 'collision' | 'houserule'
  /** 来自哪个包（文件名；可编辑自制为 null）。 */
  filename: string | null
  /** 这一条在库里的位置；详情用它读预计算的配图描述。 */
  ref?: EntryRef
  item: unknown
}

export type ChoiceBy = 'campaign' | 'rule' | 'global' | 'default'

export interface Chosen {
  /** 生效的备选编号；'base' = 原件。 */
  altId: string
  by: ChoiceBy
  /** 选过的备选已经不在了（包被删）→ 回到原件，提示用户。 */
  missing: string | null
}

/** 按 本战役 > 当前规则 > 全局 定生效版本；选的备选已不存在就回到原件并标出来。 */
export function chooseVersion(alts: Alternative[], choices: { campaign?: string; rule?: string; global?: string }): Chosen {
  const ids = new Set(alts.map((a) => a.altId))
  for (const by of ['campaign', 'rule', 'global'] as const) {
    const pick = choices[by]
    if (pick === undefined) continue
    if (pick === 'base') return { altId: 'base', by, missing: null }
    if (ids.has(pick)) return { altId: pick, by, missing: null }
    return { altId: 'base', by, missing: pick }
  }
  return { altId: 'base', by: 'default', missing: null }
}
