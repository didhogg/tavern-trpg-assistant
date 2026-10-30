import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "status.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "status.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "status.entries": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "status.entries[].items[].entries": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items[].name": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].items[].type": {"how":"text","to":"data.text","wp":"R8"},
  "status.entries[].type": {"how":"text","to":"data.text","wp":"R8"},
  "status.name": {"how":"mapped","to":"entry.name","wp":"R8"},
  "status.page": {"how":"mapped","to":"data.src.page","wp":"R8"},
  "status.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "status 的 reprintedAs（核心 2 条）目标全是 2024 新版，样本 [\"专注|XPHB\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "status.source": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "status.srd": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "status.translator": {"how":"mapped","to":"data.credit.by","wp":"R8"},
}
