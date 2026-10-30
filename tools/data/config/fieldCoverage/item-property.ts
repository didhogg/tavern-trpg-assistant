import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-property.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "item-property.abbreviation": {"how":"mapped","to":"data.abbreviation","wp":"R11"},
  "item-property.entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-property.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "item-property.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-property.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "item-property.entries[].page": {"how":"text","to":"data.text","wp":"R11"},
  "item-property.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "item-property.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "item-property.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "item-property.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "item-property.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "item-property.template": { "how": "lost", "why": "物品属性模板没有写入输出", "affected": 13 },
}
