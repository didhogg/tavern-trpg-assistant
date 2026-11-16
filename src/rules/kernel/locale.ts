// 中文战役的显示文字：结算小窗吃的是英文对照条目（Plutonium 按英文认东西），它吐出的文字也就是英文。
// 这些文字都来自同一编号的那条条目（起始装备第几个、职业表第几列、第几个小标题……）：
// 在英文版里找到这段文字的位置，取中文版同一位置的文字。中英两版同一编号、结构一一对应（作者中文数据）。
// 不建字典、不按类型写规则；位置不唯一 / 中文版那里没有 → 返回 null，调用方原样显示英文。

/** 作者写法 {@标签 文字|…}：只比较里面的文字。 */
const TAG = /^\{@\w+ ([^|}]*)(?:\|[^}]*)?\}$/
const clean = (s: string): string => { const t = s.trim(); return (TAG.exec(t)?.[1] ?? t).trim() }

/** 英文版里等于 text 的位置（忽略大小写、作者标签），取中文版同一位置的文字；不唯一或找不到给 null。 */
export function zhAt(en: unknown, zh: unknown, text: string | null | undefined): string | null {
  if (!text || zh === null || zh === undefined) return null
  const want = clean(text).toLowerCase()
  if (!want) return null
  const found = new Set<string>()
  const walk = (a: unknown, b: unknown): void => {
    if (typeof a === 'string') {
      if (typeof b === 'string' && clean(a).toLowerCase() === want && clean(b)) found.add(clean(b))
      return
    }
    if (Array.isArray(a)) {
      if (Array.isArray(b) && a.length === b.length) a.forEach((x, i) => walk(x, b[i]))
      return
    }
    if (a && typeof a === 'object' && b && typeof b === 'object' && !Array.isArray(b)) {
      for (const [k, v] of Object.entries(a)) if (k in b) walk(v, (b as Record<string, unknown>)[k])
    }
  }
  walk(en, zh)
  return found.size === 1 ? [...found][0] : null
}

/** 同一编号的英文 / 中文条目（中文为 null = 交给小窗的本来就是中文条目，不用换）。 */
export interface EntryPair { en: unknown; zh: unknown | null }


/** 显示用的文字字段（登记一处，所有类型共用）；编号类字段（uid、value、hash、refKey…）一律不碰。 */
export const TEXT_FIELDS = new Set(['name', 'title', 'label', 'text', 'displayName', 'rename'])

/**
 * 小窗交回结果的统一出口：整棵结果里每个显示文字字段，按「同编号条目 + 位置」换中文。
 * 不分条目类型、不分界面；原样数据（raw）不动。
 */
export function localizeAll<T>(value: T, pairs: EntryPair[]): T {
  const live = pairs.filter((p) => p.zh !== null && p.zh !== undefined)
  if (!live.length) return value
  const one = (pick: (p: EntryPair) => string | null): string | null => {
    const got = new Set(live.map(pick).filter((x): x is string => !!x))
    return got.size === 1 ? [...got][0] : null
  }
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)
    if (!node || typeof node !== 'object') return node
    const src = node as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(src)) {
      if (k === 'raw') out[k] = v
      else if (typeof v === 'string' && TEXT_FIELDS.has(k)) out[k] = one((p) => zhAt(p.en, p.zh, v)) ?? v
      else out[k] = walk(v)
    }
    return out
  }
  return walk(value) as T
}
