import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "skill.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "skill.ability": {"how":"mapped","to":"data.ability","wp":"R11"},
  "skill.basicRules": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "skill.entries": {"how":"text","to":"data.text","wp":"R11"},
  "skill.entries[].items": {"how":"text","to":"data.text","wp":"R11"},
  "skill.entries[].type": {"how":"text","to":"data.text","wp":"R11"},
  "skill.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "skill.page": {"how":"mapped","to":"data.src.page","wp":"R11"},
  "skill.reprintedAs": { "how": "dropped", "kind": "2024-only", "why": "skill 的 reprintedAs（核心 18 条）目标全是 2024 新版，样本 [\"特技|XPHB\"]，不在收录范围，没有可指向的新版条目，不写 supersededBy" },
  "skill.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "skill.srd": {"how":"mapped","to":"data.credit.license","wp":"R11"},
  "skill.translator": {"how":"mapped","to":"data.credit.by","wp":"R11"},
}
