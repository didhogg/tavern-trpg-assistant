import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "condition.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R8"},
  "condition.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "condition.entries": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].colLabels": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].colStyles": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].items": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].rows": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].type": {"how":"text","to":"data.text","wp":"R8"},
  "condition.name": {"how":"mapped","to":"entry.name","wp":"R8"},
  "condition.otherSources": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "condition.otherSources[].page": {"how":"mapped","to":"data.src.page","wp":"R8"},
  "condition.otherSources[].source": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "condition.page": {"how":"mapped","to":"data.src.page","wp":"R8"},
  "condition.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R8"},
  "condition.source": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "condition.srd": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "condition.translator": {"how":"mapped","to":"data.credit.by","wp":"R8"},
}
