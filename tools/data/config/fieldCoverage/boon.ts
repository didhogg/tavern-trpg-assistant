import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "boon.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "boon.abilityEntry": {"how":"mapped","to":"data.abilityEntry","wp":"R11"},
  "boon.entries": {"how":"text","to":"data.text","wp":"R11"},
  "boon.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "boon.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "boon.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "boon.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "boon.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "boon.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "boon.reprintedAs": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "boon.reprintedAs[].tag": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "boon.reprintedAs[].uid": {"how":"mapped","to":"data.supersededBy","wp":"R10"},
  "boon.signatureSpells": {"how":"mapped","to":"data.signatureSpells","wp":"R11"},
  "boon.signatureSpells.entry": {"how":"mapped","to":"data.signatureSpells","wp":"R11"},
  "boon.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "boon.type": {"how":"mapped","to":"data.type","wp":"R11"},
}
