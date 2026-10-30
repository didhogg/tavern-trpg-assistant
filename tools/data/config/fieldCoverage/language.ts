import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "language.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "language.additionalSources": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "language.additionalSources[].page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "language.additionalSources[].source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "language.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "language.dialects": {"how":"mapped","to":"data.dialects","wp":"R11"},
  "language.entries": {"how":"text","to":"data.text","wp":"R11"},
  "language.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "language.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "language.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "language.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "language.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "language.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "language.reprintedAs": { "how": "dropped", "kind": "out-of-scope", "why": "language 的 reprintedAs（核心 44 条）目标是 2024 新版（33 个）和 D1.2b 才收录的书（FRHoF×11），范围内没有可指向的新版；D1.2b 导入那些书时补 supersededBy" },
  "language.script": {"how":"mapped","to":"data.script","wp":"R11"},
  "language.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "language.srd": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "language.type": {"how":"mapped","to":"data.type","wp":"R11"},
  "language.typicalSpeakers": {"how":"mapped","to":"data.typicalSpeakers","wp":"R11"},
}
