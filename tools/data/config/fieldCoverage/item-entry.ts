import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-entry.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R6"},
  "item-entry.entriesTemplate": {"how":"text","to":"data.text","wp":"R6"},
  "item-entry.entriesTemplate[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R6"},
  "item-entry.entriesTemplate[].entries": {"how":"text","to":"data.text","wp":"R6"},
  "item-entry.entriesTemplate[].name": {"how":"text","to":"data.text","wp":"R6"},
  "item-entry.entriesTemplate[].type": {"how":"text","to":"data.text","wp":"R6"},
  "item-entry.name": {"how":"mapped","to":"entry.name","wp":"R6"},
  "item-entry.source": {"how":"mapped","to":"data.src.book","wp":"R6"},
}
