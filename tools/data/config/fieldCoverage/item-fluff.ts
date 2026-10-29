import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-fluff.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "item-fluff.entries": {"how":"text","to":"data.lore","wp":"R8"},
  "item-fluff.entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "item-fluff.entries[].entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "item-fluff.entries[].entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "item-fluff.entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "item-fluff.name": {"how":"mapped","to":"entry.name","wp":"R14"},
  "item-fluff.source": {"how":"mapped","to":"data.src.book","wp":"R14"},
}
