import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "hazard.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R11"},
  "hazard.entries": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R11"},
  "hazard.entries[].caption": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].colLabels": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].colStyles": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].page": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].rows": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "hazard.otherSources": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "hazard.otherSources[].page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "hazard.otherSources[].source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "hazard.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "hazard.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R11"},
  "hazard.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "hazard.trapHazType": {"how":"mapped","to":"data.kind","wp":"R11"},
}
