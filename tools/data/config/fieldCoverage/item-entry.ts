import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-entry.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "item-entry.entriesTemplate": {"how":"mapped","to":"data.entriesTemplate","wp":"R6"},
  "item-entry.entriesTemplate[].ENG_name": {"how":"mapped","to":"data.entriesTemplate","wp":"R6"},
  "item-entry.entriesTemplate[].entries": {"how":"text","to":"data.text","wp":"R6"},
  "item-entry.entriesTemplate[].name": {"how":"mapped","to":"data.entriesTemplate","wp":"R6"},
  "item-entry.entriesTemplate[].type": {"how":"mapped","to":"data.entriesTemplate","wp":"R6"},
  "item-entry.name": {"how":"mapped","to":"entry.name","wp":"R6"},
  "item-entry.source": {"how":"mapped","to":"data.src.book","wp":"R6"},
}
