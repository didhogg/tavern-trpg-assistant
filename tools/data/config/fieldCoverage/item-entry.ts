import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-entry.ENG_name": { "how": "mapped", "to": "entry.nameEn", "wp": "R6" },
  "item-entry.entriesTemplate": { "how": "lost", "why": "物品模板字段没有写入输出", "affected": 5 },
  "item-entry.entriesTemplate[].ENG_name": { "how": "lost", "why": "物品模板字段没有写入输出", "affected": 1 },
  "item-entry.entriesTemplate[].entries": { "how": "lost", "why": "物品模板字段没有写入输出", "affected": 1 },
  "item-entry.entriesTemplate[].name": { "how": "lost", "why": "物品模板字段没有写入输出", "affected": 1 },
  "item-entry.entriesTemplate[].type": { "how": "lost", "why": "物品模板字段没有写入输出", "affected": 1 },
  "item-entry.name": { "how": "mapped", "to": "entry.name", "wp": "R6" },
  "item-entry.source": { "how": "mapped", "to": "data.src.book", "wp": "R6" },
}
