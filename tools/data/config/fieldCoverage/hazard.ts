import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "hazard.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "hazard.entries": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "hazard.entries[].caption": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].colLabels": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].colStyles": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].page": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].rows": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "hazard.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "hazard.otherSources": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "hazard.otherSources[].page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "hazard.otherSources[].source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "hazard.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "hazard.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "hazard 的 reprintedAs（核心 15 条）目标全是 2024 新版，样本 [\"棕霉菌|XDMG\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "hazard.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "hazard.trapHazType": {"how":"mapped","to":"data.kind","wp":"R11"},
}
