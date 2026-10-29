import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-property.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R6"},
  "item-property.abbreviation": {"how":"mapped","to":"data.abbreviation","wp":"R6"},
  "item-property.entries": {"how":"text","to":"data.text","wp":"R6"},
  "item-property.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R6"},
  "item-property.entries[].entries": {"how":"text","to":"data.text","wp":"R6"},
  "item-property.entries[].name": {"how":"text","to":"data.text","wp":"R6"},
  "item-property.entries[].page": {"how":"text","to":"data.text","wp":"R6"},
  "item-property.entries[].type": {"how":"text","to":"data.text","wp":"R6"},
  "item-property.name": {"how":"mapped","to":"entry.name","wp":"R6"},
  "item-property.page": {"how":"mapped","to":"data.src.page","wp":"R6"},
  "item-property.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R6"},
  "item-property.source": {"how":"mapped","to":"data.src.book","wp":"R6"},
  "item-property.template": {"how":"mapped","to":"data.template","wp":"R6"},
}
