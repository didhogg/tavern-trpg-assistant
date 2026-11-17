import { refKey } from '../../core/saves/split'
import type { EntryRef } from '../../library/scopes'

/** The library kinds the existing build wizard presents as separate steps. */
export const EXTRA_KINDS = ['subclass', 'feat', 'optionalfeature'] as const
export type ExtraKind = (typeof EXTRA_KINDS)[number]

export interface ExtraCandidate {
  ref: EntryRef
  name: string
  source: string | null
  /** Upstream prerequisite text where the engine could not decide eligibility. */
  requirement?: string
}

export interface ExtraWithCandidates {
  id: string
  kind: ExtraKind
  title: string
  count: number
  candidates: ExtraCandidate[]
  unfiltered?: boolean
}

export interface ExtraPoolRow {
  key: string
  entry: Record<string, unknown>
  /** Local record supplies the original class name when a Chinese-only child has no English counterpart. */
  local?: Record<string, unknown>
}
export type ExtraPools = Partial<Record<ExtraKind, ExtraPoolRow[]>>

export interface FrameExtra {
  id: string
  kind: ExtraKind
  title: string
  count: number
  candidates: Array<{ key: string; requirement?: string }>
  labels?: Array<{ at: string[]; text: string }>
}
export interface FrameExtras { extras: FrameExtra[]; blocked: string[] }

/** 额外选择复核：每个选了的条目要能放进一个对得上的组（组之间候选可交叉）。
 *  wrong = 选错（关掉的、不合条件、不属于任何一组）→ 不能创建；missing = 还没选完 → 照样能创建，空位留空（驾驶员 11-16 定「没选的留空」）。 */
export function checkBuildExtras(groups: ExtraWithCandidates[], selected: EntryRef[]): { wrong: string | null; missing: string | null } {
  const slots = groups.flatMap(group => Array.from({ length: group.count }, () => ({
    title: group.title,
    allowed: new Set(group.candidates.map(candidate => refKey(candidate.ref))),
  })))
  const assigned = new Map<number, string>()
  const place = (key: string, visited: Set<number>): boolean => slots.some((slot, index) => {
    if (visited.has(index) || !slot.allowed.has(key)) return false
    visited.add(index)
    const previous = assigned.get(index)
    if (previous && !place(previous, visited)) return false
    assigned.set(index, key)
    return true
  })
  const choices = selected.filter(ref => (EXTRA_KINDS as readonly string[]).includes(ref.prop)).map(refKey)
  if (new Set(choices).size !== choices.length || !choices.every(key => place(key, new Set()))) {
    return { wrong: '额外选项已关闭、不符合条件，或不属于需要选择的那一组', missing: null }
  }
  const missing = slots.find((_slot, index) => !assigned.has(index))
  return { wrong: null, missing: missing ? `还有必选项没有选完：${missing.title}` : null }
}
