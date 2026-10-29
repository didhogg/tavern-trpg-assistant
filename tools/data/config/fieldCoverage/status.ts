import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "status.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R8"},
  "status.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "status.entries": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R8"},
  "status.entries[].items[].entries": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items[].name": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items[].type": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].type": {"how":"text","to":"data.text","wp":"R8"},
  "status.name": {"how":"mapped","to":"entry.name","wp":"R8"},
  "status.page": {"how":"mapped","to":"data.src.page","wp":"R8"},
  "status.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R8"},
  "status.source": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "status.srd": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "status.translator": {"how":"mapped","to":"data.credit.by","wp":"R8"},
}
