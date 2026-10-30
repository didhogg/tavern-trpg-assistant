import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "gems.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "gems.name": {"how":"mapped","to":"entry.name","wp":"R9"},
  "gems.page": {"how":"mapped","to":"data.src.page","wp":"R9"},
  "gems.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "gems 的 reprintedAs（核心 6 条）目标全是 2024 新版，样本 [\"价值 10gp 的宝石|XDMG\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "gems.source": {"how":"mapped","to":"data.src.book","wp":"R9"},
  "gems.table": {"how":"mapped","to":"data.rows","wp":"R9"},
  "gems.type": {"how":"mapped","to":"data.type","wp":"R9"},
}
