import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-type.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "item-type.abbreviation": {"how":"mapped","to":"data.abbreviation","wp":"R11"},
  "item-type.entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "item-type.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "item-type.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "item-type.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "item-type.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
}
