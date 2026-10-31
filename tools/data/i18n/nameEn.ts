import type { Entry } from '../../../src/schemas/pack'

/**
 * S1：顶层 `nameEn` 此前由「中文前缀 + 英文基础名」之类拼出，混着汉字（如「卓尔 +1Dagger」）。
 * 英文那一遍（i18n.en.name）是干净的英文原名，对齐之后一律以它为准；keywords 里的旧英文名同步替换。返回改动的条目数。
 */
export function unifyNameEn(entries: Entry[]): number {
  let changed = 0
  for (const entry of entries) {
    const english = (entry as { i18n?: { en?: { name?: string } } }).i18n?.en?.name
    if (!english || english === entry.nameEn) continue
    const old = entry.nameEn
    entry.nameEn = english
    // 旧英文名与中文名相同时（兜底写法），中文名关键词要留着
    entry.keywords = [...new Set(entry.keywords.map((k) => (k === old && old !== entry.name ? english : k)))]
    if (!entry.keywords.includes(english)) entry.keywords.push(english)
    changed++
  }
  return changed
}
