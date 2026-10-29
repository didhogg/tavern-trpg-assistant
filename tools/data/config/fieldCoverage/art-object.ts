import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "art-object.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "art-object.name": {"how":"mapped","to":"entry.name","wp":"R9"},
  "art-object.page": {"how":"mapped","to":"data.src.page","wp":"R9"},
  "art-object.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "art-object.source": {"how":"mapped","to":"data.src.book","wp":"R9"},
  "art-object.table": {"how":"mapped","to":"data.rows","wp":"R9"},
  "art-object.type": {"how":"mapped","to":"data.type","wp":"R9"},
}
