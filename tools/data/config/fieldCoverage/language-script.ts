import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "language-script.ENG_name": {"how":"mapped","to":"i18n.en.name","wp":"R13"},
  "language-script.name": {"how":"mapped","to":"entry.name","wp":"R11"},
  "language-script.source": {"how":"mapped","to":"data.src.book","wp":"R11"},
  "language-script.fonts": { "how": "dropped", "kind": "fonts", "why": "文字系统的字体文件不进入输出" },
}
