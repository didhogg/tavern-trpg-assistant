import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "art-object.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "art-object.name": {"how":"mapped","to":"entry.name","wp":"R9"},
  "art-object.page": {"how":"mapped","to":"data.src.page","wp":"R9"},
  "art-object.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "art-object 的 reprintedAs（核心 5 条）目标全是 2024 新版，样本 [\"25 gp 艺术品|XDMG\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "art-object.source": {"how":"mapped","to":"data.src.book","wp":"R9"},
  "art-object.table": {"how":"mapped","to":"data.rows","wp":"R9"},
  "art-object.type": {"how":"mapped","to":"data.type","wp":"R9"},
}
