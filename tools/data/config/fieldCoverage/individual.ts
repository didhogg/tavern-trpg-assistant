import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "individual.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "individual.crMax": {"how":"mapped","to":"data.crRange","wp":"R9"},
  "individual.crMin": {"how":"mapped","to":"data.crRange","wp":"R9"},
  "individual.name": {"how":"mapped","to":"entry.name","wp":"R9"},
  "individual.page": {"how":"mapped","to":"data.src.page","wp":"R9"},
  "individual.source": {"how":"mapped","to":"data.src.book","wp":"R9"},
  "individual.table": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].coins": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].coins.cp": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].coins.ep": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].coins.gp": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].coins.pp": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].coins.sp": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].max": {"how":"mapped","to":"data.rows","wp":"R9"},
  "individual.table[].min": {"how":"mapped","to":"data.rows","wp":"R9"},
}
