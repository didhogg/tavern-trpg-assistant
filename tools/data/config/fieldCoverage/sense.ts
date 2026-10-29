import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "sense.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "sense.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "sense.entries": {"how":"text","to":"data.text","wp":"R11"},
  "sense.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "sense.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "sense.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "sense.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "sense.srd": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "sense.translator": {"how":"mapped","to":"data.credit.by","wp":"R11"},
}
