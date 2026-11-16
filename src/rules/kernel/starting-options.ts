// 建卡「起始装备」给界面的结果：小窗算出的分组（英文名、作者编号）→ 对上本战役【库】里看得见的条目，补引用和显示名（中文战役显示中文名）。
// 本战役看不见的物品（书 / 包 / 单条被停用，或库里没有）一律去掉，列在 excluded 里；看得见的以战役范围的查询为准（和库页同一套，P5 B-19）。
// 对应 Plutonium 的黑名单（UtilItemExcludedSimple）：它读作者的全局屏蔽表，插件不用这张表（设计 §2.2），改用战役范围。
import type { KernelRefMapper } from '../../core/saves/split'
import type { KernelRef } from '../../schemas/kernel'
import type { EquipCandidate, EquipEntryView, EquipSection, StartingSelection } from './frame/commands-equipment'

export type { StartingSelection }
export interface Labeled { ref: KernelRef; label: string }
export type LabeledCandidate = EquipCandidate & Labeled
export type LabeledEntry = Omit<EquipEntryView, 'candidates'> & Partial<Labeled> & { candidates?: LabeledCandidate[] }
export type StartingSection = Omit<EquipSection, 'groups'> & {
  groups: Array<{ index: number; choices: Array<{ key: string; entries: LabeledEntry[] }> }>
  /** 本战役看不到、已去掉的物品（作者的 名字|来源）；固定给的被停用 = 不给，候选被停用 = 不能选。 */
  excluded: string[]
}

type Row = { ref: { set: string; prop: string; hash: string }; item?: unknown }
const keyOf = (r: { set: string; prop: string; hash: string }): string => `${r.set}|${r.prop}|${r.hash}`

/** visibleRows：本战役看得见的物品（战役范围的查询，不是浏览模式）。 */
export async function labelSections(sections: EquipSection[], mapper: KernelRefMapper, visibleRows: () => Promise<Row[]>): Promise<StartingSection[]> {
  const names = new Map((await visibleRows()).map((r) => [keyOf(r.ref), String((r.item as { name?: unknown } | undefined)?.name ?? '')]))
  const out: StartingSection[] = []
  for (const s of sections) {
    const excluded: string[] = []
    const label = (c: { uid: string; source: string; hash: string; name: string }): Labeled | null => {
      const ref = mapper({ propDroppable: 'item', source: c.source, hash: c.hash })
      if (!ref || !names.has(keyOf(ref))) { excluded.push(c.uid); return null }
      return { ref, label: names.get(keyOf(ref)) || c.name }
    }
    const groups: StartingSection['groups'] = []
    for (const g of s.groups) {
      const choices: StartingSection['groups'][number]['choices'] = []
      for (const c of g.choices) {
        const entries: LabeledEntry[] = []
        for (const e of c.entries) {
          const { candidates, ...rest } = e
          if (e.uid) { const l = label({ uid: e.uid, source: e.source ?? '', hash: e.hash ?? '', name: e.name ?? '' }); if (!l) continue; entries.push({ ...rest, ...l }); continue }
          if (!candidates) { entries.push(rest); continue }
          const kept = candidates.flatMap((k) => { const l = label(k); return l ? [{ ...k, ...l }] : [] })
          if (kept.length) entries.push({ ...rest, candidates: kept })
        }
        if (entries.length) choices.push({ key: c.key, entries })
      }
      if (choices.length) groups.push({ index: g.index, choices })
    }
    out.push({ ...s, groups, excluded: [...new Set(excluded)] })
  }
  return out
}

/** 建卡前检查玩家的类别槽选择：必须是这个条目的候选里看得见的物品；交回要告诉小窗「不给」的物品（按条目键）。 */
export function checkStarting(sections: StartingSection[], selection: Record<string, StartingSelection>): { error?: string; excluded: Record<string, string[]> } {
  const excluded: Record<string, string[]> = {}
  for (const s of sections) {
    excluded[s.refKey] = s.excluded
    const allowed = new Set(s.groups.flatMap((g) => g.choices.flatMap((c) => c.entries.flatMap((e) => (e.candidates ?? []).map((k) => k.uid)))))
    for (const uid of Object.values(selection[s.refKey]?.pick ?? {})) {
      if (!allowed.has(uid)) return { error: `「${uid}」不在本战役的资料范围里（书 / 包 / 这一条被停用），不能作为起始装备`, excluded }
    }
  }
  return { excluded }
}
