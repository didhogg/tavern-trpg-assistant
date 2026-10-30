import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-type-additional-entries.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "item-type-additional-entries.appliesTo": { "how": "lost", "why": "物品类型附加条目 appliesTo 没有写入输出", "affected": 2 },
  "item-type-additional-entries.entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "item-type-additional-entries.entries[].caption": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.entries[].colLabels": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.entries[].colStyles": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.entries[].rows": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "item-type-additional-entries.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "item-type-additional-entries.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
}
