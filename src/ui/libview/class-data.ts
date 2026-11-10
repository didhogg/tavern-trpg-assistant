// 职业页（U9d）的纯处理：把作者已按等级展开的特性分到各级、拼职业表的行。数据形状：class.classFeatures = 每级一组特性对象（带 level / name / entries），
// class.classTableGroups = [{ title?, colLabels, rows }]（每行对应一级），subclass.subclassFeatures 同样展开。
import { ABILITIES } from './statblock'

export interface Feature { name: string; level: number; entries: unknown }
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** 嵌套数组里所有"有名字和等级的特性对象"。 */
export function flattenFeatures(x: unknown): Feature[] {
  if (Array.isArray(x)) return x.flatMap(flattenFeatures)
  if (isObj(x) && typeof x.name === 'string' && typeof x.level === 'number') return [{ name: x.name, level: x.level, entries: x.entries ?? null }]
  return []
}

/** 按等级分组（升序）。 */
export function byLevel(features: Feature[]): Array<{ level: number; features: Feature[] }> {
  const map = new Map<number, Feature[]>()
  for (const f of features) map.set(f.level, [...(map.get(f.level) ?? []), f])
  return [...map].sort((a, b) => a[0] - b[0]).map(([level, fs]) => ({ level, features: fs }))
}

export interface ClassTable { head: string[]; rows: unknown[][] }

/** 职业表：等级 | 特性（取自各级特性名）| 作者额外列（已知戏法、每环法术位…）。 */
export function classTable(cls: unknown): ClassTable {
  const o = isObj(cls) ? cls : {}
  const feats = byLevel(flattenFeatures(o.classFeatures))
  const names = (lv: number): string => feats.find((g) => g.level === lv)?.features.map((f) => f.name).join('，') ?? ''
  const groups = (Array.isArray(o.classTableGroups) ? o.classTableGroups : []).filter(isObj)
  const levels = Math.max(20, ...groups.map((g) => (Array.isArray(g.rows) ? g.rows.length : 0)))
  const head = ['等级', '特性', ...groups.flatMap((g) => (Array.isArray(g.colLabels) ? g.colLabels.map((c) => String(c)) : []))]
  const rows = Array.from({ length: levels }, (_, i) => [i + 1, names(i + 1), ...groups.flatMap((g) => (Array.isArray(g.rows) && Array.isArray(g.rows[i]) ? (g.rows[i] as unknown[]) : []))])
  return { head, rows }
}

/** 摘要：生命骰、豁免熟练（能力代号用登记表翻成中文）。 */
export function classLines(cls: unknown): Array<{ label: string; value: string }> {
  const o = isObj(cls) ? cls : {}
  const out: Array<{ label: string; value: string }> = []
  const hd = o.hd
  if (isObj(hd) && typeof hd.number === 'number' && typeof hd.faces === 'number') out.push({ label: '生命骰', value: `${hd.number}d${hd.faces}` })
  const names = new Map(ABILITIES)
  const prof = (Array.isArray(o.proficiency) ? o.proficiency : []).map((p) => names.get(String(p)) ?? String(p))
  if (prof.length) out.push({ label: '豁免熟练', value: prof.join('、') })
  return out
}
