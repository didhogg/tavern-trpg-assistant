import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-entry.ENG_name": { "how": "mapped", "to": "entry.nameEn", "wp": "R6" },
  "item-entry.entriesTemplate": {"how":"dropped","kind":"derived","why":"「item-entry.entriesTemplate」物品正文模板已由转换器展开进物品正文（R3 起），模板本身不单独输出"},
  "item-entry.entriesTemplate[].ENG_name": {"how":"dropped","kind":"derived","why":"「item-entry.entriesTemplate[].ENG_name」是来源里的英文名；英文名已由 i18n.en 承载（R13）"},
  "item-entry.entriesTemplate[].entries": {"how":"dropped","kind":"derived","why":"「item-entry.entriesTemplate[].entries」物品正文模板已由转换器展开进物品正文（R3 起），模板本身不单独输出"},
  "item-entry.entriesTemplate[].name": {"how":"dropped","kind":"derived","why":"「item-entry.entriesTemplate[].name」物品正文模板已由转换器展开进物品正文（R3 起），模板本身不单独输出"},
  "item-entry.entriesTemplate[].type": {"how":"dropped","kind":"derived","why":"「item-entry.entriesTemplate[].type」物品正文模板已由转换器展开进物品正文（R3 起），模板本身不单独输出"},
  "item-entry.name": { "how": "mapped", "to": "entry.name", "wp": "R6" },
  "item-entry.source": { "how": "mapped", "to": "data.src.book", "wp": "R6" },
}
