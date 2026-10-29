import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "recipe-fluff.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "recipe-fluff._copy": {"how":"mapped","to":"data.versionGroup","wp":"R10"},
  "recipe-fluff._copy.ENG_name": {"how":"mapped","to":"i18n.en.fields._copy","wp":"R13"},
  "recipe-fluff._copy.name": {"how":"mapped","to":"data.text","wp":"R11"},
  "recipe-fluff._copy.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "recipe-fluff.entries": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.entries[].entries[].by": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.entries[].entries[].entries": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.entries[].entries[].from": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.entries[].entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.entries[].page": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.entries[].type": {"how":"text","to":"data.lore","wp":"R8"},
  "recipe-fluff.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "recipe-fluff.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
}
