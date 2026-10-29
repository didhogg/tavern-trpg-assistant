import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "language.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "language.additionalSources": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "language.additionalSources[].page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "language.additionalSources[].source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "language.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "language.dialects": {"how":"mapped","to":"data.text","wp":"R11"},
  "language.entries": {"how":"text","to":"data.text","wp":"R11"},
  "language.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "language.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "language.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "language.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "language.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "language.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "language.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "language.script": {"how":"mapped","to":"data.script","wp":"R11"},
  "language.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "language.srd": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "language.type": {"how":"mapped","to":"data.text","wp":"R11"},
  "language.typicalSpeakers": {"how":"mapped","to":"data.text","wp":"R11"},
}
