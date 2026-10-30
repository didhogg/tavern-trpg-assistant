import type { CoverageEntry } from './types'

export const COVERAGE: Record<string, CoverageEntry> = {
  "legendary-group-template.ENG_name": { "how": "dropped", "kind": "internal-meta", "why": "核心十本书来源记录中没有该字段值（ENG_name）" },
  "legendary-group-template.apply": { "how": "dropped", "kind": "internal-meta", "why": "核心十本书来源记录中没有该字段值（apply）" },
  "legendary-group-template.name": { "how": "lost", "why": "这是来源模板/组模板字段，核心输出没有对应条目", "affected": 1 },
  "legendary-group-template.page": { "how": "dropped", "kind": "internal-meta", "why": "核心十本书来源记录中没有该字段值（page）" },
  "legendary-group-template.ref": { "how": "dropped", "kind": "internal-meta", "why": "核心十本书来源记录中没有该字段值（ref）" },
  "legendary-group-template.source": { "how": "dropped", "kind": "internal-meta", "why": "核心十本书来源记录中没有该字段值（source）" },
}
