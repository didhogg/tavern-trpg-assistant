import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "vehicle-fluff.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "vehicle-fluff.entries": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.entries[].entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.entries[].entries[].entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "vehicle-fluff.entries[].entries[].entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.entries[].entries[].entries[].name": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.entries[].entries[].entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.entries[].entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "vehicle-fluff.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "vehicle-fluff.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
}
