import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "item-type.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "item-type.abbreviation": {"how":"mapped","to":"data.abbreviation","wp":"R11"},
  "item-type.entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.entries[].ENG_name": {"how":"text","to":"i18n.en.fields.text","wp":"R13"},
  "item-type.entries[].entries": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.entries[].name": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "item-type.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "item-type.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "item-type.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "item-type 的 reprintedAs（核心 30 条）目标全是 2024 新版，样本 [\"$A|XDMG\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "item-type.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "item-type._copy": { "how": "dropped", "kind": "internal-meta", "why": "_copy 是来源的复制指令，转换时已解析，不进入输出" },
  "item-type._copy.abbreviation": { "how": "dropped", "kind": "internal-meta", "why": "_copy 子项随父字段处理" },
  "item-type._copy.source": { "how": "dropped", "kind": "internal-meta", "why": "_copy 子项随父字段处理" },
}
