import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "condition.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "condition.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "condition.entries": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].colLabels": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].colStyles": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].items": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].rows": {"how":"text","to":"data.text","wp":"R8"},
  "condition.entries[].type": {"how":"text","to":"data.text","wp":"R8"},
  "condition.name": {"how":"mapped","to":"entry.name","wp":"R8"},
  "condition.otherSources": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "condition.otherSources[].page": {"how":"mapped","to":"data.src.page","wp":"R8"},
  "condition.otherSources[].source": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "condition.page": {"how":"mapped","to":"data.src.page","wp":"R8"},
  "condition.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "condition 的 reprintedAs（核心 15 条）目标全是 2024 新版，样本 [\"目盲|XPHB\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "condition.source": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "condition.srd": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "condition.translator": {"how":"mapped","to":"data.credit.by","wp":"R8"},
}
