import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "subclass-fluff.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "subclass-fluff.className": {"how":"mapped","to":"data.owner","wp":"R14"},
  "subclass-fluff.classSource": {"how":"mapped","to":"data.owner","wp":"R14"},
  "subclass-fluff.entries": {"how":"text","to":"data.lore","wp":"R8"},
  "subclass-fluff.entries[].by": {"how":"text","to":"data.lore","wp":"R8"},
  "subclass-fluff.entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "subclass-fluff.entries[].entries[].by": {"how":"text","to":"data.lore","wp":"R8"},
  "subclass-fluff.entries[].entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "subclass-fluff.entries[].entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "subclass-fluff.entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "subclass-fluff.name": {"how":"mapped","to":"entry.name","wp":"R14"},
  "subclass-fluff.shortName": {"how":"mapped","to":"data.shortName","wp":"R14"},
  "subclass-fluff.source": {"how":"mapped","to":"data.src.book","wp":"R14"},
}
