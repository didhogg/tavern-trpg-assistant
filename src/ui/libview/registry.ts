import { getSource } from '../../library/sources'

// P5-0 §4.5 的库页显示顺序。条目名称从作者 Parser 取。
export const CATEGORY_ORDER = [
  'spell', 'monster', 'object', 'vehicle', 'vehicleUpgrade', 'item', 'itemProperty', 'itemMastery',
  'class', 'subclass', 'classFeature', 'subclassFeature', 'optionalfeature', 'race', 'raceFeature', 'background',
  'feat', 'charoption', 'reward', 'variantrule', 'action', 'condition', 'disease', 'status',
  'skill', 'sense', 'language', 'deity', 'cult', 'boon', 'facility', 'psionic',
  'trap', 'hazard', 'deck', 'card', 'recipe', 'crochetPattern', 'table', 'tableGroup',
  'legendaryGroup',
]
const ORDER = new Map(CATEGORY_ORDER.map((prop, index) => [prop, index]))
export const isRegisteredCategory = (prop: string): boolean => ORDER.has(prop)
/** 保留库页展示的类别和原有排列顺序。 */
export function registeredCategories<T extends { prop: string }>(rows: T[]): T[] {
  return rows.filter((r) => ORDER.has(r.prop)).sort((a, b) => ORDER.get(a.prop)! - ORDER.get(b.prop)!)
}

/**
 * 书 / 包行的规则标签（驾驶员 2026-11-11 定）：自制源的包标「自制」；否则按作者的版本归类，2014 规则标「5e」、
 * 2024 规则（含 2025 年出版的）标「5.5e」；作者分不出的不标（返回 null）。
 */
export function ruleBadge(row: { set: string; edition: { classic: boolean | null } | null }): string | null {
  if (getSource(row.set).kind === 'brew') return '自制'
  if (!row.edition || row.edition.classic === null) return null
  return row.edition.classic ? '5e' : '5.5e'
}
