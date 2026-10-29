import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "spell-fluff.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R8"},
  "spell-fluff.entries": {"how":"text","to":"data.lore","wp":"R8"},
  "spell-fluff.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R8"},
  "spell-fluff.entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "spell-fluff.entries[].name": {"how":"text","to":"data.lore","wp":"R8"},
  "spell-fluff.entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "spell-fluff.name": {"how":"mapped","to":"entry.name","wp":"R8"},
  "spell-fluff.source": {"how":"mapped","to":"data.src.book","wp":"R8"},
}
