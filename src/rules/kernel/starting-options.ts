// 建卡「起始装备」给界面的结果：小窗算出的分组（英文名、作者编号）→ 补上本战役【库】里的条目引用和显示名（中文战役显示中文名）。
// 只做配对，不改小窗的结果；配不上的（库里没有这件物品）ref 为 null、显示英文名。
import type { KernelRefMapper } from '../../core/saves/split'
import type { KernelRef } from '../../schemas/kernel'
import type { EquipCandidate, EquipEntryView, EquipSection } from './frame/commands-equipment'

export type { StartingSelection } from './frame/commands-equipment'
export interface Labeled { ref: KernelRef | null; label: string }
export type LabeledCandidate = EquipCandidate & Labeled
export type LabeledEntry = Omit<EquipEntryView, 'candidates'> & Partial<Labeled> & { candidates?: LabeledCandidate[] }
export type StartingSection = Omit<EquipSection, 'groups'> & { groups: Array<{ index: number; choices: Array<{ key: string; entries: LabeledEntry[] }> }> }

type Row = { ref: { hash: string }; item: Record<string, unknown> }

export async function labelSections(sections: EquipSection[], mapper: KernelRefMapper, queryItems: () => Promise<Row[]>): Promise<StartingSection[]> {
  let names: Map<string, string> | null = null
  const label = async (c: { source: string; hash: string; name: string }): Promise<Labeled> => {
    const ref = mapper({ propDroppable: 'item', source: c.source, hash: c.hash })
    if (!ref) return { ref: null, label: c.name }
    names ??= new Map((await queryItems()).map((r) => [r.ref.hash, String(r.item?.name ?? '')]))
    return { ref, label: names.get(ref.hash) || c.name }
  }
  const out: StartingSection[] = []
  for (const s of sections) {
    const groups = []
    for (const g of s.groups) {
      const choices = []
      for (const c of g.choices) {
        const entries: LabeledEntry[] = []
        for (const e of c.entries) {
          const base: LabeledEntry = { ...e, candidates: undefined }
          if (e.hash) Object.assign(base, await label({ source: e.source ?? '', hash: e.hash, name: e.name ?? '' }))
          if (e.candidates) base.candidates = await Promise.all(e.candidates.map(async (k) => ({ ...k, ...(await label(k)) })))
          else delete base.candidates
          entries.push(base)
        }
        choices.push({ key: c.key, entries })
      }
      groups.push({ index: g.index, choices })
    }
    out.push({ ...s, groups })
  }
  return out
}
