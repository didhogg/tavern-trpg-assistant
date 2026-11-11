// 交给结算内核的条目（蓝图“中文战役”一节、设计 §2.3）：
//   生效版本是原件 → 交英文对照（Plutonium 按英文名合并旁路数据）；
//   生效版本是房规 / 备选，或原件没有英文对照 → 直接交中文条目，标“无英文对照”。
// 建人物、加到人物、批量建、读档重建、装资料时预换算都用这一个判断。
import type { ScopedLibrary } from '../../library/scoped'
import type { EntryRef } from '../../library/scopes'
import { officialSourceOf } from '../../library/sources'
import type { LibraryView } from '../../library/revision'

export interface KernelEntry {
  entry: unknown
  /** 交的是中文条目（出处要标“无英文对照”）。 */
  noEnglish: boolean
  /** 为什么交中文：alternative = 生效的是房规 / 备选；其余是英文对照查不到的原因。 */
  reason?: string
}

export async function kernelEntryOf(scoped: ScopedLibrary, codeSet: string, ref: EntryRef, item: unknown, altId: string, view?: LibraryView): Promise<KernelEntry> {
  if (officialSourceOf(codeSet).lang !== 'zh') return { entry: item, noEnglish: false }
  if (altId !== 'base') return { entry: item, noEnglish: true, reason: 'alternative' }
  const en = await scoped.englishOf(ref, { fluff: false }, view)
  return en?.status === 'found' ? { entry: en.item, noEnglish: false } : { entry: item, noEnglish: true, reason: en?.status ?? 'english-missing' }
}
