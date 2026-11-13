// P5.5 §16.10 第 1 步 1a：官方数据实际怎么用（给表单排「必填 / 常用 / 更多」、选默认写法、藏罕见子项、给常见值用）。
// 按字段表的形状走一遍这一类的全部官方条目，数：每个顶层字段几条在用；每处「几种写法」各用了几次；每个套组的子项几次；
// 常见取值（文字 / 选项 / 一小串代号，例如阵营 ["C","E"]）前 12 个。只认字段表里的字段（作者加载器加的 _category 这类不算）。
// 结果按资料版本存在派生缓存里（view.derivedPut），第一次要用时算，资料更新后新版本重新算。
import type { BrewField, FieldShape } from './brew-validate'
import { branchOf, resolve, type Defs } from './field-shape-core'

export interface UsageAt {
  /** 这个位置出现了几次。 */
  n: number
  /** 几种写法：第几种（字段表 branches 的下标）用了几次。 */
  branches?: Record<number, number>
  /** 套组：每个子项出现了几次。 */
  sub?: Record<string, number>
  /** 常见取值（JSON 文本 → 次数），按次数从多到少，最多 12 个。 */
  values?: Array<[string, number]>
}

export interface FieldUsage {
  /** 统计了几条官方条目（0 = 官方没有这一类）。 */
  items: number
  /** 顶层字段 → 几条在用。 */
  fields: Record<string, number>
  /** 位置（字段名，套组用「.子项」，列表里每一项用「[]」，名字 → 值用「{}」）→ 用法。 */
  at: Record<string, UsageAt>
}

const MAX_DEPTH = 6
const TOP_VALUES = 12
const SMALL_LIST = 6

/** 统计（纯函数）：items = 这一类的官方条目；fields / defs = 字段表。 */
export function fieldUsage(items: Array<Record<string, unknown>>, fields: BrewField[], defs: Defs): FieldUsage {
  const at: Record<string, UsageAt & { vals?: Map<string, number> }> = {}
  const spot = (path: string) => (at[path] ??= { n: 0 })
  const count = <K extends string | number>(rec: Record<K, number>, k: K) => { rec[k] = (rec[k] ?? 0) + 1 }
  const value = (path: string, v: unknown) => { const s = spot(path); s.vals ??= new Map(); const k = JSON.stringify(v); s.vals.set(k, (s.vals.get(k) ?? 0) + 1) }

  const walk = (shape: FieldShape, v: unknown, path: string, depth: number): void => {
    if (v === undefined || depth > MAX_DEPTH) return
    const s = resolve(shape, defs)
    const here = spot(path)
    here.n++
    if (s.c === 'pick') {
      const i = branchOf(s, v, defs)
      count((here.branches ??= {}), i)
      const b = s.branches[i]
      if (b) { here.n--; walk(b.shape, v, path, depth) } // 写法那一层不重复算次数
      return
    }
    if (s.c === 'group' && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const p of s.props) {
        const x = (v as Record<string, unknown>)[p.name]
        if (x === undefined) continue
        count((here.sub ??= {}), p.name)
        walk(p.shape, x, `${path}.${p.name}`, depth + 1)
      }
      return
    }
    if ((s.c === 'list' || s.c === 'multiselect') && Array.isArray(v)) {
      if (v.length && v.length <= SMALL_LIST && v.every((x) => typeof x === 'string' || typeof x === 'number')) value(path, v)
      if (s.c === 'list') for (const x of v) walk(s.of, x, `${path}[]`, depth + 1)
      return
    }
    if (s.c === 'map' && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const x of Object.values(v)) walk(s.of, x, `${path}{}`, depth + 1)
      return
    }
    if ((s.c === 'select' || s.c === 'text' || s.c === 'number') && (typeof v === 'string' || typeof v === 'number')) value(path, v)
  }

  const top: Record<string, number> = {}
  const own = fields.filter((f) => !f.internal && f.shape)
  for (const it of items) {
    for (const f of own) {
      const v = it[f.name]
      if (v === undefined) continue
      count(top, f.name)
      walk(f.shape!, v, f.name, 0)
    }
  }
  const out: Record<string, UsageAt> = {}
  for (const [path, s] of Object.entries(at)) {
    const { vals, ...rest } = s
    out[path] = vals ? { ...rest, values: [...vals].sort((a, b) => b[1] - a[1]).slice(0, TOP_VALUES) } : rest
  }
  return { items: items.length, fields: top, at: out }
}

/** 统计用的条目：只要自己写全了的（只写 _copy 的复制件是「照另一条 + 改几处」，按原文件统计会把字段算少）。 */
export const ownItems = (items: unknown[]): Array<Record<string, unknown>> =>
  items.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x) && !('_copy' in x))
