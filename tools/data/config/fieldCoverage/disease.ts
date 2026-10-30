import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "disease.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "disease.entries": {"how":"text","to":"data.text","wp":"R8"},
  "disease.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "disease.entries[].entries": {"how":"text","to":"data.text","wp":"R8"},
  "disease.entries[].name": {"how":"text","to":"data.text","wp":"R8"},
  "disease.entries[].page": {"how":"text","to":"data.text","wp":"R8"},
  "disease.entries[].type": {"how":"text","to":"data.text","wp":"R8"},
  "disease.name": {"how":"mapped","to":"entry.name","wp":"R8"},
  "disease.page": {"how":"mapped","to":"data.src.page","wp":"R8"},
  "disease.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "disease 的 reprintedAs（核心 3 条）目标全是 2024 新版，样本 [\"疯笑病|XDMG\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "disease.source": {"how":"mapped","to":"data.src.book","wp":"R8"},
  "disease.srd": {"how":"mapped","to":"data.credit.license","wp":"R8"},
  "disease.translator": {"how":"mapped","to":"data.credit.by","wp":"R8"},
}
